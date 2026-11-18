<template>
  <div v-if="subjectStore.drawerOpen" class="drawer-overlay active" @click.self="subjectStore.closeDrawer">
    <div class="drawer-content">
      <!-- 抽屉头部 -->
      <div class="drawer-header">
        <div class="drawer-title-area">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span class="badge" :class="q.difficulty || 'medium'">
              {{ q.difficulty === 'easy' ? '简单' : q.difficulty === 'hard' ? '困难' : '中等' }}
            </span>
            <span v-for="tag in q.labels || []" :key="tag" class="category-pill">
              {{ tag }}
            </span>
            <span v-for="c in q.company || []" :key="c" class="company-badge">
              {{ c }}
            </span>
          </div>
          <h2 class="drawer-title">{{ q.title }}</h2>
        </div>
        <button class="btn btn-secondary" @click="subjectStore.closeDrawer" style="padding: 4px 10px; border-radius: var(--radius-sm);">
          ✕ 关闭
        </button>
      </div>

      <!-- 选项卡 -->
      <div class="drawer-tabs">
        <div
          class="drawer-tab"
          :class="{ active: currentTab === 0 }"
          @click="currentTab = 0"
        >
          官方深度解析
        </div>
        <div
          class="drawer-tab"
          :class="{ active: currentTab === 1 }"
          @click="currentTab = 1"
        >
          考官常考要点 &amp; 追问
        </div>
      </div>

      <!-- 抽屉正文 -->
      <div class="drawer-body">
        <!-- 标签0：深度解析 -->
        <div v-if="currentTab === 0">
          <!-- 答题要点 -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
              💡 核心答案提炼 (TL;DR)
            </h4>
            <div class="answer-box">
              <div class="summary-text" v-html="formatAnswer(q.answer || q.summary || '该题暂无深度解析，正在火速补充中...')"></div>
            </div>
          </div>

          <!-- 代码实战示例 -->
          <div v-if="q.code" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main);">
                💻 核心源码 / 实战示例
              </h4>
              <button class="btn btn-secondary" @click="copyCode(q.code)" style="padding: 2px 8px; font-size: 11px;">
                {{ copied ? '已复制 ✔' : '复制代码' }}
              </button>
            </div>
            <pre class="code-block"><code>{{ q.code }}</code></pre>
          </div>

          <!-- 避坑指南 -->
          <div class="warning-callout">
            <h5 style="font-weight: 700; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; color: #b45309;">
              <span>⚠️</span> 避坑提示与高频失分点
            </h5>
            <p style="font-size: 13px; color: #78350f; line-height: 1.6;">
              {{ followupInfo.pitfalls }}
            </p>
          </div>
        </div>

        <!-- 标签1：考官追问 -->
        <div v-else>
          <div class="followup-box">
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
              🎯 常见连环追问 (Follow-up Questions)
            </h4>
            <div class="followup-list">
              <div
                v-for="(item, idx) in followupInfo.followupList"
                :key="idx"
                class="followup-item"
              >
                <div class="f-q">追问 {{ idx + 1 }}: {{ item.question }}</div>
                <div class="f-a"><strong>回答策略：</strong>{{ item.strategy }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 抽屉底部悬浮操作栏 -->
      <div class="drawer-footer">
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" @click="subjectStore.navigateDrawer(-1)">
            ‹ 上一题
          </button>
          <button class="btn btn-secondary" @click="subjectStore.navigateDrawer(1)">
            下一题 ›
          </button>
        </div>
        <div style="display: flex; gap: 10px;">
          <button
            class="btn"
            :class="q.mastered ? 'btn-success' : 'btn-secondary'"
            @click="subjectStore.toggleMasterCurrentQuestion"
          >
            {{ q.mastered ? '已掌握 ✔' : '标记为已掌握' }}
          </button>
          <button
            class="btn"
            :class="q.liked ? 'btn-primary' : 'btn-secondary'"
            @click="subjectStore.toggleLikeCurrentQuestion"
          >
            {{ q.liked ? '已点赞 👍' : '点赞' }} ({{ q.likedCount || 0 }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import { formatAnswer } from '@/utils/format'
import { getFollowupInfo } from '@/utils/questionFollowups'

const subjectStore = useSubjectStore()
const currentTab = ref(0)
const copied = ref(false)

const q = computed(() => subjectStore.currentQuestion || {})
const followupInfo = computed(() => getFollowupInfo(q.value))

function copyCode(code) {
  navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  justify-content: flex-end;
  animation: fadeInOverlay 0.2s ease;
}
.drawer-content {
  width: 780px;
  max-width: 90vw;
  height: 100vh;
  background: #ffffff;
  box-shadow: var(--shadow-drawer);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.drawer-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
}
.drawer-tabs {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
  background: #ffffff;
}
.drawer-tab {
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}
.drawer-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.answer-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}
.summary-text {
  line-height: 1.7;
  word-break: break-word;
  font-size: 14px;
  color: var(--text-regular);
}
:deep(.summary-text strong) {
  color: var(--text-main);
  font-weight: 700;
}
:deep(.summary-text .md-code) {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  background: rgba(22, 119, 255, 0.08);
  color: var(--primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid rgba(22, 119, 255, 0.15);
}
:deep(.summary-text .md-pre) {
  margin: 12px 0;
  padding: 12px 14px;
  background: #1e1e24;
  color: #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
}
:deep(.summary-text .md-pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
  border: none;
  font-family: inherit;
  font-size: inherit;
}
:deep(.summary-text .ans-h1),
:deep(.summary-text .ans-h2),
:deep(.summary-text .ans-h3) {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-top: 10px;
  margin-bottom: 4px;
}
:deep(.summary-text .ans-li),
:deep(.summary-text .ans-ol) {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 3px 0;
}
:deep(.summary-text .li-dot) {
  color: var(--primary);
  font-weight: 700;
}
:deep(.summary-text .ol-num) {
  font-weight: 600;
  color: var(--primary);
}
:deep(.summary-text .ans-gap) {
  height: 8px;
}
.code-block {
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
.warning-callout {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  padding: 14px;
}
.followup-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.followup-item {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
}
.f-q {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}
.f-a {
  font-size: 13px;
  color: var(--text-regular);
  line-height: 1.6;
}
.drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-pill {
  font-size: 11px;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}
.company-badge {
  font-size: 11px;
  color: #d46b08;
  background: var(--duck-yellow-light);
  padding: 2px 6px;
  border-radius: 4px;
}
.btn-success {
  background: var(--success);
  color: #fff;
  border: none;
}
</style>
