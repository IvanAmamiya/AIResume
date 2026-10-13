<template>
  <div class="resume-container resume-paper resume-template-c" :style="resumeStyle">
    <!-- 左侧边栏 -->
    <aside class="sidebar">
      <div class="profile-section" :style="sectionStyle('personalInfo')">
        <div class="avatar-wrapper" v-if="resume.personalInfo.avatar">
          <img :src="resume.personalInfo.avatar" :alt="$t('label.avatar')" class="avatar">
        </div>
        <h1 class="name" v-if="resume.personalInfo.name">{{ resume.personalInfo.name }}</h1>
        <p class="title" v-if="resume.personalInfo.applicationPosition">{{ resume.personalInfo.applicationPosition }}
        </p>
      </div>

      <div class="contact-section" v-if="hasContactInfo" :style="sectionStyle('personalInfo', 0.1)">
        <div class="contact-item" v-if="resume.personalInfo.gender">
          <i class="fas fa-user"></i>
          <span>{{ $t('label.genderColon') }}{{ resume.personalInfo.gender }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.age">
          <i class="fas fa-birthday-cake"></i>
          <span>{{ $t('label.ageColon') }}{{ resume.personalInfo.age }}{{ $t('label.ageUnit') }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.politicalStatus">
          <i class="fas fa-flag"></i>
          <span>{{ $t('label.politicalColon') }}{{ resume.personalInfo.politicalStatus }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.phone">
          <i class="fas fa-phone"></i>
          <span>{{ $t('label.phoneColon') }}{{ resume.personalInfo.phone }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.email">
          <i class="fas fa-envelope"></i>
          <span>{{ $t('label.emailColon') }}{{ resume.personalInfo.email }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.university">
          <i class="fas fa-university"></i>
          <span>{{ $t('label.schoolColon') }}{{ resume.personalInfo.university }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.major">
          <i class="fas fa-graduation-cap"></i>
          <span>{{ $t('label.majorColon') }}{{ resume.personalInfo.major }}</span>
        </div>
        <div class="contact-item" v-if="resume.personalInfo.website">
          <i class="fas fa-globe"></i>
          <span>{{ $t('label.websiteColon') }}<a :href="resume.personalInfo.website" target="_blank">{{ resume.personalInfo.website }}</a></span>
        </div>
      </div>

      <div class="side-section" v-if="resume.education.length" :style="sectionStyle('education')">
        <h2 class="side-title">{{ $t('section.educationBackground') }}</h2>
        <div class="education-item" v-for="edu in resume.education" :key="edu.id">
          <h3>{{ edu.school }}</h3>
          <p class="edu-major">{{ edu.major }}</p>
          <p class="edu-degree">{{ edu.degree }}</p>
          <p v-if="edu.startDate" class="edu-time">{{ edu.startDate }} - {{ edu.endDate || $t('common.present') }}</p>
        </div>
      </div>

      <div class="side-section" v-if="resume.skills.length" :style="sectionStyle('skills')">
        <h2 class="side-title">{{ $t('section.skillsSummary') }}</h2>
        <div class="skills-wrapper">
          <p class="skill-tag" v-for="skill in resume.skills" :key="skill.id" v-html="marked(skill.skillName)"></p>
        </div>
      </div>
    </aside>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <section class="content-section" v-if="resume.summary" :style="sectionStyle('summary')">
        <h2 class="section-title">{{ $t('section.profile') }}</h2>
        <p class="summary" v-html="marked(resume.summary)"></p>
      </section>

      <section class="content-section" v-if="resume.workExperience.length" :style="sectionStyle('workExperience')">
        <h2 class="section-title">{{ $t('section.work') }}</h2>
        <div class="experience-item" v-for="work in resume.workExperience" :key="work.id">
          <div class="exp-header">
            <h3>{{ work.company }}</h3>
            <div class="exp-role">{{ work.position }}</div>
            <span v-if="work.startDate" class="exp-date">{{ work.startDate }} - {{ work.endDate || $t('common.present') }}</span>
          </div>

          <div class="exp-desc" v-html="marked(work.description)"></div>
        </div>
      </section>

      <section class="content-section" v-if="resume.projects.length" :style="sectionStyle('projects')">
        <h2 class="section-title">{{ $t('section.projectsSummary') }}</h2>
        <div class="project-item" v-for="project in resume.projects" :key="project.id">
          <div class="proj-header">
            <h3>{{ project.projectName }}</h3>
            <div class="proj-role">{{ project.role }}</div>
            <span v-if="project.startDate" class="proj-date">{{ project.startDate }} - {{ project.endDate || $t('common.present')
              }}</span>
          </div>

          <div class="proj-brief" v-html="marked(project.briefIntroduction)"></div>
          <div class="proj-details" v-html="marked(project.description)"></div>
        </div>
      </section>

      <section class="content-section" v-if="resume.honors.length" :style="sectionStyle('honors')">
        <h2 class="section-title">{{ $t('section.honors') }}</h2>
        <p v-for="honor in resume.honors" :key="honor.id" class="honor-item">
          <span v-html="marked(honor.honorName)"></span>
          <span class="honor-date" v-if="honor.date">{{ honor.date }}</span>
        </p>
      </section>
    </main>
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



// 判断是否有联系方式信息
const hasContactInfo = computed(() => {
  const { phone, email, website, gender, age, politicalStatus, university, major } = resume.value.personalInfo;
  return phone || email || website || gender || age || politicalStatus || university || major;
});

// 合并所有样式到一个计算属性
const { resumeStyle, sectionStyle } = useResumePresentation(resume);
</script>

<style scoped>

.resume-template-c { display: grid; grid-template-columns: minmax(0, 30%) minmax(0, 1fr); padding: 0; }
.sidebar { background: #f2f5f9; color: #263244; padding: var(--padding-top-bottom) 20px; display: flex; flex-direction: column; }
.main-content { padding: var(--padding-top-bottom) var(--padding-left-right); display: flex; flex-direction: column; }
.profile-section { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.contact-section { margin-top: 16px; }
.contact-item { margin-bottom: 8px; }
.contact-item i { display: none; }
.name { font-size: 1.65em; }
.title { margin: 0; color: #526079; }
.side-section:first-child, .content-section:first-child { margin-top: 0; }
</style>
