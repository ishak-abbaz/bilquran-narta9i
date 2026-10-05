import {
  AtSign,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import {
  getInstagramUrl,
  getStoreSettings,
} from "@/lib/store-settings";

export default async function ContactPage() {
  const settings =
    await getStoreSettings();

  const instagramUrl =
    getInstagramUrl(
      settings.instagram,
    );

  const hasContactInfo =
    Boolean(
      settings.phone ||
        settings.email ||
        settings.instagram ||
        settings.address,
    );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted-foreground">
            نحن هنا لمساعدتك
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            تواصل معنا
          </h1>

          <p className="mt-3 text-sm leading-8 text-muted-foreground">
            تواصل مع{" "}
            <span className="font-semibold text-foreground">
              {settings.store_name}
            </span>{" "}
            لأي سؤال حول المنتجات أو الطلبات أو التوصيل.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card sm:p-6">
            <h2 className="text-lg font-bold">
              معلومات التواصل
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              يمكنك مراسلتنا عبر النموذج أو استخدام معلومات
              التواصل التالية.
            </p>

            {hasContactInfo ? (
              <div className="mt-7 space-y-5">
                {settings.phone ? (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Phone
                        className="size-4"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        الهاتف
                      </p>

                      <a
                        href={`tel:${settings.phone}`}
                        dir="ltr"
                        className="mt-1 block font-semibold transition-opacity hover:opacity-70"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {settings.email ? (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Mail
                        className="size-4"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        البريد الإلكتروني
                      </p>

                      <a
                        href={`mailto:${settings.email}`}
                        dir="ltr"
                        className="mt-1 block break-all font-semibold transition-opacity hover:opacity-70"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                ) : null}

                {settings.address ? (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <MapPin
                        className="size-4"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        العنوان
                      </p>

                      <p className="mt-1 font-semibold leading-7">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                ) : null}

                {settings.instagram ? (
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <AtSign
                        className="size-4"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        إنستغرام
                      </p>

                      {instagramUrl ? (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="mt-1 block font-semibold transition-opacity hover:opacity-70"
                        >
                          {settings.instagram}
                        </a>
                      ) : (
                        <p
                          dir="ltr"
                          className="mt-1 font-semibold"
                        >
                          {settings.instagram}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                لم تتم إضافة معلومات التواصل بعد.
              </p>
            )}
          </aside>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}