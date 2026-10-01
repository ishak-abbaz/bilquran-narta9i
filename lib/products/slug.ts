const arabicDiacritics =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function arabicSafeSlug(
  value: string,
): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(arabicDiacritics, "")
    .replace(/\u0640/g, "")
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}