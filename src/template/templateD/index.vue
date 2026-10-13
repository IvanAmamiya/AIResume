<template>
  <div class="resume-container resume-paper resume-template-d" :style="colorShadesStyle">
    <div class="header-decoration"></div>
    <!-- 头部信息区域 -->
    <header class="resume-header" :style="sectionStyle('personalInfo')">
      <div class="header-content">
        <div class="header-main">
          <h1 class="name">{{ resume.personalInfo.name }}</h1>
          <div class="basic-info">
            <span v-if="resume.personalInfo.gender">{{ resume.personalInfo.gender }}</span>
            <span v-if="resume.personalInfo.age">{{ resume.personalInfo.age }}{{ $t('label.ageUnit') }}</span>
            <span v-if="resume.personalInfo.university">{{ resume.personalInfo.university }}</span>
            <span v-if="resume.personalInfo.major">{{ resume.personalInfo.major }}</span>
            <span v-if="resume.personalInfo.politicalStatus">{{ resume.personalInfo.politicalStatus }}</span>
          </div>
          <div class="contact-info">
            <a v-if="resume.personalInfo.phone" class="contact-item">
              <i class="fas fa-phone"></i>{{ resume.personalInfo.phone }}
            </a>
            <a v-if="resume.personalInfo.email" class="contact-item">
              <i class="fas fa-envelope"></i>{{ resume.personalInfo.email }}
            </a>
            <a v-if="resume.personalInfo.website" :href="resume.personalInfo.website" target="_blank"
              class="contact-item">
              <i class="fas fa-globe"></i>{{ resume.personalInfo.website }}
            </a>
          </div>
          <div v-if="resume.personalInfo.applicationPosition" class="job-target"> {{ $t('label.positionColon') }} {{ resume.personalInfo.applicationPosition }}
          </div>
        </div>
        <div v-if="resume.personalInfo.avatar" class="avatar">
          <img :src="resume.personalInfo.avatar" :alt="$t('label.avatar')">
        </div>
      </div>
    </header>

    <!-- 个人总结 -->
    <section v-if="resume.summary" class="resume-section" :style="sectionStyle('summary')">
      <div class="section-icon">
        <i class="fas fa-user"></i>
      </div>
      <h2 class="section-title">{{ $t('section.summary') }}</h2>
      <div class="section-content summary" v-html="marked(resume.summary)"></div>
    </section>

    <!-- 教育经历 -->
    <section v-if="resume.education.length" class="resume-section" :style="sectionStyle('education')">
      <div class="section-icon">
        <i class="fas fa-graduation-cap"></i>
      </div>
      <h2 class="section-title">{{ $t('section.education') }}</h2>
      <div class="section-content">
        <div v-for="edu in resume.education" :key="edu.id" class="education-item">
          <div class="edu-main">
            <span class="school">{{ edu.school }}</span>
            <span v-if="edu.major" class="major">{{ edu.major }}</span>
            <span v-if="edu.degree" class="degree">{{ edu.degree }}</span>
          </div>
          <div v-if="edu.startDate" class="edu-time">{{ edu.startDate }} ~ {{ edu.endDate || $t('common.present') }}</div>
        </div>
      </div>
    </section>

    <!-- 工作经历 -->
    <section v-if="resume.workExperience.length" class="resume-section" :style="sectionStyle('workExperience')">
      <div class="section-icon">
        <i class="fas fa-briefcase"></i>
      </div>
      <h2 class="section-title">{{ $t('section.work') }}</h2>
      <div class="section-content">
        <div v-for="work in resume.workExperience" :key="work.id" class="work-item">
          <div class="work-header">
            <h3 class="company">{{ work.company }}</h3>
            <div v-if="work.position" class="position">{{ work.position }}</div>
            <span v-if="work.startDate" class="time">{{ work.startDate }} ~ {{ work.endDate || $t('common.present') }}</span>
          </div>

          <div v-if="work.description" class="description" v-html="marked(work.description)"></div>
        </div>
      </div>
    </section>

    <!-- 项目经历 -->
    <section v-if="resume.projects.length" class="resume-section" :style="sectionStyle('projects')">
      <div class="section-icon">
        <i class="fas fa-project-diagram"></i>
      </div>
      <h2 class="section-title">{{ $t('section.projects') }}</h2>
      <div class="section-content">
        <div v-for="project in resume.projects" :key="project.id" class="project-item">
          <div class="project-header">
            <h3 class="project-name">{{ project.projectName }}</h3>
            <div v-if="project.role" class="role">{{ project.role }}</div>
            <span v-if="project.startDate" class="time">{{ project.startDate }} ~ {{ project.endDate || $t('common.present') }}</span>
          </div>

          <div v-if="project.briefIntroduction" class="brief" v-html="marked(project.briefIntroduction)"></div>
          <ul v-if="project.description" class="description-list">
            <li v-for="(desc, index) in String(project.description).split('\n')" :key="index" v-html="marked(desc)">
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 技能特长 -->
    <section v-if="resume.skills.length" class="resume-section" :style="sectionStyle('skills')">
      <div class="section-icon">
        <i class="fas fa-tools"></i>
      </div>
      <h2 class="section-title">{{ $t('section.skillsSummary') }}</h2>
      <div class="section-content">
        <div class="skills-list">
          <p v-for="skill in resume.skills" :key="skill.id" class="skill-item" v-html="marked(skill.skillName)"></p>
        </div>
      </div>
    </section>

    <!-- 荣誉奖项 -->
    <section v-if="resume.honors.length" class="resume-section" :style="sectionStyle('honors')">
      <div class="section-icon">
        <i class="fas fa-award"></i>
      </div>
      <h2 class="section-title">{{ $t('section.honors') }}</h2>
      <div class="section-content">
        <div v-for="honor in resume.honors" :key="honor.id" class="honor-item">
          <span class="honor-name" v-html="marked(honor.honorName)"></span>
          <span class="honor-date">{{ honor.date }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../store/useResumeStore';
import { computed } from 'vue';
import { useResumePresentation } from '../../composables/useResumePresentation';
import type { ColorShades } from '../../types/color';
import { marked } from 'marked';

// 接受父组件的主题色
const props = defineProps<{
  colorShades: ColorShades;
}>();

// 引入引用的store
const resumeStore = useResumeStore();
const resume = computed(() => resumeStore.$state);

// 动态生成 CSS 变量的样式
const { resumeStyle: baseStyle, sectionStyle } = useResumePresentation(resume);
const colorShadesStyle = computed(() => ({
  ...baseStyle.value,
  '--color-base': props.colorShades.base,
  '--color-dark': props.colorShades.dark,
  '--color-darker': props.colorShades.darker,
  '--color-light': props.colorShades.light,
  '--color-lighter': props.colorShades.lighter,
}));
</script>

<style scoped>

.resume-template-d .resume-header { border-bottom-width: 3px; }
.resume-template-d .section-title { color: var(--color-dark); }
</style>
