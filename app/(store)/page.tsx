import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/product-card";
import {
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/data/products";

export default async function HomePage() {
  const [
    categories,
    newProducts,
    featuredProducts,
  ] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
    getFeaturedProducts(),
  ]);

  return (
    <main className="space-y-20 px-4 py-8 text-start sm:px-8 lg:px-12">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-border bg-muted">
        <div className="mx-auto flex min-h-[520px] max-w-7xl items-center px-6 py-16 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold text-primary">
              مصاحف وكتب إسلامية
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              كتب مختارة بعناية
              <br />
              لكل بيت وقارئ
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              اكتشف مجموعة من المصاحف والكتب الإسلامية
              المناسبة للقراءة والتعلم والإهداء، مع خدمة
              التوصيل والدفع عند الاستلام داخل الجزائر.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                تسوق الكتب
              </Link>

              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-7 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-primary">
            تصفح حسب الاهتمام
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            التصنيفات
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            لا توجد تصنيفات حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(
                  category.slug,
                )}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New arrivals */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              جديد المتجر
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              وصل حديثاً
            </h2>
          </div>

          <Link
            href="/shop"
            className="shrink-0 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            عرض الكل
          </Link>
        </div>

        {newProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            لا توجد كتب حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {newProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">
              اختيارات مميزة
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              الأكثر طلباً
            </h2>
          </div>

          <Link
            href="/shop"
            className="shrink-0 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            عرض الكل
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
            لا توجد كتب مميزة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}