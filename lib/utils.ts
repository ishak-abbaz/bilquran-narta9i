import {
  clsx,
  type ClassValue,
} from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(
  ...inputs: ClassValue[]
) {
  return twMerge(
    clsx(inputs),
  );
}

const dzdFormatter =
  new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  );

export function formatPrice(
  price: number,
): string {
  return `${dzdFormatter.format(price)} د.ج`;
}