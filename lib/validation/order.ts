import { z } from "zod";

import {
  isValidAlgerianPhone,
} from "@/lib/data/phone";


export const orderSchema = z.object({

  fullName: z
    .string()
    .min(3, "الاسم الكامل مطلوب"),

  phone: z
    .string()
    .refine(
      isValidAlgerianPhone,
      "رقم الهاتف غير صالح",
    ),

  wilaya: z
  .string()
  .min(1, "اختر الولاية"),

  address: z
    .string()
    .min(5, "العنوان مطلوب"),

  notes: z
    .string()
    .optional(),

  deliveryType: z.enum([
    "home",
    "office",
  ]),

  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      size: z.string(),
      color: z.string(),
    }),
  ).min(1),

});


export type OrderInput =
  z.infer<typeof orderSchema>;