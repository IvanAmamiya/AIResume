<script setup lang="ts">
import Header from "./components/Header/index.vue";
import ThemeSwitcher from './components/ThemeSwitcher/index.vue';
import NarrowScreen from './components/narrow/index.vue';
import { useResumeStore } from './store/useResumeStore';
import { useSettingsStore } from './store/useSettingsStore';
import { onMounted, ref, onBeforeMount } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';
import jaJP from 'ant-design-vue/es/locale/ja_JP';
const { locale } = useI18n();
const componentLocale = computed(() => ({ 'zh-CN': zhCN, en: enUS, ja: jaJP }[locale.value]));
const settingsStore = useSettingsStore();
const showNarrowScreen = ref(false);


// 检查屏幕宽度
const checkScreenWidth = () => {
  showNarrowScreen.value = window.innerWidth < 768;
};

onBeforeMount(() => {
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
});

// 页面加载时初始化
onMounted(async () => {
  const resumeStore = useResumeStore();
  await resumeStore.initCheck();
  settingsStore.initTheme();
});
</script>

<template>
  <a-config-provider :locale="componentLocale" :theme="{
      token: {
        colorPrimary: settingsStore.theme,
      },
    }">
    <narrow-screen v-if="showNarrowScreen" />
    <template v-else>
      <Header />
      <router-view v-slot="{ Component }">
        <keep-alive include="aiDeep">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <ThemeSwitcher />
    </template>
  </a-config-provider>
</template>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
