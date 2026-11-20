<template>
  <div class="oauth-callback-container">
    <div class="callback-card">
      <div v-if="loading" class="state-loading">
        <div class="spinner"></div>
        <h3>正在完成第三方账号授权...</h3>
        <p>正在与 {{ platformName }} 服务器安全核验身份，请稍候</p>
      </div>

      <div v-else-if="success" class="state-success">
        <div class="icon-circle success">✓</div>
        <h3>授权成功，正在进入随风 Club！</h3>
        <p>欢迎你，{{ authStore.nickname }}</p>
      </div>

      <div v-else class="state-error">
        <div class="icon-circle error">✕</div>
        <h3>第三方授权登录失败</h3>
        <p class="error-detail">{{ errorMsg }}</p>
        <div class="action-bar">
          <button class="btn btn-primary" @click="handleGoHome">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const success = ref(false)
const errorMsg = ref('')

const platform = computed(() => {
  const p = route.params.platform || route.query.platform || 'github'
  return String(p).toUpperCase()
})

const platformName = computed(() => {
  switch (platform.value) {
    case 'FEISHU':
      return '飞书'
    case 'GITHUB':
      return 'GitHub'
    case 'ZHIHU':
      return '知乎'
    default:
      return platform.value
  }
})

async function processOAuthCallback() {
  const code = route.query.code || route.query.authorization_code
  const state = route.query.state || ''

  if (!code) {
    loading.value = false
    errorMsg.value = '授权回调中未检测到有效 Code 参数，可能已被取消授权。'
    return
  }

  try {
    const res = await authStore.oauthLogin(platform.value, code, state)
    if (res && res.success) {
      success.value = true
      loading.value = false

      // 若为弹窗模式打开，通知主窗口并关闭
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', platform: platform.value }, '*')
          setTimeout(() => {
            window.close()
          }, 800)
          return
        } catch (e) {
          console.warn('postMessage to opener failed:', e)
        }
      }

      // 正常整页跳转模式
      setTimeout(() => {
        router.push('/')
      }, 1200)
    } else {
      loading.value = false
      errorMsg.value = res?.message || '授权登录校验失败'
    }
  } catch (err) {
    loading.value = false
    errorMsg.value = err.message || '网络连接超时或服务器异常'
  }
}

function handleGoHome() {
  router.push('/')
}

onMounted(() => {
  processOAuthCallback()
})
</script>

<style scoped>
.oauth-callback-container {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
}

.callback-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-light, #e2e8f0);
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3.5px solid #e2e8f0;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 18px;
}

.icon-circle.success {
  background: #ecfdf5;
  color: #10b981;
}

.icon-circle.error {
  background: #fef2f2;
  color: #ef4444;
}

h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  margin-bottom: 10px;
}

p {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  line-height: 1.5;
  margin-bottom: 20px;
}

.error-detail {
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #ef4444;
  word-break: break-all;
}

.action-bar {
  margin-top: 24px;
}

.btn {
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #1677ff;
  color: #ffffff;
}

.btn-primary:hover {
  background: #0958d9;
}
</style>
