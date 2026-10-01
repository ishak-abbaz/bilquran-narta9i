import "server-only";

import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export async function getOrders({
  page = 1,
  search = "",
  status = "all",
}: {
  page?: number;
  search?: string;
  status?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_name,
      phone,
      wilaya,
      total,
      status,
      created_at
      `,
      {
        count: "exact",
      }
    )
    .order("created_at", {
      ascending: false,
    });


  if (status !== "all") {
    query = query.eq("status", status);
  }


  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }


  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;


  const { data, count, error } = await query.range(
    from,
    to
  );


  if (error) {
    throw new Error(error.message);
  }


  return {
    orders: data ?? [],
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    currentPage: page,
  };
}


export async function getOrderDetails(id: string) {
  const supabase = await createClient();


  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        product_name,
        unit_price,
        quantity,
        size,
        color
      )
      `
    )
    .eq("id", id)
    .single();


  if (error) {
    throw new Error(error.message);
  }


  return data;
}