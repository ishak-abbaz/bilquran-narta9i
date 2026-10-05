"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم قصير جداً.")
    .max(
      100,
      "الاسم طويل جداً.",
    ),

  phone: z
    .string()
    .trim()
    .min(
      8,
      "رقم الهاتف غير صالح.",
    )
    .max(
      30,
      "رقم الهاتف طويل جداً.",
    )
    .regex(
      /^[0-9+\s().-]+$/,
      "رقم الهاتف غير صالح.",
    ),

  message: z
    .string()
    .trim()
    .min(
      10,
      "اكتب رسالة من 10 أحرف على الأقل.",
    )
    .max(
      2000,
      "الرسالة طويلة جداً.",
    ),
});

export type ContactActionState = {
  success: boolean;
  message: string;
  errors: {
    name?: string[];
    phone?: string[];
    message?: string[];
  };
};

export const initialContactActionState: ContactActionState =
  {
    success: false,
    message: "",
    errors: {},
  };

export async function sendContactMessage(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const honeypot =
    formData.get("website");

  if (
    typeof honeypot === "string" &&
    honeypot.trim() !== ""
  ) {
    return {
      success: true,
      message:
        "تم إرسال رسالتك بنجاح.",
      errors: {},
    };
  }

  const parsed =
    contactSchema.safeParse({
      name:
        formData.get("name"),
      phone:
        formData.get("phone"),
      message:
        formData.get("message"),
    });

  if (!parsed.success) {
    const flattened =
      z.flattenError(
        parsed.error,
      );

    return {
      success: false,
      message:
        "تحقق من المعلومات المدخلة.",
      errors: {
        name:
          flattened.fieldErrors
            .name,
        phone:
          flattened.fieldErrors
            .phone,
        message:
          flattened.fieldErrors
            .message,
      },
    };
  }

  const supabase =
    await createClient();

  const { error } = await supabase
    .from("contact_messages")
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      message:
        parsed.data.message,
    });

  if (error) {
    console.error(
      "فشل إرسال رسالة التواصل:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر إرسال الرسالة. حاول مرة أخرى.",
      errors: {},
    };
  }

  revalidatePath(
    "/admin/messages",
  );

  return {
    success: true,
    message:
      "تم إرسال رسالتك بنجاح.",
    errors: {},
  };
} 