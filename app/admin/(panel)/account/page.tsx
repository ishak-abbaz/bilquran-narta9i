import {
  KeyRound,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  changeAdminPassword,
} from "@/app/admin/(panel)/account/actions";
import {
  requireAdmin,
} from "@/lib/auth";

type AccountPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(
  value:
    | string
    | undefined,
) {
  switch (value) {
    case "current":
      return "كلمة المرور الحالية غير صحيحة.";

    case "weak":
      return "كلمة المرور الجديدة يجب أن تحتوي على 10 أحرف على الأقل.";

    case "mismatch":
      return "كلمتا المرور الجديدتان غير متطابقتين.";

    case "email":
      return "لا يحتوي حساب الإدارة على بريد إلكتروني صالح.";

    case "update":
      return "تعذر تغيير كلمة المرور. حاول مرة أخرى.";

    default:
      return "";
  }
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps) {
  const user =
    await requireAdmin();

  const params =
    await searchParams;

  const errorMessage =
    getErrorMessage(
      params.error,
    );

  return (
    <section className="mx-auto w-full max-w-2xl space-y-8">
      <header>
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound
            className="size-5"
            aria-hidden="true"
          />
        </div>

        <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
          أمان الحساب
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          تغيير كلمة المرور
        </h1>

        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          غيّر كلمة مرور حساب الإدارة. ستحتاج إلى تسجيل الدخول مرة أخرى بعد الحفظ.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <div className="mb-6 rounded-xl bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Mail
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />

            <div>
              <p className="text-xs text-muted-foreground">
                حساب الإدارة
              </p>

              <p
                dir="ltr"
                className="mt-1 font-semibold"
              >
                {
                  user.email ??
                  "بدون بريد إلكتروني"
                }
              </p>
            </div>
          </div>
        </div>

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
            changeAdminPassword
          }
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm font-semibold"
            >
              كلمة المرور الحالية
            </label>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                id="current-password"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                dir="ltr"
                className="h-12 w-full rounded-xl border border-input bg-background ps-12 pe-4 text-start text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm font-semibold"
            >
              كلمة المرور الجديدة
            </label>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                dir="ltr"
                className="h-12 w-full rounded-xl border border-input bg-background ps-12 pe-4 text-start text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-semibold"
            >
              تأكيد كلمة المرور الجديدة
            </label>

            <div className="relative">
              <LockKeyhole
                className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                dir="ltr"
                className="h-12 w-full rounded-xl border border-input bg-background ps-12 pe-4 text-start text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            تغيير كلمة المرور
          </button>
        </form>
      </div>
    </section>
  );
}