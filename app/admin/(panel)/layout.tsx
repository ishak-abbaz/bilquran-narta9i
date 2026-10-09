import type {
  ReactNode,
} from "react";

import AdminMobileMenu from "@/components/admin/admin-mobile-menu";
import AdminSideBar from "@/components/admin/admin-sidebar";
import {
  requireAdmin,
} from "@/lib/auth";

type AdminPanelLayoutProps = {
  children: ReactNode;
};

export default async function AdminPanelLayout({
  children,
}: AdminPanelLayoutProps) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center px-4">
          <AdminMobileMenu />
        </div>
      </header>

      <div className="lg:flex lg:min-h-screen">
        <AdminSideBar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}