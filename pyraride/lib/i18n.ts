// i18n configuration for Arabic RTL support
// This is a simplified implementation - for production, use next-intl or similar

export type Locale = "en" | "ar";

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "ar"];

export function getDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function formatCurrency(amount: number, locale: Locale = "en"): string {
  if (locale === "ar") {
    return `${amount} جنيه`;
  }
  
  const formatter = new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  });
  
  return formatter.format(amount);
}

export function formatDate(date: Date, locale: Locale = "en"): string {
  if (locale === "ar") {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
  
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatTime(date: Date, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// Language detection (simplified)
export function detectLocale(): Locale {
  if (typeof window !== "undefined") {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ar")) return "ar";
  }
  return defaultLocale;
}

// Simple translation function (for production, use a proper i18n library)
let currentMessages: Record<string, any> = {};

export async function loadMessages(locale: Locale) {
  try {
    const messages = await import(`../messages/${locale}.json`);
    currentMessages = messages.default || messages;
    return currentMessages;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return {};
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: any = currentMessages;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  if (value === undefined) return key;
  if (typeof value !== "string") return key;
  
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      return String(params[name] || "");
    });
  }
  
  return value;
}

