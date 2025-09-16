export const i18n = {
  defaultLocale: "en",
  locales: ["en", "zh", "ko", "ja"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

// Language mapping object
export const localeMap = {
  en: "English",
  zh: "中文",
  ko: "한국어",
  ja: "日本語",
} as const;
