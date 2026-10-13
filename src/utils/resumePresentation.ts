import type { ResumeSetting } from '../types/resume';

// 简历尺寸仅作用于纸张，不修改 html/body 字号或编辑器界面。
export const resumeDefaults = {
  fontSize: 14.5,
  paragraphSpacing: 6,
  sectionSpacing: 20,
  padding_top_bottom: 32,
  padding_left_right: 40,
} as const;

const bounded = (value: number, fallback: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export const getResumeStyle = (settings: ResumeSetting) => ({
  fontSize: `${bounded(settings.fontSize, resumeDefaults.fontSize, 12, 24)}px`,
  '--paragraph-spacing': `${bounded(settings.paragraphSpacing, resumeDefaults.paragraphSpacing, 0, 30)}px`,
  '--section-spacing': `${bounded(settings.sectionSpacing, resumeDefaults.sectionSpacing, 0, 40)}px`,
  '--padding-left-right': `${bounded(settings.padding_left_right, resumeDefaults.padding_left_right, 0, 65)}px`,
  '--padding-top-bottom': `${bounded(settings.padding_top_bottom, resumeDefaults.padding_top_bottom, 0, 65)}px`,
  '--themeColor1': settings.themeColor1,
  '--themeColor2': settings.themeColor2,
});
