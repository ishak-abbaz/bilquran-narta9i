import "server-only";

import { createClient } from "@/lib/supabase/server";


export type DeliveryPrice = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};


export async function getDeliveryPrices(): Promise<
  DeliveryPrice[]
> {

  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("delivery_prices")
      .select(
        "wilaya_code, wilaya_name, home_price, desk_price",
      )
      .order(
        "wilaya_code",
        {
          ascending: true,
        },
      );


  if (error) {

    throw new Error(
      `Failed to fetch delivery prices: ${error.message}`,
    );

  }


  return data ?? [];

}