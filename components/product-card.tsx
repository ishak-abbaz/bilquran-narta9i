import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const image = product.images?.[0];
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            لا توجد صورة
          </div>
        )}

        {isOutOfStock ? (
          <span className="absolute start-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
            نفدت الكمية
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-2 text-start">
        <h3 className="line-clamp-2 font-semibold leading-6 transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        {product.publisher ? (
          <p className="truncate text-xs text-muted-foreground">
            {product.publisher}
          </p>
        ) : null}

        <p className="pt-1 font-bold">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}