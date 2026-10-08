"use server";

import "server-only";

import {
  revalidatePath,
} from "next/cache";
import {
  z,
} from "zod";

import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

const POSTGRES_INTEGER_MAX =
  2_147_483_647;

const wilayaCodeSchema =
  z
    .number()
    .int(
      "رمز الولاية يجب أن يكون عدداً صحيحاً.",
    )
    .min(
      1,
      "رمز الولاية يجب أن يكون أكبر من صفر.",
    )
    .max(
      POSTGRES_INTEGER_MAX,
      "رمز الولاية كبير جداً.",
    );

const deliveryWilayaSchema =
  z.object({
    wilaya_code:
      wilayaCodeSchema,

    wilaya_name:
      z
        .string()
        .trim()
        .min(
          1,
          "اسم الولاية مطلوب.",
        )
        .max(
          100,
          "اسم الولاية طويل جداً.",
        ),

    home_price:
      z
        .number()
        .int(
          "سعر التوصيل إلى المنزل يجب أن يكون عدداً صحيحاً.",
        )
        .min(
          0,
          "سعر التوصيل إلى المنزل لا يمكن أن يكون سالباً.",
        )
        .max(
          1_000_000,
          "سعر التوصيل إلى المنزل كبير جداً.",
        ),

    desk_price:
      z
        .number()
        .int(
          "سعر التوصيل إلى المكتب يجب أن يكون عدداً صحيحاً.",
        )
        .min(
          0,
          "سعر التوصيل إلى المكتب لا يمكن أن يكون سالباً.",
        )
        .max(
          1_000_000,
          "سعر التوصيل إلى المكتب كبير جداً.",
        ),
  });

export type DeliveryWilayaInput =
  z.infer<
    typeof deliveryWilayaSchema
  >;

export type DeliveryActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

function revalidateDeliveryPages() {
  revalidatePath(
    "/admin/settings",
  );

  revalidatePath(
    "/shop",
  );

  revalidatePath(
    "/product/[slug]",
    "page",
  );
}

function databaseErrorMessage(
  error: {
    code?:
      | string
      | null;
  },
) {
  if (
    error.code ===
    "23505"
  ) {
    return "رمز الولاية مستخدم بالفعل.";
  }

  return "تعذر حفظ بيانات الولاية. حاول مرة أخرى.";
}

export async function createDeliveryWilaya(
  input:
    DeliveryWilayaInput,
): Promise<DeliveryActionResult> {
  await requireAdmin();

  const parsed =
    deliveryWilayaSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,

      message:
        parsed.error
          .issues[0]
          ?.message ??
        "بيانات الولاية غير صالحة.",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from(
      "delivery_prices",
    )
    .insert({
      wilaya_code:
        parsed.data
          .wilaya_code,

      wilaya_name:
        parsed.data
          .wilaya_name,

      home_price:
        parsed.data
          .home_price,

      desk_price:
        parsed.data
          .desk_price,
    });

  if (error) {
    console.error(
      "فشل إضافة ولاية التوصيل:",
      error,
    );

    return {
      success: false,

      message:
        databaseErrorMessage(
          error,
        ),
    };
  }

  revalidateDeliveryPages();

  return {
    success: true,

    message:
      `تمت إضافة ولاية ${parsed.data.wilaya_name}.`,
  };
}

export async function updateDeliveryWilaya(
  originalWilayaCode:
    number,
  input:
    DeliveryWilayaInput,
): Promise<DeliveryActionResult> {
  await requireAdmin();

  const parsedOriginalCode =
    wilayaCodeSchema.safeParse(
      originalWilayaCode,
    );

  const parsedInput =
    deliveryWilayaSchema.safeParse(
      input,
    );

  if (
    !parsedOriginalCode.success
  ) {
    return {
      success: false,

      message:
        "رمز الولاية الأصلي غير صالح.",
    };
  }

  if (
    !parsedInput.success
  ) {
    return {
      success: false,

      message:
        parsedInput.error
          .issues[0]
          ?.message ??
        "بيانات الولاية غير صالحة.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "delivery_prices",
    )
    .update({
      wilaya_code:
        parsedInput.data
          .wilaya_code,

      wilaya_name:
        parsedInput.data
          .wilaya_name,

      home_price:
        parsedInput.data
          .home_price,

      desk_price:
        parsedInput.data
          .desk_price,
    })
    .eq(
      "wilaya_code",
      parsedOriginalCode.data,
    )
    .select(
      "wilaya_code",
    )
    .maybeSingle();

  if (error) {
    console.error(
      "فشل تحديث ولاية التوصيل:",
      error,
    );

    return {
      success: false,

      message:
        databaseErrorMessage(
          error,
        ),
    };
  }

  if (!data) {
    return {
      success: false,

      message:
        "الولاية غير موجودة أو تم حذفها.",
    };
  }

  revalidateDeliveryPages();

  return {
    success: true,

    message:
      `تم حفظ ولاية ${parsedInput.data.wilaya_name}.`,
  };
}

export async function deleteDeliveryWilaya(
  wilayaCode: number,
): Promise<DeliveryActionResult> {
  await requireAdmin();

  const parsed =
    wilayaCodeSchema.safeParse(
      wilayaCode,
    );

  if (!parsed.success) {
    return {
      success: false,

      message:
        "رمز الولاية غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "delivery_prices",
    )
    .delete()
    .eq(
      "wilaya_code",
      parsed.data,
    )
    .select(
      "wilaya_name",
    )
    .maybeSingle();

  if (error) {
    console.error(
      "فشل حذف ولاية التوصيل:",
      error,
    );

    return {
      success: false,

      message:
        "تعذر حذف الولاية. حاول مرة أخرى.",
    };
  }

  if (!data) {
    return {
      success: false,

      message:
        "الولاية غير موجودة أو تم حذفها مسبقاً.",
    };
  }

  revalidateDeliveryPages();

  return {
    success: true,

    message:
      `تم حذف ولاية ${data.wilaya_name} من قائمة التوصيل.`,
  };
}