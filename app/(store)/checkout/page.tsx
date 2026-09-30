import { getDeliveryPrices } from "@/lib/data/delivery";

import {
  CheckoutPageClient,
} from "@/components/checkout/checkout-page-client";


export default async function CheckoutPage() {

  const deliveryPrices =
    await getDeliveryPrices();


  return (

    <main
      className="
        container
        mx-auto
        min-h-screen
        py-10
      "
      dir="rtl"
    >

      <CheckoutPageClient
        deliveryPrices={
          deliveryPrices
        }
      />

    </main>

  );

}