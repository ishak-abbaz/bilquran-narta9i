"use client";

import { logoutAdmin } from "@/app/admin/login/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        type="submit"
        className="w-full rounded-lg border border-white/20 px-4 py-3 text-sm text-white transition hover:bg-white/10"
      >
        تسجيل الخروج
      </button>
    </form>
  );
}