import { createI18n } from 'vue-i18n';
import { watch } from 'vue';
import zh from './locales/zh-CN.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import { localeStorageKey, readSavedLocale, resolveLocale } from './locale';

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: (() => {
    try { return readSavedLocale(typeof window === 'undefined' ? undefined : window.localStorage); }
    catch { return 'zh-CN'; }
  })(),
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zh, en, ja },
});

// 非组件代码（提示消息、store 等）也使用同一套语言资源。
export const t = i18n.global.t;
export const setLocale = (value: unknown) => { i18n.global.locale.value = resolveLocale(value); };

watch(i18n.global.locale, (locale) => {
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  try { window.localStorage.setItem(localeStorageKey, locale); } catch { /* 存储不可用时只在本次会话生效。 */ }
}, { immediate: true });
