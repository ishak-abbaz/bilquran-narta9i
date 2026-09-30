"use client";

import {
  useState,
} from "react";


import {
  CheckoutForm,
} from "@/components/checkout/checkout-form";


import {
  CheckoutSummary,
} from "@/components/checkout/checkout-summary";


import type {
  DeliveryPrice,
} from "@/lib/data/delivery";



type Props = {

  deliveryPrices:
    DeliveryPrice[];

};



export function CheckoutPageClient({

  deliveryPrices,

}: Props) {


  const [
    deliveryFee,
    setDeliveryFee,
  ] = useState(0);



  return (

    <div
      className="
        grid
        gap-8
        lg:grid-cols-2
      "
    >


      {/* Form */}

      <section
        className="
          order-2
          rounded-2xl
          border
          p-6
          lg:order-1
        "
      >

        <h1
          className="
            mb-8
            text-3xl
            font-bold
            text-end
          "
        >
          إتمام الطلب
        </h1>


        <CheckoutForm

          deliveryPrices={
            deliveryPrices
          }

          onDeliveryChange={
            setDeliveryFee
          }

        />

      </section>





      {/* Summary */}

      <section

        className="
          order-1
          rounded-2xl
          border
          p-6
          lg:order-2
        "

      >

        <h2
          className="
            mb-8
            text-3xl
            font-bold
            text-end
          "
        >
          ملخص الطلب
        </h2>


        <CheckoutSummary

          deliveryFee={
            deliveryFee
          }

        />


      </section>


    </div>

  );

}