import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/product-card";
import {
  getCategories,
  getNewArrivals,
} from "@/lib/data/products";

export default async function HomePage() {
  const [
    categories,
    newProducts,
  ] = await Promise.all([
    getCategories(),
    getNewArrivals(8),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-20 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-border bg-muted sm:min-h-[620px]">
        <Image
          src="/home-hero.jpg"
          alt="مجموعة من المصاحف والكتب الإسلامية"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/*
         * Gradient only, no text card.
         * It keeps the image visible while making
         * the Arabic content readable.
         */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5"
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-end p-6 sm:p-10 lg:p-14">
          <div className="max-w-2xl text-white">
            <p className="text-sm font-semibold text-emerald-300 sm:text-base">
              مصاحف وكتب إسلامية
            </p>

            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              كتب مختارة بعناية
              <br />
              لكل بيت وقارئ
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-8 text-white/85 sm:text-base">
              اكتشف مجموعة من المصاحف
              والكتب الإسلامية المناسبة
              للقراءة والتعلم والإهداء،
              مع التوصيل والدفع عند
              الاستلام داخل الجزائر.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                تسوق الكتب
              </Link>

              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/60 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
              >
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 ? (
        <section>
          <div className="mb-8">
            <p className="text-sm font-semibold text-primary">
              تصفح حسب النوع
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              التصنيفات
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(
              (category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${encodeURIComponent(
                    category.slug,
                  )}`}
                  className="group overflow-hidden rounded-3xl border border-border bg-background"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {category.image_url ? (
                      <Image
                        src={
                          category.image_url
                        }
                        alt={
                          category.name
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        لا توجد صورة
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold text-primary">
                      تصنيف
                    </p>

                    <h3 className="mt-2 text-lg font-bold">
                      {
                        category.name
                      }
                    </h3>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      ) : null}

      {/* New books */}
      {newProducts.length > 0 ? (
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
              className="text-sm font-semibold text-primary transition-opacity hover:opacity-70"
            >
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {newProducts.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
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