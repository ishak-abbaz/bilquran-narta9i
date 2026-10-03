import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductSeoBySlug } from "@/lib/seo/products";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo/site-config";
import { absoluteUrl } from "@/lib/seo/site-url";

type ProductLayoutProps = {
  children: ReactNode;

  params: Promise<{
    slug: string;
  }>;
};

function getProductDescription(
  productName: string,
  description: string | null,
): string {
  const cleanedDescription = description?.trim();

  if (cleanedDescription) {
    return cleanedDescription.slice(0, 160);
  }

  return `اكتشف ${productName} في ${SITE_NAME}، مع التوصيل داخل الجزائر والدفع عند الاستلام.`;
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductSeoBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: "المصحف غير موجود",

      description:
        "تعذر العثور على المصحف المطلوب في متجر بالقرآن نرتقي.",

      path: `/product/${encodeURIComponent(slug)}`,

      noIndex: true,
    });
  }

  const description = getProductDescription(
    product.name,
    product.description,
  );

  return buildPageMetadata({
    title: product.name,

    description,

    path: `/product/${encodeURIComponent(product.slug)}`,

    image:
      product.image_url ??
      DEFAULT_OG_IMAGE,

    imageAlt:
      `${product.name} | ${SITE_NAME}`,
  });
}

export default async function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  const { slug } = await params;

  const product = await getProductSeoBySlug(slug);

  if (!product) {
    return children;
  }

  const productUrl = absoluteUrl(
    `/product/${encodeURIComponent(product.slug)}`,
  );

  const description = getProductDescription(
    product.name,
    product.description,
  );

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "Product",

    name: product.name,

    description,

    url: productUrl,

    category: "المصاحف والقرآن الكريم",

    ...(product.image_url
      ? {
          image: [
            absoluteUrl(product.image_url),
          ],
        }
      : {}),

    offers: {
      "@type": "Offer",

      url: productUrl,

      priceCurrency: "DZD",

      price: String(product.price),

      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };

  const serializedJsonLd = JSON.stringify(jsonLd).replace(
    /</g,
    "\\u003c",
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializedJsonLd,
        }}
      />

      {children}
    </>
  );
}