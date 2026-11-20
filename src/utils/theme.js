import { ref } from 'vue'

const THEME_KEY = 'sf_theme'

export const isDark = ref(false)

/**
 * 应用主题至 html 根元素与持久化
 */
export function applyTheme(dark) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
  }
}

/**
 * 初始化主题：优先读取 localStorage，其次跟随系统配色偏好
 */
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) {
    applyTheme(saved === 'dark')
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark)
  }
}

/**
 * 带有全屏太阳/月亮圆形向外发散效果的主题切换（完全匀速 + 极速发散无停顿）
 * @param {MouseEvent|null} event 点击事件
 * @param {HTMLElement|null} targetEl 触发按钮元素
 */
export function toggleTheme(event = null, targetEl = null) {
  // 确定发散的中心原点坐标 (x, y)
  let x = window.innerWidth / 2
  let y = window.innerHeight / 2

  if (event && event.clientX && event.clientY) {
    x = event.clientX
    y = event.clientY
  } else if (targetEl) {
    const rect = targetEl.getBoundingClientRect()
    x = rect.left + rect.width / 2
    y = rect.top + rect.height / 2
  }

  const willBeDark = !isDark.value

  // 计算扩散至全屏最远角落所需的最大半径
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 1. 优先使用现代浏览器的 View Transitions API 实现像素级圆形极速发散
  const isViewTransitionSupported =
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (isViewTransitionSupported) {
    try {
      // 同步应用主题，严禁多余的 async/nextTick 延迟停顿，让浏览器在当前帧立即捕获
      const transition = document.startViewTransition(() => {
        applyTheme(willBeDark)
      })

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]

        // 完全匀速 (linear) + 极速 (200ms)，彻底消除尾部减速与任何停顿感
        document.documentElement.animate(
          {
            clipPath: clipPath
          },
          {
            duration: 200,
            easing: 'linear',
            pseudoElement: '::view-transition-new(root)'
          }
        )
      })
      return
    } catch (e) {
      console.warn('View Transition animation fallback:', e)
    }
  }

  // 2. 降级模式：极速切换，无多余定时器停顿
  applyTheme(willBeDark)
}
