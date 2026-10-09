import AdminNav from "@/components/admin/admin-nav";
import LogoutButton from "@/components/admin/logout-button";

export default function AdminSideBar() {
  return (
    <aside className="hidden shrink-0 border-e border-border bg-background lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:self-start">
      <div className="flex h-full flex-col overflow-y-auto p-4">
        <div className="px-3 py-5">
          <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
            الإدارة
          </p>

          <p className="mt-2 text-xl font-bold">
            بالقرآن نرتقي
          </p>
        </div>

        <div className="mt-4">
          <AdminNav />
        </div>

        <div className="mt-auto border-t border-border pt-4">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}