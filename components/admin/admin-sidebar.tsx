import AdminNav from "./admin-nav";
import LogoutButton from "./logout-button";

export default function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 end-0 hidden w-72 flex-col bg-black px-6 py-8 text-white lg:flex">
      <h1 className="mb-10 text-2xl font-semibold">
        لوحة الإدارة
      </h1>

      <AdminNav />

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}