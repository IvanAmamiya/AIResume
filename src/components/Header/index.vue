<template>
  <header class="navbar">
    <nav>
      <ul>
        <li><router-link to="/">
            <SvgIcon iconName="resume" /> {{ $t('nav.resume') }} </router-link></li>
        <li ref="templateStore"><router-link to="/template">
            <SvgIcon iconName="templateStore" /> {{ $t('nav.templates') }} </router-link></li>
        <li ref="setting"><router-link to="/aiDeep">
            <SvgIcon iconName="ai" /> {{ $t('nav.ai') }} </router-link></li>
        <li ref="setting"><router-link to="/setting">
            <SvgIcon iconName="setting" /> {{ $t('nav.settings') }} </router-link></li>

        <li><router-link to="/resumeDesign">{{ $t('nav.design') }}</router-link></li>
      </ul>
    </nav>
    <LanguageSwitcher />
  </header>

  <!-- 漫游式引导 -->
  <a-tour v-model:open="tourOpen" :steps="tourSteps" :mask="true" :next-button-props="{ children: $t('common.next') }"
    :prev-button-props="{ children: $t('common.previous') }" :finish-button-props="{ children: $t('common.finish') }" @finish="handleFinish"
    @close="handleFinish" />
</template>

<script setup lang="ts">
import { t } from '../../i18n';
import { computed, onMounted, ref } from "vue";
import SvgIcon from '../SvgIcon.vue';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import { useResumeStore } from "../../store/useResumeStore";
import type { TourProps } from 'ant-design-vue';

const store = useResumeStore();
const setting = ref(null);
const templateStore = ref(null);
const tourOpen = ref(false); // 控制引导是否打开

const tourSteps = computed<TourProps['steps']>(() => [
  {
    title: t('nav.settings'),
    description: t('tour.settings'),
    target: () => setting.value,
  },
  {
    title: t('tour.chooseTemplate'),
    description: t('tour.templates'),
    target: () => templateStore.value,
  }
]);



// 引导完成时的回调
const handleFinish = () => {
  tourOpen.value = false;
};

onMounted(() => {
  if (store.isFirstVisit) {
    tourOpen.value = true; // 开始引导
  }
});
</script>

<style scoped>
.navbar {
  background: linear-gradient(to right, var(--color-5), var(--color-6), var(--color-5));
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.navbar nav ul li {
  float: left;
}

.navbar nav ul li a {
  display: block;
  color: white;
  text-align: center;
  font-size: 17px;
  padding: 17px 16px;
  text-decoration: none;
  transition: all 0.22s;
}

.navbar nav ul li a:hover {
  background-color: #ffffff;
  color: black;
}
</style>
