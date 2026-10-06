import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";
import type {
  OrderStatus,
} from "@/types";

type RecentOrder = {
  id: string;
  customer_name: string;
  total: number | null;
  status: OrderStatus;
  created_at: string;
};

type LatestBook = {
  id: string;
  name: string;
  publisher: string | null;
  created_at: string;
};

export async function getAdminDashboardStats() {
  const supabase =
    await createClient();

  const [
    productsResult,
    categoriesResult,
    ordersResult,
    pendingResult,
    cancelledResult,
    deliveredResult,
    revenueResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),

    supabase
      .from("categories")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),

    supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      ),

    supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "status",
        "pending",
      ),

    supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "status",
        "cancelled",
      ),

    supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "status",
        "delivered",
      ),

    supabase
      .from("orders")
      .select("total")
      .neq(
        "status",
        "cancelled",
      ),
  ]);

  const firstError = [
    productsResult.error,
    categoriesResult.error,
    ordersResult.error,
    pendingResult.error,
    cancelledResult.error,
    deliveredResult.error,
    revenueResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error(
      firstError.message,
    );
  }

  const revenue =
    revenueResult.data?.reduce(
      (
        sum,
        order,
      ) =>
        sum +
        (
          order.total ??
          0
        ),
      0,
    ) ?? 0;

  return {
    totalProducts:
      productsResult.count ??
      0,

    totalCategories:
      categoriesResult.count ??
      0,

    totalOrders:
      ordersResult.count ??
      0,

    pendingOrders:
      pendingResult.count ??
      0,

    cancelledOrders:
      cancelledResult.count ??
      0,

    deliveredOrders:
      deliveredResult.count ??
      0,

    revenue,
  };
}

export async function getRecentOrders(): Promise<
  RecentOrder[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(`
      id,
      customer_name,
      total,
      status,
      created_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(5);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ) as RecentOrder[];
}

export async function getLatestBooks(): Promise<
  LatestBook[]
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
      publisher,
      created_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(5);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ) as LatestBook[];
}