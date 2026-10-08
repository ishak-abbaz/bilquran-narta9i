import {
  z,
} from "zod";

import {
  isValidAlgerianPhone,
} from "@/lib/data/phone";

const POSTGRES_INTEGER_MAX =
  2_147_483_647;

export const orderSchema =
  z
    .object({
      productId:
        z
          .string()
          .uuid(
            "معرّف الكتاب غير صالح.",
          ),

      quantity:
        z
          .number()
          .int(
            "الكمية غير صالحة.",
          )
          .min(
            1,
            "الكمية يجب أن تكون 1 على الأقل.",
          )
          .max(
            10,
            "لا يمكن طلب أكثر من 10 نسخ في الطلب الواحد.",
          ),

      fullName:
        z
          .string()
          .trim()
          .min(
            2,
            "الاسم الكامل مطلوب.",
          )
          .max(
            100,
            "الاسم طويل جداً.",
          ),

      phone:
        z
          .string()
          .trim()
          .refine(
            isValidAlgerianPhone,
            "رقم الهاتف غير صالح.",
          ),

      wilayaCode:
        z
          .number()
          .int(
            "رمز الولاية غير صالح.",
          )
          .min(
            1,
            "اختر الولاية.",
          )
          .max(
            POSTGRES_INTEGER_MAX,
            "رمز الولاية غير صالح.",
          ),

      deliveryType:
        z.enum([
          "home",
          "desk",
        ]),

      address:
        z
          .string()
          .trim()
          .max(
            500,
            "العنوان طويل جداً.",
          )
          .optional(),

      notes:
        z
          .string()
          .trim()
          .max(
            1000,
            "الملاحظات طويلة جداً.",
          )
          .optional(),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        if (
          data.deliveryType ===
            "home" &&
          (
            !data.address ||
            data.address
              .trim()
              .length <
              5
          )
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "address",
            ],

            message:
              "العنوان مطلوب للتوصيل إلى المنزل.",
          });
        }
      },
    );

export type OrderInput =
  z.infer<
    typeof orderSchema
  >;