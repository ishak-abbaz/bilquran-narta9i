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
import {
  z,
} from "zod";

import {
  DeleteProductButton,
} from "@/components/admin/delete-product-button";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";
import {
  formatPrice,
} from "@/lib/utils";

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

  publisher:
    | string
    | null;

  price: number;

  is_active:
    | boolean
    | null;

  images:
    | string[]
    | null;

  category_id:
    | string
    | null;

  category: {
    name: string;
  } | null;
};

const categoryIdSchema =
  z.string().uuid();

function sanitizeSearch(
  value: string,
) {
  return value
    .replace(
      /[(),%]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .slice(
      0,
      100,
    );
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
    typeof params.q ===
    "string"
      ? sanitizeSearch(
          params.q,
        )
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
      .from(
        "categories",
      )
      .select(
        "id, name",
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        },
      )
      .order(
        "name",
        {
          ascending:
            true,
        },
      );

  let productsQuery =
    supabase
      .from(
        "products",
      )
      .select(`
        id,
        name,
        publisher,
        price,
        is_active,
        images,
        category_id,
        category:categories (
          name
        )
      `)
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

  if (
    searchQuery
  ) {
    productsQuery =
      productsQuery.or(
        `name.ilike.%${searchQuery}%,publisher.ilike.%${searchQuery}%`,
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
      data:
        categoriesData,

      error:
        categoriesError,
    },
    {
      data:
        productsData,

      error:
        productsError,
    },
  ] =
    await Promise.all([
      categoriesPromise,
      productsQuery,
    ]);

  if (
    categoriesError
  ) {
    console.error(
      "فشل تحميل التصنيفات:",
      categoriesError,
    );

    throw new Error(
      "تعذر تحميل التصنيفات.",
    );
  }

  if (
    productsError
  ) {
    console.error(
      "فشل تحميل الكتب:",
      productsError,
    );

    throw new Error(
      "تعذر تحميل الكتب.",
    );
  }

  const categories =
    (
      categoriesData ??
      []
    ) as Category[];

  const products =
    (
      productsData ??
      []
    ) as unknown as ProductRow[];

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
              إدارة الكتب
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              الكتب
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              إدارة الكتب والأسعار
              والتصنيفات وحالة ظهورها
              في المتجر.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus
              className="size-4"
              aria-hidden="true"
            />

            إضافة كتاب
          </Link>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="border-b border-border p-4 sm:p-5">
            <form
              method="get"
              action="/admin/products"
              className="flex flex-col gap-3 xl:flex-row"
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  name="q"
                  type="search"
                  defaultValue={
                    searchQuery
                  }
                  placeholder="ابحث بعنوان الكتاب أو الناشر..."
                  className="h-11 w-full rounded-xl border border-input bg-background ps-10 pe-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>

              <select
                name="category"
                defaultValue={
                  selectedCategoryId
                }
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 xl:w-64"
              >
                <option value="">
                  كل التصنيفات
                </option>

                {categories.map(
                  (
                    category,
                  ) => (
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

              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
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
                ? "لا توجد كتب"
                : `${products.length} كتاب`}
            </p>

            <p className="text-xs text-muted-foreground">
              {hasFilters
                ? "نتائج البحث والتصفية"
                : "جميع الكتب"}
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
                  ? "لم نعثر على كتب مطابقة"
                  : "لا توجد كتب بعد"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                {hasFilters
                  ? "جرّب تغيير البحث أو اختيار تصنيف آخر."
                  : "ابدأ بإضافة أول كتاب إلى المتجر."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="w-24 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الصورة
                    </th>

                    <th className="min-w-60 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الكتاب
                    </th>

                    <th className="min-w-44 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      الناشر
                    </th>

                    <th className="min-w-40 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      التصنيف
                    </th>

                    <th className="min-w-32 px-5 py-4 text-start text-xs font-semibold text-muted-foreground">
                      السعر
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
                    (
                      product,
                    ) => {
                      const image =
                        product
                          .images?.[0] ??
                        null;

                      const active =
                        product.is_active ===
                        true;

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="border-b border-border last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="px-5 py-4">
                            <div className="size-14 overflow-hidden rounded-xl border border-border bg-muted">
                              {image ? (
                                <img
                                  src={
                                    image
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
                            <p className="max-w-72 truncate font-semibold">
                              {
                                product.name
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {product.publisher ??
                              "غير محدد"}
                          </td>

                          <td className="px-5 py-4 text-muted-foreground">
                            {product
                              .category
                              ?.name ??
                              "بدون تصنيف"}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {formatPrice(
                              product.price,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {active ? (
                              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                نشط
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                غير نشط
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
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