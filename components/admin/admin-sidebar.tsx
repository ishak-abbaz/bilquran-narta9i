"use client";

import {
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/admin",
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/orders",
    label: "الطلبات",
    icon: ShoppingBag,
    exact: false,
  },
  {
    href: "/admin/products",
    label: "المنتجات",
    icon: Package,
    exact: false,
  },
  {
    href: "/admin/messages",
    label: "الرسائل",
    icon: Mail,
    exact: false,
  },
  {
    href: "/admin/settings",
    label: "الإعدادات",
    icon: Settings,
    exact: false,
  },
];

export default function AdminSideBar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-e">
      <div className="flex h-full flex-col p-4">
        <div className="px-3 py-5">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
            الإدارة
          </p>

          <p className="mt-2 text-xl font-bold">
            لوحة التحكم
          </p>
        </div>

        <nav className="mt-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}