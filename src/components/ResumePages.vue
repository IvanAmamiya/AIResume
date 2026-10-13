<template>
  <!-- 测量源在屏幕外保持原尺寸，不能 display:none，否则无法获得文字行坐标。 -->
  <div class="pagination-source" ref="sourceHost" aria-hidden="true">
    <component :is="component" v-bind="templateProps" />
  </div>
  <div class="resume-pages" ref="pagesHost" :aria-busy="busy" />
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount, type Component } from 'vue';
import { useResumeStore } from '../store';
import { i18n } from '../i18n';
import { paginateResume } from '../utils/paginateResume';

const props = defineProps<{ component: Component; templateProps: Record<string, unknown> }>();
const emit = defineEmits<{ ready: []; error: [error: unknown] }>();
const store = useResumeStore();
const sourceHost = ref<HTMLElement>();
const pagesHost = ref<HTMLElement>();
const busy = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let revision = 0;
let disposed = false;
let observer: MutationObserver | undefined;

async function prepare(): Promise<HTMLElement[]> {
  const current = ++revision;
  busy.value = true;
  try {
    await nextTick();
    await document.fonts.ready;
    const paper = sourceHost.value?.querySelector<HTMLElement>('.resume-paper');
    if (!paper) throw new Error('Resume template is not ready');
    await Promise.all(Array.from(paper.querySelectorAll('img'), image => image.decode().catch(() => undefined)));
    if (disposed || current !== revision) return [];
    const pages = paginateResume(paper);
    pagesHost.value?.replaceChildren(...pages);
    emit('ready');
    return pages;
  } finally { if (current === revision) busy.value = false; }
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => { prepare().catch(error => emit('error', error)); }, 100);
}
watch([() => store.$state, () => props.component, () => props.templateProps, i18n.global.locale], schedule, { deep: true });
onMounted(() => {
  // 异步模板挂载和图片加载也会改变测量源，不能只依赖数据 watch。
  observer = new MutationObserver(schedule);
  if (sourceHost.value) observer.observe(sourceHost.value, { subtree: true, childList: true, characterData: true, attributes: true });
  sourceHost.value?.addEventListener('load', schedule, true);
  schedule();
});
onBeforeUnmount(() => {
  disposed = true;
  ++revision;
  clearTimeout(timer);
  observer?.disconnect();
  sourceHost.value?.removeEventListener('load', schedule, true);
});
defineExpose({ prepare });
</script>

<style>
.pagination-source { position: fixed; left: -100000px; top: 0; width: 210mm; pointer-events: none; }
.resume-pages { display: flex; flex-direction: column; gap: 24px; width: 210mm; }
.resume-page { box-shadow: 0 2px 12px #0002; }
</style>
