import "server-only";

import {
  createClient,
} from "@supabase/supabase-js";
import { cache } from "react";
import { z } from "zod";

const productSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(180)
  .refine(
    (value) =>
      !value.includes("/") &&
      !value.includes("\\"),
    "رابط الكتاب غير صالح.",
  );

const productSeoSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),

  description:
    z.string().nullable(),

  publisher:
    z.string().nullable(),

  riwaya:
    z.string().nullable(),

  price:
    z.coerce
      .number()
      .nonnegative(),

  images:
    z.array(z.string())
      .max(3),

  stock:
    z.coerce
      .number()
      .int()
      .nonnegative(),

  is_active:
    z.boolean(),

  created_at:
    z.string(),
});

export type ProductSeo =
  z.infer<
    typeof productSeoSchema
  >;

function createSeoSupabaseClient() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const supabaseKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseKey
  ) {
    throw new Error(
      "متغيرات Supabase العامة غير مضبوطة في إعدادات البيئة.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export const getProductSeoBySlug =
  cache(
    async (
      rawSlug: string,
    ): Promise<
      ProductSeo | null
    > => {
      const slugResult =
        productSlugSchema.safeParse(
          rawSlug,
        );

      if (
        !slugResult.success
      ) {
        return null;
      }

      const supabase =
        createSeoSupabaseClient();

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(`
          slug,
          name,
          description,
          publisher,
          riwaya,
          price,
          images,
          stock,
          is_active,
          created_at
        `)
        .eq(
          "slug",
          slugResult.data,
        )
        .eq(
          "is_active",
          true,
        )
        .maybeSingle();

      if (error) {
        console.error(
          "تعذر تحميل بيانات الكتاب لمحركات البحث:",
          error,
        );

        throw new Error(
          "تعذر تحميل بيانات الكتاب.",
        );
      }

      if (!data) {
        return null;
      }

      const parsedProduct =
        productSeoSchema.safeParse(
          data,
        );

      if (
        !parsedProduct.success
      ) {
        console.error(
          "بيانات الكتاب لا تطابق بنية SEO المطلوبة:",
          parsedProduct.error,
        );

        throw new Error(
          "بيانات الكتاب المخزنة غير صالحة.",
        );
      }

      return parsedProduct.data;
    },
  );

export async function getIndexableProducts(): Promise<
  ProductSeo[]
> {
  const supabase =
    createSeoSupabaseClient();

  const pageSize = 1000;
  let offset = 0;

  const products:
    ProductSeo[] = [];

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(`
        slug,
        name,
        description,
        publisher,
        riwaya,
        price,
        images,
        stock,
        is_active,
        created_at
      `)
      .eq(
        "is_active",
        true,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .order(
        "slug",
        {
          ascending: true,
        },
      )
      .range(
        offset,
        offset +
          pageSize -
          1,
      );

    if (error) {
      console.error(
        "تعذر تحميل الكتب لخريطة الموقع:",
        error,
      );

      throw new Error(
        "تعذر تحميل الكتب لخريطة الموقع.",
      );
    }

    const parsedPage =
      z.array(
        productSeoSchema,
      ).safeParse(
        data ?? [],
      );

    if (
      !parsedPage.success
    ) {
      console.error(
        "بيانات الكتب لا تطابق بنية خريطة الموقع:",
        parsedPage.error,
      );

      throw new Error(
        "بيانات الكتب المخزنة غير صالحة.",
      );
    }

    products.push(
      ...parsedPage.data,
    );

    if (
      parsedPage.data.length <
      pageSize
    ) {
      break;
    }

    offset += pageSize;
  }

  return products;
}

export function buildBookStructuredData(
  product: ProductSeo,
) {
  const additionalProperties =
    product.riwaya
      ? [
          {
            "@type":
              "PropertyValue",
            name: "الرواية",
            value:
              product.riwaya,
          },
        ]
      : undefined;

  return {
    "@context":
      "https://schema.org",

    "@type": [
      "Product",
      "Book",
    ],

    name:
      product.name,

    sku:
      product.slug,

    description:
      product.description ??
      undefined,

    image:
      product.images.length >
      0
        ? product.images
        : undefined,

    publisher:
      product.publisher
        ? {
            "@type":
              "Organization",
            name:
              product.publisher,
          }
        : undefined,

    additionalProperty:
      additionalProperties,

    offers: {
      "@type": "Offer",

      priceCurrency:
        "DZD",

      price:
        product.price,

      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
}