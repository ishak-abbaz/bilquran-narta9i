import type {
  MetadataRoute,
} from "next";

import {
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
} from "@/lib/seo/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",

    name:
      `${SITE_NAME} | مصاحف وكتب إسلامية`,

    short_name:
      SITE_NAME,

    description:
      SITE_DESCRIPTION,

    lang:
      SITE_LANGUAGE,

    dir: "rtl",

    start_url:
      "/",

    scope: "/",

    display:
      "standalone",

    background_color:
      "#ffffff",

    theme_color:
      "#166534",

    categories: [
      "shopping",
      "books",
    ],

    icons: [
      {
        src: "/icon",
        sizes:
          "512x512",
        type:
          "image/png",
        purpose:
          "any",
      },

      {
        src: "/icon",
        sizes:
          "512x512",
        type:
          "image/png",
        purpose:
          "maskable",
      },
    ],
  };
}