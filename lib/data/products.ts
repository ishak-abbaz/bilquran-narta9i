import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";


export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}


export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}


export async function getNewArrivals(
  limit = 8
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
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
}: GetProductsParams = {}): Promise<Product[]> {

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
    .eq("is_active", true);


  if (category) {
    query = query.eq("categories.slug", category);
  }


  if (search) {
    query = query.ilike(
      "name",
      `%${search}%`
    );
  }


  switch (sort) {
    case "price-asc":
      query = query.order(
        "price",
        {
          ascending: true,
        }
      );
      break;


    case "price-desc":
      query = query.order(
        "price",
        {
          ascending: false,
        }
      );
      break;


    default:
      query = query.order(
        "created_at",
        {
          ascending: false,
        }
      );
  }


  const { data, error } = await query;


  if (error) {
    throw new Error(error.message);
  }


  return data ?? [];
}



export async function getProductBySlug(
  slug: string
): Promise<Product | null> {

  const supabase = await createClient();


  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*)
    `)
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