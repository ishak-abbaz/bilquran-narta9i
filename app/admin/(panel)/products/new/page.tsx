import {
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import {
  ProductForm,
} from "@/components/admin/product-form";
import {
  requireAdmin,
} from "@/lib/auth";
import {
  createClient,
} from "@/lib/supabase/server";

type Category = {
  id: string;
  name: string;
};

export default async function NewProductPage() {
  await requireAdmin();

  const supabase =
    await createClient();

  const {
    data:
      categoriesData,
    error:
      categoriesError,
  } = await supabase
    .from("categories")
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

  const categories =
    (
      categoriesData ??
      []
    ) as Category[];

  return (
    <main className="w-full">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <Link
            href="/admin/products"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />

            العودة إلى الكتب
          </Link>

          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            إدارة الكتب
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            إضافة كتاب
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            أضف بيانات الكتاب والناشر
            والرواية والسعر والمخزون
            والصور.
          </p>
        </header>

        <ProductForm
          mode="create"
          categories={
            categories
          }
        />
      </div>
    </main>
  );
}