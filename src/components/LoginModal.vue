<template>
  <div v-if="authStore.loginModalOpen" class="modal-overlay active" @click.self="authStore.closeLoginModal">
    <div class="modal-box" style="width: 380px; text-align: center;">
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
        微信扫码登录 / 注册
      </h3>
      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 18px;">
        关注公众号【随风技术圈】回复“验证码”获取 6 位数字
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

      <!-- 快捷联调账号 -->
      <div class="quick-test-box">
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 600;">
          ⚡ 一键快捷切换测试账号:
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
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const validCode = ref('123456')
const loading = ref(false)
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
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}
.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}
.qr-mock-box {
  width: 130px;
  height: 130px;
  border: 1px solid var(--border-color);
  background: #fafafa;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
  background-size: 8px 8px;
  position: relative;
}
.qr-center-logo {
  background: #ffffff;
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
