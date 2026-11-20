<template>
  <div v-if="authStore.loginModalOpen" class="modal-overlay active" @click.self="authStore.closeLoginModal">
    <div class="modal-box" style="width: 390px; text-align: center;">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
        <button class="btn btn-secondary" @click="authStore.closeLoginModal" style="padding: 2px 8px; border: none; font-size: 16px;">
          ✕
        </button>
      </div>

      <div class="duck-logo" style="margin: 0 auto 12px; width: 44px; height: 44px; border-radius: 10px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C7.58 2 4 5.58 4 10C4 12.38 5.05 14.51 6.71 15.97C6.26 16.59 5.67 17.07 5 17.4C6.54 17.9 8.23 18.15 10 18.06V20C10 20.55 10.45 21 11 21H13C13.55 21 14 20.55 14 20V18C15.8 17.86 17.49 17.44 19 16.7C18.33 16.37 17.74 15.89 17.29 15.27C18.95 13.81 20 11.68 20 10C20 5.58 16.42 2 12 2Z" fill="#ffffff"></path>
          <circle cx="9" cy="9" r="1.5" fill="#1e293b"></circle>
          <path d="M11 12C12.5 12 15 13 14 15C13 16 10 15 9.5 13.5" stroke="#ff7a45" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      </div>

      <h3 style="font-size: 17px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
        欢迎登录随风 Club
      </h3>
      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
        关注公众号回复“验证码”，或选择快捷第三方账号登录
      </p>

      <!-- 微信登录二维码容器 -->
      <div class="qr-container">
        <div class="qr-mock-box">
          <div class="qr-center-logo">随风</div>
        </div>
      </div>

      <!-- 验证码输入框 -->
      <div style="margin-bottom: 14px; text-align: left;">
        <div style="display: flex; gap: 8px;">
          <input
            v-model="validCode"
            type="text"
            maxlength="6"
            class="code-input"
            placeholder="输入 6 位验证码"
            @keyup.enter="handleLogin"
          />
          <button class="btn btn-primary" :disabled="loading" @click="handleLogin" style="flex-shrink: 0; padding: 0 16px;">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>

      <!-- 第三方快速登录 -->
      <div class="oauth-section">
        <div class="oauth-divider">
          <span>第三方账号快捷登录</span>
        </div>
        <div class="oauth-buttons">
          <!-- 飞书登录 -->
          <button
            class="oauth-card-btn"
            title="飞书快捷登录"
            @click="handleOAuthLogin('FEISHU')"
            :disabled="oauthLoading"
          >
            <div class="oauth-icon-box feishu-bg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19.3 6.2c-.8-1.5-2.2-2.7-3.8-3.3-2.1-.8-4.4-.6-6.3.5L4.5 6.1c-.8.5-1.4 1.3-1.6 2.2-.2.9 0 1.9.6 2.6l3.6 4.3c.7.8 1.8 1.3 2.9 1.2 1.1-.1 2-.7 2.6-1.5l6.7-8.7z" fill="#0070FF"/>
                <path d="M20.2 11.2c-.4-1.2-1.3-2.2-2.5-2.7l-8.6 11.2c.7.5 1.5.8 2.4.7 1.1-.1 2-.7 2.6-1.5l6.1-7.7z" fill="#00D6B9"/>
                <path d="M10.8 19.4c-.9.1-1.8-.2-2.5-.8L4.7 14.3c-.6-.7-.8-1.7-.6-2.6.2-.9.8-1.7 1.6-2.2l4.7-2.7-2.6 10.6z" fill="#3370FF"/>
              </svg>
            </div>
            <span class="oauth-btn-label">飞书</span>
          </button>

          <!-- GitHub 登录 -->
          <button
            class="oauth-card-btn"
            title="GitHub快捷登录"
            @click="handleOAuthLogin('GITHUB')"
            :disabled="oauthLoading"
          >
            <div class="oauth-icon-box github-bg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <span class="oauth-btn-label">GitHub</span>
          </button>

          <!-- 知乎登录 -->
          <button
            class="oauth-card-btn"
            title="知乎快捷登录"
            @click="handleOAuthLogin('ZHIHU')"
            :disabled="oauthLoading"
          >
            <div class="oauth-icon-box zhihu-bg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M5.72 4.09c.47 1.35.95 2.88 1.38 4.29H2.5v2.12h3.92c-.38 2.5-1.12 5.06-2.58 6.94-.4.52-.77.92-1.2 1.32-.42.4-.92.74-1.44 1.05l1.6 1.74c.64-.38 1.26-.81 1.8-1.33.6-.57 1.13-1.18 1.65-1.89 1.4-1.92 2.39-4.32 2.94-7.83h4.08V8.38H9.3c-.41-1.39-.85-2.9-1.3-4.29H5.72zm10.74 3.09c-2.45 0-4.39 1.82-4.39 4.34 0 2.52 1.94 4.34 4.39 4.34h1.01v4.73l4.35-4.73h1.3c2.45 0 4.39-1.82 4.39-4.34 0-2.52-1.94-4.34-4.39-4.34h-6.67zm0 2.12h6.67c1.3 0 2.27.94 2.27 2.22s-.97 2.22-2.27 2.22h-1.93l-2.07 2.25v-2.25h-2.67c-1.3 0-2.27-.94-2.27-2.22s.97-2.22 2.27-2.22z"/>
              </svg>
            </div>
            <span class="oauth-btn-label">知乎</span>
          </button>
        </div>
      </div>

      <!-- 快捷联调账号 -->
      <div class="quick-test-box">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">
          ⚡ 一键快捷切换内置测试账号:
        </div>
        <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" @click="quickDirectLogin('suifeng')">
            随风 (核心作者)
          </button>
          <button class="btn btn-secondary btn-sm" @click="quickDirectLogin('test_user')">
            测试小伙伴
          </button>
          <button class="btn btn-secondary btn-sm" @click="quickDirectLogin('admin')">
            管理员
          </button>
        </div>
      </div>

      <div v-if="errorMsg" class="error-tip">
        {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getOAuthRenderUrl } from '@/api/auth'

