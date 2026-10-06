import type {
  Metadata,
} from "next";
import {
  Cairo,
} from "next/font/google";

import "./globals.css";

import {
  ThemeProvider,
} from "@/components/theme-provider";
import {
  Toaster,
} from "sonner";

const cairo = Cairo({
  variable:
    "--font-cairo",

  subsets: [
    "arabic",
    "latin",
  ],

  display: "swap",
});

const siteUrl =
  process.env
    .NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase:
    new URL(siteUrl),

  title: {
    default:
      "بالقرآن نرتقي | مصاحف وكتب إسلامية في الجزائر",

    template:
      "%s | بالقرآن نرتقي",
  },

  description:
    "متجر بالقرآن نرتقي لبيع المصاحف والكتب الإسلامية في الجزائر، بتشكيلة مختارة بعناية وخدمة التوصيل والدفع عند الاستلام.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          {children}

          <Toaster
            richColors
            position="top-center"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}