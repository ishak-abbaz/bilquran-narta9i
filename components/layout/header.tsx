"use client";

import Link from "next/link";
import {
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  useEffect,
  useState,
} from "react";

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
  const {
    resolvedTheme,
    setTheme,
  } = useTheme();

  const [
    mounted,
    setMounted,
  ] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark",
    );
  }

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        bg-background/90
        backdrop-blur
      "
    >
      <div
        className="
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-6
        "
      >
        <Link
          href="/"
          className="
            text-2xl
            font-bold
            tracking-[0.35em]
          "
        >
          بالقرآن نرتقي
        </Link>

        <nav
          className="
            hidden
            items-center
            gap-8
            md:flex
          "
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                text-sm
                font-medium
                transition-colors
                hover:text-primary
              "
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="
              flex
              size-11
              items-center
              justify-center
              rounded-full
              border
              border-border
              bg-background
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              focus-visible:ring-offset-background
            "
            aria-label={
              resolvedTheme === "dark"
                ? "تفعيل الوضع الفاتح"
                : "تفعيل الوضع الداكن"
            }
          >
            {mounted &&
            resolvedTheme === "dark" ? (
              <Sun
                size={19}
                aria-hidden="true"
              />
            ) : (
              <Moon
                size={19}
                aria-hidden="true"
              />
            )}
          </button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                className="
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-border
                  transition-colors
                  hover:bg-accent
                  hover:text-accent-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring
                "
                aria-label="القائمة"
              >
                <Menu size={20} />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-80"
              >
                <SheetHeader>
                  <SheetTitle className="text-end">
                    بالقرآن نرتقي
                  </SheetTitle>
                </SheetHeader>

                <nav
                  className="
                    mt-8
                    flex
                    flex-col
                    gap-6
                    text-end
                  "
                >
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="
                        text-lg
                        transition-colors
                        hover:text-primary
                      "
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}