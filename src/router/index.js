import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import SubjectView from '@/views/SubjectView.vue'
import PracticeView from '@/views/PracticeView.vue'
import InterviewView from '@/views/InterviewView.vue'
import CircleView from '@/views/CircleView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { title: '首页 - 随风 Club' }
  },
  {
    path: '/subject',
    name: 'Subject',
    component: SubjectView,
    meta: { title: '题库大全 - 随风 Club' }
  },
  {
    path: '/practice',
    name: 'Practice',
    component: PracticeView,
    meta: { title: '在线考场 - 随风 Club' }
  },
  {
    path: '/interview',
    name: 'Interview',
    component: InterviewView,
    meta: { title: 'AI 模拟面试 - 随风 Club' }
  },
  {
    path: '/circle',
    name: 'Circle',
    component: CircleView,
    meta: { title: '技术圈子 - 随风 Club' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { title: '个人中心 - 随风 Club' }
  },
  {
    path: '/base',
    name: 'AdminBase',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { title: '随风 Club · 后台管理系统', requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
