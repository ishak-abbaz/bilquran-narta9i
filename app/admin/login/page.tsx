"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginAdmin } from "./actions";

const loginSchema = z.object({
  email: z
    .string()
    .email("أدخل بريداً إلكترونياً صحيحاً."),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");

    const formData = new FormData();

    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await loginAdmin(formData);

    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-start">
          <h1 className="text-2xl font-semibold">
            دخول الإدارة
          </h1>

          <p className="text-sm text-muted-foreground">
            سجل الدخول لإدارة المتجر.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm">
              البريد الإلكتروني
            </label>

            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-start outline-none"
            />

            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm">
              كلمة المرور
            </label>

            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-start outline-none"
            />

            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <button
            disabled={isSubmitting}
            type="submit"
            className="h-10 w-full rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
      </section>
    </main>
  );
}