/* eslint-disable @next/next/no-img-element */
import CategoryDialog from "@/components/admin/category-dialog";
import CategorySortButtons from "@/components/admin/category-sort-buttons";
import DeleteCategoryButton from "@/components/admin/delete-category-button";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image_url:
    | string
    | null;
  sort_order: number;
  bookCount: number;
};

export default async function CategoriesPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const [
    categoriesResult,
    productsResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        image_url,
        sort_order,
        created_at
      `)
      .order(
        "sort_order",
        {
          ascending:
            true,
        },
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        },
      ),

    supabase
      .from("products")
      .select(
        "category_id",
      ),
  ]);

  if (
    categoriesResult.error
  ) {
    throw new Error(
      categoriesResult
        .error.message,
    );
  }

  if (
    productsResult.error
  ) {
    throw new Error(
      productsResult
        .error.message,
    );
  }

  const bookCounts =
    new Map<
      string,
      number
    >();

  for (
    const product of
      productsResult.data ??
      []
  ) {
    if (
      !product.category_id
    ) {
      continue;
    }

    bookCounts.set(
      product.category_id,
      (
        bookCounts.get(
          product.category_id,
        ) ?? 0
      ) + 1,
    );
  }

  const categories:
    AdminCategory[] =
    (
      categoriesResult.data ??
      []
    ).map(
      (category) => ({
        id:
          category.id,

        name:
          category.name,

        slug:
          category.slug,

        image_url:
          category.image_url,

        sort_order:
          Number(
            category.sort_order ??
              0,
          ),

        bookCount:
          bookCounts.get(
            category.id,
          ) ?? 0,
      }),
    );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            التصنيفات
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            إدارة تصنيفات
            المصاحف والكتب
            وترتيب ظهورها في
            المتجر.
          </p>
        </div>

        <CategoryDialog />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="p-4 text-start">
                الصورة
              </th>

              <th className="p-4 text-start">
                الاسم
              </th>

              <th className="p-4 text-start">
                الرابط
              </th>

              <th className="p-4 text-start">
                عدد الكتب
              </th>

              <th className="p-4 text-start">
                الترتيب
              </th>

              <th className="p-4 text-start">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.length >
            0 ? (
              categories.map(
                (
                  category,
                  index,
                ) => (
                  <tr
                    key={
                      category.id
                    }
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="p-4">
                      <div className="size-14 overflow-hidden rounded-lg border border-border bg-muted">
                        {category.image_url ? (
                          <img
                            src={
                              category.image_url
                            }
                            alt={
                              category.name
                            }
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                            لا صورة
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-semibold">
                      {
                        category.name
                      }
                    </td>

                    <td
                      dir="ltr"
                      className="p-4 text-end text-muted-foreground"
                    >
                      {
                        category.slug
                      }
                    </td>

                    <td className="p-4">
                      {
                        category.bookCount
                      }
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="min-w-6 font-medium">
                          {
                            category.sort_order
                          }
                        </span>

                        <CategorySortButtons
                          categoryId={
                            category.id
                          }
                          canMoveUp={
                            index >
                            0
                          }
                          canMoveDown={
                            index <
                            categories.length -
                              1
                          }
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryDialog
                          category={{
                            id:
                              category.id,

                            name:
                              category.name,

                            slug:
                              category.slug,

                            image_url:
                              category.image_url,
                          }}
                        />

                        <DeleteCategoryButton
                          categoryId={
                            category.id
                          }
                          categoryName={
                            category.name
                          }
                          bookCount={
                            category.bookCount
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center"
                >
                  <p className="font-semibold">
                    لا توجد تصنيفات
                    حالياً.
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    أضف أول تصنيف
                    للبدء بتنظيم
                    الكتب.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}