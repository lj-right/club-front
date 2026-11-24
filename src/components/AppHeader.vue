<template>
  <header class="header">
    <div class="header-inner">
      <!-- 品牌标识 -->
      <div class="brand-section" @click="$router.push('/home')">
        <img src="/logo.png" alt="烤面筋" class="brand-logo logo-img" title="烤面筋" />
        <div class="brand-title">
          烤面筋
        </div>
      </div>

      <!-- 核心功能导航 -->
      <ul class="nav-links">
        <li
          class="nav-item"
          :class="{ active: $route.path === '/home' }"
          @click="$router.push('/home')"
        >
          首页
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.path === '/subject' }"
          @click="$router.push('/subject')"
        >
          题库
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.path === '/practice' }"
          @click="$router.push('/practice')"
        >
          练习
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.path === '/interview' }"
          @click="$router.push('/interview')"
        >
          AI 面试
        </li>
        <li
          class="nav-item"
          :class="{ active: $route.path.startsWith('/circle') }"
          @click="$router.push('/circle')"
        >
          论坛
        </li>
      </ul>

      <!-- 全局搜索框 -->
      <div class="header-search">
        <div class="search-input-wrapper" @click="subjectStore.openSearchModal">
          <span class="search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            class="search-input"
            placeholder="搜题目、知识点、大厂考点..."
            readonly
          />
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <!-- 右侧操作与个人中心 -->
      <div class="header-actions">
        <!-- 白天/黑夜主题切换 (太阳/月亮发散效果) -->
        <ThemeToggle />

        <!-- 消息通知按钮与浮层 -->
        <div class="notification-trigger-wrap" ref="notificationTriggerRef">
          <button
            class="btn-icon-nav"
            :class="{ active: notificationOpen }"
            title="消息通知"
            @click.stop="toggleNotification"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span v-if="circleStore.hasUnread || circleStore.unreadCount > 0" class="notice-dot"></span>
          </button>

          <!-- 消息通知下拉面板 -->
          <NotificationPopover
            v-if="notificationOpen"
            @close="notificationOpen = false"
          />
        </div>

        <!-- 用户名片与下拉菜单 -->
        <div class="user-menu-container">
          <div
            v-if="authStore.isLoggedIn"
            class="user-profile"
            @click="dropdownOpen = !dropdownOpen"
            title="个人中心"
          >
            <img v-if="authStore.avatar" :src="authStore.avatar" class="avatar-img" @error="handleAvatarError" />
            <div v-else class="avatar">{{ userInitial }}</div>
            <span class="user-name">{{ authStore.nickname }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div
            v-else
            class="user-profile login-trigger"
            @click="authStore.openLoginModal"
          >
            <img :src="authStore.avatar" class="avatar-img" @error="handleAvatarError" />
            <span class="user-name">登录 / 注册</span>
          </div>

          <!-- 用户下拉浮层 -->
          <div v-if="dropdownOpen && authStore.isLoggedIn" class="user-dropdown-menu" @click.outside="dropdownOpen = false">
            <div class="dropdown-item" @click="goToProfile">
              <span>个人主页</span>
            </div>
            <div class="dropdown-item" @click="goToAdmin">
              <span>后台管理系统</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item danger" @click="handleLogout">
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubjectStore } from '@/stores/subject'
import { useCircleStore } from '@/stores/circle'
import NotificationPopover from '@/components/NotificationPopover.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import defaultAvatarImg from '@/assets/default_avatar.jpg'

const router = useRouter()
const authStore = useAuthStore()
const subjectStore = useSubjectStore()
const circleStore = useCircleStore()

const dropdownOpen = ref(false)
const notificationOpen = ref(false)
const notificationTriggerRef = ref(null)

function handleAvatarError(e) {
  if (e?.target) {
    e.target.onerror = null
    e.target.src = defaultAvatarImg
  }
}

const userInitial = computed(() => {
  const name = authStore.nickname || '随'
  return name.charAt(0)
})

function toggleNotification() {
  notificationOpen.value = !notificationOpen.value
  if (notificationOpen.value) {
    dropdownOpen.value = false
    circleStore.fetchUnreadMessages()
  }
}

function handleGlobalClick(e) {
  if (notificationTriggerRef.value && !notificationTriggerRef.value.contains(e.target)) {
    notificationOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
  circleStore.checkUnread()
})

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick)
})

function goToProfile() {
  dropdownOpen.value = false
  router.push('/profile')
}

function goToAdmin() {
  dropdownOpen.value = false
  router.push('/base')
}

function handleLogout() {
  dropdownOpen.value = false
  authStore.logout()
  circleStore.hasUnread = false
  circleStore.unreadMessages = []
  circleStore.readMessages = []
}
</script>

<style scoped>
.notification-trigger-wrap {
  position: relative;
}
.btn-icon-nav.active {
  color: var(--primary);
  border-color: var(--primary-border);
  background: #eff6ff;
}
.user-menu-container {
  position: relative;
}
.login-trigger:hover {
  background: var(--primary-light);
  border-color: var(--primary-border);
}
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 160px;
  padding: 6px 0;
  z-index: 200;
  animation: fadeIn 0.15s ease;
}
.dropdown-item {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-regular);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
}
.dropdown-item:hover {
  background: var(--bg-hover);
  color: var(--primary);
}
.dropdown-item.danger:hover {
  background: var(--danger-light);
  color: var(--danger);
}
.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}
.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
  display: block;
}
</style>
