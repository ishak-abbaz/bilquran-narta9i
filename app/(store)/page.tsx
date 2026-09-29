import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { mockProducts } from "@/lib/mock-data";

const categories = [
  {
    name: "تيشرتات",
    slug: "t-shirts",
    image: "/categories/t-shirts.jpg",
  },
  {
    name: "أطقم",
    slug: "sets",
    image: "/categories/sets.jpg",
  },
  {
    name: "شورتات",
    slug: "shorts",
    image: "/categories/shorts.jpg",
  },
  {
    name: "بناطيل",
    slug: "pants",
    image: "/categories/pants.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="space-y-20 px-4 py-8 text-start sm:px-8 lg:px-12">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-4xl bg-neutral-100 dark:bg-neutral-900">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/hero-mobile.jpg"
          />

          <Image
            src="/hero.jpg"
            alt="مجموعة أسترا"
            width={1600}
            height={900}
            priority
            sizes="100vw"
            className="h-[70vh] w-full object-cover"
          />
        </picture>

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8 text-white sm:p-12">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              أناقة عصرية تناسب كل يوم
            </h1>

            <p className="text-lg text-white/90">
              اكتشف تشكيلتنا الجديدة من الملابس العصرية بجودة عالية.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:bg-neutral-200"
              >
                تسوق المجموعة
              </Link>

              <Link
                href="/contact"
                className="rounded-full border border-white px-7 py-3 font-semibold text-white transition hover:bg-white hover:text-black"
              >
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Categories */}
      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-black"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-sm tracking-[0.25em] text-neutral-500">
                  التصنيف
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {category.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* New arrivals */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-neutral-500">
              جديد
            </p>

            <h2 className="text-3xl font-bold">
              وصل حديثاً
            </h2>
          </div>

          <Link
            href="/shop"
            className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold transition hover:bg-black hover:text-white dark:border-white/20"
          >
            عرض الكل
          </Link>
        </div>


        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

    </main>
  );
}