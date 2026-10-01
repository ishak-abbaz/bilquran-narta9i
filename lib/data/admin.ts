import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardStats() {
  const supabase = await createClient();

  const [
    productsResult,
    ordersResult,
    pendingResult,
    cancelledResult,
    deliveredResult,
    revenueResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "delivered"),

    supabase
      .from("orders")
      .select("total")
      .neq("status", "cancelled"),
  ]);

  const revenue =
    revenueResult.data?.reduce(
      (sum, order) => sum + (order.total ?? 0),
      0
    ) ?? 0;

  return {
    totalProducts: productsResult.count ?? 0,
    totalOrders: ordersResult.count ?? 0,
    pendingOrders: pendingResult.count ?? 0,
    cancelledOrders: cancelledResult.count ?? 0,
    deliveredOrders: deliveredResult.count ?? 0,
    revenue,
  };
}


export async function getRecentOrders() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      total,
      status,
      created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  return data ?? [];
}


export async function getLatestProducts() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(5);

  return data ?? [];
}