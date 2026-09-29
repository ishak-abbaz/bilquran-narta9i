import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/types";


interface ProductCardProps {
  product: Product;
}



export default function ProductCard({
  product,
}: ProductCardProps) {


  const image =
    product.images?.[0];



  return (

    <Link
      href={`/product/${product.slug}`}
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        p-3
      "
    >


      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-xl
          bg-muted
        "
      >

        {image ? (

          <Image
            src={image}
            alt={product.name}
            fill
            className="
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />

        ) : (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-sm
              text-muted-foreground
            "
          >
            لا توجد صورة
          </div>

        )}

      </div>





      <div className="mt-4 space-y-2 text-start">


        {product.category && (

          <p
            className="
              text-xs
              text-muted-foreground
            "
          >
            {product.category.name}
          </p>

        )}



        <h3
          className="
            font-medium
          "
        >
          {product.name}
        </h3>



        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          <span
            className="
              font-bold
            "
          >
            {product.price.toLocaleString("en-US")} د.ج
          </span>


          {product.compare_at_price && (

            <span
              className="
                text-sm
                text-muted-foreground
                line-through
              "
            >
              {product.compare_at_price.toLocaleString("en-US")} د.ج
            </span>

          )}

        </div>


      </div>


    </Link>

  );
}