"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

const links = [
  {
    title:
      "لوحة التحكم",
    href: "/admin",
  },
  {
    title: "الطلبات",
    href: "/admin/orders",
  },
  {
    title: "المنتجات",
    href: "/admin/products",
  },
  {
    title: "التصنيفات",
    href: "/admin/categories",
  },
  {
    title: "المبيعات",
    href: "/admin/sales",
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
  },
];

export default function AdminNav() {
  const pathname =
    usePathname();

  return (
    <nav className="space-y-2">
      {links.map(
        (link) => {
          const active =
            pathname ===
              link.href ||
            pathname.startsWith(
              `${link.href}/`,
            );

          return (
            <Link
              key={
                link.href
              }
              href={
                link.href
              }
              className={`block rounded-lg px-4 py-3 text-sm transition ${
                active
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {
                link.title
              }
            </Link>
          );
        },
      )}
    </nav>
  );
}