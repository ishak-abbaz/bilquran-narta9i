import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "المصاحف",

  description:
    "تصفح تشكيلة مختارة من المصاحف وكتب القرآن الكريم، مع التوصيل داخل الجزائر والدفع عند الاستلام.",

  path: "/shop",

  imageAlt:
    "تشكيلة المصاحف في متجر بالقرآن نرتقي",
});

export default function ShopLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}