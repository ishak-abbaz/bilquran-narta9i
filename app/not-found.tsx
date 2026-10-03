import Link from "next/link";
import {
  BookOpen,
  Home,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-8 ps-6 pe-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
        <BookOpen
          className="h-9 w-9"
          aria-hidden="true"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          404
        </p>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          الصفحة غير موجودة
        </h1>

        <p className="mx-auto max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
          لم نتمكن من العثور على الصفحة التي تبحث عنها.
          قد يكون الرابط غير صحيح أو تم نقل المحتوى إلى صفحة أخرى.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary ps-6 pe-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BookOpen
            className="h-4 w-4"
            aria-hidden="true"
          />

          تصفح المصاحف
        </Link>

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