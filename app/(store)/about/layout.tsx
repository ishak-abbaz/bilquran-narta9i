import type { ReactNode } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "من نحن",

  description:
    "تعرف على متجر بالقرآن نرتقي ورسالتنا في توفير المصاحف وكتب القرآن الكريم لعملائنا داخل الجزائر.",

  path: "/about",
});

export default function AboutLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}