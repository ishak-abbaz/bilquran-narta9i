"use server";

import {
  isValidAlgerianPhone,
  normalizeAlgerianPhone,
} from "@/lib/data/phone";


type OrderInput = {
  fullName: string;
  phone: string;
  wilaya: string;
  address: string;
  notes?: string;
  deliveryType: "home" | "office";
};


export async function createOrder(
  data: OrderInput,
) {

  if (
    !isValidAlgerianPhone(data.phone)
  ) {
    return {
      success: false,
      message:
        "رقم الهاتف غير صالح",
    };
  }


  const phone =
    normalizeAlgerianPhone(
      data.phone,
    );


  if (!phone) {
    return {
      success: false,
      message:
        "تعذر معالجة رقم الهاتف",
    };
  }


  // TODO:
  // Insert order into Supabase:
  // orders table
  // order_items table


  return {
    success: true,
    message:
      "تم إنشاء الطلب",
  };
}