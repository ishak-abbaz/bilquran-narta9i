"use server";

import {
  createClient,
} from "@supabase/supabase-js";
import { z } from "zod";

import {
  normalizeAlgerianPhone,
} from "@/lib/data/phone";
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

export type CreateBookOrderActionResult =
  | {
      success: true;
      orderNumber: number;
    }
  | {
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

const databaseErrorMessages =
  {
    NOT_FOUND:
      "الكتاب غير موجود.",

    INACTIVE:
      "هذا الكتاب غير متاح للطلب حالياً.",

    NO_STOCK:
      "الكمية المطلوبة غير متوفرة.",

    BAD_WILAYA:
      "الولاية أو نوع التوصيل غير صالح.",

    BAD_QUANTITY:
      "الكمية المطلوبة غير صالحة.",
  } as const;

function createServiceRoleClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase service role configuration is missing.",
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

function getDatabaseErrorMessage(
  message: string,
): string {
  const code =
    (
      Object.keys(
        databaseErrorMessages,
      ) as Array<
        keyof typeof databaseErrorMessages
      >
    ).find((item) =>
      message.includes(item),
    );

  if (!code) {
    return "تعذر إرسال الطلب. حاول مرة أخرى.";
  }

  return databaseErrorMessages[
    code
  ];
}

export async function createBookOrderAction(
  input: OrderInput,
): Promise<CreateBookOrderActionResult> {
  const parsed =
    orderSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    const flattened =
      z.flattenError(
        parsed.error,
      );

    return {
      success: false,
      message:
        "تحقق من المعلومات المدخلة.",
      fieldErrors:
        flattened.fieldErrors,
    };
  }

  const phone =
    normalizeAlgerianPhone(
      parsed.data.phone,
    );

  if (!phone) {
    return {
      success: false,
      message:
        "تحقق من المعلومات المدخلة.",
      fieldErrors: {
        phone: [
          "رقم الهاتف غير صالح",
        ],
      },
    };
  }

  try {
    const supabase =
      createServiceRoleClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "create_book_order",
      {
        p_product_id:
          parsed.data.productId,

        p_quantity:
          parsed.data.quantity,

        p_customer_name:
          parsed.data.fullName,

        p_phone:
          phone,

        p_wilaya_code:
          parsed.data.wilayaCode,

        p_delivery_type:
          parsed.data.deliveryType,

        p_address:
          parsed.data.address,

        p_notes:
          parsed.data.notes ||
          null,
      },
    );

    if (error) {
      console.error(
        "فشل إنشاء الطلب:",
        error,
      );

      return {
        success: false,
        message:
          getDatabaseErrorMessage(
            error.message,
          ),
      };
    }

    const result =
      rpcResultSchema.safeParse(
        data,
      );

    if (!result.success) {
      console.error(
        "نتيجة create_book_order غير صالحة:",
        result.error,
      );

      return {
        success: false,
        message:
          "تمت معالجة الطلب ولكن تعذر قراءة رقم الطلب.",
      };
    }

    return {
      success: true,
      orderNumber:
        result.data
          .order_number,
    };
  } catch (error) {
    console.error(
      "تعذر إنشاء الطلب:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر إرسال الطلب. حاول مرة أخرى.",
    };
  }
}