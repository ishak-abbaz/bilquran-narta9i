"use server";

import "server-only";

import {
  revalidatePath,
} from "next/cache";
import { z } from "zod";

import {
  requireAdmin,
} from "@/lib/auth";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/products/product-schema";
import {
  createClient,
} from "@/lib/supabase/server";

const productIdSchema =
  z
    .string()
    .uuid(
      "معرّف الكتاب غير صالح.",
    );

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

type SupabaseServerClient =
  Awaited<
    ReturnType<
      typeof createClient
    >
  >;

type ProductSnapshot = {
  slug: string;
  images: string[];
};

function normalizeImageUrls(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is string =>
      typeof item ===
      "string",
  );
}

function getProductStoragePath(
  publicUrl: string,
): string | null {
  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return null;
    }

    const projectUrl =
      new URL(
        supabaseUrl,
      );

    const imageUrl =
      new URL(
        publicUrl,
      );

    if (
      projectUrl.origin !==
      imageUrl.origin
    ) {
      return null;
    }

    const prefix =
      "/storage/v1/object/public/products/";

    if (
      !imageUrl.pathname.startsWith(
        prefix,
      )
    ) {
      return null;
    }

    const encodedPath =
      imageUrl.pathname.slice(
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
      getProductStoragePath(
        url,
      ) !== null,
  );
}

async function removeProductImages(
  supabase:
    SupabaseServerClient,
  urls: string[],
) {
  const paths =
    Array.from(
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

  if (
    paths.length ===
    0
  ) {
    return;
  }

  const {
    error,
  } = await supabase
    .storage
    .from("products")
    .remove(paths);

  if (error) {
    console.error(
      "تعذر تنظيف صور الكتاب من Storage:",
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
        typeof value ===
          "string" &&
        value.length > 0,
    );

  for (
    const slug of
      new Set(
        validSlugs,
      )
  ) {
    revalidatePath(
      `/product/${slug}`,
    );
  }
}

function getSaveErrorMessage(
  error: {
    code?: string;
  },
): string {
  if (
    error.code ===
    "23505"
  ) {
    return "الرابط المختصر مستخدم من كتاب آخر.";
  }

  if (
    error.code ===
    "23503"
  ) {
    return "التصنيف المحدد غير موجود.";
  }

  return "حدث خطأ أثناء حفظ الكتاب.";
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
        parsed.error
          .issues[0]
          ?.message ??
        "بيانات الكتاب غير صالحة.",
    };
  }

  /*
   * Defense in depth.
   * Zod already limits this to 3.
   */
  if (
    parsed.data
      .images.length >
    3
  ) {
    return {
      success: false,
      message:
        "لا يمكن إضافة أكثر من 3 صور للكتاب.",
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
        "إحدى الصور لا تنتمي إلى مخزن صور الكتب.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .insert({
      name:
        parsed.data.name,

      slug:
        parsed.data.slug,

      description:
        parsed.data
          .description ||
        null,

      publisher:
        parsed.data
          .publisher ||
        null,

      riwaya:
        parsed.data
          .riwaya ||
        null,

      price:
        parsed.data.price,

      category_id:
        parsed.data
          .category_id ||
        null,

      images:
        parsed.data.images,

      stock:
        parsed.data.stock,

      is_featured:
        parsed.data
          .is_featured,

      is_active:
        parsed.data
          .is_active,
    })
    .select(
      "id, slug",
    )
    .single();

  if (
    error ||
    !data
  ) {
    console.error(
      "فشل إنشاء الكتاب:",
      error,
    );

    return {
      success: false,
      message:
        getSaveErrorMessage(
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
      "تم إنشاء الكتاب بنجاح.",
    productId:
      data.id,
    slug:
      data.slug,
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
        "معرّف الكتاب غير صالح.",
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
        parsed.error
          .issues[0]
          ?.message ??
        "بيانات الكتاب غير صالحة.",
    };
  }

  if (
    parsed.data
      .images.length >
    3
  ) {
    return {
      success: false,
      message:
        "لا يمكن إضافة أكثر من 3 صور للكتاب.",
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
        "إحدى الصور لا تنتمي إلى مخزن صور الكتب.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      existingData,
    error:
      existingError,
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
    existingError ||
    !existingData
  ) {
    return {
      success: false,
      message:
        "الكتاب غير موجود.",
    };
  }

  const existing:
    ProductSnapshot = {
    slug:
      String(
        existingData.slug,
      ),

    images:
      normalizeImageUrls(
        existingData.images,
      ),
  };

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .update({
      name:
        parsed.data.name,

      slug:
        parsed.data.slug,

      description:
        parsed.data
          .description ||
        null,

      publisher:
        parsed.data
          .publisher ||
        null,

      riwaya:
        parsed.data
          .riwaya ||
        null,

      price:
        parsed.data.price,

      category_id:
        parsed.data
          .category_id ||
        null,

      images:
        parsed.data.images,

      stock:
        parsed.data.stock,

      is_featured:
        parsed.data
          .is_featured,

      is_active:
        parsed.data
          .is_active,
    })
    .eq(
      "id",
      parsedProductId.data,
    )
    .select(
      "id, slug",
    )
    .single();

  if (
    error ||
    !data
  ) {
    console.error(
      "فشل تحديث الكتاب:",
      error,
    );

    return {
      success: false,
      message:
        getSaveErrorMessage(
          error ?? {},
        ),
    };
  }

  const nextImages =
    new Set(
      parsed.data.images,
    );

  const removedImages =
    existing.images.filter(
      (url) =>
        !nextImages.has(
          url,
        ),
    );

  await removeProductImages(
    supabase,
    removedImages,
  );

  revalidateProductPages(
    existing.slug,
    data.slug,
  );

  revalidatePath(
    `/admin/products/${data.id}`,
  );

  return {
    success: true,
    message:
      "تم تحديث الكتاب بنجاح.",
    productId:
      data.id,
    slug:
      data.slug,
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
        "معرّف الكتاب غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      productData,
    error:
      productError,
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
        "الكتاب غير موجود أو تم حذفه مسبقاً.",
    };
  }

  const product:
    ProductSnapshot = {
    slug:
      String(
        productData.slug,
      ),

    images:
      normalizeImageUrls(
        productData.images,
      ),
  };

  const {
    error:
      deleteError,
  } = await supabase
    .from("products")
    .delete()
    .eq(
      "id",
      parsedProductId.data,
    );

  if (deleteError) {
    console.error(
      "فشل حذف الكتاب:",
      deleteError,
    );

    if (
      deleteError.code ===
      "23503"
    ) {
      return {
        success: false,
        message:
          "لا يمكن حذف الكتاب لأنه مرتبط ببيانات أخرى في النظام.",
      };
    }

    return {
      success: false,
      message:
        "تعذر حذف الكتاب. حاول مرة أخرى.",
    };
  }

  /*
   * order_items.product_id uses ON DELETE SET NULL,
   * so previous orders retain product_name and do
   * not prevent normal book deletion.
   */
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
      "تم حذف الكتاب بنجاح.",
  };
}