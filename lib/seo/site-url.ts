import "server-only";

function normalizeBaseUrl(value: string): string {
  const rawValue = value.trim();

  const valueWithProtocol =
    rawValue.startsWith("http://") || rawValue.startsWith("https://")
      ? rawValue
      : `https://${rawValue}`;

  const url = new URL(valueWithProtocol);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("عنوان الموقع يجب أن يستخدم HTTP أو HTTPS.");
  }

  return url.origin;
}

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (productionUrl) {
    return normalizeBaseUrl(productionUrl);
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return normalizeBaseUrl(vercelUrl);
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim();

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // القيمة عبارة عن مسار نسبي.
  }

  const path = value.startsWith("/") ? value : `/${value}`;

  return new URL(path, getSiteUrl()).toString();
}