<template>
  <a-collapse class="education-collapse">
    <a-collapse-panel key="1" :header="$t('section.education')">
      <a-space direction="vertical" style="width: 100%">
        <!-- 教育经历列表 -->
        <div
          v-for="(edu, index) in education"
          :key="edu.id"
          class="education-item"
          :class="{ 'is-drag-over': dragOverIndex === index }"
          @dragenter.prevent="onDragEnter(index)"
          @dragover.prevent="onDragOver(index, $event)"
          @dragleave="onDragLeave(index)"
          @drop="onDrop(index, $event)"
        >
          <div class="item-header">
            <button
              class="item-drag-handle"
              type="button"
              draggable="true"
              :aria-label="$t('education.reorder')"
              @dragstart="onDragStart(index, $event)"
              @dragend="onDragEnd"
            >
              <MenuOutlined />
            </button>
            <h4>{{ $t('education.number') }}{{ index + 1 }}</h4>
            <a-popconfirm :title="$t('education.confirmDelete')" :ok-text="$t('common.delete')" :cancel-text="$t('common.cancel')" @confirm="removeEducation(edu.id)">
              <template #icon><question-circle-outlined style="color: red" /></template>
              <a-button type="link" danger>{{ $t('common.delete') }}</a-button>
            </a-popconfirm>
          </div>

          <a-form layout="vertical">
            <a-row gutter="24">
              <a-col :span="12">
                <a-input v-model:value="edu.school" :placeholder="$t('education.schoolPlaceholder')" :addonBefore="$t('label.school')" />
              </a-col>
              <a-col :span="12">
                <a-input v-model:value="edu.major" :placeholder="$t('education.majorPlaceholder')" :addonBefore="$t('label.major')" />
              </a-col>
            </a-row>

            <a-row gutter="24" style="margin-top: 16px">
              <a-col :span="12">
                <a-date-picker v-model:value="edu.startDate" :placeholder="$t('label.startDate')" style="width: 100%" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" />
              </a-col>
              <a-col :span="12">
                <a-date-picker v-model:value="edu.endDate" :placeholder="$t('label.endDate')" style="width: 100%" format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD" />
              </a-col>
            </a-row>

            <a-input v-model:value="edu.degree" :placeholder="$t('education.degreePlaceholder')" :addonBefore="$t('label.degree')" style="margin-top: 16px" />
          </a-form>
          <a-divider v-if="index !== education.length - 1" />
        </div>

        <!-- 添加按钮 -->
        <a-button type="dashed" block @click="addEducation" style="margin-top: 16px">
          <plus-outlined /> {{ $t('education.add') }} </a-button>
      </a-space>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup lang="ts">
import { t } from '../../../i18n';
import { computed, ref, watch } from 'vue';
import { PlusOutlined, MenuOutlined } from '@ant-design/icons-vue';
import { useResumeStore } from '../../../store';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { moveItem } from '../../../utils/reorder';
const resumeStore = useResumeStore();
const education = computed(() => resumeStore.education);
const draggingIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// 添加教育经历
const addEducation = () => {
  resumeStore.addEducation({
    school: '',
    degree: '',
    major: '',
    startDate: '',
    endDate: ''
  });
};

// 删除教育经历
const removeEducation = (id: number) => {
  resumeStore.deleteEducation(id)
  message.success(t('education.deleted'));
};

const onDragStart = (index: number, event: DragEvent) => {
  draggingIndex.value = index;
  dragOverIndex.value = null;
  event.dataTransfer?.setData('text/plain', String(index));
  event.dataTransfer && (event.dataTransfer.effectAllowed = 'move');
};

const onDragEnd = () => {
  draggingIndex.value = null;
  dragOverIndex.value = null;
};

const onDragEnter = (index: number) => {
  if (draggingIndex.value === null || draggingIndex.value === index) return;
  dragOverIndex.value = index;
};

const onDragLeave = (index: number) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null;
  }
};

const onDragOver = (index: number, event: DragEvent) => {
  if (draggingIndex.value === null) return;
  event.dataTransfer && (event.dataTransfer.dropEffect = 'move');
  if (dragOverIndex.value !== index && draggingIndex.value !== index) {
    dragOverIndex.value = index;
  }
};

const onDrop = (index: number, event: DragEvent) => {
  event.preventDefault();
  if (draggingIndex.value === null) return;
  const currentTarget = event.currentTarget as HTMLElement | null;
  let toIndex = index;
  if (currentTarget) {
    const rect = currentTarget.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    if (offset > rect.height / 2) {
      toIndex = index + 1;
    }
  }
  const fromIndex = draggingIndex.value;
  if (fromIndex < toIndex) {
    toIndex -= 1;
  }
  if (fromIndex !== toIndex) {
    moveItem(education.value, fromIndex, toIndex);
    resumeStore.saveToLocalStorage();
  }
  draggingIndex.value = null;
  dragOverIndex.value = null;
};

// 监听变化并保存到 localStorage
watch(
  () => resumeStore.$state,
  () => {
    resumeStore.saveToLocalStorage();
  },
  { deep: true }
);
</script>

<style scoped>
.education-collapse {
  margin: 20px auto 0;
  max-width: 800px;
  font-family: 'zql';
  background-color: var(--color-7);
}

.education-item {
  width: 100%;
  position: relative;
  border-radius: 8px;
}

.item-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.item-header h4 {
  margin: 0;
}

.item-header > :last-child {
  justify-self: end;
}

.item-drag-handle {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border: none;
  background: transparent;
  color: #8c8c8c;
  padding: 0;
}

.item-drag-handle:active {
  cursor: grabbing;
}

.education-item.is-drag-over {
  outline: 2px dashed #1677ff;
}
</style>