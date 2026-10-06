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
  categoryFormSchema,
} from "@/lib/categories/category-schema";
import {
  createClient,
} from "@/lib/supabase/server";

const categoryIdSchema =
  z
    .string()
    .uuid(
      "معرّف التصنيف غير صالح.",
    );

const moveCategorySchema =
  z.object({
    categoryId:
      categoryIdSchema,

    direction:
      z.enum([
        "up",
        "down",
      ]),
  });

export type CategoryActionResult = {
  success: boolean;
  message: string;
};

type SupabaseServerClient =
  Awaited<
    ReturnType<
      typeof createClient
    >
  >;

type CategorySnapshot = {
  id: string;
  name: string;
  slug: string;
  image_url:
    | string
    | null;
  sort_order: number;
};

function revalidateCategoryPages() {
  revalidatePath("/");
  revalidatePath("/shop");

  revalidatePath(
    "/admin/categories",
  );

  /*
   * The dashboard contains the
   * category-count stat.
   */
  revalidatePath(
    "/admin",
  );
}

function getCategoryStoragePath(
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
      "/storage/v1/object/public/categories/";

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

function isValidCategoryImageUrl(
  url:
    | string
    | null,
) {
  if (!url) {
    return true;
  }

  return (
    getCategoryStoragePath(
      url,
    ) !== null
  );
}

async function removeCategoryImage(
  supabase:
    SupabaseServerClient,
  imageUrl:
    | string
    | null,
) {
  if (!imageUrl) {
    return;
  }

  const path =
    getCategoryStoragePath(
      imageUrl,
    );

  if (!path) {
    return;
  }

  const {
    error,
  } = await supabase.storage
    .from("categories")
    .remove([
      path,
    ]);

  if (error) {
    console.error(
      "تعذر حذف صورة التصنيف من Storage:",
      error,
    );
  }
}

function duplicateSlugMessage() {
  return (
    "الرابط المختصر مستخدم من تصنيف آخر."
  );
}

function categoryBookMessage(
  count: number,
) {
  return `لا يمكن حذف التصنيف لأنه يحتوي على ${count} كتاباً. انقل الكتب إلى تصنيف آخر أولاً.`;
}

export async function createCategory(
  input: unknown,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const parsed =
    categoryFormSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error
          .issues[0]
          ?.message ??
        "بيانات التصنيف غير صالحة.",
    };
  }

  if (
    !isValidCategoryImageUrl(
      parsed.data
        .imageUrl,
    )
  ) {
    return {
      success: false,
      message:
        "الصورة لا تنتمي إلى مخزن التصنيفات.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      lastCategory,
    error:
      lastCategoryError,
  } = await supabase
    .from("categories")
    .select(
      "sort_order",
    )
    .order(
      "sort_order",
      {
        ascending:
          false,
      },
    )
    .limit(1)
    .maybeSingle();

  if (
    lastCategoryError
  ) {
    console.error(
      "تعذر تحديد ترتيب التصنيف:",
      lastCategoryError,
    );

    return {
      success: false,
      message:
        "تعذر إنشاء التصنيف. حاول مرة أخرى.",
    };
  }

  const nextSortOrder =
    Number(
      lastCategory
        ?.sort_order ??
        0,
    ) + 1;

  const {
    error,
  } = await supabase
    .from("categories")
    .insert({
      name:
        parsed.data.name,

      slug:
        parsed.data.slug,

      image_url:
        parsed.data
          .imageUrl,

      sort_order:
        nextSortOrder,
    });

  if (error) {
    if (
      error.code ===
      "23505"
    ) {
      return {
        success: false,
        message:
          duplicateSlugMessage(),
      };
    }

    console.error(
      "فشل إنشاء التصنيف:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر إنشاء التصنيف. حاول مرة أخرى.",
    };
  }

  revalidateCategoryPages();

  return {
    success: true,
    message:
      "تم إنشاء التصنيف بنجاح.",
  };
}

export async function updateCategory(
  categoryId: string,
  input: unknown,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const parsedId =
    categoryIdSchema.safeParse(
      categoryId,
    );

  if (!parsedId.success) {
    return {
      success: false,
      message:
        "معرّف التصنيف غير صالح.",
    };
  }

  const parsed =
    categoryFormSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error
          .issues[0]
          ?.message ??
        "بيانات التصنيف غير صالحة.",
    };
  }

  if (
    !isValidCategoryImageUrl(
      parsed.data
        .imageUrl,
    )
  ) {
    return {
      success: false,
      message:
        "الصورة لا تنتمي إلى مخزن التصنيفات.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      existingCategory,
    error:
      existingError,
  } = await supabase
    .from("categories")
    .select(
      "image_url",
    )
    .eq(
      "id",
      parsedId.data,
    )
    .maybeSingle();

  if (
    existingError ||
    !existingCategory
  ) {
    return {
      success: false,
      message:
        "التصنيف غير موجود.",
    };
  }

  const oldImageUrl =
    existingCategory
      .image_url;

  const {
    error,
  } = await supabase
    .from("categories")
    .update({
      name:
        parsed.data.name,

      slug:
        parsed.data.slug,

      image_url:
        parsed.data
          .imageUrl,
    })
    .eq(
      "id",
      parsedId.data,
    );

  if (error) {
    if (
      error.code ===
      "23505"
    ) {
      return {
        success: false,
        message:
          duplicateSlugMessage(),
      };
    }

    console.error(
      "فشل تحديث التصنيف:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر تحديث التصنيف. حاول مرة أخرى.",
    };
  }

  if (
    oldImageUrl &&
    oldImageUrl !==
      parsed.data.imageUrl
  ) {
    await removeCategoryImage(
      supabase,
      oldImageUrl,
    );
  }

  revalidateCategoryPages();

  return {
    success: true,
    message:
      "تم تحديث التصنيف بنجاح.",
  };
}

