import type { MetadataRoute } from "next";

import {
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      allow: "/",

      disallow: [
        "/admin",
        "/checkout",
        "/order-success",
      ],
    },

    sitemap: absoluteUrl("/sitemap.xml"),

    host: getSiteUrl(),
  };
}