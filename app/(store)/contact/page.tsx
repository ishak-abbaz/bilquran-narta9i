import type {
  Metadata,
} from "next";

import {
  ContactForm,
} from "@/components/contact/contact-form";
import {
  buildPageMetadata,
} from "@/lib/seo/metadata";

export const metadata:
  Metadata =
  buildPageMetadata({
    title:
      "تواصل معنا",

    description:
      "أرسل رسالة إلى متجر بالقرآن نرتقي للاستفسار عن الكتب والطلبات والتوصيل.",

    path:
      "/contact",
  });

export default function ContactPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold text-primary">
            بالقرآن نرتقي
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            أرسل لنا رسالة
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            لديك سؤال حول كتاب أو
            طلب أو التوصيل؟ اكتب
            رسالتك وسنتواصل معك.
          </p>
        </header>

        <ContactForm />
      </div>
    </main>
  );
}