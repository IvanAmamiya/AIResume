<script setup lang="ts">
import { t } from '../../i18n';
// import { ref } from 'vue';
import { computed, ref, provide } from "vue";
import userInput from './components/userInput.vue';
import AIChat from './components/AIChat.vue';
import type { TourProps } from 'ant-design-vue';

//子组件之间通信 jd 以及 简历数据
const resumeProject = ref<string>("");
const jd = ref<string>("");

defineOptions({
  name: "aiDeep"  // keep-alive需要
});


provide("resumeProject", resumeProject);
provide("jd", jd);

//引导开始
const left = ref(null);
const right = ref(null);
const aiChatRef = ref<InstanceType<typeof AIChat> | null>(null);
const inputRef = ref<InstanceType<typeof userInput> | null>(null);
const tourOpen = ref(false);
const tourSteps = computed<TourProps['steps']>(() => [
  {
    title: t('tour.input'),
    description: t('tour.inputDescription'),
    target: () => right.value,
    placement: "left",
    nextButtonProps: { children: () => t('common.next') },
  },
  {
    title: t('tour.mode'),
    description: t('tour.modeDescription'),
    target: () => aiChatRef.value?.$el.querySelector("#ai-choose-content") as HTMLElement,
    placement: "bottom",
    prevButtonProps: { children: () => t('common.previous') },
    nextButtonProps: { children: () => t('common.next') },
  },
  {
    title: t('tour.chat'),
    description: t('tour.chatDescription'),
    target: () => aiChatRef.value?.$el.querySelector("#ai-chat-content") as HTMLElement,
    placement: "top",
    prevButtonProps: { children: () => t('common.previous') },
    nextButtonProps: { children: () => t('common.next') },
  },
  {
    title: t('tour.edit'),
    description: t('tour.editDescription'),
    target: () => inputRef.value?.$el.querySelector("#input-value") as HTMLElement,
    placement: "left",
    prevButtonProps: { children: () => t('common.previous') },
    nextButtonProps: { children: () => t('common.close') },
  }
]);
// 引导完成时回调关闭引导
const handleFinish = () => {
  tourOpen.value = false;
};

const beginTour = () => {
  tourOpen.value = true;
};
provide("beginTour", beginTour);
</script>

<template>
  <div class="main-box">
    <div class="left" ref="left">
      <AIChat ref="aiChatRef" />
    </div>
    <div class="right" ref="right">
      <userInput ref="inputRef" />
    </div>
  </div>

  <!-- 漫游式引导 -->
  <a-tour v-model:open="tourOpen" arrow="true" :steps="tourSteps" :mask="true" :prev-button-props="{ children: $t('common.previous') }"
    :finish-button-props="{ children: $t('common.finish') }" @finish="handleFinish" @close="handleFinish" />
</template>

<style scoped>
.main-box {
  border-radius: 20px;

  background-color: var(--bg-card-color);
  margin: 30px auto;
  box-shadow: 0 2px 17px 0 rgba(53, 53, 53, 0.1);
  padding: 5px;
  display: flex;
  max-width: 80vw;
  height: 85vh;
}

.left {
  flex: 1;
  padding: 10px;
}

.right {
  /* display: flex;
  flex-direction: column; */
  width: 30%;
  min-width: 250px;
}
</style>
