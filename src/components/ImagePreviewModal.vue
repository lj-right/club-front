<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div
        v-if="store.visible"
        class="img-preview-overlay"
        @click="handleOverlayClick"
        @wheel.prevent="handleWheel"
      >
        <!-- 顶部悬浮控制栏 -->
        <div class="img-preview-toolbar" @click.stop>
          <!-- 图片张数指示器（仅多图时显示） -->
          <div v-if="store.hasMultiple" class="toolbar-pill page-indicator">
            {{ store.currentIndex + 1 }} / {{ store.images.length }}
          </div>

          <!-- 缩放控制组 -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn"
              title="缩小 (快捷键: 向下滚轮 / -)"
              :disabled="store.scale <= 0.2"
              @click="store.zoomOut()"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <span class="scale-text" title="当前缩放比">
              {{ Math.round(store.scale * 100) }}%
            </span>

            <button
              class="toolbar-btn"
              title="放大 (快捷键: 向上滚轮 / +)"
              :disabled="store.scale >= 5.0"
              @click="store.zoomIn()"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <button
              class="toolbar-btn"
              title="恢复原始尺寸 (快捷键: 双击图片)"
              @click="store.resetTransform()"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- 旋转与新窗口操作组 -->
          <div class="toolbar-group">
            <button
              class="toolbar-btn"
              title="顺时针旋转90°"
              @click="store.rotateRight()"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </button>

            <a
              :href="store.currentImage"
              target="_blank"
              rel="noopener noreferrer"
              class="toolbar-btn"
              title="在新标签页中打开原图"
              @click.stop
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>

          <div class="toolbar-divider"></div>

          <!-- 关闭按钮 -->
          <button
            class="toolbar-btn close-btn"
            title="关闭预览 (快捷键: Esc)"
            @click="store.close()"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 左右切换箭头（仅多图时展示） -->
        <button
          v-if="store.hasMultiple"
          class="nav-arrow nav-arrow-left"
          title="上一张 (快捷键: 左方向键 ←)"
          @click.stop="store.prev()"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          v-if="store.hasMultiple"
          class="nav-arrow nav-arrow-right"
          title="下一张 (快捷键: 右方向键 →)"
          @click.stop="store.next()"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- 图片展示主舞台 -->
        <div
          class="img-stage"
          :class="{ 'is-dragging': isDragging, 'can-drag': store.scale > 1.0 }"
          @mousedown="handleMouseDown"
        >
          <!-- 加载中指示器 -->
          <div v-if="loading" class="img-loading-spinner">
            <div class="spinner-circle"></div>
            <span>高清图片加载中...</span>
          </div>

          <!-- 加载失败提示 -->
          <div v-else-if="loadError" class="img-load-error" @click.stop>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>图片加载失败</p>
            <span class="error-tip">原图地址可能已失效或网络连接异常</span>
            <a :href="store.currentImage" target="_blank" class="error-link">尝试直接访问原链接</a>
          </div>

          <!-- 图片本体 -->
          <img
            v-show="!loadError"
            ref="imgRef"
            :src="store.currentImage"
            :alt="store.title || '大图预览'"
            class="preview-main-img"
            :style="imgTransformStyle"
            @load="handleImageLoaded"
            @error="handleImageError"
            @dblclick.stop="handleDoubleClick"
            @dragstart.prevent
            @click.stop
          />
        </div>

        <!-- 底部说明与快捷键提示 -->
        <div class="img-preview-bottom-bar" @click.stop>
          <div v-if="store.title" class="img-title-caption">
            {{ store.title }}
          </div>
          <div class="img-shortcuts-hint">
            <span>滚轮缩放</span>
            <span class="dot">•</span>
            <span>双击还原</span>
            <span class="dot">•</span>
            <span>拖拽平移</span>
            <span class="dot">•</span>
            <span>Esc 退出</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useImagePreviewStore } from '@/stores/imagePreview'

const store = useImagePreviewStore()

const loading = ref(true)
const loadError = ref(false)
const imgRef = ref(null)

// 拖拽状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const initialTranslate = ref({ x: 0, y: 0 })

