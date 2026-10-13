import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';


// 定义路由
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'resume',
    component: () => import('@/views/resume/index.vue'),
    meta: { titleKey: 'title.resume' }
  },
  {
    path: '/resumeDesign',
    name: 'resumeDesign',
    component: () => import('@/views/resumeDesign/index.vue'),
    meta: { titleKey: 'title.design' }
  },
  {
    path: '/template',
    name: 'template',
    component: () => import('@/views/template/index.vue'),
    meta: { titleKey: 'title.templates' }
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import('@/views/setting/index.vue'),
    meta: { titleKey: 'title.settings' }
  },
  {
    path: '/aiDeep',
    name: 'aiDeep',
    component: () => import('@/views/aiDeep/index.vue'),
    meta: { titleKey: 'title.ai', keepAlive: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue')
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 使用 HTML5 历史模式
  routes
});
export default router;
