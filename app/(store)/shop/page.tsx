import Link from "next/link";

import ProductCard from "@/components/product-card";
import {
  getCategories,
  getProducts,
} from "@/lib/data/products";

type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
  }>;
};

const sortOptions: {
  label: string;
  value: ProductSort;
}[] = [
  {
    label: "الأحدث",
    value: "newest",
  },
  {
    label: "السعر: من الأقل",
    value: "price-asc",
  },
  {
    label: "السعر: من الأعلى",
    value: "price-desc",
  },
];

function buildShopHref({
  category,
  sort,
  search,
}: {
  category?: string;
  sort?: ProductSort;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (sort && sort !== "newest") {
    params.set("sort", sort);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return query
    ? `/shop?${query}`
    : "/shop";
}

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;

  const category =
    params.category?.trim() || undefined;

  const search =
    params.search?.trim() || undefined;

  const sort: ProductSort =
    params.sort === "price-asc" ||
    params.sort === "price-desc"
      ? params.sort
      : "newest";

  const [
    categories,
    products,
  ] = await Promise.all([
    getCategories(),
    getProducts({
      category,
      sort,
      search,
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold text-primary">
          مصاحف وكتب إسلامية
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          المتجر
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          تصفح مجموعتنا واختر الكتاب المناسب لك.
        </p>
      </header>

      <section className="mb-8 space-y-5">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildShopHref({
              sort,
              search,
            })}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            الكل
          </Link>

          {categories.map((item) => (
            <Link
              key={item.id}
              href={buildShopHref({
                category: item.slug,
                sort,
                search,
              })}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                category === item.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Search and sorting */}
        <form
          method="GET"
          action="/shop"
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          {category ? (
            <input
              type="hidden"
              name="category"
              value={category}
            />
          ) : null}

          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="ابحث باسم الكتاب أو الناشر"
            className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />

          <select
            name="sort"
            defaultValue={sort}
            aria-label="ترتيب الكتب"
            className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            تطبيق
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {products.length} كتاب
          </p>

          {search ? (
            <Link
              href={buildShopHref({
                category,
                sort,
              })}
              className="text-sm font-semibold text-primary hover:underline"
            >
              مسح البحث
            </Link>
          ) : null}
        </div>
      </section>

      {products.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border py-20 text-center">
          <h2 className="text-xl font-semibold">
            لا توجد كتب
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            جرّب تغيير التصنيف أو عبارة البحث.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </section>
      )}
    </main>
  );
}