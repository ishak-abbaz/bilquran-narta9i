"use client";

import {
  Menu,
} from "lucide-react";
import {
  useState,
} from "react";

import AdminNav from "@/components/admin/admin-nav";
import LogoutButton from "@/components/admin/logout-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminMobileMenu() {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <Sheet
      open={
        open
      }
      onOpenChange={
        setOpen
      }
    >
      <SheetTrigger
        className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="فتح قائمة الإدارة"
      >
        <Menu
          className="size-5"
          aria-hidden="true"
        />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[86vw] max-w-xs border-s border-border bg-background p-0 text-foreground"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border px-5 py-5 text-start">
            <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
              الإدارة
            </p>

            <SheetTitle className="mt-1 text-start text-xl font-bold">
              بالقرآن نرتقي
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <AdminNav
              onNavigate={() =>
                setOpen(
                  false,
                )
              }
            />
          </div>

          <div className="border-t border-border p-4">
            <LogoutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}