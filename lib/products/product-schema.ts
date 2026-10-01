import { z } from "zod";

const slugRegex =
  /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "اسم المنتج قصير جداً.")
      .max(120, "اسم المنتج طويل جداً."),

    slug: z
      .string()
      .trim()
      .min(1, "الرابط المختصر مطلوب.")
      .max(160, "الرابط المختصر طويل جداً.")
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

    category_id: z.union([
      z.literal(""),
      z.string().uuid("التصنيف غير صالح."),
    ]),

    price: z
      .number({
        message: "السعر مطلوب.",
      })
      .int("السعر يجب أن يكون عدداً صحيحاً.")
      .min(0, "السعر لا يمكن أن يكون سالباً.")
      .max(
        1_000_000_000,
        "السعر أكبر من الحد المسموح.",
      ),

    compare_at_price: z
      .number()
      .int(
        "السعر قبل التخفيض يجب أن يكون عدداً صحيحاً.",
      )
      .min(
        0,
        "السعر قبل التخفيض لا يمكن أن يكون سالباً.",
      )
      .max(
        1_000_000_000,
        "السعر قبل التخفيض أكبر من الحد المسموح.",
      )
      .nullable(),

    stock: z
      .number({
        message: "المخزون مطلوب.",
      })
      .int("المخزون يجب أن يكون عدداً صحيحاً.")
      .min(
        0,
        "المخزون لا يمكن أن يكون سالباً.",
      )
      .max(
        1_000_000,
        "قيمة المخزون أكبر من الحد المسموح.",
      ),

    sizes: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(30),
      )
      .max(
        20,
        "لا يمكن إضافة أكثر من 20 مقاساً.",
      ),

    colors: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(50),
      )
      .max(
        30,
        "لا يمكن إضافة أكثر من 30 لوناً.",
      ),

    is_featured: z.boolean(),

    is_active: z.boolean(),

    images: z
      .array(
        z
          .string()
          .url("رابط الصورة غير صالح."),
      )
      .max(
        10,
        "لا يمكن إضافة أكثر من 10 صور.",
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.compare_at_price !== null &&
      data.compare_at_price <= data.price
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["compare_at_price"],
        message:
          "السعر قبل التخفيض يجب أن يكون أكبر من السعر الحالي.",
      });
    }

    const normalizedSizes = data.sizes.map(
      (size) => size.trim().toLowerCase(),
    );

    if (
      new Set(normalizedSizes).size !==
      normalizedSizes.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sizes"],
        message: "يوجد مقاس مكرر.",
      });
    }

    const normalizedColors = data.colors.map(
      (color) => color.trim().toLowerCase(),
    );

    if (
      new Set(normalizedColors).size !==
      normalizedColors.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["colors"],
        message: "يوجد لون مكرر.",
      });
    }
  });

export type ProductFormValues = z.infer<
  typeof productFormSchema
>;

export const emptyProductFormValues: ProductFormValues =
  {
    name: "",
    slug: "",
    description: "",
    category_id: "",
    price: 0,
    compare_at_price: null,
    stock: 0,
    sizes: [],
    colors: [],
    is_featured: false,
    is_active: true,
    images: [],
  };