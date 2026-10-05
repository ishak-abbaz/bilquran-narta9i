import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductCard from "@/components/product-card";
import ProductDetailsClient from "@/components/product/product-details-client";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/products";
import {
  buildBookStructuredData,
  getProductSeoBySlug,
} from "@/lib/seo/products";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product =
    await getProductSeoBySlug(slug);

  if (!product) {
    return {
      title: "الكتاب غير موجود",
      description:
        "تعذر العثور على الكتاب المطلوب.",
    };
  }

  const description =
    product.description ??
    (product.publisher
      ? `${product.name}، من إصدار ${product.publisher}.`
      : `${product.name}، متوفر ضمن مجموعة المصاحف والكتب الإسلامية.`);

  const images =
    product.images.slice(0, 3);

  return {
    title: product.name,
    description,

    openGraph: {
      title: product.name,
      description,
      images: images.map((url) => ({
        url,
        alt: product.name,
      })),
    },

    twitter: {
      card:
        images.length > 0
          ? "summary_large_image"
          : "summary",
      title: product.name,
      description,
      images:
        images.length > 0
          ? [images[0]]
          : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    product.category_id
      ? await getRelatedProducts(
          product.category_id,
          product.id,
          4,
        )
      : [];

  const structuredData =
    buildBookStructuredData(product);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData,
          ).replace(/</g, "\\u003c"),
        }}
      />

      <section>
        <ProductDetailsClient
          product={product}
        />
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-20 space-y-8">
          <div>
            <p className="text-sm font-semibold text-primary">
              من نفس التصنيف
            </p>

            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              كتب مشابهة
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map(
              (item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ),
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}