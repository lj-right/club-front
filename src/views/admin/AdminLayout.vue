<template>
  <div class="admin-wrapper">
    <!-- 管理员鉴权拦截门禁 (未持有管理员Token时展示) -->
    <div v-if="!adminStore.isAuthenticated" class="auth-gate-overlay">
      <div class="auth-gate-card">
        <h2 class="gate-title">管理中台鉴权</h2>
        <p class="gate-desc">
          访问路径 <code>/base</code> 需要管理员 Sa-Token 凭据
        </p>

        <!-- 一键以超级管理员身份登入 -->
        <div class="gate-option-box primary">
          <div class="opt-title">超级管理员身份登录</div>
          <button class="btn btn-gate-primary" :disabled="adminStore.loading" @click="handleQuickLogin">
            {{ adminStore.loading ? '正在验证...' : '以超级管理员身份进入' }}
          </button>
        </div>

        <div class="divider-text">或输入现有 Token</div>

        <!-- 手工输入 Token -->
        <div class="gate-option-box manual">
          <div class="manual-input-row">
            <input
              v-model="customToken"
              type="text"
              class="admin-input flex-1"
              placeholder="输入管理员 Sa-Token"
            />
            <button class="btn btn-secondary" @click="handleCustomTokenLogin">
              验证进入
            </button>
          </div>
          <div v-if="adminStore.authErrorMessage" class="err-msg">
            {{ adminStore.authErrorMessage }}
          </div>
        </div>

        <div class="gate-footer">
          <button class="btn-link" @click="$router.push('/home')">
            返回前台主页
          </button>
        </div>
      </div>
    </div>

    <!-- 管理后台完整主框架 -->
    <div v-else class="admin-layout">
      <!-- 左侧管理导航侧边栏 (无图标纯净导航) -->
      <aside class="admin-sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <div class="sidebar-brand" @click="$router.push('/home')">
          <div v-if="!isSidebarCollapsed" class="brand-text">
            <span class="brand-main">随风 Club</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div
            v-for="item in navItems"
            :key="item.key"
            class="nav-menu-item"
            :class="{ active: currentTab === item.key }"
            @click="switchTab(item.key)"
          >
            <span v-if="!isSidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="btn-return-home" @click="$router.push('/home')">
            <span v-if="!isSidebarCollapsed">返回前台</span>
          </button>
        </div>
      </aside>

      <!-- 右侧主工作区 -->
      <div class="admin-main-container">
        <!-- 顶部管理员专属导航栏 (无冗余图标与文本) -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="btn-collapse" @click="isSidebarCollapsed = !isSidebarCollapsed">
              ☰
            </button>
            <div class="topbar-breadcrumbs">
              <span class="crumb-root">管理中台</span>
              <span class="crumb-sep">/</span>
              <span class="crumb-current">{{ currentTabLabel }}</span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- 管理员账号与退出操作 -->
            <div class="admin-user-badge">
              <span class="admin-name">{{ adminStore.adminUser.nickName }}</span>
              <button class="btn-logout" @click="handleLogout">
                退出
              </button>
            </div>
          </div>
        </header>

        <!-- 管理业务动态内容视图容器 -->
        <main class="admin-content">
          <AdminDashboard
            v-if="currentTab === 'dashboard'"
            @switch-tab="switchTab"
          />
          <AdminSubjects
            v-else-if="currentTab === 'subjects'"
          />
          <AdminCategories
            v-else-if="currentTab === 'categories'"
          />
          <AdminLabels
            v-else-if="currentTab === 'labels'"
          />
          <AdminUsers
            v-else-if="currentTab === 'users'"
          />
          <AdminRoles
            v-else-if="currentTab === 'roles'"
          />
          <AdminSensitive
            v-else-if="currentTab === 'sensitive'"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

import AdminDashboard from './AdminDashboard.vue'
import AdminSubjects from './AdminSubjects.vue'
import AdminCategories from './AdminCategories.vue'
import AdminLabels from './AdminLabels.vue'
import AdminUsers from './AdminUsers.vue'
import AdminRoles from './AdminRoles.vue'
import AdminSensitive from './AdminSensitive.vue'

const router = useRouter()
const adminStore = useAdminStore()

const isSidebarCollapsed = ref(false)
const currentTab = ref('dashboard')
const customToken = ref('')

const navItems = [
  { key: 'dashboard', label: '系统管理' },
  { key: 'subjects', label: '题目管理' },
  { key: 'categories', label: '分类管理' },
  { key: 'labels', label: '标签管理' },
  { key: 'users', label: '用户管理' },
  { key: 'roles', label: '角色管理' },
  { key: 'sensitive', label: '敏感词管理' }
]

const currentTabLabel = computed(() => {
  const item = navItems.find((n) => n.key === currentTab.value)
  return item ? item.label : '管理中台'
})

function switchTab(key) {
  currentTab.value = key
}

async function handleQuickLogin() {
  await adminStore.quickAdminLogin()
}

async function handleCustomTokenLogin() {
  if (!customToken.value.trim()) {
    adminStore.authErrorMessage = '请输入有效的 Sa-Token 字符串'
    return
  }
  await adminStore.loginWithToken(customToken.value)
}

async function handleLogout() {
  if (confirm('确定要退出管理控制台吗？')) {
    await adminStore.adminLogout()
    router.push('/home')
  }
}

onMounted(async () => {
  if (adminStore.isAuthenticated) {
    adminStore.initAdminData()
  } else {
    const cachedToken = localStorage.getItem('adminToken')
    if (cachedToken) {
      adminStore.adminToken = cachedToken
      adminStore.initAdminData()
    }
  }
})
</script>

<style scoped>
.admin-wrapper {
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1e293b;
}

/* 鉴权门禁 */
.auth-gate-overlay {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  padding: 24px;
}

.auth-gate-card {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 32px 28px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.gate-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.gate-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 20px;
}

.gate-desc code {
  font-family: monospace;
  background: #f1f5f9;
  color: #2563eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.gate-option-box {
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  margin-bottom: 14px;
}

.gate-option-box.primary {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.opt-title {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 10px;
}

.btn-gate-primary {
  width: 100%;
  padding: 9px 16px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-gate-primary:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #2563eb;
}

.divider-text {
  font-size: 12px;
  color: #94a3b8;
  margin: 14px 0;
}

.gate-option-box.manual {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.manual-input-row {
  display: flex;
  gap: 8px;
}

.err-msg {
  font-size: 12px;
  color: #ef4444;
  margin-top: 8px;
}

.gate-footer {
  margin-top: 20px;
}

.btn-link {
  background: transparent;
  border: none;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
}

.btn-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 主后台框架 */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.admin-sidebar {
  width: 220px;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-brand {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.brand-main {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.nav-menu-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.nav-menu-item.active {
  color: #60a5fa;
  background: rgba(37, 99, 235, 0.2);
  font-weight: 600;
  border-left: 3px solid #60a5fa;
}

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-return-home {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.btn-return-home:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

/* 主容器区 */
.admin-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 顶部导航栏 */
.admin-topbar {
  height: 56px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn-collapse {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.topbar-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.crumb-root {
  color: #64748b;
}

.crumb-sep {
  color: #cbd5e1;
}

.crumb-current {
  font-weight: 600;
  color: #0f172a;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.admin-user-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.btn-logout {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-logout:hover {
  background: #fecaca;
}

/* 主内容区 */
.admin-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.btn {
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.admin-input {
  font-size: 13px;
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

.flex-1 {
  flex: 1;
}
</style>
