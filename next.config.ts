import type {
  NextConfig,
} from "next";

const nextConfig:
  NextConfig = {
  images: {
    /*
     * Supabase images are already compressed
     * before upload.
     *
     * In your local environment the Supabase
     * hostname resolves through a NAT64/private
     * address, so Next's server-side image
     * optimizer rejects the request for SSRF
     * protection.
     *
     * With unoptimized=true the browser loads
     * the public Supabase image directly.
     */
    unoptimized: true,

    remotePatterns: [
      {
        protocol:
          "https",

        hostname:
          "*.supabase.co",

        pathname:
          "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;