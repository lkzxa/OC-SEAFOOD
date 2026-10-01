export const OFFICIAL_PHONE_DISPLAY = "0908 464 818";
export const OFFICIAL_PHONE_DIGITS = "0908464818";
export const OFFICIAL_PHONE_TEL = `tel:${OFFICIAL_PHONE_DIGITS}`;
export const OFFICIAL_ZALO_URL = `https://zalo.me/${OFFICIAL_PHONE_DIGITS}`;

export function toTelephoneHref(value: string = OFFICIAL_PHONE_DISPLAY): string {
  const digits = value.replace(/\D/g, "");
  return `tel:${digits || OFFICIAL_PHONE_DIGITS}`;
}
