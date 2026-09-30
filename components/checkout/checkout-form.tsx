"use client";

import {
  useEffect,
  useTransition,
} from "react";

import {
  useForm,
  useWatch,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  z,
} from "zod";

import {
  toast,
} from "sonner";


import {
  Button,
} from "@/components/ui/button";


import type {
  DeliveryPrice,
} from "@/lib/data/delivery";


import {
  isValidAlgerianPhone,
} from "@/lib/data/phone";


import {
  createOrderAction,
} from "@/app/(store)/checkout/actions";


import {
  useCartStore,
} from "@/store/cart";



const schema = z.object({

  fullName:
    z
      .string()
      .min(
        3,
        "الاسم الكامل مطلوب",
      ),


  phone:
    z
      .string()
      .refine(
        isValidAlgerianPhone,
        "رقم الهاتف غير صالح",
      ),


  wilaya:
    z
      .string()
      .min(
        1,
        "اختر الولاية",
      ),


  address:
    z
      .string()
      .min(
        5,
        "العنوان مطلوب",
      ),


  notes:
    z
      .string()
      .optional(),


  deliveryType:
    z.enum([
      "home",
      "office",
    ]),

});



type FormValues =
  z.infer<typeof schema>;



type Props = {

  deliveryPrices:
    DeliveryPrice[];


  onDeliveryChange:
    (price:number)=>void;

};



export function CheckoutForm({

  deliveryPrices,

  onDeliveryChange,

}: Props) {


  const [
    pending,
    startTransition,
  ] =
    useTransition();



  const items =
    useCartStore(
      state =>
        state.items,
    );



  const form =
    useForm<FormValues>({

      resolver:
        zodResolver(schema),


      defaultValues: {

        fullName: "",

        phone: "",

        wilaya: "",

        address: "",

        notes: "",

        deliveryType:
          "home",

      },

    });



  const wilaya =
    useWatch({

      control:
        form.control,

      name:
        "wilaya",

    });



  const deliveryType =
    useWatch({

      control:
        form.control,

      name:
        "deliveryType",

    });




  useEffect(()=>{


    const selected =
        deliveryPrices.find(
        (item) =>
            String(item.wilaya_code) === wilaya,
        );


    if (!selected) {

        onDeliveryChange(0);

        return;

    }


    const price =
        deliveryType === "home"
        ? selected.home_price
        : selected.desk_price;


    onDeliveryChange(price);


    },[
    wilaya,
    deliveryType,
    deliveryPrices,
    onDeliveryChange,
    ]);






  function submit(
    values:FormValues,
  ){


    if(items.length === 0){

      toast.error(
        "السلة فارغة",
      );

      return;

    }



    const orderItems =
      items.map(item=>({

        productId:
          item.productId,


        quantity:
          item.quantity,


        size:
          item.size,


        color:
          item.color,


      }));





    startTransition(
      async()=>{


        const result =
          await createOrderAction({

            ...values,

            items:
              orderItems,

          });




        if(!result.success){

          toast.error(
            result.message,
          );

          return;

        }



      },
    );


  }





  return (

    <form

      onSubmit={
        form.handleSubmit(
          submit,
        )
      }

      className="
        space-y-5
        text-end
      "

      dir="rtl"

    >




      <input

        {...form.register(
          "fullName",
        )}

        placeholder="الاسم الكامل"

        className="
          w-full
          rounded-full
          border
          px-5
          py-3
          text-end
        "

      />





      <input

        {...form.register(
          "phone",
        )}

        placeholder="رقم الهاتف"

        className="
          w-full
          rounded-full
          border
          px-5
          py-3
          text-end
        "

      />





      <select

        {...form.register(
          "wilaya",
        )}

        className="
          w-full
          rounded-full
          border
          px-5
          py-3
          text-end
        "

      >


        <option value="">
          اختر الولاية
        </option>



        {
          deliveryPrices.map(
            item=>(

              <option

                key={
                  item.wilaya_code
                }

                value={
                  item.wilaya_code
                }

              >

                {
                  item.wilaya_name
                }

              </option>

            )
          )
        }


      </select>





      <textarea

        {...form.register(
          "address",
        )}

        placeholder="العنوان"

        className="
          min-h-28
          w-full
          rounded-2xl
          border
          px-5
          py-3
          text-end
        "

      />





      <textarea

        {...form.register(
          "notes",
        )}

        placeholder="ملاحظات (اختياري)"

        className="
          min-h-24
          w-full
          rounded-2xl
          border
          px-5
          py-3
          text-end
        "

      />





      <div
        className="
          space-y-3
        "
      >


        <label

          className="
            flex
            flex-row-reverse
            items-center
            justify-between
            rounded-xl
            border
            p-4
          "

        >

          <input

            type="radio"

            value="home"

            {...form.register(
              "deliveryType",
            )}

          />


          <span>
            توصيل للمنزل
          </span>


        </label>





        <label

          className="
            flex
            flex-row-reverse
            items-center
            justify-between
            rounded-xl
            border
            p-4
          "

        >

          <input

            type="radio"

            value="office"

            {...form.register(
              "deliveryType",
            )}

          />


          <span>
            توصيل للمكتب
          </span>


        </label>



      </div>






      <div

        dir="rtl"

        className="
          rounded-xl
          bg-muted
          p-4
          text-end
        "

      >

        الدفع عند الاستلام

      </div>






      <Button

        type="submit"

        disabled={
          pending
        }

        className="
          w-full
        "

      >

        {
          pending

          ?

          "جاري إرسال الطلب..."

          :

          "تأكيد الطلب"
        }


      </Button>



    </form>

  );

}