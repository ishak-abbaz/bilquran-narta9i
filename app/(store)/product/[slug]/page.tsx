import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getProductBySlug,
  getProducts,
} from "@/lib/data/products";

import ProductCard from "@/components/product-card";
import ProductDetailsClient from "@/components/product/product-details-client";


type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};



export async function generateMetadata(
  {
    params,
  }: ProductPageProps
): Promise<Metadata> {

  const { slug } = await params;

  const product =
    await getProductBySlug(slug);


  if (!product) {
    return {
      title: "المنتج غير موجود",
    };
  }


  return {
    title: product.name,
    description:
      product.description ??
      `اكتشف ${product.name} من متجرنا`,
  };
}




export default async function ProductPage({
  params,
}: ProductPageProps) {


  const { slug } = await params;


  const product =
    await getProductBySlug(slug);



  if (!product) {
    notFound();
  }



  const similarProducts =
    product.category_id
      ? await getProducts({
          category:
            product.category?.slug,
          sort: "newest",
        })
      : [];



  const filteredSimilar =
    similarProducts
      .filter(
        (item) =>
          item.id !== product.id
      )
      .slice(0, 4);



  return (

    <main
      dir="rtl"
      className="
        mx-auto
        max-w-7xl
        px-4
        py-12
        sm:px-6
        lg:px-8
      "
    >


      <section
        className="
          grid
          gap-10
          lg:grid-cols-2
        "
      >


        <ProductDetailsClient
          product={product}
        />

      </section>





      {filteredSimilar.length > 0 && (

        <section className="mt-20">


          <h2
            className="
              mb-8
              text-2xl
              font-bold
            "
          >
            منتجات مشابهة
          </h2>



          <div
            className="
              grid
              grid-cols-2
              gap-4
              md:grid-cols-4
            "
          >

            {filteredSimilar.map((item)=>(

              <ProductCard
                key={item.id}
                product={item}
              />

            ))}

          </div>


        </section>

      )}


    </main>

  );
}