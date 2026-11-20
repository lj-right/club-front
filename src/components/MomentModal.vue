<template>
  <div v-if="circleStore.momentModalOpen" class="modal-overlay active" @click.self="circleStore.closeMomentModal">
    <div class="modal-box" style="width: 540px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main);">发表技术圈子动态</h3>
        <button class="btn btn-secondary" @click="circleStore.closeMomentModal" style="padding: 2px 8px; border: none;">✕</button>
      </div>

      <!-- 选择发布频道 -->
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-regular); margin-bottom: 6px;">
          选择发布板块:
        </label>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button
            v-for="ch in circleStore.channels.filter(c => c.id !== 'all')"
            :key="ch.id"
            type="button"
            class="btn"
            :class="selectedChannel === ch.id ? 'btn-primary' : 'btn-secondary'"
            style="font-size: 12px; padding: 4px 10px;"
            @click="selectedChannel = ch.id"
          >
            {{ ch.name }}
          </button>
        </div>
      </div>

      <!-- 动态内容输入框 -->
      <div style="margin-bottom: 14px;">
        <textarea
          v-model="textContent"
          class="moment-textarea"
          rows="5"
          placeholder="分享你的大厂求职经验、刷题踩坑、架构设计心得或今日学习打卡总结..."
          @input="checkText"
        ></textarea>
      </div>

      <!-- 敏感词实时提醒 -->
      <div v-if="sensitiveViolations.length > 0" class="sensitive-warning">
        <span>⚠️</span> 提醒：检测到敏感/违规词汇 <strong>{{ sensitiveViolations.join(', ') }}</strong>，发表时将被系统安全策略拦截。
      </div>

      <!-- 常用技术标签 -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">快捷添加话题标签:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <span
            v-for="tag in commonTags"
            :key="tag"
            class="tag-select-pill"
            :class="{ active: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 底部发布 -->
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" @click="circleStore.closeMomentModal">取消</button>
        <button
          class="btn btn-primary"
          :disabled="!textContent.trim() || sensitiveViolations.length > 0 || loading"
          @click="handlePublish"
        >
          {{ loading ? '发布中...' : '立即发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCircleStore } from '@/stores/circle'

const circleStore = useCircleStore()

const selectedChannel = ref(circleStore.channels.find(c => c.id !== 'all')?.id || '101')
const textContent = ref('')
const sensitiveViolations = ref([])
const commonTags = ['#高频面试', '#大厂面经', '#Spring源码', '#Redis架构', '#算法打卡', '#秋招冲刺']
const selectedTags = ref([])
const loading = ref(false)

function checkText() {
  sensitiveViolations.value = circleStore.checkSensitiveWords(textContent.value)
}

function toggleTag(tag) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

async function handlePublish() {
  if (!textContent.value.trim()) return
  loading.value = true
  try {
    let finalContent = textContent.value.trim()
    if (selectedTags.value.length > 0) {
      const existing = finalContent.match(/#[^\s#]+/g) || []
      const toAdd = selectedTags.value.filter((t) => !existing.includes(t))
      if (toAdd.length > 0) {
        finalContent = finalContent + '\n' + toAdd.join(' ')
      }
    }

    const res = await circleStore.publishMoment({
      content: finalContent,
      channel: selectedChannel.value
    })
    if (res.success) {
      textContent.value = ''
      selectedTags.value = []
      sensitiveViolations.value = []
    } else {
      alert(res.message || '发布失败')
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
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
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
.moment-textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  resize: vertical;
}
.moment-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}
.sensitive-warning {
  background: var(--danger-light);
  border: 1px solid var(--danger-border);
  color: var(--danger);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tag-select-pill {
  font-size: 11px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.tag-select-pill:hover,
.tag-select-pill.active {
  background: var(--primary-light);
  border-color: var(--primary-border);
  color: var(--primary);
  font-weight: 600;
}
</style>
