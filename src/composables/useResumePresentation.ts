import { computed, type ComputedRef } from 'vue';
import { normalizeSectionOrder } from '../constants/sectionOrder';
import { getResumeStyle } from '../utils/resumePresentation';
import type { ResumeState, SectionKey } from '../types/resume';

export function useResumePresentation(resume: ComputedRef<Pick<ResumeState, 'resumeSetting' | 'sectionOrder'>>) {
  const resumeStyle = computed(() => getResumeStyle(resume.value.resumeSetting));
  const sectionOrder = computed(() => normalizeSectionOrder(resume.value.sectionOrder));
  const sectionStyle = (key: SectionKey, offset = 0) => {
    const index = sectionOrder.value.indexOf(key);
    return { order: (index < 0 ? sectionOrder.value.length : index) + offset };
  };
  return { resumeStyle, sectionStyle };
}
