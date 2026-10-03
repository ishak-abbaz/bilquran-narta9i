import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "اتصل بنا",

  description:
    "تواصل مع متجر بالقرآن نرتقي للاستفسار عن المصاحف والطلبات والتوصيل داخل الجزائر.",

  path: "/contact",
});

export default function ContactLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}