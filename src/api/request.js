import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 180000 // 默认全局超时放宽至 180 秒 (3分钟)，确保大模型推理、简历解析与 CLI 考官充分作答
})

// Request Interceptor: Attach Sa-Token
request.interceptors.request.use(
  (config) => {
    // 强制全局任何请求超时都不低于 180 秒，彻底杜绝 15000ms 超时中断
    config.timeout = Math.max(config.timeout || 0, 180000)

    // Priority: Explicit header > adminToken (if on admin route /base) > token > adminToken fallback
    if (!config.headers['satoken']) {
      const adminToken = localStorage.getItem('adminToken')
      const userToken = localStorage.getItem('token')
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/base')
      
      const token = (isAdminRoute && adminToken) ? adminToken : (userToken || adminToken)
      if (token) {
        config.headers['satoken'] = token
      }
    }

    // Attach loginId header for downstream microservices
    if (!config.headers['loginId']) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const loginId = userInfo.userName || userInfo.loginId || 'suifeng'
        if (loginId) {
          config.headers['loginId'] = loginId
        }
      } catch (_) {
        config.headers['loginId'] = 'suifeng'
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Parse Result<T> structure
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // If backend returns binary or raw string
    if (typeof res !== 'object' || res === null) {
      return res
    }

    // Sa-Token auth check failure from gateway
    if (res.code === 401) {
      console.warn('Sa-Token authentication required or expired:', res.message)
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth-required', { detail: res.message }))
    }

    return res
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth-required', { detail: '登录凭证已过期' }))
    }
    return Promise.reject(error)
  }
)

export default request
