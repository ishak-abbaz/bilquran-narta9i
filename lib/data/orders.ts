import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";
import type {
  Order,
  OrderItem,
  OrderStatus,
} from "@/types";

export type AdminOrder =
  Order & {
    order_items:
      OrderItem[];
  };

type GetOrdersParams = {
  page?: number;
  search?: string;
  status?: string;
};

const PAGE_SIZE = 20;

const VALID_STATUSES =
  new Set<OrderStatus>([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ]);

function escapeSearch(
  value: string,
): string {
  const escapedLike =
    value
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
      );

  return escapedLike
    .replace(
      /\\/g,
      "\\\\",
    )
    .replace(
      /"/g,
      '\\"',
    );
}

export async function getOrders({
  page = 1,
  search = "",
  status = "all",
}: GetOrdersParams = {}) {
  const supabase =
    await createClient();

  const safePage =
    Number.isFinite(page) &&
    page > 0
      ? Math.floor(page)
      : 1;

  const from =
    (
      safePage -
      1
    ) * PAGE_SIZE;

  const to =
    from +
    PAGE_SIZE -
    1;

  let query =
    supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          customer_name,
          phone,
          wilaya,
          delivery_type,
          address,
          notes,
          status,
          subtotal,
          delivery_fee,
          total,
          created_at,
          order_items (
            id,
            order_id,
            product_id,
            product_name,
            unit_price,
            quantity
          )
        `,
        {
          count: "exact",
        },
      );

  const normalizedSearch =
    search.trim();

  if (
    normalizedSearch
  ) {
    const escaped =
      escapeSearch(
        normalizedSearch,
      );

    const pattern =
      `"%${escaped}%"`;

    query =
      query.or(
        `customer_name.ilike.${pattern},phone.ilike.${pattern}`,
      );
  }

  if (
    status !== "all" &&
    VALID_STATUSES.has(
      status as OrderStatus,
    )
  ) {
    query =
      query.eq(
        "status",
        status,
      );
  }

  const {
    data,
    error,
    count,
  } = await query
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .range(
      from,
      to,
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        (count ?? 0) /
          PAGE_SIZE,
      ),
    );

  return {
    orders:
      (
        data ?? []
      ) as AdminOrder[],

    totalPages,

    totalCount:
      count ?? 0,
  };
}