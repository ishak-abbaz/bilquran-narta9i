/**
 * يتحقق من رقم هاتف جزائري ويعيده بصيغة محلية 10 أرقام:
 * مثال:
 * 0555123456
 *
 * يقبل:
 * +213555123456
 * 00213555123456
 * 0555123456
 */

export function normalizeAlgerianPhone(
  phone: string,
): string | null {
  let normalized = phone
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  if (normalized.startsWith("+213")) {
    normalized = `0${normalized.slice(4)}`;
  }

  if (normalized.startsWith("00213")) {
    normalized = `0${normalized.slice(5)}`;
  }

  if (!/^0[567]\d{8}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function isValidAlgerianPhone(
  phone: string,
): boolean {
  return normalizeAlgerianPhone(phone) !== null;
}

/*
Test cases:

1) normalizeAlgerianPhone("0555123456")
   => "0555123456"

2) normalizeAlgerianPhone("+213555123456")
   => "0555123456"

3) normalizeAlgerianPhone("00213555123456")
   => "0555123456"

4) normalizeAlgerianPhone("0412345678")
   => null

5) isValidAlgerianPhone("0777123456")
   => true
*/