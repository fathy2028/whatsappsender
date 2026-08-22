import { config } from "./config";

/**
 * Normalize a phone number to international digits (no "+", no separators).
 *
 * assumeLocal=true (bulk endpoints): numbers without a country code get the
 * configured one prepended. assumeLocal=false (single send): the number is
 * assumed to already be international unless it starts with "0".
 */
export const normalizePhoneNumber = (raw: unknown, assumeLocal = true): string => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  const cc = config.countryCode;
  if (!digits) return "";
  if (digits.startsWith(cc)) {
    // Handle numbers written as <cc> + leading local zero, e.g. "20" + "010..."
    if (digits[cc.length] === "0") {
      return cc + digits.slice(cc.length + 1);
    }
    return digits;
  }
  if (digits.startsWith("0")) return cc + digits.slice(1);
  return assumeLocal ? cc + digits : digits;
};

export const toJid = (phoneNumber: string): string =>
  `${phoneNumber}@s.whatsapp.net`;

export const isValidUsername = (username: unknown): username is string =>
  typeof username === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(username);
