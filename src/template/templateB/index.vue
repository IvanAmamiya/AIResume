<template>
  <div class="resume resume-paper resume-template-b" :style="resumeStyle">
    <!-- 个人信息 -->
    <section class="personal-section" :style="sectionStyle('personalInfo')">
      <div class="personal-info">
        <h1 class="name" v-if="resume.personalInfo.name">{{ resume.personalInfo.name }}</h1>
        <div class="info-grid">
          <div class="info-item" v-if="resume.personalInfo.gender">
            <span class="label">{{ $t('label.genderColon') }}</span>{{ resume.personalInfo.gender }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.age">
            <span class="label">{{ $t('label.ageColon') }}</span>{{ resume.personalInfo.age }}{{ $t('label.ageUnit') }} </div>
          <div class="info-item" v-if="resume.personalInfo.politicalStatus">
            <span class="label">{{ $t('label.politicalColon') }}</span>{{ resume.personalInfo.politicalStatus }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.phone">
            <span class="label">{{ $t('label.phoneColon') }}</span>{{ resume.personalInfo.phone }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.email">
            <span class="label">{{ $t('label.emailColon') }}</span>{{ resume.personalInfo.email }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.university">
            <span class="label">{{ $t('label.schoolColon') }}</span>{{ resume.personalInfo.university }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.major">
            <span class="label">{{ $t('label.majorColon') }}</span>{{ resume.personalInfo.major }}
          </div>
          <div class="info-item" v-if="resume.personalInfo.website">
            <span class="label">{{ $t('label.websiteColon') }}</span>
            <a :href="resume.personalInfo.website" target="_blank">{{ resume.personalInfo.website }}</a>
          </div>
        </div>
      </div>
      <div class="avatar" v-if="resume.personalInfo.avatar">
        <img :src="resume.personalInfo.avatar" :alt="$t('label.photo')">
      </div>
    </section>

    <!-- 分割线 -->
    <hr class="section-divider" :style="sectionStyle('personalInfo', 0.1)" />

    <!-- 荣誉奖项 -->
    <section class="section" v-if="resume.honors.length" :style="sectionStyle('honors')">
      <h2 class="section-title">{{ $t('section.honors') }}</h2>
      <ul class="list">
        <li v-for="honor in resume.honors" :key="honor.id" v-html="marked(honor.honorName)"></li>
      </ul>
    </section>

    <!-- 教育经历 -->
    <section class="section" v-if="resume.education.length" :style="sectionStyle('education')">
      <h2 class="section-title">{{ $t('section.education') }}</h2>
      <div class="experience-list">
        <div class="experience-item" v-for="edu in resume.education" :key="edu.id">
          <div class="item-header">
            <h3 class="institution">{{ edu.school }}</h3>
            <span v-if="edu.startDate" class="duration">{{ edu.startDate }} - {{ edu.endDate || $t('common.present') }}</span>
          </div>
          <p class="degree">{{ edu.degree }} - {{ edu.major }}</p>
        </div>
      </div>
    </section>

    <!-- 技能特长 -->
    <section class="section" v-if="resume.skills.length" :style="sectionStyle('skills')">
      <h2 class="section-title">{{ $t('section.skillsSummary') }}</h2>
      <ul class="skill-list">
        <li v-for="skill in resume.skills" :key="skill.id">{{ skill.skillName }}</li>
      </ul>
    </section>

    <!-- 工作/实习经历 -->
    <section class="section" v-if="resume.workExperience.length" :style="sectionStyle('workExperience')">
      <h2 class="section-title">{{ $t('section.workInternships') }}</h2>
      <div class="experience-list">
        <div class="experience-item" v-for="work in resume.workExperience" :key="work.id">
          <div class="item-header">
            <p class="company">{{ work.company }}</p>
            <h3 class="position">{{ work.position }}</h3>
            <span v-if="work.startDate" class="duration">{{ work.startDate }} - {{ work.endDate || $t('common.present') }}</span>
          </div>

          <ul class="description-list">
            <li v-for="(desc, index) in work.description.split('\n')" :key="index" v-html="marked(desc)"></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 项目经验 -->
    <section class="section" v-if="resume.projects.length" :style="sectionStyle('projects')">
      <h2 class="section-title">{{ $t('section.projectsSummary') }}</h2>
      <div class="experience-list">
        <div class="experience-item" v-for="project in resume.projects" :key="project.id">
          <div class="item-header">
            <h3 class="project-name">{{ project.projectName }}</h3>
            <p class="role">{{ project.role }}</p>
            <span v-if="project.startDate" class="duration">{{ project.startDate }} - {{ project.endDate || $t('common.present')
              }}</span>
          </div>
          <p class="project-intro" v-html="marked(project.briefIntroduction)"></p>
          <ul class="description-list">
            <li v-for="(desc, index) in project.description.split('\n')" :key="index" v-html="marked(desc)"></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 自我评价 -->
    <section class="section" v-if="resume.summary" :style="sectionStyle('summary')">
      <h2 class="section-title">{{ $t('section.selfEvaluation') }}</h2>
      <p class="summary" v-html="marked(resume.summary)"></p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../store/useResumeStore';
import { computed } from 'vue';
import { useResumePresentation } from '../../composables/useResumePresentation';
import { marked } from 'marked';

// 引用的store
const resumeStore = useResumeStore();
const resume = computed(() => resumeStore.$state);


// 合并所有样式到一个计算属性
const { resumeStyle, sectionStyle } = useResumePresentation(resume);
</script>

<style scoped>

.resume-template-b .personal-section { border-bottom: 2px solid var(--themeColor1); padding-bottom: 16px; }
</style>
