import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    price: number;
    image: string;
  };
};

function formatPrice(price: number) {
  return `${price.toLocaleString("en-US")} د.ج`;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-black">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="space-y-3 p-5 text-start">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {product.name}
          </h3>

          <p className="text-xl font-bold text-black dark:text-white">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </article>
  );
}