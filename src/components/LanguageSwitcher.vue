<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { setLocale } from '../i18n';
const { locale, t } = useI18n();
</script>

<template>
  <label class="language-switcher">
    <span class="sr-only">{{ t('language.label') }}</span>
    <select :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value)">
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  </label>
</template>

<style scoped>
.language-switcher { display: flex; align-items: center; padding: 8px 12px; }
select { padding: 6px 8px; border: 1px solid #ffffff80; border-radius: 6px; background: #fff; color: #222; font: inherit; }
select:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
</style>
