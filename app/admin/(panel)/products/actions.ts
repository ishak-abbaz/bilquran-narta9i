"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/products/product-schema";
import { createClient } from "@/lib/supabase/server";

const productIdSchema = z
  .string()
  .uuid("معرّف المنتج غير صالح.");

export type ProductActionResult =
  | {
      success: true;
      message: string;
      productId: string;
      slug: string;
    }
  | {
      success: false;
      message: string;
    };

export type DeleteProductResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

type SupabaseServerClient = Awaited<
  ReturnType<typeof createClient>
>;

type ProductSnapshot = {
  slug: string;
  images: string[];
};

function normalizeImageUrls(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: unknown[] = value;

  return items.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function getProductStoragePath(
  publicUrl: string,
): string | null {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return null;
    }

    const parsedSupabaseUrl =
      new URL(supabaseUrl);

    const parsedPublicUrl =
      new URL(publicUrl);

    if (
      parsedSupabaseUrl.origin !==
      parsedPublicUrl.origin
    ) {
      return null;
    }

    const prefix =
      "/storage/v1/object/public/products/";

    if (
      !parsedPublicUrl.pathname.startsWith(
        prefix,
      )
    ) {
      return null;
    }

    const encodedPath =
      parsedPublicUrl.pathname.slice(
        prefix.length,
      );

    if (!encodedPath) {
      return null;
    }

    return decodeURIComponent(
      encodedPath,
    );
  } catch {
    return null;
  }
}

function validateProductImageUrls(
  images: string[],
): boolean {
  return images.every(
    (url) =>
      getProductStoragePath(url) !== null,
  );
}

async function removeProductImages(
  supabase: SupabaseServerClient,
  urls: string[],
) {
  const paths = Array.from(
    new Set(
      urls
        .map(
          getProductStoragePath,
        )
        .filter(
          (
            path,
          ): path is string =>
            path !== null,
        ),
    ),
  );

  if (paths.length === 0) {
    return;
  }

  const { error } =
    await supabase.storage
      .from("products")
      .remove(paths);

  if (error) {
    console.error(
      "تعذر تنظيف صور المنتج من Storage:",
      error,
    );
  }
}

function revalidateProductPages(
  ...slugs: Array<
    string | null | undefined
  >
) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(
    "/admin/products",
  );

  const validSlugs =
    slugs.filter(
      (
        value,
      ): value is string =>
        typeof value === "string" &&
        value.length > 0,
    );

  for (const slug of new Set(
    validSlugs,
  )) {
    revalidatePath(
      `/shop/${slug}`,
    );
  }
}

function getDatabaseErrorMessage(
  error: {
    code?: string;
  },
): string {
  if (error.code === "23505") {
    return "الرابط المختصر مستخدم من منتج آخر.";
  }

  if (error.code === "23503") {
    return "التصنيف المحدد غير موجود.";
  }

  return "حدث خطأ أثناء حفظ المنتج.";
}

export async function createProduct(
  input: ProductFormValues,
): Promise<ProductActionResult> {
  await requireAdmin();

  const parsed =
    productFormSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]
          ?.message ??
        "بيانات المنتج غير صالحة.",
    };
  }

  if (
    !validateProductImageUrls(
      parsed.data.images,
    )
  ) {
    return {
      success: false,
      message:
        "إحدى الصور لا تنتمي إلى مخزن المنتجات.",
    };
  }

  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description:
          parsed.data.description ||
          null,
        price: parsed.data.price,
        compare_at_price:
          parsed.data
            .compare_at_price,
        category_id:
          parsed.data.category_id ||
          null,
        images:
          parsed.data.images,
        sizes:
          parsed.data.sizes,
        colors:
          parsed.data.colors,
        stock:
          parsed.data.stock,
        is_featured:
          parsed.data.is_featured,
        is_active:
          parsed.data.is_active,
      })
      .select("id, slug")
      .single();

  if (error || !data) {
    console.error(
      "فشل إنشاء المنتج:",
      error,
    );

    return {
      success: false,
      message:
        getDatabaseErrorMessage(
          error ?? {},
        ),
    };
  }

  revalidateProductPages(
    data.slug,
  );

  revalidatePath(
    `/admin/products/${data.id}`,
  );

  return {
    success: true,
    message:
      "تم إنشاء المنتج بنجاح.",
    productId: data.id,
    slug: data.slug,
  };
}

