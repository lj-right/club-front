import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImagePreviewStore = defineStore('imagePreview', () => {
  const visible = ref(false)
  const images = ref([])
  const currentIndex = ref(0)
  const title = ref('')

  // 变换状态：缩放、旋转、位移
  const scale = ref(1.0)
  const rotate = ref(0)
  const translateX = ref(0)
  const translateY = ref(0)

  // 当前图片 URL
  const currentImage = computed(() => {
    if (!images.value.length) return ''
    return images.value[currentIndex.value] || ''
  })

  // 是否有多张图片
  const hasMultiple = computed(() => images.value.length > 1)

  // 是否有上一张/下一张
  const hasPrev = computed(() => images.value.length > 1 && currentIndex.value > 0)
  const hasNext = computed(() => images.value.length > 1 && currentIndex.value < images.value.length - 1)

  /**
   * 打开预览
   * @param {Object} options
   * @param {string|string[]} options.images 图片URL或图片URL数组
   * @param {number} [options.initialIndex=0] 初始索引
   * @param {string} [options.title=''] 图片标题/描述
   */
  function open(options = {}) {
    let list = []
    if (typeof options === 'string') {
      list = [options]
    } else if (Array.isArray(options)) {
      list = options
    } else if (options.images) {
      list = Array.isArray(options.images) ? options.images : [options.images]
    } else if (options.url) {
      list = [options.url]
    }

    // 过滤空地址
    list = list.filter(Boolean)
    if (!list.length) return

    images.value = list
    currentIndex.value = Math.max(0, Math.min(options.initialIndex || 0, list.length - 1))
    title.value = options.title || ''

    // 重置变换状态
    resetTransform()

    visible.value = true
    // 阻止页面底层滚动
    document.body.style.overflow = 'hidden'
  }

  /**
   * 关闭预览
   */
  function close() {
    visible.value = false
    document.body.style.overflow = ''
    resetTransform()
  }

  /**
   * 重置变换参数
   */
  function resetTransform() {
    scale.value = 1.0
    rotate.value = 0
    translateX.value = 0
    translateY.value = 0
  }

  /**
   * 上一张图片
   */
  function prev() {
    if (!hasMultiple.value) return
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else {
      // 循环到最后一张
      currentIndex.value = images.value.length - 1
    }
    resetTransform()
  }

  /**
   * 下一张图片
   */
  function next() {
    if (!hasMultiple.value) return
    if (currentIndex.value < images.value.length - 1) {
      currentIndex.value++
    } else {
      // 循环到第一张
      currentIndex.value = 0
    }
    resetTransform()
  }

  /**
   * 放大图片
   * @param {number} [step=0.25] 
   */
  function zoomIn(step = 0.25) {
    scale.value = Math.min(5.0, Number((scale.value + step).toFixed(2)))
  }

  /**
   * 缩小图片
   * @param {number} [step=0.25] 
   */
  function zoomOut(step = 0.25) {
    scale.value = Math.max(0.2, Number((scale.value - step).toFixed(2)))
    if (scale.value <= 1.0) {
      // 缩小到正常尺寸时，自动重置偏移
      translateX.value = 0
      translateY.value = 0
    }
  }

  /**
   * 设置具体缩放倍数
   */
  function setScale(val) {
    scale.value = Math.max(0.2, Math.min(5.0, Number(val.toFixed(2))))
    if (scale.value <= 1.0) {
      translateX.value = 0
      translateY.value = 0
    }
  }

  /**
   * 顺时针旋转90度
   */
  function rotateRight() {
    rotate.value = (rotate.value + 90) % 360
  }

  /**
   * 逆时针旋转90度
   */
  function rotateLeft() {
    rotate.value = (rotate.value - 90 + 360) % 360
  }

  /**
   * 移动平移位置
   */
  function setTranslate(x, y) {
    translateX.value = x
    translateY.value = y
  }

  return {
    visible,
    images,
    currentIndex,
    currentImage,
    title,
    scale,
    rotate,
    translateX,
    translateY,
    hasMultiple,
    hasPrev,
    hasNext,
    open,
    close,
    prev,
    next,
    zoomIn,
    zoomOut,
    setScale,
    resetTransform,
    rotateRight,
    rotateLeft,
    setTranslate
  }
})