// 样式变换
const imgTransformStyle = computed(() => {
  return {
    transform: `translate(${store.translateX}px, ${store.translateY}px) scale(${store.scale}) rotate(${store.rotate}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
  }
})

// 当切换当前图片时重新触发 loading
watch(() => store.currentImage, (newVal) => {
  if (newVal) {
    loading.value = true
    loadError.value = false
  }
})

function handleImageLoaded() {
  loading.value = false
  loadError.value = false
}

function handleImageError() {
  loading.value = false
  loadError.value = true
}

// 遮罩点击关闭（只有点击舞台空白处才触发）
function handleOverlayClick(e) {
  if (e.target.classList.contains('img-preview-overlay') || e.target.classList.contains('img-stage')) {
    store.close()
  }
}

// 鼠标滚轮缩放
function handleWheel(e) {
  if (loadError.value) return
  // 向上滚放大，向下滚缩小
  if (e.deltaY < 0) {
    store.zoomIn(0.2)
  } else {
    store.zoomOut(0.2)
  }
}

// 双击快速在 1.0 与 1.75 倍之间切换
function handleDoubleClick() {
  if (loadError.value) return
  if (store.scale !== 1.0) {
    store.resetTransform()
  } else {
    store.setScale(1.75)
  }
}

// 鼠标拖拽平移（当放大状态时生效）
function handleMouseDown(e) {
  // 只响应左键且不是在加载错误状态
  if (e.button !== 0 || loadError.value) return
  // 仅在 scale > 1 时允许拖拽
  if (store.scale <= 1.0) return

  isDragging.value = true
  dragStart.value = { x: e.clientX, y: e.clientY }
  initialTranslate.value = { x: store.translateX, y: store.translateY }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e) {
  if (!isDragging.value) return
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  store.setTranslate(initialTranslate.value.x + dx, initialTranslate.value.y + dy)
}

function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
}

// 键盘事件监听
function handleKeyDown(e) {
  if (!store.visible) return

  switch (e.key) {
    case 'Escape':
      store.close()
      break
    case 'ArrowLeft':
      store.prev()
      break
    case 'ArrowRight':
      store.next()
      break
    case 'ArrowUp':
    case '+':
    case '=':
      store.zoomIn()
      break
    case 'ArrowDown':
    case '-':
    case '_':
      store.zoomOut()
      break
    case '0':
      store.resetTransform()
      break
    case 'r':
    case 'R':
      store.rotateRight()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.img-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  overflow: hidden;
}

/* 顶部悬浮工具栏 */
.img-preview-toolbar {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  padding: 6px 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transition: all 0.2s ease;
}

.img-preview-toolbar:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.25);
}

.toolbar-pill {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.18);
  margin: 0 4px;
}

.toolbar-btn {
  background: transparent;
  border: none;
  color: #cbd5e1;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
  transform: scale(1.05);
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.toolbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.close-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.scale-text {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  min-width: 44px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* 左右切换导航 */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.nav-arrow:hover {
  background: rgba(22, 119, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.08);
}

.nav-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.nav-arrow-left {
  left: 28px;
}

.nav-arrow-right {
  right: 28px;
}

/* 图片展示舞台 */
.img-stage {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

.img-stage.can-drag {
  cursor: grab;
}

.img-stage.is-dragging {
  cursor: grabbing;
}

.preview-main-img {
  max-width: 88vw;
  max-height: 82vh;
  object-fit: contain;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  transform-origin: center center;
  will-change: transform;
}

/* 加载指示器 */
.img-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #94a3b8;
  font-size: 13px;
}

.spinner-circle {
  width: 38px;
  height: 38px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.img-load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  text-align: center;
  background: rgba(30, 41, 59, 0.6);
  padding: 32px 48px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.img-load-error svg {
  color: #f59e0b;
}

.img-load-error p {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
}

.error-tip {
  font-size: 12px;
  color: #64748b;
}

.error-link {
  margin-top: 6px;
  font-size: 12px;
  color: #1677ff;
  text-decoration: underline;
}

/* 底部状态栏与快捷键说明 */
.img-preview-bottom-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 10;
}

.img-title-caption {
  font-size: 13.5px;
  font-weight: 500;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  padding: 4px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 80vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.img-shortcuts-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.5);
  padding: 2px 12px;
  border-radius: 9999px;
}

.img-shortcuts-hint .dot {
  opacity: 0.5;
}

/* 过渡动画 */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.22s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* 移动端与小屏适配 */
@media (max-width: 640px) {
  .img-preview-toolbar {
    top: 12px;
    padding: 4px 8px;
    gap: 4px;
    max-width: 94vw;
  }
  .scale-text {
    display: none;
  }
  .toolbar-btn {
    width: 30px;
    height: 30px;
  }
  .nav-arrow {
    width: 40px;
    height: 40px;
  }
  .nav-arrow-left {
    left: 12px;
  }
  .nav-arrow-right {
    right: 12px;
  }
  .preview-main-img {
    max-width: 95vw;
    max-height: 85vh;
  }
}
</style>
