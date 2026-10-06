import { z } from "zod";

const slugPattern =
  /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export const categoryFormSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "اسم التصنيف مطلوب.",
      )
      .max(
        100,
        "اسم التصنيف طويل جداً.",
      ),

    slug: z
      .string()
      .trim()
      .min(
        1,
        "الرابط المختصر مطلوب.",
      )
      .max(
        180,
        "الرابط المختصر طويل جداً.",
      )
      .regex(
        slugPattern,
        "الرابط المختصر يجب أن يحتوي على حروف أو أرقام وشرطات فقط.",
      ),

    imageUrl: z
      .string()
      .url(
        "رابط الصورة غير صالح.",
      )
      .nullable(),
  });

export type CategoryFormValues =
  z.infer<
    typeof categoryFormSchema
  >;