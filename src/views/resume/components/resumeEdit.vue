<template>
  <div class="resume-edit">
    <a-alert
      :message="$t('editor.markdown')"
      show-icon
      type="info"
      style="margin-bottom: 10px;"
    />
    <div
      v-for="module in orderedModules"
      :key="module.key"
      class="module-wrapper"
      :class="{ 'is-drag-over': dragOverModule === module.key }"
      @dragenter.prevent="onModuleDragEnter(module.key)"
      @dragover.prevent="onModuleDragOver(module.key, $event)"
      @dragleave="onModuleDragLeave(module.key)"
      @drop="onModuleDrop(module.key, $event)"
    >
      <button
        class="module-drag-handle"
        type="button"
        draggable="true"
        :aria-label="$t('editor.reorderSection', { name: module.label })"
        @dragstart="onModuleDragStart(module.key, $event)"
        @dragend="onModuleDragEnd"
      >
        <MenuOutlined />
      </button>
      <component :is="module.component" />
    </div>
    <div
      v-show="draggingModule"
      class="module-drop-zone"
      @dragenter.prevent
      @dragover.prevent
      @drop="onDropToEnd"
    >
      <MenuOutlined />
      <span>{{ $t('editor.dropLast') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t } from '../../../i18n';
import { computed, ref } from 'vue';
import type { Component } from 'vue';
import { MenuOutlined } from '@ant-design/icons-vue';
import { useResumeStore } from '../../../store';
import type { SectionKey } from '../../../types/resume';
import personalInfo from './personalInfo.vue';
import education from './education.vue';
import workExperience from './workExperience.vue';
import skill from './skill.vue';
import honor from './honor.vue';
import selfEvaluation from './selfEvaluation.vue';
import project from './project.vue';

type ModuleDefinition = {
  key: SectionKey;
  label: string;
  component: Component;
};

const moduleDefinitions = computed<ModuleDefinition[]>(() => [
  { key: 'personalInfo', label: t('section.personal'), component: personalInfo },
  { key: 'education', label: t('section.education'), component: education },
  { key: 'projects', label: t('section.projects'), component: project },
  { key: 'workExperience', label: t('section.work'), component: workExperience },
  { key: 'skills', label: t('section.skills'), component: skill },
  { key: 'honors', label: t('section.honors'), component: honor },
  { key: 'summary', label: t('section.selfEvaluation'), component: selfEvaluation }
]);

const moduleMap = computed(() => new Map<SectionKey, ModuleDefinition>(
  moduleDefinitions.value.map(definition => [definition.key, definition])
));

const resumeStore = useResumeStore();

const orderedModules = computed(() =>
  resumeStore.sectionOrder
    .map(key => moduleMap.value.get(key))
    .filter((module): module is ModuleDefinition => Boolean(module))
);

const draggingModule = ref<SectionKey | null>(null);
const dragOverModule = ref<SectionKey | null>(null);

const onModuleDragStart = (key: SectionKey, event: DragEvent) => {
  draggingModule.value = key;
  dragOverModule.value = null;
  event.dataTransfer?.setData('text/plain', key);
  event.dataTransfer && (event.dataTransfer.effectAllowed = 'move');
};

const onModuleDragEnd = () => {
  draggingModule.value = null;
  dragOverModule.value = null;
};

const onModuleDragEnter = (key: SectionKey) => {
  if (!draggingModule.value || draggingModule.value === key) return;
  dragOverModule.value = key;
};

const onModuleDragLeave = (key: SectionKey) => {
  if (dragOverModule.value === key) {
    dragOverModule.value = null;
  }
};

const onModuleDragOver = (key: SectionKey, event: DragEvent) => {
  if (!draggingModule.value) return;
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move');
  if (dragOverModule.value !== key && draggingModule.value !== key) {
    dragOverModule.value = key;
  }
};

const onModuleDrop = (key: SectionKey, event: DragEvent) => {
  event.preventDefault();
  if (!draggingModule.value) return;
  const currentTarget = event.currentTarget as HTMLElement | null;
  let placement: 'before' | 'after' = 'before';
  if (currentTarget) {
    const rect = currentTarget.getBoundingClientRect();
    if (event.clientY - rect.top > rect.height / 2) {
      placement = 'after';
    }
  }
  resumeStore.moveSection(draggingModule.value, key, placement);
  draggingModule.value = null;
  dragOverModule.value = null;
};

const onDropToEnd = (event: DragEvent) => {
  event.preventDefault();
  if (!draggingModule.value) return;
  const nextOrder = resumeStore.sectionOrder.filter(item => item !== draggingModule.value);
  nextOrder.push(draggingModule.value);
  resumeStore.setSectionOrder(nextOrder);
  draggingModule.value = null;
  dragOverModule.value = null;
};
</script>

<style scoped>
.resume-edit {
  padding: 12px;
  height: 100vh;
  overflow-y: auto;
  /* 滚动条细 */
  scrollbar-width: thin;
}

.module-wrapper {
  position: relative;
  padding-left: 28px;
  margin-bottom: 16px;
  border-radius: 10px;
}

.module-wrapper.is-drag-over {
  outline: 2px dashed #1677ff;
}

.module-drag-handle {
  position: absolute;
  left: 0;
  top: 12px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border: none;
  background: transparent;
  color: #8c8c8c;
  padding: 0;
}

.module-drag-handle:active {
  cursor: grabbing;
}

.module-drop-zone {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8c8c8c;
  font-size: 12px;
  background: #f7f7f7;
}

.module-drop-zone svg {
  font-size: 16px;
}
</style>
