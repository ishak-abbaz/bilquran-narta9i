"use client";

import {
  BarChart3,
  KeyRound,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  Tags,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

type AdminNavProps = {
  onNavigate?: () => void;
};

const links = [
  {
    title:
      "لوحة التحكم",
    href:
      "/admin",
    icon:
      LayoutDashboard,
    exact:
      true,
  },
  {
    title:
      "الطلبات",
    href:
      "/admin/orders",
    icon:
      ShoppingBag,
    exact:
      false,
  },
  {
    title:
      "الكتب",
    href:
      "/admin/products",
    icon:
      Package,
    exact:
      false,
  },
  {
    title:
      "التصنيفات",
    href:
      "/admin/categories",
    icon:
      Tags,
    exact:
      false,
  },
  {
    title:
      "المبيعات",
    href:
      "/admin/sales",
    icon:
      BarChart3,
    exact:
      false,
  },
  {
    title:
      "الرسائل",
    href:
      "/admin/messages",
    icon:
      Mail,
    exact:
      false,
  },
  {
    title:
      "الإعدادات",
    href:
      "/admin/settings",
    icon:
      Settings,
    exact:
      false,
  },
  {
    title:
      "كلمة المرور",
    href:
      "/admin/account",
    icon:
      KeyRound,
    exact:
      false,
  },
];

export default function AdminNav({
  onNavigate,
}: AdminNavProps) {
  const pathname =
    usePathname();

  return (
    <nav className="space-y-1">
      {links.map(
        (
          link,
        ) => {
          const Icon =
            link.icon;

          const active =
            link.exact
              ? pathname ===
                link.href
              : pathname ===
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
              onClick={
                onNavigate
              }
              className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className="size-4 shrink-0"
                aria-hidden="true"
              />

              <span>
                {
                  link.title
                }
              </span>
            </Link>
          );
        },
      )}
    </nav>
  );
}