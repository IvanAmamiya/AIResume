<template>
  <!-- 简历容器，使用计算属性绑定所有主题相关的样式变量 -->
  <div class="resume-container resume-paper resume-template-dev" :style="resumeStyle">
    <!-- 个人信息部分 -->
    <div class="personal-info" :style="sectionStyle('personalInfo')">
      <div class="personal-details">
        <!-- 仅在有值时显示对应的信息行 -->
        <div class="detail-row" v-if="resume.personalInfo.name">
          <span class="label">{{ $t('label.nameColon') }}</span>
          <span class="value">{{ resume.personalInfo.name }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.gender">
          <span class="label">{{ $t('label.genderColon') }}</span>
          <span class="value">{{ resume.personalInfo.gender }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.age">
          <span class="label">{{ $t('label.ageColon') }}</span>
          <span class="value">{{ resume.personalInfo.age }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.phone">
          <span class="label">{{ $t('label.phoneColon') }}</span>
          <span class="value">{{ resume.personalInfo.phone }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.email">
          <span class="label">{{ $t('label.emailColon') }}</span>
          <span class="value">{{ resume.personalInfo.email }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.university">
          <span class="label">{{ $t('label.schoolColon') }}</span>
          <span class="value">{{ resume.personalInfo.university }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.major">
          <span class="label">{{ $t('label.majorColon') }}</span>
          <span class="value">{{ resume.personalInfo.major }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.politicalStatus">
          <span class="label">{{ $t('label.politicalColon') }}</span>
          <span class="value">{{ resume.personalInfo.politicalStatus }}</span>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.website">
          <span class="label">{{ $t('label.websiteColon') }}</span>
          <a :href="resume.personalInfo.website" target="_blank" class="value">{{ resume.personalInfo.website }}</a>
        </div>
      </div>
      <!-- 头像部分，仅在有头像时显示 -->
      <div class="profile-image" v-if="resume.personalInfo.avatar">
        <img :src="resume.personalInfo.avatar" :alt="$t('label.photo')">
      </div>
    </div>

    <!-- 各个章节的模板结构相似，都包含标题和内容部分 -->
    <div class="section education-section" v-if="resume.education.length" :style="sectionStyle('education')">
      <div class="section-title">{{ $t('section.education') }}</div>
      <div class="section-content">
        <div class="item" v-for="edu in resume.education" :key="edu.id">
          <span>{{ edu.school }} {{ edu.degree ? `(${edu.degree})` : '' }}</span>
          <strong v-if="edu.startDate && edu.endDate">{{ edu.startDate }} {{ $t('common.to') }} {{ edu.endDate }}</strong>
        </div>
      </div>
    </div>

    <div class="section experience-section" v-if="resume.workExperience.length" :style="sectionStyle('workExperience')">
      <div class="section-title">{{ $t('section.work') }}</div>
      <div class="section-content">
        <div class="item" v-for="work in resume.workExperience" :key="work.id">
          <span>{{ work.company }} {{ work.position ? `- ${work.position}` : '' }}</span>
          <span class="date" v-if="work.startDate && work.endDate">({{ work.startDate }} {{ $t('common.to') }} {{ work.endDate }})</span>
          <p v-if="work.description" v-html="marked(work.description)"></p>
        </div>
      </div>
    </div>

    <div class="section skills-section" v-if="resume.skills.length" :style="sectionStyle('skills')">
      <div class="section-title">{{ $t('section.skillsSummary') }}</div>
      <div class="skills-list">
        <p v-for="skill in resume.skills" :key="skill.id" class="skill-item" v-html="marked(skill.skillName)"></p>
      </div>
    </div>

    <div class="section projects-section" v-if="resume.projects.length" :style="sectionStyle('projects')">
      <div class="section-title">{{ $t('section.projectsSummary') }}</div>
      <div class="section-content">
        <div class="item" v-for="project in resume.projects" :key="project.id">
          <div class="project-header">
            <span>{{ project.projectName }}</span>
            <span v-if="project.role" class="role">{{ project.role }}</span>
            <span class="date" v-if="project.startDate && project.endDate">({{ project.startDate }} {{ $t('common.to') }} {{ project.endDate
            }})</span>
          </div>
          <p v-if="project.briefIntroduction" v-html="marked(project.briefIntroduction)"></p>
          <div v-if="project.description" class="project-details" v-html="marked(project.description)"></div>
        </div>
      </div>
    </div>

    <div class="section honors-section" v-if="resume.honors.length" :style="sectionStyle('honors')">
      <div class="section-title">{{ $t('section.honors') }}</div>
      <div class="section-content">
        <p v-for="honor in resume.honors" :key="honor.id" class="honor-item">
          <span v-html="marked(honor.honorName)"></span>
          <span class="date" v-if="honor.date">{{ honor.date }}</span>
        </p>
      </div>
    </div>

    <div class="section summary-section" v-if="resume.summary" :style="sectionStyle('summary')">
      <div class="section-title">{{ $t('section.selfEvaluation') }}</div>
      <p class="summary" v-html="marked(resume.summary)"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../store/useResumeStore';
import { computed } from 'vue';
import { useResumePresentation } from '../../composables/useResumePresentation';
import type { ColorShades } from '../../types/color';
import { marked } from 'marked';

// 接受父组件传递的主题色
const props = defineProps<{
  colorShades: ColorShades;
}>();

// 引入store
const resumeStore = useResumeStore();
const resume = computed(() => resumeStore.$state);

// 合并所有样式变量到一个计算属性
const { resumeStyle: baseStyle, sectionStyle } = useResumePresentation(resume);
const resumeStyle = computed(() => ({
  ...baseStyle.value,
  '--color-base': props.colorShades.base,
  '--color-dark': props.colorShades.dark,
  '--color-darker': props.colorShades.darker,
  '--color-light': props.colorShades.light,
  '--color-lighter': props.colorShades.lighter,
}));
</script>

<style scoped>
</style>
