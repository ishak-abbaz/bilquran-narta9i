import {
  AtSign,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";

import {
  getInstagramUrl,
  getStoreSettings,
} from "@/lib/store-settings";

export async function SiteFooter() {
  const settings =
    await getStoreSettings();

  const instagramUrl =
    getInstagramUrl(
      settings.instagram,
    );

  const year =
    new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            {settings.store_name}
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            متجر ملابس جزائري بتجربة تسوق بسيطة وآمنة،
            والدفع عند الاستلام.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold">
            روابط سريعة
          </h2>

          <nav className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground">
            <Link
              href="/shop"
              className="transition-colors hover:text-foreground"
            >
              المتجر
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              تواصل معنا
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold">
            معلومات التواصل
          </h2>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Phone
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                <span dir="ltr">
                  {settings.phone}
                </span>
              </a>
            ) : null}

            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                <span
                  dir="ltr"
                  className="break-all"
                >
                  {settings.email}
                </span>
              </a>
            ) : null}

            {settings.address ? (
              <div className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  {settings.address}
                </span>
              </div>
            ) : null}

            {settings.instagram ? (
              instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <AtSign
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span dir="ltr">
                    {settings.instagram}
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-2">
                  <AtSign
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span dir="ltr">
                    {settings.instagram}
                  </span>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {year} {settings.store_name}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}