export async function deleteCategory(
  categoryId: string,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const parsedId =
    categoryIdSchema.safeParse(
      categoryId,
    );

  if (!parsedId.success) {
    return {
      success: false,
      message:
        "معرّف التصنيف غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const [
    categoryResult,
    countResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "image_url",
      )
      .eq(
        "id",
        parsedId.data,
      )
      .maybeSingle(),

    supabase
      .from("products")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "category_id",
        parsedId.data,
      ),
  ]);

  if (
    categoryResult.error ||
    !categoryResult.data
  ) {
    return {
      success: false,
      message:
        "التصنيف غير موجود أو تم حذفه مسبقاً.",
    };
  }

  if (
    countResult.error
  ) {
    console.error(
      "تعذر حساب كتب التصنيف:",
      countResult.error,
    );

    return {
      success: false,
      message:
        "تعذر التحقق من التصنيف. حاول مرة أخرى.",
    };
  }

  const bookCount =
    countResult.count ??
    0;

  if (
    bookCount > 0
  ) {
    return {
      success: false,
      message:
        categoryBookMessage(
          bookCount,
        ),
    };
  }

  const {
    error:
      deleteError,
  } = await supabase
    .from("categories")
    .delete()
    .eq(
      "id",
      parsedId.data,
    );

  if (deleteError) {
    /*
     * ON DELETE RESTRICT.
     * This also protects against a book being
     * assigned after the count check.
     */
    if (
      deleteError.code ===
      "23503"
    ) {
      const {
        count,
      } = await supabase
        .from("products")
        .select(
          "id",
          {
            count:
              "exact",
            head: true,
          },
        )
        .eq(
          "category_id",
          parsedId.data,
        );

      return {
        success: false,
        message:
          count &&
          count > 0
            ? categoryBookMessage(
                count,
              )
            : "لا يمكن حذف التصنيف لأنه مرتبط بكتب.",
      };
    }

    console.error(
      "فشل حذف التصنيف:",
      deleteError,
    );

    return {
      success: false,
      message:
        "تعذر حذف التصنيف. حاول مرة أخرى.",
    };
  }

  await removeCategoryImage(
    supabase,
    categoryResult.data
      .image_url,
  );

  revalidateCategoryPages();

  return {
    success: true,
    message:
      "تم حذف التصنيف بنجاح.",
  };
}

export async function moveCategory(
  categoryId: string,
  direction: unknown,
): Promise<CategoryActionResult> {
  await requireAdmin();

  const parsed =
    moveCategorySchema.safeParse(
      {
        categoryId,
        direction,
      },
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        "طلب تغيير الترتيب غير صالح.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
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
        ascending: true,
      },
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    )
    .order(
      "id",
      {
        ascending: true,
      },
    );

  if (error) {
    console.error(
      "تعذر تحميل ترتيب التصنيفات:",
      error,
    );

    return {
      success: false,
      message:
        "تعذر تغيير ترتيب التصنيف.",
    };
  }

  const categories =
    (
      data ?? []
    ).map(
      (
        item,
      ): CategorySnapshot => ({
        id:
          item.id,

        name:
          item.name,

        slug:
          item.slug,

        image_url:
          item.image_url,

        sort_order:
          Number(
            item.sort_order ??
              0,
          ),
      }),
    );

  const currentIndex =
    categories.findIndex(
      (category) =>
        category.id ===
        parsed.data
          .categoryId,
    );

  if (
    currentIndex === -1
  ) {
    return {
      success: false,
      message:
        "التصنيف غير موجود.",
    };
  }

  const neighborIndex =
    parsed.data
      .direction ===
    "up"
      ? currentIndex - 1
      : currentIndex + 1;

  if (
    neighborIndex < 0 ||
    neighborIndex >=
      categories.length
  ) {
    return {
      success: true,
      message:
        "التصنيف في موضعه الأخير بالفعل.",
    };
  }

  const current =
    categories[
      currentIndex
    ];

  const neighbor =
    categories[
      neighborIndex
    ];

  /*
   * One upsert statement updates both rows.
   * PostgreSQL therefore swaps the two
   * sort_order values atomically.
   */
  const {
    error:
      updateError,
  } = await supabase
    .from("categories")
    .upsert(
      [
        {
          id:
            current.id,

          name:
            current.name,

          slug:
            current.slug,

          image_url:
            current.image_url,

          sort_order:
            neighbor.sort_order,
        },
        {
          id:
            neighbor.id,

          name:
            neighbor.name,

          slug:
            neighbor.slug,

          image_url:
            neighbor.image_url,

          sort_order:
            current.sort_order,
        },
      ],
      {
        onConflict: "id",
      },
    );

  if (updateError) {
    console.error(
      "فشل تغيير ترتيب التصنيف:",
      updateError,
    );

    return {
      success: false,
      message:
        "تعذر تغيير ترتيب التصنيف.",
    };
  }

  revalidateCategoryPages();

  return {
    success: true,
    message:
      "تم تحديث ترتيب التصنيفات.",
  };
}