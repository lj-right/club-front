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
    meta: { title: '首页 - 烤面筋' }
  },
  {
    path: '/subject',
    name: 'Subject',
    component: SubjectView,
    meta: { title: '题库 - 烤面筋' }
  },
  {
    path: '/practice',
    name: 'Practice',
    component: PracticeView,
    meta: { title: '在线练习 - 烤面筋' }
  },
  {
    path: '/interview',
    name: 'Interview',
    component: InterviewView,
    meta: { title: 'AI 面试 - 烤面筋' }
  },
  {
    path: '/circle',
    name: 'Circle',
    component: CircleView,
    meta: { title: '交流论坛 - 烤面筋' }
  },
  {
    path: '/circle/detail/:id',
    name: 'CircleDetail',
    component: () => import('@/views/CircleDetailView.vue'),
    meta: { title: '动态详情 - 烤面筋' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { title: '个人中心 - 烤面筋' }
  },
  {
    path: '/oauth/callback/:platform',
    name: 'OAuthCallback',
    component: () => import('@/views/oauth/CallbackView.vue'),
    meta: { title: '第三方授权登录 - 烤面筋' }
  },
  {
    path: '/base',
    name: 'AdminBase',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { title: '烤面筋 · 后台管理系统', requiresAdmin: true }
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
