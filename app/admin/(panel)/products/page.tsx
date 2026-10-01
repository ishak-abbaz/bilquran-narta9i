/* eslint-disable @next/next/no-img-element */

import {
  ImageIcon,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { DeleteProductButton } from "@/components/admin/delete-product-button";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

type Category = {
  id: string;
  name: string;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  is_active: boolean | null;
  images: string[] | null;
  category_id: string | null;
  category: {
    name: string;
  } | null;
};

const categoryIdSchema =
  z.string().uuid();

function formatDzd(
  value: number,
) {
  return `${new Intl.NumberFormat(
    "en-US",
  ).format(value)} د.ج`;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  await requireAdmin();

  const supabase =
    await createClient();

  const params =
    await searchParams;

  const searchQuery =
    typeof params.q === "string"
      ? params.q
          .trim()
          .slice(0, 100)
      : "";

  const categoryParam =
    typeof params.category ===
    "string"
      ? params.category
      : "";

  const parsedCategoryId =
    categoryIdSchema.safeParse(
      categoryParam,
    );

  const selectedCategoryId =
    parsedCategoryId.success
      ? parsedCategoryId.data
      : "";

  const categoriesPromise =
    supabase
      .from("categories")
      .select("id, name")
      .order(
        "sort_order",
        {
          ascending: true,
        },
      )
      .order(
        "name",
        {
          ascending: true,
        },
      );

  let productsQuery =
    supabase
      .from("products")
      .select(
        `
          id,
          name,
          price,
          stock,
          is_active,
          images,
          category_id,
          category:categories (
            name
          )
        `,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

  if (searchQuery) {
    productsQuery =
      productsQuery.ilike(
        "name",
        `%${searchQuery}%`,
      );
  }

  if (
    selectedCategoryId
  ) {
    productsQuery =
      productsQuery.eq(
        "category_id",
        selectedCategoryId,
      );
  }

  const [
    {
      data: categoriesData,
      error: categoriesError,
    },
    {
      data: productsData,
      error: productsError,
    },
  ] = await Promise.all([
    categoriesPromise,
    productsQuery,
  ]);

  if (categoriesError) {
    console.error(
      "فشل تحميل التصنيفات:",
      categoriesError,
    );

    throw new Error(
      "تعذر تحميل التصنيفات.",
    );
  }

  if (productsError) {
    console.error(
      "فشل تحميل المنتجات:",
      productsError,
    );

    throw new Error(
      "تعذر تحميل المنتجات.",
    );
  }

  const categories =
    (categoriesData ?? []) as Category[];

  const products =
    (productsData ??
      []) as unknown as ProductRow[];

  const hasFilters =
    Boolean(
      searchQuery ||
        selectedCategoryId,
    );

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-[1600px]">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
              إدارة المخزون
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              المنتجات
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              إدارة المنتجات والأسعار
              والمخزون وحالة ظهور المنتجات
              في المتجر.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus
              className="size-4"
              aria-hidden="true"
            />
            إضافة منتج
          </Link>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-card">
          <div className="border-b border-border p-4 sm:p-5">
            <form
              method="GET"
              action="/admin/products"
              className="flex flex-col gap-3 xl:flex-row"
            >
              <div className="relative min-w-0 flex-1">
                <label
                  htmlFor="product-search"
                  className="sr-only"
                >
                  البحث عن منتج
                </label>

                <Search
                  className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="product-search"
                  name="q"
                  type="search"
                  defaultValue={
                    searchQuery
                  }
                  placeholder="ابحث باسم المنتج..."
                  className="h-11 w-full rounded-xl border border-input bg-background ps-10 pe-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="min-w-0 xl:w-64">
                <label
                  htmlFor="category-filter"
                  className="sr-only"
                >
                  تصفية حسب التصنيف
                </label>

                <select
                  id="category-filter"
                  name="category"
                  defaultValue={
                    selectedCategoryId
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-foreground/30 focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">
                    كل التصنيفات
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
              >
                <Search
                  className="size-4"
                  aria-hidden="true"
                />
                بحث
              </button>

              {hasFilters ? (
                <Link
                  href="/admin/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <RotateCcw
                    className="size-4"
                    aria-hidden="true"
                  />
                  إعادة ضبط
                </Link>
              ) : null}
            </form>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <p className="text-sm font-medium">
              {products.length ===
              0
                ? "لا توجد منتجات"
                : `${products.length} ${
                    products.length ===
                    1
                      ? "منتج"
                      : "منتجات"
                  }`}
            </p>

            <p className="text-xs text-muted-foreground">
              {hasFilters
                ? "نتائج البحث والتصفية"
                : "جميع المنتجات"}
            </p>
          </div>

          {products.length ===
          0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
                <PackageOpen
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <h2 className="text-lg font-semibold">
                {hasFilters
                  ? "لم نعثر على منتجات مطابقة"
                  : "لا توجد منتجات بعد"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                {hasFilters
                  ? "جرّب تغيير عبارة البحث أو اختيار تصنيف آخر."
                  : "ابدأ بإضافة أول منتج إلى المتجر."}
              </p>

              {hasFilters ? (
                <Link
                  href="/admin/products"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  عرض جميع المنتجات
                </Link>
              ) : (
                <Link
                  href="/admin/products/new"
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />
                  إضافة منتج
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="w-24 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الصورة
                    </th>

                    <th className="min-w-60 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      اسم المنتج
                    </th>

                    <th className="min-w-40 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      التصنيف
                    </th>

                    <th className="min-w-36 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      السعر
                    </th>

                    <th className="min-w-28 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      المخزون
                    </th>

                    <th className="min-w-28 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الحالة
                    </th>

                    <th className="min-w-52 px-5 py-4 text-end text-xs font-semibold text-muted-foreground">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => {
                      const imageUrl =
                        product
                          .images?.[0] ??
                        null;

                      const stock =
                        product.stock ??
                        0;

                      const isActive =
                        product.is_active ===
                        true;

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-5 py-4">
                            <div className="size-14 overflow-hidden rounded-xl border border-border bg-muted">
                              {imageUrl ? (
                                <img
                                  src={
                                    imageUrl
                                  }
                                  alt={
                                    product.name
                                  }
                                  loading="lazy"
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <ImageIcon
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-72">
                              <p className="truncate font-semibold text-foreground">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {
                                  product.id
                                }
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {product
                              .category
                              ?.name ??
                              "بدون تصنيف"}
                          </td>

                          <td className="px-5 py-4 font-semibold tabular-nums">
                            {formatDzd(
                              product.price,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex min-w-12 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                stock ===
                                0
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {stock}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                                <span
                                  className="size-1.5 rounded-full bg-background"
                                  aria-hidden="true"
                                />
                                نشط
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                <span
                                  className="size-1.5 rounded-full bg-muted-foreground"
                                  aria-hidden="true"
                                />
                                غير نشط
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                              >
                                <Pencil
                                  className="size-4"
                                  aria-hidden="true"
                                />
                                تعديل
                              </Link>

                              <DeleteProductButton
                                productId={
                                  product.id
                                }
                                productName={
                                  product.name
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}