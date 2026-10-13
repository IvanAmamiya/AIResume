<script lang="ts" setup>
import { t } from '../../../i18n';
import { computed, inject, type Ref, ref } from "vue";
import { useResumeStore } from "../../../store";
import { toRef } from "vue";
const resume = toRef(useResumeStore());

interface ExperienceOption {
  label: string;
  value: string;
}
// 构建经历的选项
const experienceOptions = computed<ExperienceOption[]>(() => [
  ...resume.value.projects.map(item => ({
    label: t('chat.projectPrefix') + item.projectName,
    value: `project:${item.id}`,
  })),
  ...resume.value.workExperience.map(item => ({
    label: t('chat.workPrefix') + item.company,
    value: `work:${item.id}`,
  })),
]);
const selectedExperience = ref<string>();
// 项目经历
// 工作经历
const jd = inject<Ref<string>>("jd");
const resumeProject = inject<Ref<string>>("resumeProject");
const handleExperienceChange = (value: string) => {
  if (resumeProject) {
    const project = resume.value.projects.find(item => `project:${item.id}` === value);
    const work = resume.value.workExperience.find(item => `work:${item.id}` === value);
    if (project) resumeProject.value = `${t('chat.projectIntro')}${project.briefIntroduction}\n${t('chat.projectDescription')}${project.description}`;
    if (work) resumeProject.value = `${t('chat.companyPrefix')}${work.company}\n${t('chat.positionPrefix')}${work.position}\n${t('chat.workDescription')}${work.description}`;
  }
};
</script>

<template>
  <div class="data-input">
    <div class="input-section">
      <div class="input-header">{{ $t('chat.jd') }}<span style="font-size: 12px;">{{ $t('chat.jdHint') }}</span></div>
      <a-textarea v-model:value="jd" :placeholder="$t('chat.jdPlaceholder')" class="custom-textarea" />
    </div>
    <!-- 选项框-用户可以选择一段经历来进行问答 -->
    <div class="select-section">
      <div class="input-header">{{ $t('chat.chooseExperience') }}<span style="font-size: 12px;">{{ $t('chat.experienceHint') }}</span></div>
      <a-select v-model:value="selectedExperience" :placeholder="$t('chat.chooseExperiencePlaceholder')" :options="experienceOptions"
        @change="handleExperienceChange" />
    </div>
    <div class="input-section" id="input-value">
      <div class="input-header">{{ $t('chat.experience') }}<span style="font-size: 12px;">{{ $t('chat.oneExperience') }}</span></div>
      <a-textarea v-model:value="resumeProject" :placeholder="$t('chat.experiencePlaceholder')" class="custom-textarea" />
    </div>
  </div>
</template>

<style scoped>
.data-input {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--bg-card-color);
}

.select-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.input-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.input-header {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  padding: 0 4px;
}

:deep(.custom-textarea) {
  flex: 1;
  display: flex;
  background: var(--chat-input-bg);
  border-color: var(--chat-border);
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.custom-textarea:hover) {
  border-color: var(--color-4);
}

:deep(.custom-textarea:focus) {
  border-color: var(--color-4);
  box-shadow: 0 0 0 2px rgba(var(--color-4-rgb), 0.1);
}

:deep(.ant-input) {
  background: var(--chat-input-bg);
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  overflow-y: auto;
  height: 100% !important;
  min-height: unset !important;
}

:deep(.ant-input::placeholder) {
  color: var(--chat-placeholder);
}

:deep(.ant-input::-webkit-scrollbar) {
  width: 6px;
}

:deep(.ant-input::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.ant-input::-webkit-scrollbar-thumb) {
  background: var(--chat-border);
  border-radius: 3px;
}

:deep(.ant-input::-webkit-scrollbar-thumb:hover) {
  background: var(--color-6);
}
</style>
