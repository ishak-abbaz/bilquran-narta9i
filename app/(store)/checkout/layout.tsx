import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "إتمام الطلب",

  description:
    "أدخل معلومات التوصيل لإتمام طلب المصاحف والدفع عند الاستلام.",

  path: "/checkout",

  noIndex: true,
});

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}