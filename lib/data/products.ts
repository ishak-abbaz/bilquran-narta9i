import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Product,
} from "@/types";

const PRODUCT_SELECT = `
  *,
  category:categories(*)
`;

const PRODUCT_WITH_REQUIRED_CATEGORY_SELECT = `
  *,
  category:categories!inner(*)
`;

function escapePostgrestIlikeSearch(
  value: string,
): string {
  /*
   * First escape characters that have special meaning
   * inside PostgreSQL LIKE / ILIKE patterns.
   */
  const escapedLikePattern = value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");

  /*
   * .or() uses raw PostgREST filter syntax.
   * Values are wrapped in double quotes below, so
   * backslashes and double quotes must also be escaped.
   */
  return escapedLikePattern
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

export async function getCategories(): Promise<
  Category[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, image_url, sort_order",
    )
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getFeaturedProducts(): Promise<
  Product[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getNewArrivals(
  limit = 8,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc";

interface GetProductsParams {
  category?: string;
  sort?: ProductSort;
  search?: string;
}

export async function getProducts({
  category,
  sort = "newest",
  search,
}: GetProductsParams = {}): Promise<
  Product[]
> {
  const supabase = await createClient();

  /*
   * !inner is required when filtering by a field
   * belonging to the embedded categories relation.
   * Without it, the filter can affect only the
   * embedded relation instead of excluding products.
   */
  let query = supabase
    .from("products")
    .select(
      category
        ? PRODUCT_WITH_REQUIRED_CATEGORY_SELECT
        : PRODUCT_SELECT,
    )
    .eq("is_active", true);

  if (category) {
    query = query.eq(
      "categories.slug",
      category,
    );
  }

  const normalizedSearch =
    search?.trim();

  if (normalizedSearch) {
    const escapedSearch =
      escapePostgrestIlikeSearch(
        normalizedSearch,
      );

    const pattern =
      `"%${escapedSearch}%"`;

    query = query.or(
      `name.ilike.${pattern},publisher.ilike.${pattern}`,
    );
  }

  switch (sort) {
    case "price-asc":
      query = query.order(
        "price",
        {
          ascending: true,
        },
      );
      break;

    case "price-desc":
      query = query.order(
        "price",
        {
          ascending: false,
        },
      );
      break;

    case "newest":
    default:
      query = query.order(
        "created_at",
        {
          ascending: false,
        },
      );
      break;
  }

  const { data, error } =
    await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}