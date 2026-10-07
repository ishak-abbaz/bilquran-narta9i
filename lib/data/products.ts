import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";
import type {
  Category,
  Product,
} from "@/types";

type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc";

type GetProductsParams = {
  category?: string;
  sort?: ProductSort;
  search?: string;
};

function normalizeSlug(
  value: string,
): string {
  let decoded =
    value;

  try {
    decoded =
      decodeURIComponent(
        value,
      );
  } catch {
    decoded =
      value;
  }

  return decoded
    .normalize("NFKC")
    .trim();
}

function escapePostgrestSearch(
  value: string,
): string {
  return value
    .replace(
      /\\/g,
      "\\\\",
    )
    .replace(
      /%/g,
      "\\%",
    )
    .replace(
      /_/g,
      "\\_",
    )
    .replace(
      /,/g,
      "\\,",
    )
    .replace(
      /\(/g,
      "\\(",
    )
    .replace(
      /\)/g,
      "\\)",
    );
}

export async function getCategories(): Promise<
  Category[]
> {
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
      sort_order
    `)
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

  if (error) {
    console.error(
      "فشل تحميل التصنيفات:",
      error,
    );

    throw new Error(
      "تعذر تحميل التصنيفات.",
    );
  }

  return (
    data ?? []
  ) as Category[];
}

export async function getFeaturedProducts(): Promise<
  Product[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      publisher,
      riwaya,
      price,
      category_id,
      images,
      stock,
      is_featured,
      is_active,
      created_at,
      category:categories (
        id,
        name,
        slug,
        image_url,
        sort_order
      )
    `)
    .eq(
      "is_featured",
      true,
    )
    .eq(
      "is_active",
      true,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    console.error(
      "فشل تحميل الكتب المميزة:",
      error,
    );

    throw new Error(
      "تعذر تحميل الكتب المميزة.",
    );
  }

  return (
    data ?? []
  ) as unknown as Product[];
}

export async function getNewArrivals(
  limit = 8,
): Promise<Product[]> {
  const safeLimit =
    Math.min(
      Math.max(
        Math.trunc(
          limit,
        ),
        1,
      ),
      50,
    );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      publisher,
      riwaya,
      price,
      category_id,
      images,
      stock,
      is_featured,
      is_active,
      created_at,
      category:categories (
        id,
        name,
        slug,
        image_url,
        sort_order
      )
    `)
    .eq(
      "is_active",
      true,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(
      safeLimit,
    );

  if (error) {
    console.error(
      "فشل تحميل أحدث الكتب:",
      error,
    );

    throw new Error(
      "تعذر تحميل أحدث الكتب.",
    );
  }

  return (
    data ?? []
  ) as unknown as Product[];
}

export async function getProducts({
  category,
  sort = "newest",
  search,
}: GetProductsParams = {}): Promise<
  Product[]
> {
  const supabase =
    await createClient();

  let query =
    supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        publisher,
        riwaya,
        price,
        category_id,
        images,
        stock,
        is_featured,
        is_active,
        created_at,
        category:categories!inner (
          id,
          name,
          slug,
          image_url,
          sort_order
        )
      `)
      .eq(
        "is_active",
        true,
      );

  if (
    category
  ) {
    query =
      query.eq(
        "categories.slug",
        normalizeSlug(
          category,
        ),
      );
  }

  const normalizedSearch =
    search
      ?.trim()
      .slice(
        0,
        100,
      );

  if (
    normalizedSearch
  ) {
    const escaped =
      escapePostgrestSearch(
        normalizedSearch,
      );

    query =
      query.or(
        `name.ilike.%${escaped}%,publisher.ilike.%${escaped}%`,
      );
  }

  switch (
    sort
  ) {
    case "price-asc":
      query =
        query.order(
          "price",
          {
            ascending: true,
          },
        );

      break;

    case "price-desc":
      query =
        query.order(
          "price",
          {
            ascending: false,
          },
        );

      break;

    default:
      query =
        query.order(
          "created_at",
          {
            ascending: false,
          },
        );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "فشل تحميل الكتب:",
      error,
    );

    throw new Error(
      "تعذر تحميل الكتب.",
    );
  }

  return (
    data ?? []
  ) as unknown as Product[];
}

export async function getProductBySlug(
  rawSlug: string,
): Promise<
  Product | null
> {
  const slug =
    normalizeSlug(
      rawSlug,
    );

  if (!slug) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      publisher,
      riwaya,
      price,
      category_id,
      images,
      stock,
      is_featured,
      is_active,
      created_at,
      category:categories (
        id,
        name,
        slug,
        image_url,
        sort_order
      )
    `)
    .eq(
      "slug",
      slug,
    )
    .eq(
      "is_active",
      true,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "فشل تحميل الكتاب:",
      {
        slug,
        error,
      },
    );

    throw new Error(
      "تعذر تحميل الكتاب.",
    );
  }

  if (!data) {
    return null;
  }

  return data as unknown as Product;
}

export async function getRelatedProducts(
  product:
    Pick<
      Product,
      | "id"
      | "category_id"
    >,
  limit = 4,
): Promise<Product[]> {
  if (
    !product.category_id
  ) {
    return [];
  }

  const safeLimit =
    Math.min(
      Math.max(
        Math.trunc(
          limit,
        ),
        1,
      ),
      12,
    );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      publisher,
      riwaya,
      price,
      category_id,
      images,
      stock,
      is_featured,
      is_active,
      created_at,
      category:categories (
        id,
        name,
        slug,
        image_url,
        sort_order
      )
    `)
    .eq(
      "is_active",
      true,
    )
    .eq(
      "category_id",
      product.category_id,
    )
    .neq(
      "id",
      product.id,
    )
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(
      safeLimit,
    );

  if (error) {
    console.error(
      "فشل تحميل الكتب المشابهة:",
      error,
    );

    throw new Error(
      "تعذر تحميل الكتب المشابهة.",
    );
  }

  return (
    data ?? []
  ) as unknown as Product[];
}