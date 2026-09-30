"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/types";

import {
  useCartStore,
} from "@/store/cart";


interface Props {
  product: Product;
}


export default function ProductDetailsClient({
  product,
}: Props) {


  const addItem =
    useCartStore(
      (state) => state.addItem,
    );


  const images =
    product.images.length > 0
      ? product.images
      : [
          "/images/product-placeholder.png",
        ];



  const [
    selectedImage,
    setSelectedImage,
  ] = useState(images[0]);



  const [
    size,
    setSize,
  ] = useState("");



  const [
    color,
    setColor,
  ] = useState("");



  const [
    quantity,
    setQuantity,
  ] = useState(1);



  const requiresSize =
    product.sizes.length > 0;


  const requiresColor =
    product.colors.length > 0;



  const canAdd =
    (!requiresSize || size) &&
    (!requiresColor || color);



  function addToCart() {


    if (!canAdd) {

      toast.error(
        "يرجى اختيار المقاس واللون",
      );

      return;
    }



    addItem({

      productId:
        product.id,

      slug:
        product.slug,

      name:
        product.name,

      image:
        selectedImage,

      price:
        product.price,

      size:
        size || "بدون مقاس",

      color:
        color || "بدون لون",

      quantity,

    });



    toast.success(
      "تمت إضافة المنتج إلى السلة",
    );

  }



  return (

    <>


      <div
        className="
          space-y-4
        "
      >


        <div
          className="
            relative
            aspect-square
            overflow-hidden
            rounded-2xl
            border
            bg-muted
          "
        >

          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-cover"
          />

        </div>



        {images.length > 1 && (

          <div
            className="
              flex
              gap-3
            "
          >

            {images.map((image) => (

              <button
                key={image}
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                className="
                  relative
                  h-20
                  w-20
                  overflow-hidden
                  rounded-lg
                  border
                "
              >

                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

              </button>

            ))}

          </div>

        )}

      </div>





      <div
        className="
          space-y-6
        "
      >



        {product.category && (

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            {product.category.name}
          </p>

        )}




        <h1
          className="
            text-3xl
            font-bold
          "
        >
          {product.name}
        </h1>





        <div className="flex items-center gap-3">


          <span
            className="
              text-2xl
              font-bold
            "
          >
            {product.price.toLocaleString("en-US")} د.ج
          </span>



          {product.compare_at_price && (

            <span
              className="
                text-muted-foreground
                line-through
              "
            >
              {product.compare_at_price.toLocaleString("en-US")} د.ج
            </span>

          )}


        </div>






        <p
          className="
            leading-8
            text-muted-foreground
          "
        >
          {product.description}
        </p>





        <p
          className={
            product.stock > 0
              ? "font-medium text-green-600"
              : "font-medium text-red-600"
          }
        >

          {product.stock > 0
            ? "متوفر"
            : "نفدت الكمية"}

        </p>







        {requiresSize && (

          <div>

            <h3 className="mb-3 font-semibold">
              المقاس
            </h3>


            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {product.sizes.map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setSize(item)
                  }
                  className={`
                    rounded-lg
                    border
                    px-4
                    py-2
                    ${
                      size === item
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : ""
                    }
                  `}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

        )}







        {requiresColor && (

          <div>

            <h3 className="mb-3 font-semibold">
              اللون
            </h3>


            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {product.colors.map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setColor(item)
                  }
                  className={`
                    rounded-lg
                    border
                    px-4
                    py-2
                    ${
                      color === item
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : ""
                    }
                  `}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

        )}







        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <button
            type="button"
            onClick={() =>
              setQuantity(
                Math.max(
                  1,
                  quantity - 1,
                ),
              )
            }
            className="rounded-lg border px-4 py-2"
          >
            -
          </button>


          <span>
            {quantity}
          </span>


          <button
            type="button"
            onClick={() =>
              setQuantity(
                quantity + 1,
              )
            }
            className="rounded-lg border px-4 py-2"
          >
            +
          </button>


        </div>







        <button
          type="button"
          disabled={
            !canAdd ||
            product.stock === 0
          }
          onClick={addToCart}
          className="
            w-full
            rounded-xl
            bg-black
            py-4
            font-semibold
            text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:bg-white
            dark:text-black
          "
        >

          أضف إلى السلة

        </button>



      </div>


    </>

  );
}