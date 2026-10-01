    import "server-only";

import { createClient } from "@/lib/supabase/server";

export type StoreSettings = {
  store_name: string;
  phone: string;
  email: string;
  instagram: string;
  address: string;
  free_delivery_threshold: number | null;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: "متجري",
  phone: "",
  email: "",
  instagram: "",
  address: "",
  free_delivery_threshold: null,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select(
      `
        store_name,
        phone,
        email,
        instagram,
        address,
        free_delivery_threshold
      `,
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error(
      "تعذر تحميل معلومات المتجر:",
      error,
    );

    return DEFAULT_STORE_SETTINGS;
  }

  if (!data) {
    return DEFAULT_STORE_SETTINGS;
  }

  return {
    store_name:
      typeof data.store_name === "string"
        ? data.store_name
        : DEFAULT_STORE_SETTINGS.store_name,

    phone:
      typeof data.phone === "string"
        ? data.phone
        : "",

    email:
      typeof data.email === "string"
        ? data.email
        : "",

    instagram:
      typeof data.instagram === "string"
        ? data.instagram
        : "",

    address:
      typeof data.address === "string"
        ? data.address
        : "",

    free_delivery_threshold:
      typeof data.free_delivery_threshold === "number"
        ? data.free_delivery_threshold
        : null,
  };
}

export function getInstagramUrl(
  value: string,
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (
    /^[A-Za-z0-9._]+$/.test(
      trimmed.replace(/^@/, ""),
    )
  ) {
    return `https://www.instagram.com/${trimmed.replace(/^@/, "")}`;
  }

  try {
    const url = new URL(trimmed);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    const host = url.hostname.toLowerCase();

    if (
      host !== "instagram.com" &&
      host !== "www.instagram.com"
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}