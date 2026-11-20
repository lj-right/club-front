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
    <ImagePreviewModal />
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
import ImagePreviewModal from '@/components/ImagePreviewModal.vue'

import { useAuthStore } from '@/stores/auth'
import { useSubjectStore } from '@/stores/subject'
import { useImagePreviewStore } from '@/stores/imagePreview'

const authStore = useAuthStore()
const subjectStore = useSubjectStore()
const imagePreviewStore = useImagePreviewStore()

onMounted(async () => {
  // If user has token, probe backend status and load profile
  const token = localStorage.getItem('token')
  if (token) {
    await authStore.checkLoginStatus()
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

  // 全局图片点击预览委托：智能识别题目解析、Markdown 配图与动态图片
  document.addEventListener('click', (e) => {
    // 优先检查是否点击了 ans-img 遮罩或直接点击了图片
    const wrap = e.target.closest('.ans-img-wrap')
    let targetImg = null
    if (wrap) {
      targetImg = wrap.querySelector('img.ans-img')
    } else {
      targetImg = e.target.closest('img')
    }

    if (!targetImg) return

    // 排除特定非大图元素（头像、微标、技术 SVG 图标等）
    if (
      targetImg.classList.contains('tech-svg-icon') ||
      targetImg.classList.contains('m-avatar') ||
      targetImg.classList.contains('avatar') ||
      targetImg.classList.contains('comment-avatar') ||
      targetImg.classList.contains('sub-reply-avatar') ||
      targetImg.classList.contains('logo-img') ||
      targetImg.classList.contains('user-avatar')
    ) {
      return
    }

    // 判定是否属于内容大图
    const isAnsImg = targetImg.classList.contains('ans-img')
    const isPreviewable = targetImg.hasAttribute('data-previewable')
    const isMomentImg = targetImg.classList.contains('m-img')
    const isInRichText = targetImg.closest('.summary-text') ||
      targetImg.closest('.parse-body') ||
      targetImg.closest('.q-answer-preview') ||
      targetImg.closest('.m-images-grid')

    if (isAnsImg || isPreviewable || isMomentImg || isInRichText) {
      e.preventDefault()
      e.stopPropagation()

      // 提取同一内容块中的图片组（支持多图相册联动）
      const container = targetImg.closest('.m-images-grid') ||
        targetImg.closest('.summary-text') ||
        targetImg.closest('.parse-body') ||
        targetImg.closest('.q-answer-preview')

      let list = []
      let idx = 0
      if (container) {
        const imgs = Array.from(container.querySelectorAll('img.ans-img, img.m-img, img[data-previewable]'))
        if (imgs.length > 1) {
          list = imgs.map(img => img.currentSrc || img.src)
          idx = imgs.indexOf(targetImg)
          if (idx < 0) idx = 0
        }
      }

      if (!list.length) {
        list = [targetImg.currentSrc || targetImg.src]
        idx = 0
      }

      imagePreviewStore.open({
        images: list,
        initialIndex: idx,
        title: targetImg.alt || ''
      })
    }
  }, true)
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
  padding: 19px 0 40px;
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