export async function updateProduct(
  productId: string,
  input: ProductFormValues,
): Promise<ProductActionResult> {
  await requireAdmin();

  const parsedProductId =
    productIdSchema.safeParse(
      productId,
    );

  if (
    !parsedProductId.success
  ) {
    return {
      success: false,
      message:
        parsedProductId.error
          .issues[0]?.message ??
        "معرّف المنتج غير صالح.",
    };
  }

  const parsed =
    productFormSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]
          ?.message ??
        "بيانات المنتج غير صالحة.",
    };
  }

  if (
    !validateProductImageUrls(
      parsed.data.images,
    )
  ) {
    return {
      success: false,
      message:
        "إحدى الصور لا تنتمي إلى مخزن المنتجات.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      existingProductData,
    error:
      existingProductError,
  } = await supabase
    .from("products")
    .select(
      "slug, images",
    )
    .eq(
      "id",
      parsedProductId.data,
    )
    .maybeSingle();

  if (
    existingProductError ||
    !existingProductData
  ) {
    return {
      success: false,
      message:
        "المنتج غير موجود.",
    };
  }

  const existingProduct: ProductSnapshot =
    {
      slug: String(
        existingProductData.slug,
      ),

      images:
        normalizeImageUrls(
          existingProductData.images,
        ),
    };

  const { data, error } =
    await supabase
      .from("products")
      .update({
        name:
          parsed.data.name,

        slug:
          parsed.data.slug,

        description:
          parsed.data.description ||
          null,

        price:
          parsed.data.price,

        compare_at_price:
          parsed.data
            .compare_at_price,

        category_id:
          parsed.data.category_id ||
          null,

        images:
          parsed.data.images,

        sizes:
          parsed.data.sizes,

        colors:
          parsed.data.colors,

        stock:
          parsed.data.stock,

        is_featured:
          parsed.data.is_featured,

        is_active:
          parsed.data.is_active,
      })
      .eq(
        "id",
        parsedProductId.data,
      )
      .select("id, slug")
      .single();

  if (error || !data) {
    console.error(
      "فشل تحديث المنتج:",
      error,
    );

    return {
      success: false,
      message:
        getDatabaseErrorMessage(
          error ?? {},
        ),
    };
  }

  const nextImages =
    new Set<string>(
      parsed.data.images,
    );

  const removedImages =
    existingProduct.images.filter(
      (url) =>
        !nextImages.has(url),
    );

  await removeProductImages(
    supabase,
    removedImages,
  );

  revalidateProductPages(
    data.slug,
    existingProduct.slug,
  );

  revalidatePath(
    `/admin/products/${data.id}`,
  );

  return {
    success: true,
    message:
      "تم تحديث المنتج بنجاح.",
    productId: data.id,
    slug: data.slug,
  };
}

export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResult> {
  await requireAdmin();

  const parsedProductId =
    productIdSchema.safeParse(
      productId,
    );

  if (
    !parsedProductId.success
  ) {
    return {
      success: false,
      message:
        "معرّف المنتج غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const {
    data: productData,
    error: productError,
  } = await supabase
    .from("products")
    .select(
      "slug, images",
    )
    .eq(
      "id",
      parsedProductId.data,
    )
    .maybeSingle();

  if (
    productError ||
    !productData
  ) {
    return {
      success: false,
      message:
        "المنتج غير موجود أو تم حذفه مسبقاً.",
    };
  }

  const product: ProductSnapshot =
    {
      slug: String(
        productData.slug,
      ),

      images:
        normalizeImageUrls(
          productData.images,
        ),
    };

  const { error: deleteError } =
    await supabase
      .from("products")
      .delete()
      .eq(
        "id",
        parsedProductId.data,
      );

  if (deleteError) {
    console.error(
      "فشل حذف المنتج:",
      deleteError,
    );

    return {
      success: false,
      message:
        "تعذر حذف المنتج. حاول مرة أخرى.",
    };
  }

  await removeProductImages(
    supabase,
    product.images,
  );

  revalidateProductPages(
    product.slug,
  );

  return {
    success: true,
    message:
      "تم حذف المنتج بنجاح.",
  };
}