const authStore = useAuthStore()
const validCode = ref('123456')
const loading = ref(false)
const oauthLoading = ref(false)
const errorMsg = ref('')

async function quickDirectLogin(username) {
  loading.value = true
  try {
    await authStore.quickLogin(username)
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (!validCode.value.trim()) {
    errorMsg.value = '请输入验证码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await authStore.login(validCode.value.trim())
    if (!res.success) {
      errorMsg.value = res.message
    }
  } finally {
    loading.value = false
  }
}

async function handleOAuthLogin(platform) {
  oauthLoading.value = true
  errorMsg.value = ''
  try {
    const res = await getOAuthRenderUrl(platform)
    if (res && res.success && res.data && res.data.authorizeUrl) {
      const url = res.data.authorizeUrl
      // 现代弹窗模式 (Popup Window)
      const width = 640
      const height = 720
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      const popup = window.open(
        url,
        `oauth_${platform}`,
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      )

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // 若弹窗被浏览器安全策略拦截，平滑降级为整页跳转
        window.location.href = url
      }
    } else {
      errorMsg.value = res?.message || '获取授权跳转链接失败'
    }
  } catch (err) {
    errorMsg.value = err.message || '网络连接失败'
  } finally {
    oauthLoading.value = false
  }
}

function handleOAuthMessage(event) {
  if (event.data && event.data.type === 'OAUTH_SUCCESS') {
    authStore.closeLoginModal()
  }
}

onMounted(() => {
  window.addEventListener('message', handleOAuthMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleOAuthMessage)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}
.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.qr-mock-box {
  width: 120px;
  height: 120px;
  border: 1px solid var(--border-color);
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 8px 8px;
  position: relative;
}
.qr-center-logo {
  background: var(--bg-card);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
}
.code-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  letter-spacing: 1px;
  font-family: var(--font-mono);
  outline: none;
}
.code-input:focus {
  border-color: var(--primary);
}

/* OAuth 第三方快捷登录卡片 */
.oauth-section {
  margin-top: 16px;
  margin-bottom: 14px;
}
.oauth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 12px;
}
.oauth-divider::before,
.oauth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}
.oauth-divider span {
  padding: 0 10px;
  font-size: 11px;
  color: var(--text-muted, #94a3b8);
  font-weight: 500;
}
.oauth-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.oauth-card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  background: #f8fafc;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.oauth-card-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
.oauth-card-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.oauth-icon-box {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feishu-bg {
  background: #f0f7ff;
}
.github-bg {
  background: #24292f;
}
.zhihu-bg {
  background: #0084ff;
}
.oauth-btn-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main, #334155);
}

.quick-test-box {
  background: var(--bg-subtle);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px;
}
.btn-sm {
  font-size: 11px;
  padding: 3px 8px;
}
.error-tip {
  margin-top: 10px;
  font-size: 12px;
  color: var(--danger);
  background: var(--danger-light);
  padding: 6px;
  border-radius: 4px;
}
</style>
