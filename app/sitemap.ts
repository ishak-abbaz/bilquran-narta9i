import type { MetadataRoute } from "next";

import {
  getIndexableProducts,
} from "@/lib/seo/products";
import {
  absoluteUrl,
} from "@/lib/seo/site-url";

export const revalidate = 3600;

function getValidLastModified(
  value: string | null,
  fallback: Date,
): Date {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return fallback;
  }

  return date;
}

function getImageUrl(
  value: string,
): string {
  try {
    return new URL(value).toString();
  } catch {
    return absoluteUrl(value);
  }
}

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const now = new Date();

  const staticPages:
    MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: absoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const products =
      await getIndexableProducts();

    const productPages:
      MetadataRoute.Sitemap =
      products.map(
        (product) => ({
          url: absoluteUrl(
            `/product/${encodeURIComponent(
              product.slug,
            )}`,
          ),

          lastModified:
            getValidLastModified(
              product.created_at,
              now,
            ),

          changeFrequency:
            "weekly",

          priority: 0.8,

          images:
            product.images.length >
            0
              ? product.images
                  .slice(0, 3)
                  .map(getImageUrl)
              : undefined,
        }),
      );

    return [
      ...staticPages,
      ...productPages,
    ];
  } catch (error) {
    console.error(
      "تعذر إضافة الكتب إلى خريطة الموقع:",
      error,
    );

    return staticPages;
  }
}