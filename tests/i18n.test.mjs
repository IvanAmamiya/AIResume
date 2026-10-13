import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import { createI18n } from 'vue-i18n';

const source = await fs.readFile(new URL('../src/i18n/locale.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
});
const { resolveLocale, readSavedLocale, localeStorageKey } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const messages = Object.fromEntries(await Promise.all(['zh-CN', 'en', 'ja'].map(async locale =>
  [locale, JSON.parse(await fs.readFile(new URL(`../src/i18n/locales/${locale}.json`, import.meta.url), 'utf8'))]
)));
const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([key, value]) => {
  const full = prefix ? `${prefix}.${key}` : key;
  return typeof value === 'string' ? [[full, value]] : flatten(value, full);
});

test('each language has the same keys, nonempty messages and matching placeholders', () => {
  const base = new Map(flatten(messages['zh-CN']));
  for (const locale of ['en', 'ja']) {
    const actual = new Map(flatten(messages[locale]));
    assert.deepEqual([...actual.keys()].sort(), [...base.keys()].sort());
    for (const [key, value] of actual) {
      assert.ok(value.trim(), `${locale}:${key}`);
      assert.deepEqual(value.match(/\{\w+\}/g) ?? [], base.get(key).match(/\{\w+\}/g) ?? [], `${locale}:${key}`);
    }
  }
});

test('all messages compile and translations switch without stale fallback text', () => {
  const i18n = createI18n({ legacy: false, locale: 'zh-CN', fallbackLocale: 'zh-CN', messages });
  for (const locale of ['zh-CN', 'en', 'ja']) {
    i18n.global.locale.value = locale;
    for (const [key] of flatten(messages[locale])) {
      const rendered = i18n.global.t(key, { name: 'Example', status: 500 });
      assert.ok(rendered && rendered !== key, `${locale}:${key}`);
    }
    assert.equal(i18n.global.t('nav.resume'), messages[locale].nav.resume);
    assert.ok(i18n.global.t('worker.http', { status: 500 }).includes('500'));
  }
});

test('saved language is validated and storage denial falls back safely', () => {
  for (const locale of ['zh-CN', 'en', 'ja']) {
    assert.equal(resolveLocale(locale), locale);
    assert.equal(readSavedLocale({ getItem: key => { assert.equal(key, localeStorageKey); return locale; } }), locale);
  }
  for (const invalid of [null, undefined, '', 'fr', {}, '__proto__']) assert.equal(resolveLocale(invalid), 'zh-CN');
  assert.equal(readSavedLocale({ getItem() { throw new Error('storage denied'); } }), 'zh-CN');
});

test('every literal translation key in the source exists in the dictionaries', async () => {
  const keys = new Set(flatten(messages['zh-CN']).map(([key]) => key));
  async function walk(dir) {
    for (const file of await fs.readdir(dir, { withFileTypes: true })) {
      const url = new URL(file.name + (file.isDirectory() ? '/' : ''), dir);
      if (file.isDirectory()) { if (file.name !== 'i18n') await walk(url); continue; }
      if (!/\.(vue|ts)$/.test(file.name)) continue;
      const content = await fs.readFile(url, 'utf8');
      for (const [, key] of content.matchAll(/(?<![\w$])\$?t\(['"]([^'"]+)['"]/g)) assert.ok(keys.has(key), `${url.pathname}:${key}`);
    }
  }
  await walk(new URL('../src/', import.meta.url));
});

test('changing language does not change stored gender or affiliation values', async () => {
  const content = await fs.readFile(new URL('../src/views/resume/components/personalInfo.vue', import.meta.url), 'utf8');
  for (const value of ['男', '女', '其他', '中共党员', '中共预备党员', '共青团员', '群众']) {
    assert.ok(content.includes(`value: '${value}'`));
  }
});
