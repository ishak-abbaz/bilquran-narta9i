import {
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import type { ProductFormValues } from "@/lib/products/product-schema";
import { createClient } from "@/lib/supabase/server";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Category = {
  id: string;
  name: string;
};

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  stock: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
};

const productIdSchema =
  z.string().uuid();

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;

  const parsedProductId =
    productIdSchema.safeParse(id);

  if (!parsedProductId.success) {
    notFound();
  }

  const supabase =
    await createClient();

  const [
    {
      data: categoriesData,
      error: categoriesError,
    },
    {
      data: productData,
      error: productError,
    },
  ] = await Promise.all([
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
      ),

    supabase
      .from("products")
      .select(
        `
          id,
          name,
          slug,
          description,
          price,
          compare_at_price,
          category_id,
          images,
          sizes,
          colors,
          stock,
          is_featured,
          is_active
        `,
      )
      .eq(
        "id",
        parsedProductId.data,
      )
      .maybeSingle(),
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

  if (productError) {
    console.error(
      "فشل تحميل المنتج:",
      productError,
    );

    throw new Error(
      "تعذر تحميل المنتج.",
    );
  }

  if (!productData) {
    notFound();
  }

  const categories =
    (categoriesData ?? []) as Category[];

  const product =
    productData as ProductRecord;

  const initialValues: ProductFormValues =
    {
      name: product.name,
      slug: product.slug,
      description:
        product.description ?? "",
      category_id:
        product.category_id ?? "",
      price: product.price,
      compare_at_price:
        product.compare_at_price,
      stock: product.stock ?? 0,
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      is_featured:
        product.is_featured === true,
      is_active:
        product.is_active === true,
      images: product.images ?? [],
    };

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
            العودة إلى المنتجات
          </Link>

          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            إدارة المنتجات
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            تعديل المنتج
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            {product.name}
          </p>
        </header>

        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          initialValues={initialValues}
        />
      </div>
    </main>
  );
}