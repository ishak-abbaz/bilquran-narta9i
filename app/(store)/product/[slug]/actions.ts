"use server";

import "server-only";

import {
  redirect,
} from "next/navigation";
import { z } from "zod";

import {
  normalizeAlgerianPhone,
} from "@/lib/data/phone";
import {
  createAdminClient,
} from "@/lib/supabase/admin";
import {
  orderSchema,
  type OrderInput,
} from "@/lib/validation/order";

type OrderFieldErrors =
  Partial<
    Record<
      keyof OrderInput,
      string[]
    >
  >;

export type CreateOrderActionResult = {
  success: false;
  message: string;
  fieldErrors?: OrderFieldErrors;
};

const rpcResultSchema =
  z.object({
    order_number: z.coerce
      .number()
      .int()
      .positive(),
  });

const GENERIC_ERROR =
  "تعذر إنشاء الطلب. حاول مرة أخرى.";

const RATE_LIMIT_ERROR =
  "تم تجاوز عدد الطلبات المسموح بها. حاول مرة أخرى لاحقاً.";

const FUNCTION_ERROR_MESSAGES = {
  NOT_FOUND:
    "الكتاب غير موجود",

  INACTIVE:
    "هذا الكتاب غير متوفر حالياً",

  NO_STOCK:
    "الكمية المطلوبة غير متوفرة",

  BAD_WILAYA:
    "الولاية غير صالحة",

  BAD_QUANTITY:
    "الكمية غير صالحة",
} as const;

type FunctionErrorCode =
  keyof typeof FUNCTION_ERROR_MESSAGES;

function getFunctionErrorCode(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  },
): FunctionErrorCode | null {
  const errorText = [
    error.message,
    error.details,
    error.hint,
    error.code,
  ]
    .filter(Boolean)
    .join(" ");

  const codes =
    Object.keys(
      FUNCTION_ERROR_MESSAGES,
    ) as FunctionErrorCode[];

  return (
    codes.find(
      (code) =>
        errorText.includes(
          code,
        ),
    ) ?? null
  );
}

export async function createOrderAction(
  payload: unknown,
): Promise<CreateOrderActionResult> {
  /*
   * Re-validate everything received
   * from the browser.
   */
  const parsed =
    orderSchema.safeParse(
      payload,
    );

  if (!parsed.success) {
    const flattened =
      z.flattenError(
        parsed.error,
      );

    return {
      success: false,
      message:
        "تحقق من معلومات الطلب.",
      fieldErrors:
        flattened.fieldErrors as OrderFieldErrors,
    };
  }

  const data =
    parsed.data;

  const phone =
    normalizeAlgerianPhone(
      data.phone,
    );

  if (!phone) {
    return {
      success: false,
      message:
        "رقم الهاتف غير صالح",
      fieldErrors: {
        phone: [
          "رقم الهاتف غير صالح",
        ],
      },
    };
  }

  let orderNumber:
    number | null = null;

  /*
   * redirect() must stay outside
   * this try/catch.
   */
  try {
    const supabase =
      createAdminClient();

    const oneHourAgo =
      new Date(
        Date.now() -
          60 * 60 * 1000,
      ).toISOString();

    /*
     * Rate limit:
     * Maximum 5 orders for the same
     * normalized phone during one hour.
     */
    const {
      count,
      error: rateLimitError,
    } = await supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "phone",
        phone,
      )
      .gte(
        "created_at",
        oneHourAgo,
      );

    if (
      rateLimitError
    ) {
      console.error(
        "فشل فحص حد الطلبات:",
        rateLimitError,
      );

      return {
        success: false,
        message:
          GENERIC_ERROR,
      };
    }

    if (
      (count ?? 0) >= 5
    ) {
      return {
        success: false,
        message:
          RATE_LIMIT_ERROR,
      };
    }

    /*
     * For desk delivery the customer
     * does not provide an address.
     *
     * The database column is NOT NULL,
     * so a server-controlled value is used.
     */
    const address =
      data.deliveryType ===
      "home"
        ? data.address?.trim() ??
          ""
        : "مكتب التوصيل";

    /*
     * No price-related values are accepted
     * or calculated here.
     *
     * create_book_order reads the product
     * price, delivery fee, threshold and
     * stock directly from PostgreSQL.
     */
    const {
      data: rpcResult,
      error: rpcError,
    } = await supabase.rpc(
      "create_book_order",
      {
        p_product_id:
          data.productId,

        p_quantity:
          data.quantity,

        p_customer_name:
          data.fullName,

        p_phone:
          phone,

        p_wilaya_code:
          data.wilayaCode,

        p_delivery_type:
          data.deliveryType,

        p_address:
          address,

        p_notes:
          data.notes?.trim() ||
          null,
      },
    );

    if (rpcError) {
      const errorCode =
        getFunctionErrorCode(
          rpcError,
        );

      if (errorCode) {
        return {
          success: false,
          message:
            FUNCTION_ERROR_MESSAGES[
              errorCode
            ],
        };
      }

      console.error(
        "فشل create_book_order:",
        rpcError,
      );

      return {
        success: false,
        message:
          GENERIC_ERROR,
      };
    }

    const parsedResult =
      rpcResultSchema.safeParse(
        rpcResult,
      );

    if (
      !parsedResult.success
    ) {
      console.error(
        "نتيجة create_book_order غير صالحة:",
        {
          rpcResult,
          validation:
            parsedResult.error,
        },
      );

      return {
        success: false,
        message:
          GENERIC_ERROR,
      };
    }

    orderNumber =
      parsedResult.data
        .order_number;
  } catch (error) {
    console.error(
      "خطأ غير متوقع أثناء إنشاء الطلب:",
      error,
    );

    return {
      success: false,
      message:
        GENERIC_ERROR,
    };
  }

  redirect(
    `/order-success?order=${encodeURIComponent(
      String(
        orderNumber,
      ),
    )}`,
  );
}