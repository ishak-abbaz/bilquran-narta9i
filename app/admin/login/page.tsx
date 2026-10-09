import {
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  loginAdmin,
} from "@/app/admin/login/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    password?: string;
  }>;
};

function getErrorMessage(
  value:
    | string
    | undefined,
) {
  switch (value) {
    case "invalid":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

    case "unauthorized":
      return "هذا الحساب غير مخول بالدخول إلى لوحة الإدارة.";

    default:
      return "";
  }
}

function getSuccessMessage(
  value:
    | string
    | undefined,
) {
  if (
    value ===
    "changed"
  ) {
    return "تم تغيير كلمة المرور بنجاح. سجل الدخول بكلمة المرور الجديدة.";
  }

  return "";
}

export default async function AdminLoginPage({
  searchParams,
}: LoginPageProps) {
  const params =
    await searchParams;

  const errorMessage =
    getErrorMessage(
      params.error,
    );

  const successMessage =
    getSuccessMessage(
      params.password,
    );

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-primary">
            بالقرآن نرتقي
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            تسجيل دخول الإدارة
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            أدخل بيانات حساب الإدارة للمتابعة.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {successMessage ? (
            <div
              role="status"
              className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-7 text-primary"
            >
              {
                successMessage
              }
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive"
            >
              {
                errorMessage
              }
            </div>
          ) : null}

          <form
            action={
              loginAdmin
            }
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold"
              >
                البريد الإلكتروني
              </label>

              <div className="relative">
                <Mail
                  className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-input bg-background ps-12 pe-4 text-start text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold"
              >
                كلمة المرور
              </label>

              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-12 w-full rounded-xl border border-input bg-background ps-12 pe-4 text-start text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}