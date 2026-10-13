export const supportedLocales = ['zh-CN', 'en', 'ja'] as const;
export type AppLocale = typeof supportedLocales[number];
export const localeStorageKey = 'airesume.locale';

// 无效或旧版本保存的语言值回退到中文，不影响已有简历数据。
export const resolveLocale = (value: unknown): AppLocale =>
  supportedLocales.includes(value as AppLocale) ? value as AppLocale : 'zh-CN';

export function readSavedLocale(storage?: Pick<Storage, 'getItem'>): AppLocale {
  try {
    return resolveLocale(storage?.getItem(localeStorageKey));
  } catch {
    return 'zh-CN'; // 浏览器禁用存储时仍可使用语言切换。
  }
}
