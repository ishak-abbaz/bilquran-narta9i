import ContactForm from "@/components/contact-form";

export default function ContactPage() {
  return (
    <main className="space-y-16 px-4 py-12 text-start sm:px-8 lg:px-12">

      <section className="rounded-4xl bg-neutral-100 px-6 py-16 text-center dark:bg-neutral-900">
        <h1 className="text-4xl font-bold sm:text-6xl">
          اتصل بنا
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-neutral-600 dark:text-neutral-300">
          نحن هنا للإجابة على استفساراتكم ومساعدتكم في طلباتكم.
        </p>
      </section>


      <section className="grid gap-8 md:grid-cols-2">

        {/* Contact information */}
        <div className="space-y-6 rounded-3xl border border-black/10 p-8 dark:border-white/10">

          <h2 className="text-2xl font-bold">
            معلومات التواصل
          </h2>

          <div className="space-y-4 text-neutral-700 dark:text-neutral-300">

            <p>
              الهاتف:
              <span className="ms-2 font-semibold">
                05 XX XX XX XX
              </span>
            </p>

            <p>
              البريد الإلكتروني:
              <span className="ms-2 font-semibold">
                contact@astra-store.com
              </span>
            </p>

            <p>
              Instagram:
              <span className="ms-2 font-semibold">
                @astra.store
              </span>
            </p>

            <p>
              العنوان:
              <span className="ms-2 font-semibold">
                الجزائر العاصمة - الجزائر
              </span>
            </p>

          </div>

        </div>


        {/* Form */}
        <div className="rounded-3xl border border-black/10 p-8 dark:border-white/10">
          <h2 className="mb-6 text-2xl font-bold">
            أرسل لنا رسالة
          </h2>

          <ContactForm />
        </div>

      </section>

    </main>
  );
}