<template>
  <button
    ref="toggleBtnRef"
    class="btn-icon-nav theme-toggle-btn"
    :class="{ 'is-dark': isDark }"
    :title="isDark ? '当前为深色模式，点击切换至白天模式' : '当前为白天模式，点击切换至深色模式'"
    :aria-label="isDark ? '切换至白天模式' : '切换至深色模式'"
    @click="handleClick"
  >
    <!-- 发散光环微动效 -->
    <span class="divergent-halo"></span>

    <!-- 太阳与月亮发散图形容器 -->
    <div class="theme-icon-container">
      <!-- 太阳模式图形 (含 8 束向外发散光芒) -->
      <svg
        class="theme-svg sun-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- 太阳发散中心核心 -->
        <circle cx="12" cy="12" r="4.5" class="sun-core" />
        <!-- 8 道向外发散的光芒射线 -->
        <g class="sun-rays">
          <line x1="12" y1="2" x2="12" y2="4.5" class="ray ray-1" />
          <line x1="19.07" y1="4.93" x2="17.3" y2="6.7" class="ray ray-2" />
          <line x1="22" y1="12" x2="19.5" y2="12" class="ray ray-3" />
          <line x1="19.07" y1="19.07" x2="17.3" y2="17.3" class="ray ray-4" />
          <line x1="12" y1="22" x2="12" y2="19.5" class="ray ray-5" />
          <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" class="ray ray-6" />
          <line x1="2" y1="12" x2="4.5" y2="12" class="ray ray-7" />
          <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" class="ray ray-8" />
        </g>
      </svg>

      <!-- 月亮模式图形 (含发散闪烁星芒) -->
      <svg
        class="theme-svg moon-svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- 月牙主体 -->
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          class="moon-crescent"
        />
        <!-- 发散闪烁星芒 1 -->
        <path
          d="M17.5 4.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"
          class="star star-1"
        />
        <!-- 发散闪烁星芒 2 -->
        <path
          d="M20 10.5l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z"
          class="star star-2"
        />
      </svg>
    </div>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { isDark, toggleTheme } from '@/utils/theme'

const toggleBtnRef = ref(null)

function handleClick(e) {
  // 零停顿瞬时触发发散，绝无锁死定时器
  toggleTheme(e, toggleBtnRef.value)
}
</script>

<style scoped>
.theme-toggle-btn {
  position: relative;
  overflow: visible;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  transition: border-color 0.15s linear, background-color 0.15s linear, box-shadow 0.15s linear, transform 0.1s linear;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-btn:hover {
  border-color: var(--primary-border);
  box-shadow: 0 0 10px rgba(250, 173, 20, 0.25);
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  /* 按下即刻物理反馈，松开立即平滑回弹，毫无卡顿停顿 */
  transform: scale(0.92);
}

.theme-toggle-btn.is-dark:hover {
  border-color: #60a5fa;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.35);
}

/* 按钮自身周围的发散光环微动效 */
.divergent-halo {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s linear, transform 0.15s linear;
  background: radial-gradient(circle, rgba(250, 173, 20, 0.25) 0%, rgba(250, 173, 20, 0) 70%);
}

.theme-toggle-btn:hover .divergent-halo {
  opacity: 1;
  transform: scale(1.15);
}

.theme-toggle-btn.is-dark .divergent-halo {
  background: radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, rgba(96, 165, 250, 0) 70%);
}

/* 图标容器 */
.theme-icon-container {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  /* 匀速 + 极速 0.2s 切换，与全屏发散高度同步 */
  transition: transform 0.2s linear,
              opacity 0.15s linear;
  transform-origin: center center;
}

/* ---------------- 太阳形态与发散光芒 ---------------- */
.sun-svg {
  color: #faad14;
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.sun-core {
  fill: #ffc53d;
  stroke: #d48806;
  stroke-width: 1.5;
  filter: drop-shadow(0 0 2px rgba(250, 173, 20, 0.6));
}

.sun-rays {
  stroke: #fa8c16;
  stroke-width: 2;
  transform-origin: 12px 12px;
  /* 匀速 0.2s */
  transition: transform 0.2s linear;
}

/* 悬停时太阳光芒微微旋转并向外舒展发散 */
.theme-toggle-btn:hover .sun-rays {
  transform: rotate(30deg) scale(1.08);
}

.theme-toggle-btn:hover .sun-core {
  filter: drop-shadow(0 0 5px rgba(250, 173, 20, 0.85));
}

/* ---------------- 月亮形态与发散星芒 ---------------- */
.moon-svg {
  color: #93c5fd;
  opacity: 0;
  transform: scale(0.3) rotate(-60deg);
  pointer-events: none;
}

.moon-crescent {
  fill: #3b82f6;
  fill-opacity: 0.18;
  stroke: #60a5fa;
  stroke-width: 1.8;
  filter: drop-shadow(0 0 3px rgba(96, 165, 250, 0.5));
}

.star {
  fill: #93c5fd;
  stroke: none;
  transform-origin: center;
  animation: starPulse 2.4s ease-in-out infinite;
}

.star-1 {
  animation-delay: 0s;
}

.star-2 {
  animation-delay: 1.2s;
}

@keyframes starPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
    filter: drop-shadow(0 0 3px #bfdbfe);
  }
}

/* ---------------- 切换到黑夜模式的激活状态 ---------------- */
.theme-toggle-btn.is-dark .sun-svg {
  opacity: 0;
  transform: scale(0.2) rotate(90deg);
  pointer-events: none;
}

.theme-toggle-btn.is-dark .sun-rays {
  /* 射向外侧发散消失 */
  transform: scale(1.4);
  opacity: 0;
}

.theme-toggle-btn.is-dark .moon-svg {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  pointer-events: auto;
}

/* 悬停时月亮微微摇曳 */
.theme-toggle-btn.is-dark:hover .moon-svg {
  transform: scale(1.08) rotate(12deg);
}

.theme-toggle-btn.is-dark:hover .moon-crescent {
  filter: drop-shadow(0 0 6px rgba(96, 165, 250, 0.8));
}
</style>
