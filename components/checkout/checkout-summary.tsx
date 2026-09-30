"use client";

import {
  Trash2,
} from "lucide-react";


import {
  Button,
} from "@/components/ui/button";


import {
  formatDZD,
  getSubtotal,
  useCartStore,
} from "@/store/cart";


import {
  useHydrated,
} from "@/hooks/use-hydrated";



type Props = {

  deliveryFee:
    number;

};



export function CheckoutSummary({

  deliveryFee,

}: Props) {



  const hydrated =
    useHydrated();



  const items =
    useCartStore(
      state =>
        state.items,
    );



  const removeItem =
    useCartStore(
      state =>
        state.removeItem,
    );




  if(!hydrated){

    return null;

  }





  const subtotal =
    getSubtotal(
      items,
    );



  const total =
    subtotal +
    deliveryFee;






  if(items.length === 0){

    return (

      <p
        className="text-end"
      >

        السلة فارغة

      </p>

    );

  }







  return (

    <div

      dir="rtl"

      className="
        space-y-5
        text-end
      "

    >



      {
        items.map(item=>(


          <div

            key={
              `${item.productId}-${item.size}-${item.color}`
            }

            className="
              flex
              items-center
              justify-between
              border-b
              pb-4
            "

          >


            <Button

              variant="ghost"

              size="icon"

              onClick={()=>


                removeItem(

                  item.productId,

                  item.size,

                  item.color,

                )

              }

            >

              <Trash2 />

            </Button>





            <div>


              <p className="font-semibold">

                {item.name}

              </p>



              <p className="text-sm text-muted-foreground">

                {item.color}

                {" • "}

                {item.size}

              </p>



              <p>

                {item.quantity}

                {" × "}

                {formatDZD(
                  item.price,
                )}

              </p>


            </div>



          </div>


        ))

      }






      <div className="flex justify-between">

        <span>
          {formatDZD(subtotal)}
        </span>


        <span>
          المنتجات
        </span>


      </div>





      <div className="flex justify-between">

        <span>
          {formatDZD(deliveryFee)}
        </span>


        <span>
          التوصيل
        </span>


      </div>






      <div

        className="
          flex
          justify-between
          text-xl
          font-bold
        "

      >

        <span>

          {formatDZD(total)}

        </span>



        <span>

          المجموع

        </span>


      </div>



    </div>

  );

}