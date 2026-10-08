"use client";

import Image from "next/image";
import {
  useState,
} from "react";

import OrderForm from "@/components/order/order-form";
import {
  formatPrice,
} from "@/lib/utils";
import type {
  Product,
} from "@/types";

type DeliveryPrice = {
  wilaya_code: number;
  wilaya_name: string;
  home_price: number;
  desk_price: number;
};

interface ProductDetailsClientProps {
  product: Product;
  deliveryPrices: DeliveryPrice[];
}

export default function ProductDetailsClient({
  product,
  deliveryPrices,
}: ProductDetailsClientProps) {
  const images =
    product.images.slice(
      0,
      3,
    );

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);

  const selectedImage =
    images[
      selectedImageIndex
    ];

  const inStock =
    product.stock > 0;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="space-y-4">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted">
          {selectedImage ? (
            <Image
              src={
                selectedImage
              }
              alt={
                product.name
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              لا توجد صورة لهذا
              الكتاب
            </div>
          )}
        </div>

        {images.length >
        1 ? (
          <div className="flex flex-wrap gap-3">
            {images.map(
              (
                image,
                index,
              ) => {
                const isSelected =
                  index ===
                  selectedImageIndex;

                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex(
                        index,
                      )
                    }
                    aria-label={`عرض الصورة ${
                      index +
                      1
                    }`}
                    aria-pressed={
                      isSelected
                    }
                    className={`relative aspect-[3/4] w-16 overflow-hidden rounded-xl border bg-muted transition sm:w-20 ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={
                        image
                      }
                      alt={`${product.name}، الصورة ${
                        index +
                        1
                      }`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                );
              },
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        {product.category ? (
          <p className="text-sm font-semibold text-primary">
            {
              product
                .category
                .name
            }
          </p>
        ) : null}

        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {
            product.name
          }
        </h1>

        <p className="mt-5 text-2xl font-bold">
          {formatPrice(
            product.price,
          )}
        </p>

        <dl className="mt-8 divide-y divide-border border-y border-border">
          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 text-sm">
            <dt className="font-semibold text-muted-foreground">
              الناشر
            </dt>

            <dd className="font-medium">
              {product.publisher ??
                "غير محدد"}
            </dd>
          </div>

          {product.riwaya ? (
            <div className="grid grid-cols-[100px_1fr] gap-4 py-4 text-sm">
              <dt className="font-semibold text-muted-foreground">
                الرواية
              </dt>

              <dd className="font-medium">
                {
                  product.riwaya
                }
              </dd>
            </div>
          ) : null}

          <div className="grid grid-cols-[100px_1fr] gap-4 py-4 text-sm">
            <dt className="font-semibold text-muted-foreground">
              التوفر
            </dt>

            <dd>
              {inStock ? (
                <span className="inline-flex items-center gap-2 font-semibold text-primary">
                  <span
                    className="size-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />

                  متوفر
                </span>
              ) : (
                <span className="font-semibold text-destructive">
                  نفدت الكمية
                </span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-bold">
            وصف الكتاب
          </h2>

          <p className="mt-3 whitespace-pre-line text-sm leading-8 text-muted-foreground">
            {product.description ??
              "لا يوجد وصف متاح حالياً."}
          </p>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          {inStock ? (
            <OrderForm
              book={
                product
              }
              deliveryPrices={
                deliveryPrices
              }
            />
          ) : (
            <button
              type="button"
              disabled
              className="h-12 w-full cursor-not-allowed rounded-xl bg-primary px-6 font-semibold text-primary-foreground opacity-50"
            >
              نفدت الكمية
            </button>
          )}
        </div>
      </div>
    </div>
  );
}