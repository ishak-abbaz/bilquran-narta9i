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

const messageIdSchema =
  z.string().uuid();

export async function deleteContactMessage(
  messageId: string,
) {
  await requireAdmin();

  const parsed =
    messageIdSchema.safeParse(
      messageId,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        "معرّف الرسالة غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("contact_messages")
    .delete()
    .eq(
      "id",
      parsed.data,
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "فشل حذف رسالة التواصل:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر حذف الرسالة. حاول مرة أخرى.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "الرسالة غير موجودة أو تم حذفها مسبقاً.",
    };
  }

  revalidatePath(
    "/admin/messages",
  );

  return {
    success: true,
    message:
      "تم حذف الرسالة بنجاح.",
  };
}