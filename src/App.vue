<template>
  <div class="app-layout">
    <!-- 全局顶部导航栏 (管理控制台 /base 专属全屏模式，隐藏学员前台顶栏) -->
    <AppHeader v-if="!$route.path.startsWith('/base')" />

    <!-- 路由主页面视图容器 -->
    <main :class="['main-body', { 'admin-body': $route.path.startsWith('/base') }]">
      <router-view />
    </main>

    <!-- 全局弹窗与抽屉挂载点 -->
    <LoginModal />
    <SearchModal />
    <QuestionDrawer />
    <MomentModal />
    <ReportModal />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import LoginModal from '@/components/LoginModal.vue'
import SearchModal from '@/components/SearchModal.vue'
import QuestionDrawer from '@/components/QuestionDrawer.vue'
import MomentModal from '@/components/MomentModal.vue'
import ReportModal from '@/components/ReportModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSubjectStore } from '@/stores/subject'

const authStore = useAuthStore()
const subjectStore = useSubjectStore()

onMounted(async () => {
  // If user has token, load profile or default to 'suifeng'
  const token = localStorage.getItem('token')
  if (token) {
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser) {
      authStore.userInfo = JSON.parse(savedUser)
    } else {
      await authStore.loadUserInfo('suifeng')
    }
  } else {
    // Auto preset login for seamless demonstration
    await authStore.quickLogin('suifeng')
  }

  // Fetch categories from backend
  subjectStore.fetchCategories()

  // Listen for 401 auth-required events
  window.addEventListener('auth-required', (e) => {
    console.log('Auth required event triggered:', e.detail)
    authStore.openLoginModal()
  })
})
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page);
}
.main-body {
  flex: 1;
  padding: 24px 0 40px;
}
.main-body.admin-body {
  padding: 0;
}
.view-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 24px;
  min-height: calc(100vh - 180px);
}
</style>
