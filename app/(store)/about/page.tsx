import Link from "next/link";

const values = [
  {
    title: "الجودة",
    description:
      "نختار منتجاتنا بعناية لنقدم لكم قطعاً تجمع بين التصميم العصري والخامات الممتازة.",
  },
  {
    title: "سرعة التوصيل",
    description:
      "نعمل على توفير تجربة طلب سهلة وسريعة مع توصيل موثوق إلى مختلف مناطق الجزائر.",
  },
  {
    title: "الدفع عند الاستلام",
    description:
      "يمكنكم الدفع بكل سهولة عند استلام الطلب، لضمان تجربة شراء آمنة ومريحة.",
  },
];

export default function AboutPage() {
  return (
    <main className="space-y-20 px-4 py-12 text-start sm:px-8 lg:px-12">

      {/* Hero */}
      <section className="rounded-4xl bg-neutral-100 px-6 py-20 text-center dark:bg-neutral-900">
        <h1 className="text-4xl font-bold sm:text-6xl">
          من نحن
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
          أسترا هي علامة ملابس عصرية تهدف إلى تقديم تصاميم مميزة
          تجمع بين الراحة، الجودة، والأسلوب الحديث.
        </p>
      </section>


      {/* Story */}
      <section className="mx-auto max-w-4xl space-y-5">
        <h2 className="text-3xl font-bold">
          قصتنا
        </h2>

        <p className="leading-8 text-neutral-600 dark:text-neutral-300">
          بدأت أسترا بفكرة بسيطة: توفير ملابس ذات طابع عصري
          تناسب الحياة اليومية للشباب في الجزائر.
          نعمل باستمرار على تطوير تشكيلاتنا واختيار المنتجات
          التي تلبي تطلعات عملائنا.
        </p>

        <p className="leading-8 text-neutral-600 dark:text-neutral-300">
          هدفنا هو بناء تجربة تسوق إلكترونية سهلة، شفافة،
          ومريحة من اختيار المنتج إلى استلام الطلب.
        </p>
      </section>


      {/* Values */}
      <section>
        <h2 className="mb-8 text-3xl font-bold">
          قيمنا
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-3xl border border-black/10 p-8 transition hover:shadow-lg dark:border-white/10"
            >
              <h3 className="mb-4 text-xl font-bold">
                {value.title}
              </h3>

              <p className="leading-7 text-neutral-600 dark:text-neutral-300">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>


      <div className="text-center">
        <Link
          href="/shop"
          className="inline-flex rounded-full bg-black px-8 py-3 font-semibold text-white dark:bg-white dark:text-black"
        >
          اكتشف المجموعة
        </Link>
      </div>

    </main>
  );
}