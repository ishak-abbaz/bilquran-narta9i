import { z } from "zod";

import {
  isValidAlgerianPhone,
} from "@/lib/data/phone";

export const orderSchema = z
  .object({
    productId: z
      .string()
      .uuid(
        "معرف الكتاب غير صالح",
      ),

    quantity: z
      .number({
        error:
          "الكمية غير صالحة",
      })
      .int(
        "الكمية غير صالحة",
      )
      .min(
        1,
        "الكمية يجب أن تكون 1 على الأقل",
      )
      .max(
        10,
        "الحد الأقصى للطلب هو 10 نسخ",
      ),

    fullName: z
      .string()
      .trim()
      .min(
        3,
        "الاسم الكامل مطلوب",
      )
      .max(
        100,
        "الاسم الكامل طويل جداً",
      ),

    phone: z
      .string()
      .trim()
      .refine(
        isValidAlgerianPhone,
        "رقم الهاتف غير صالح",
      ),

    wilayaCode: z
      .number({
        error:
          "اختر الولاية",
      })
      .int(
        "اختر الولاية",
      )
      .min(
        1,
        "اختر الولاية",
      ),

    deliveryType: z.enum(
      [
        "home",
        "desk",
      ],
      {
        error:
          "اختر نوع التوصيل",
      },
    ),

    address: z
      .string()
      .trim()
      .max(
        300,
        "العنوان طويل جداً",
      )
      .optional(),

    notes: z
      .string()
      .trim()
      .max(
        1000,
        "الملاحظات طويلة جداً",
      )
      .optional(),
  })
  .superRefine(
    (
      data,
      ctx,
    ) => {
      if (
        data.deliveryType ===
          "home" &&
        (
          !data.address ||
          data.address.length < 5
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: [
            "address",
          ],
          message:
            "العنوان مطلوب",
        });
      }
    },
  );

export type OrderInput =
  z.infer<
    typeof orderSchema
  >;