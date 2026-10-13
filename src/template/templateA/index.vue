<template>
  <div class="resume-container resume-paper resume-template-a" :style="resumeStyle">
    <!-- 个人信息 -->
    <section class="personal-info" :style="sectionStyle('personalInfo')">
      <div class="personal-details">
        <div class="detail-row">
          <div class="detail-item name" v-if="resume.personalInfo.name">
            <span class="value">{{ resume.personalInfo.name }}</span>
          </div>
          <div class="detail-item" v-if="resume.personalInfo.gender">
            <span class="label">{{ $t('label.genderColon') }}</span>
            <span class="value">{{ resume.personalInfo.gender }}</span>
          </div>
          <div class="detail-item" v-if="resume.personalInfo.age">
            <span class="label">{{ $t('label.ageColon') }}</span>
            <span class="value">{{ resume.personalInfo.age }}</span>
          </div>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.politicalStatus">
          <div class="detail-item">
            <span class="label">{{ $t('label.politicalColon') }}</span>
            <span class="value">{{ resume.personalInfo.politicalStatus }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item" v-if="resume.personalInfo.phone">
            <span class="label">{{ $t('label.phoneColon') }}</span>
            <span class="value">{{ resume.personalInfo.phone }}</span>
          </div>
          <div class="detail-item" v-if="resume.personalInfo.email">
            <span class="label">{{ $t('label.emailColon') }}</span>
            <span class="value">{{ resume.personalInfo.email }}</span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-item" v-if="resume.personalInfo.university">
            <span class="label">{{ $t('label.schoolColon') }}</span>
            <span class="value">{{ resume.personalInfo.university }}</span>
          </div>
          <div class="detail-item" v-if="resume.personalInfo.major">
            <span class="label">{{ $t('label.majorColon') }}</span>
            <span class="value">{{ resume.personalInfo.major }}</span>
          </div>
        </div>
        <div class="detail-row" v-if="resume.personalInfo.website">
          <div class="detail-item">
            <span class="label">{{ $t('label.websiteColon') }}</span>
            <a :href="resume.personalInfo.website" target="_blank" class="value">{{ resume.personalInfo.website }}</a>
          </div>
        </div>
      </div>
      <div class="profile-image" v-if="resume.personalInfo.avatar">
        <img :src="resume.personalInfo.avatar" :alt="$t('label.photo')">
      </div>
    </section>

    <!-- 荣誉奖项、复用skills样式 -->
    <section class="section skills-section" v-if="resume.honors.length" :style="sectionStyle('honors')">
      <div class="section-title">{{ $t('section.honors') }}</div>
      <ul class="skills-list">
        <li v-for="honor in resume.honors" :key="honor.id" v-html="marked(honor.honorName)"></li>
      </ul>
    </section>

    <!-- 在校经历 -->
    <section class="section education-section" v-if="resume.education.length" :style="sectionStyle('education')">
      <div class="section-title">{{ $t('section.education') }}</div>
      <div class="section-content">
        <div class="item" v-for="edu in resume.education" :key="edu.id">
          <p class="school">
            <span>{{ edu.school }}({{ edu.degree }})</span>
            <span>{{ edu.major }}</span>
            <b v-if="edu.startDate">{{ edu.startDate }} {{ $t('common.to') }} {{ edu.endDate || $t('common.present') }}</b>
          </p>
        </div>
      </div>
    </section>

    <!-- 技能特长 -->
    <section class="section skills-section" v-if="resume.skills.length" :style="sectionStyle('skills')">
      <div class="section-title">{{ $t('section.skillsSummary') }}</div>
      <ul class="skills-list">
        <li v-for="skill in resume.skills" :key="skill.id" v-html="marked(skill.skillName)"></li>
      </ul>
    </section>
    <!-- 工作/实习经历 -->
    <section class="section experience-section" v-if="resume.workExperience.length" :style="sectionStyle('workExperience')">
      <div class="section-title">{{ $t('section.workInternships') }}</div>
      <div class="section-content">
        <div class="item" v-for="work in resume.workExperience" :key="work.id">
          <div class="subtitle">
            <div class="work-header">
              <span>{{ work.company }}</span>
              <span>{{ work.position }}</span>
              <span v-if="work.startDate">{{ work.startDate }} {{ $t('common.to') }} {{ work.endDate || $t('common.present') }}</span>
            </div>
          </div>
          <ul>
            <li v-for="(desc, index) in work.description.split('\n')" :key="index" v-html="marked(desc)"></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 项目经验 -->
    <section class="section projects-section" v-if="resume.projects.length" :style="sectionStyle('projects')">
      <div class="section-title">{{ $t('section.projectsSummary') }}</div>
      <div class="section-content">
        <div class="item" v-for="project in resume.projects" :key="project.id">
          <div class="subtitle">
            <div class="project-header">
              <span>{{ project.projectName }}</span>
              <span>{{ project.role }}</span>
              <span v-if="project.startDate">{{ project.startDate }} {{ $t('common.to') }} {{ project.endDate || $t('common.present') }}</span>
            </div>
            <hr>
            <p class="project-introduction" v-html="marked(project.briefIntroduction)"></p>
          </div>
          <ul>
            <li v-for="(desc, index) in project.description.split('\n')" :key="index" v-html="marked(desc)"></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 自我评价 -->
    <section class="section self-evaluation-section" v-if="resume.summary" :style="sectionStyle('summary')">
      <div class="section-title">{{ $t('section.selfEvaluation') }}</div>
      <p class="self-evaluation" v-html="marked(resume.summary)"></p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../store/useResumeStore';
import { computed } from 'vue';
import { useResumePresentation } from '../../composables/useResumePresentation';
import { marked } from 'marked';

// 引入引用的store
const resumeStore = useResumeStore();
const resume = computed(() => resumeStore.$state);


// 合并所有样式到一个计算属性
const { resumeStyle, sectionStyle } = useResumePresentation(resume);
</script>
<!-- 引入外部css -->
<style scoped>

.resume-template-a .section-title { border-left: 3px solid var(--themeColor1); padding-left: 10px; }
</style>