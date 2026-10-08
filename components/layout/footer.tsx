import Link from "next/link";

const year =
  new Date().getFullYear();

/*
 * Replace these with your real profile URLs.
 * Keep https:// at the beginning.
 */
const INSTAGRAM_URL = 
  "https://instagram.com/";

const FACEBOOK_URL =
  "https://facebook.com/";

const TIKTOK_URL =
  "https://tiktok.com/";

const WHATSAPP_URL =
  "https://wa.me/213698867385";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="5"
        ry="5"
      />

      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />

      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.8 1.8-1.8H17V2.3c-.6-.1-1.7-.3-3-.3-3 0-5 1.8-5 5.1v2.4H6V13h3v9h4.5Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2-2.75v-3.5a6.34 6.34 0 1 0 5.45 6.28V8.73a8.16 8.16 0 0 0 4.77 1.52V6.81a4.85 4.85 0 0 1-1-.12Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.82 11.82 0 0 0 12.09 0C5.53 0 .2 5.33.2 11.89c0 2.09.55 4.13 1.59 5.93L.1 24l6.33-1.66a11.88 11.88 0 0 0 5.66 1.44h.01C18.66 23.78 24 18.45 24 11.89c0-3.18-1.24-6.16-3.48-8.41ZM12.1 21.77h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.66-.24-.38a9.83 9.83 0 0 1-1.51-5.24c0-5.46 4.45-9.9 9.91-9.9a9.83 9.83 0 0 1 7 2.9 9.82 9.82 0 0 1 2.9 7c0 5.46-4.44 9.88-9.9 9.88Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.56-.35Z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "إنستغرام",
    href:
      INSTAGRAM_URL,
    icon:
      <InstagramIcon />,
  },
  {
    name: "فيسبوك",
    href:
      FACEBOOK_URL,
    icon:
      <FacebookIcon />,
  },
  {
    name: "تيك توك",
    href:
      TIKTOK_URL,
    icon:
      <TikTokIcon />,
  },
  {
    name: "واتساب",
    href:
      WHATSAPP_URL,
    icon:
      <WhatsAppIcon />,
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-bold tracking-[0.35em]">
            بالقرآن نرتقي
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            متجر جزائري لبيع
            المصاحف والكتب الإسلامية،
            بتشكيلة مختارة بعناية
            وخدمة الدفع عند الاستلام.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            روابط سريعة
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <Link href="/">
              الرئيسية
            </Link>

            <Link href="/shop">
              المصاحف والكتب
            </Link>

            <Link href="/about">
              من نحن
            </Link>

            <Link href="/contact">
              اتصل بنا
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold">
            التواصل
          </h3>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              الهاتف: 0698867385
            </p>

            <p>
              البريد:
              {" "}
              contact@bilquran-narta9i.dz
            </p>

            <p>
              الجزائر
            </p>

            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map(
                (
                  social,
                ) => (
                  <a
                    key={
                      social.name
                    }
                    href={
                      social.href
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={
                      social.name
                    }
                    title={
                      social.name
                    }
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {
                      social.icon
                    }
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t py-5 text-center text-sm text-muted-foreground">
        © {year} بالقرآن نرتقي.
        جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}