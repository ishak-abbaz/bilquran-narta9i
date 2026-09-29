export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-6">

      <div className="max-w-2xl">

        <h1 className="text-5xl font-bold leading-tight">
          أناقة عصرية
          <br />
          بأسلوب ASTRA
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">
          اكتشف تشكيلتنا الجديدة من الملابس
          المصممة للسوق الجزائري.
        </p>

        <a
          href="/shop"
          className="mt-8 inline-flex rounded-full bg-black px-8 py-4 text-white dark:bg-white dark:text-black"
        >
          تسوق الآن
        </a>

      </div>

    </section>
  );
}