"use client";

import {
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import {
  useTheme,
} from "next-themes";

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
    label:
      "المصاحف والكتب",
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
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  function toggleTheme() {
    setTheme(
      resolvedTheme ===
        "dark"
        ? "light"
        : "dark",
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight sm:text-2xl"
        >
          بالقرآن نرتقي
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(
            (
              link,
            ) => (
              <Link
                key={
                  link.href
                }
                href={
                  link.href
                }
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {
                  link.label
                }
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={
              toggleTheme
            }
            className="flex size-11 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="تبديل المظهر"
          >
            <Sun
              size={19}
              className="hidden dark:block"
              aria-hidden="true"
            />

            <Moon
              size={19}
              className="block dark:hidden"
              aria-hidden="true"
            />
          </button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="flex size-11 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Menu
                  size={20}
                  aria-hidden="true"
                />

                <span className="sr-only">
                  فتح القائمة
                </span>
              </SheetTrigger>

              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>
                    بالقرآن نرتقي
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-8 flex flex-col gap-2">
                  {links.map(
                    (
                      link,
                    ) => (
                      <Link
                        key={
                          link.href
                        }
                        href={
                          link.href
                        }
                        className="rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {
                          link.label
                        }
                      </Link>
                    ),
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}