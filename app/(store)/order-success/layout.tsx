import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "تم استلام طلبك",

  description:
    "تم استلام طلبك بنجاح في متجر بالقرآن نرتقي.",

  path: "/order-success",

  noIndex: true,
});

export default function OrderSuccessLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}