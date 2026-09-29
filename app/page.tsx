import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold">
          مرحبا بكم في متجري
        </h1>

        <p className="text-muted-foreground">
          متجر الملابس الجزائري بتصميم فاخر وبسيط.
        </p>
      </div>

      <button
        type="button"
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition hover:opacity-90"
      >
        تصفح المنتجات
      </button>

      <ThemeToggle />
    </main>
  );
}