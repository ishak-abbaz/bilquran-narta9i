import { z } from "zod";

const slugRegex =
  /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export const productFormSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "عنوان الكتاب قصير جداً.",
      )
      .max(
        160,
        "عنوان الكتاب طويل جداً.",
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
        slugRegex,
        "استخدم حروفاً وأرقاماً وشرطات فقط.",
      ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        "الوصف يجب ألا يتجاوز 5000 حرف.",
      ),

    category_id:
      z.union([
        z.literal(""),
        z
          .string()
          .uuid(
            "التصنيف غير صالح.",
          ),
      ]),

    publisher: z
      .string()
      .trim()
      .max(
        200,
        "اسم الناشر طويل جداً.",
      ),

    riwaya: z
      .string()
      .trim()
      .max(
        160,
        "اسم الرواية طويل جداً.",
      ),

    price: z
      .number({
        message:
          "السعر مطلوب.",
      })
      .int(
        "السعر يجب أن يكون عدداً صحيحاً.",
      )
      .min(
        0,
        "السعر لا يمكن أن يكون سالباً.",
      )
      .max(
        1_000_000_000,
        "السعر أكبر من الحد المسموح.",
      ),

    stock: z
      .number({
        message:
          "المخزون مطلوب.",
      })
      .int(
        "المخزون يجب أن يكون عدداً صحيحاً.",
      )
      .min(
        0,
        "المخزون لا يمكن أن يكون سالباً.",
      )
      .max(
        1_000_000,
        "قيمة المخزون أكبر من الحد المسموح.",
      ),

    is_featured:
      z.boolean(),

    is_active:
      z.boolean(),

    images: z
      .array(
        z
          .string()
          .url(
            "رابط الصورة غير صالح.",
          ),
      )
      .max(
        3,
        "لا يمكن إضافة أكثر من 3 صور للكتاب.",
      ),
  });

export type ProductFormValues =
  z.infer<
    typeof productFormSchema
  >;

export const emptyProductFormValues:
  ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  publisher: "",
  riwaya: "",
  price: 0,
  stock: 0,
  is_featured: false,
  is_active: true,
  images: [],
};