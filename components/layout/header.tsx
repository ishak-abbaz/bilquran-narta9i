"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Menu,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  {
    label: "الرئيسية",
    href: "/",
  },
  {
    label: "المصاحف والكتب",
    href: "/shop",
  },
  {
    label: "من نحن",
    href: "/about",
  },
  {
    label: "اتصل بنا",
    href: "/contact",
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
        >
          <div className="relative size-[60px] shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="شعار بالقرآن نرتقي"
              fill
              priority
              sizes="60px"
              className="object-contain"
            />
          </div>

          <span className="text-xl font-bold sm:text-2xl">
            بالقرآن نرتقي
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background transition-colors hover:bg-muted"
              aria-label="فتح القائمة"
            >
              <Menu
                className="size-5"
                aria-hidden="true"
              />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-80"
            >
              <SheetHeader>
                <SheetTitle className="text-start">
                  <span className="flex items-center gap-3">
                    <span className="relative size-14 shrink-0 overflow-hidden">
                      <Image
                        src="/logo.png"
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </span>

                    بالقرآن نرتقي
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-2">
                {links.map(
                  (link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-muted hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}