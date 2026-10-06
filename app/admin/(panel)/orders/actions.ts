"use server";

import {
  revalidatePath,
} from "next/cache";
import { z } from "zod";

import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

const orderIdSchema =
  z.string().uuid();

const orderStatusSchema =
  z.enum([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]);

export type UpdateOrderStatusResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

const DATABASE_ERRORS = {
  ORDER_NOT_FOUND:
    "الطلب غير موجود",

  BAD_STATUS:
    "حالة الطلب غير صالحة",

  NO_STOCK:
    "لا توجد كمية كافية لإعادة تفعيل الطلب",

  PRODUCT_NOT_FOUND:
    "تعذر إعادة تفعيل الطلب لأن الكتاب لم يعد موجوداً",

  UNAUTHORIZED:
    "غير مصرح لك بتعديل الطلب",
} as const;

type DatabaseErrorCode =
  keyof typeof DATABASE_ERRORS;

function getDatabaseErrorCode(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  },
): DatabaseErrorCode | null {
  const text = [
    error.message,
    error.details,
    error.hint,
    error.code,
  ]
    .filter(Boolean)
    .join(" ");

  const codes =
    Object.keys(
      DATABASE_ERRORS,
    ) as DatabaseErrorCode[];

  return (
    codes.find(
      (code) =>
        text.includes(code),
    ) ?? null
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<UpdateOrderStatusResult> {
  await requireAdmin();

  const parsedOrderId =
    orderIdSchema.safeParse(
      orderId,
    );

  const parsedStatus =
    orderStatusSchema.safeParse(
      newStatus,
    );

  if (
    !parsedOrderId.success ||
    !parsedStatus.success
  ) {
    return {
      success: false,
      message:
        "بيانات تحديث الطلب غير صالحة",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "update_order_status_atomic",
    {
      p_order_id:
        parsedOrderId.data,

      p_new_status:
        parsedStatus.data,
    },
  );

  if (error) {
    const errorCode =
      getDatabaseErrorCode(
        error,
      );

    if (errorCode) {
      return {
        success: false,
        message:
          DATABASE_ERRORS[
            errorCode
          ],
      };
    }

    console.error(
      "فشل تحديث حالة الطلب:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر تحديث حالة الطلب. حاول مرة أخرى.",
    };
  }

  revalidatePath(
    "/admin",
  );

  revalidatePath(
    "/admin/orders",
  );

  revalidatePath(
    "/shop",
  );

  return {
    success: true,
  };
}