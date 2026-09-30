"use server";

import { redirect } from "next/navigation";

import {
  orderSchema,
} from "@/lib/validation/order";

import {
  normalizeAlgerianPhone,
} from "@/lib/data/phone";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export async function createOrderAction(
  payload: unknown,
) {

  const parsed =
    orderSchema.safeParse(payload);


  if (!parsed.success) {

    return {
      success: false,
      message:
        "بيانات الطلب غير صحيحة",
    };

  }


  const data = parsed.data;


  const phone =
    normalizeAlgerianPhone(
      data.phone,
    );


  if (!phone) {

    return {
      success: false,
      message:
        "رقم الهاتف غير صالح",
    };

  }


  const supabase =
    createAdminClient();



  /*
    Rate limit:
    maximum 5 orders / phone / hour
  */

  const { count } =
    await supabase
      .from("orders")
      .select(
        "id",
        {
          count: "exact",
          head: true,
        },
      )
      .eq(
        "phone",
        phone,
      )
      .gte(
        "created_at",
        new Date(
          Date.now() -
          60 * 60 * 1000,
        ).toISOString(),
      );


  if ((count ?? 0) >= 5) {

    return {
      success: false,
      message:
        "تم تجاوز عدد الطلبات المسموح بها حاليا",
    };

  }



  /*
    Load products from database.
    Client prices are ignored.
  */


  const productIds =
    data.items.map(
      item => item.productId,
    );


  const {
    data: products,
    error: productsError,
  } =
    await supabase
      .from("products")
      .select(
        "id,name,price,stock,is_active",
      )
      .in(
        "id",
        productIds,
      );


  if (
    productsError ||
    !products
  ) {

    return {
      success:false,
      message:
        "تعذر تحميل المنتجات",
    };

  }



  let subtotal = 0;


  const verifiedItems =
    data.items.map(item => {

      const product =
        products.find(
          p =>
            p.id === item.productId,
        );


      if (!product) {

        throw new Error(
          "PRODUCT_NOT_FOUND",
        );

      }


      if (!product.is_active) {

        throw new Error(
          "PRODUCT_DISABLED",
        );

      }


      if (
        product.stock <
        item.quantity
      ) {

        throw new Error(
          "NOT_ENOUGH_STOCK",
        );

      }


      subtotal +=
        product.price *
        item.quantity;


      return {

        productId:
            product.id,

        productName:
            product.name,

        quantity:
            item.quantity,

        price:
            product.price,

        size:
            item.size,

        color:
            item.color,

        };

    });



  /*
    Delivery price from DB
  */


  const {
  data: delivery,
    } = await supabase
    .from("delivery_prices")
    .select(
        "home_price, desk_price",
    )
    .eq(
        "wilaya_code",
        Number(data.wilaya),
    )
    .single();



  if (!delivery) {

    return {
      success:false,
      message:
        "ولاية غير متوفرة",
    };

  }


  const deliveryFee =
  data.deliveryType === "home"
    ? delivery.home_price
    : delivery.desk_price;


  const total =
    subtotal +
    deliveryFee;



  const {
    data: result,
    error,
  } =
    await supabase.rpc(
      "create_order_transaction",
      {

        p_order:
            {
            full_name:
                data.fullName,

            phone,

            wilaya:
                data.wilaya,

            address:
                data.address,

            notes:
                data.notes ?? null,

            delivery_type:
                data.deliveryType,

            subtotal,

            delivery_fee:
                deliveryFee,

            total,
            },


        p_items:
          verifiedItems,

      },
    );



  if (error) {

    return {
      success:false,
      message:
        "حدث خطأ أثناء إنشاء الطلب",
    };

  }



  redirect(
    `/order-success?order=${result.order_number}`,
  );

}