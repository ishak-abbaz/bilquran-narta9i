import type {
  Metadata,
} from "next";
import {
  notFound,
} from "next/navigation";

import ProductCard from "@/components/product-card";
import ProductDetailsClient from "@/components/product/product-details-client";
import {
  getDeliveryPrices,
} from "@/lib/data/delivery";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/data/products";
import {
  buildPageMetadata,
} from "@/lib/seo/metadata";
import {
  buildBookStructuredData,
} from "@/lib/seo/products";
import {
  getStoreSettings,
} from "@/lib/store-settings";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const product =
    await getProductBySlug(
      slug,
    );

  if (!product) {
    return buildPageMetadata({
      title:
        "الكتاب غير موجود",

      description:
        "تعذر العثور على هذا الكتاب.",

      path:
        `/product/${encodeURIComponent(
          slug,
        )}`,

      noIndex:
        true,
    });
  }

  return buildPageMetadata({
    title:
      product.name,

    description:
      product.description ??
      `اطلب ${product.name} من متجر بالقرآن نرتقي مع التوصيل داخل الجزائر والدفع عند الاستلام.`,

    path:
      `/product/${encodeURIComponent(
        product.slug,
      )}`,

    image:
      product.images[0],
  });
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const {
    slug,
  } = await params;

  const product =
    await getProductBySlug(
      slug,
    );

  if (!product) {
    notFound();
  }

  const [
    relatedProducts,
    deliveryPrices,
    settings,
  ] = await Promise.all([
    getRelatedProducts(
      product,
      4,
    ),

    getDeliveryPrices(),

    getStoreSettings(),
  ]);

  const structuredData =
    buildBookStructuredData({
      slug:
        product.slug,

      name:
        product.name,

      description:
        product.description,

      publisher:
        product.publisher,

      riwaya:
        product.riwaya,

      price:
        product.price,

      images:
        product.images,

      stock:
        product.stock,

      is_active:
        product.is_active,

      created_at:
        product.created_at,
    });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData,
            ).replace(
              /</g,
              "\\u003c",
            ),
        }}
      />

      <ProductDetailsClient
        product={
          product
        }
        deliveryPrices={
          deliveryPrices
        }
        freeDeliveryThreshold={
          settings.free_delivery_threshold
        }
      />

      {relatedProducts.length >
      0 ? (
        <section className="mt-20">
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary">
              قد يعجبك أيضاً
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              كتب من نفس التصنيف
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map(
              (
                relatedProduct,
              ) => (
                <ProductCard
                  key={
                    relatedProduct.id
                  }
                  product={
                    relatedProduct
                  }
                />
              ),
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}