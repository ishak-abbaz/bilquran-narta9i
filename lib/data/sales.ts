import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

export type SalesRange =
  | "24h"
  | "7d"
  | "30d";

export type SalesSummary = {
  revenue: number;
  orderCount: number;
  booksSold: number;
  averageOrderValue: number;
};

export type SalesTimelinePoint = {
  key: string;
  label: string;
  revenue: number;
};

export type BookSalesRow = {
  title: string;
  quantitySold: number;
  revenue: number;
};

export type CategorySalesRow = {
  categoryName: string;
  quantitySold: number;
  revenue: number;
};

export type SalesData = {
  summary: SalesSummary;
  timeline: SalesTimelinePoint[];
  books: BookSalesRow[];
  categories: CategorySalesRow[];
};

type SummaryRpcRow = {
  revenue:
    | number
    | string
    | null;
  order_count:
    | number
    | string
    | null;
  books_sold:
    | number
    | string
    | null;
  average_order_value:
    | number
    | string
    | null;
};

type TimelineRpcRow = {
  bucket_key: string;
  bucket_label: string;
  revenue:
    | number
    | string
    | null;
};

type BookRpcRow = {
  title: string;
  quantity_sold:
    | number
    | string
    | null;
  revenue:
    | number
    | string
    | null;
};

type CategoryRpcRow = {
  category_name: string;
  quantity_sold:
    | number
    | string
    | null;
  revenue:
    | number
    | string
    | null;
};

const VALID_RANGES =
  new Set<SalesRange>([
    "24h",
    "7d",
    "30d",
  ]);

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  const number =
    Number(
      value ?? 0,
    );

  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}

export function parseSalesRange(
  value:
    | string
    | undefined,
): SalesRange {
  if (
    value &&
    VALID_RANGES.has(
      value as SalesRange,
    )
  ) {
    return value as SalesRange;
  }

  return "7d";
}

export async function getSalesData(
  range: SalesRange,
): Promise<SalesData> {
  const supabase =
    await createClient();

  const [
    summaryResult,
    timelineResult,
    booksResult,
    categoriesResult,
  ] = await Promise.all([
    supabase.rpc(
      "get_admin_sales_summary",
      {
        p_range: range,
      },
    ),

    supabase.rpc(
      "get_admin_sales_timeline",
      {
        p_range: range,
      },
    ),

    supabase.rpc(
      "get_admin_book_sales",
      {
        p_range: range,
      },
    ),

    supabase.rpc(
      "get_admin_category_sales",
      {
        p_range: range,
      },
    ),
  ]);

  const firstError = [
    summaryResult.error,
    timelineResult.error,
    booksResult.error,
    categoriesResult.error,
  ].find(Boolean);

  if (firstError) {
    console.error(
      "فشل تحميل بيانات المبيعات:",
      firstError,
    );

    throw new Error(
      "تعذر تحميل بيانات المبيعات.",
    );
  }

  const summaryRow =
    (
      summaryResult.data ??
      []
    )[0] as
      | SummaryRpcRow
      | undefined;

  const timelineRows =
    (
      timelineResult.data ??
      []
    ) as TimelineRpcRow[];

  const bookRows =
    (
      booksResult.data ??
      []
    ) as BookRpcRow[];

  const categoryRows =
    (
      categoriesResult.data ??
      []
    ) as CategoryRpcRow[];

  return {
    summary: {
      revenue:
        toNumber(
          summaryRow?.revenue,
        ),

      orderCount:
        toNumber(
          summaryRow
            ?.order_count,
        ),

      booksSold:
        toNumber(
          summaryRow
            ?.books_sold,
        ),

      averageOrderValue:
        toNumber(
          summaryRow
            ?.average_order_value,
        ),
    },

    timeline:
      timelineRows.map(
        (row) => ({
          key:
            row.bucket_key,

          label:
            row.bucket_label,

          revenue:
            toNumber(
              row.revenue,
            ),
        }),
      ),

    books:
      bookRows.map(
        (row) => ({
          title:
            row.title,

          quantitySold:
            toNumber(
              row.quantity_sold,
            ),

          revenue:
            toNumber(
              row.revenue,
            ),
        }),
      ),

    categories:
      categoryRows.map(
        (row) => ({
          categoryName:
            row.category_name,

          quantitySold:
            toNumber(
              row.quantity_sold,
            ),

          revenue:
            toNumber(
              row.revenue,
            ),
        }),
      ),
  };
}