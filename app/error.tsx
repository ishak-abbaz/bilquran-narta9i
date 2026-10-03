"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Home,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      "حدث خطأ غير متوقع في المتجر:",
      error,
    );
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-8 ps-6 pe-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
        <TriangleAlert
          className="h-9 w-9"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          حدث خطأ غير متوقع
        </h1>

        <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
          لم نتمكن من تحميل المحتوى حاليًا.
          يمكنك المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary ps-6 pe-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw
            className="h-4 w-4"
            aria-hidden="true"
          />

          المحاولة مرة أخرى
        </button>

        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background ps-6 pe-6 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Home
            className="h-4 w-4"
            aria-hidden="true"
          />

          الصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}