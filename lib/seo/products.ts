import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const productSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine(
    (value) => !value.includes("/") && !value.includes("\\"),
    "رابط المصحف غير صالح.",
  );

const productSeoSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.coerce.number().nonnegative(),
  image_url: z.string().nullable(),
  updated_at: z.string().nullable(),
  stock: z.coerce.number().int().nonnegative(),
  is_active: z.boolean(),
});

export type ProductSeo = z.infer<typeof productSeoSchema>;

function createSeoSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "متغيرات Supabase العامة غير مضبوطة في إعدادات البيئة.",
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const getProductSeoBySlug = cache(
  async (rawSlug: string): Promise<ProductSeo | null> => {
    const slugResult = productSlugSchema.safeParse(rawSlug);

    if (!slugResult.success) {
      return null;
    }

    const supabase = createSeoSupabaseClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, description, price, image_url, updated_at, stock, is_active",
      )
      .eq("slug", slugResult.data)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("تعذر تحميل بيانات المصحف لمحركات البحث:", error);

      throw new Error("تعذر تحميل بيانات المصحف.");
    }

    if (!data) {
      return null;
    }

    const parsedProduct = productSeoSchema.safeParse(data);

    if (!parsedProduct.success) {
      console.error(
        "بيانات المصحف لا تطابق بنية SEO المطلوبة:",
        parsedProduct.error,
      );

      throw new Error("بيانات المصحف المخزنة غير صالحة.");
    }

    return parsedProduct.data;
  },
);

export async function getIndexableProducts(): Promise<ProductSeo[]> {
  const supabase = createSeoSupabaseClient();

  const pageSize = 1000;
  let offset = 0;

  const products: ProductSeo[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, description, price, image_url, updated_at, stock, is_active",
      )
      .eq("is_active", true)
      .order("updated_at", {
        ascending: false,
      })
      .order("slug", {
        ascending: true,
      })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error(
        "تعذر تحميل المصاحف لخريطة الموقع:",
        error,
      );

      throw new Error(
        "تعذر تحميل المصاحف لخريطة الموقع.",
      );
    }

    const parsedPage = z.array(productSeoSchema).safeParse(data ?? []);

    if (!parsedPage.success) {
      console.error(
        "بيانات المصاحف لا تطابق بنية خريطة الموقع:",
        parsedPage.error,
      );

      throw new Error(
        "بيانات المصاحف المخزنة غير صالحة.",
      );
    }

    products.push(...parsedPage.data);

    if (parsedPage.data.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return products;
}