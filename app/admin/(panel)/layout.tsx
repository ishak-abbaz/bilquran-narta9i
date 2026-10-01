import type { ReactNode } from "react";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20">

      <AdminSidebar />

      <main className="lg:pe-72">
        {children}
      </main>

    </div>
  );
}