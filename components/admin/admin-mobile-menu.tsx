"use client";

import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

import AdminNav from "./admin-nav";
import LogoutButton from "./logout-button";

export default function AdminMobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        className="rounded-md border border-border p-2"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="right" className="bg-black text-white">
        <div className="mt-8 flex h-full flex-col px-2">
          <h2 className="mb-8 text-xl font-semibold">
            لوحة الإدارة
          </h2>

          <AdminNav />

          <div className="mt-auto pb-6">
            <LogoutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}