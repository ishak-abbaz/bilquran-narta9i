"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getWilayaByCode,
} from "@/lib/algeria-wilayas";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const storeSettingsSchema = z.object({
  store_name: z
    .string()
    .trim()
    .min(2, "اسم المتجر مطلوب.")
    .max(100, "اسم المتجر طويل جداً."),

  phone: z
    .string()
    .trim()
    .max(30, "رقم الهاتف طويل جداً."),

  email: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .email("البريد الإلكتروني غير صالح.")
      .max(150),
  ]),

  instagram: z
    .string()
    .trim()
    .max(200, "حساب إنستغرام طويل جداً."),

  address: z
    .string()
    .trim()
    .max(500, "العنوان طويل جداً."),

  free_delivery_threshold: z
    .number()
    .int("قيمة التوصيل المجاني يجب أن تكون عدداً صحيحاً.")
    .min(
      0,
      "قيمة التوصيل المجاني لا يمكن أن تكون سالبة.",
    )
    .max(1_000_000_000)
    .nullable(),
});

const deliveryPriceSchema = z.object({
  wilaya_code: z
    .number()
    .int()
    .min(1)
    .max(58),

  home_price: z
    .number()
    .int("سعر التوصيل إلى المنزل يجب أن يكون عدداً صحيحاً.")
    .min(
      0,
      "سعر التوصيل إلى المنزل لا يمكن أن يكون سالباً.",
    )
    .max(1_000_000),

  desk_price: z
    .number()
    .int("سعر التوصيل إلى المكتب يجب أن يكون عدداً صحيحاً.")
    .min(
      0,
      "سعر التوصيل إلى المكتب لا يمكن أن يكون سالباً.",
    )
    .max(1_000_000),
});

export type SettingsActionResult = {
  success: boolean;
  message: string;
};

export type StoreSettingsInput = z.infer<
  typeof storeSettingsSchema
>;

export type DeliveryPriceInput = z.infer<
  typeof deliveryPriceSchema
>;

export async function saveStoreSettings(
  input: StoreSettingsInput,
): Promise<SettingsActionResult> {
  await requireAdmin();

  const parsed =
    storeSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "بيانات المتجر غير صالحة.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .upsert(
      {
        id: 1,
        store_name: parsed.data.store_name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        instagram:
          parsed.data.instagram || null,
        address: parsed.data.address || null,
        free_delivery_threshold:
          parsed.data.free_delivery_threshold,
      },
      {
        onConflict: "id",
      },
    );

  if (error) {
    console.error(
      "فشل حفظ معلومات المتجر:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر حفظ معلومات المتجر. حاول مرة أخرى.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/contact");

  return {
    success: true,
    message: "تم حفظ معلومات المتجر بنجاح.",
  };
}

export async function saveDeliveryPrice(
  input: DeliveryPriceInput,
): Promise<SettingsActionResult> {
  await requireAdmin();

  const parsed =
    deliveryPriceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        "بيانات التوصيل غير صالحة.",
    };
  }

  const wilaya = getWilayaByCode(
    parsed.data.wilaya_code,
  );

  if (!wilaya) {
    return {
      success: false,
      message: "الولاية غير صالحة.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("delivery_prices")
    .upsert(
      {
        wilaya_code: wilaya.code,
        wilaya_name: wilaya.name,
        home_price: parsed.data.home_price,
        desk_price: parsed.data.desk_price,
      },
      {
        onConflict: "wilaya_code",
      },
    );

  if (error) {
    console.error(
      "فشل حفظ سعر التوصيل:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر حفظ سعر التوصيل. حاول مرة أخرى.",
    };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");

  return {
    success: true,
    message: `تم حفظ أسعار ولاية ${wilaya.name}.`,
  };
}