"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";


export async function updateOrderStatus(
  orderId: string,
  newStatus: string
) {
  await requireAdmin();

  const supabase = await createClient();


  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      status,
      order_items (
        product_id,
        quantity
      )
      `
    )
    .eq("id", orderId)
    .single();


  if (error || !order) {
    throw new Error("الطلب غير موجود");
  }


  if (
    newStatus === "cancelled" &&
    order.status !== "cancelled"
  ) {
    for (const item of order.order_items) {
      if (!item.product_id) continue;


      await supabase.rpc(
        "restore_product_stock",
        {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        }
      );
    }
  }


  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: newStatus,
    })
    .eq("id", orderId);


  if (updateError) {
    throw new Error(updateError.message);
  }
}