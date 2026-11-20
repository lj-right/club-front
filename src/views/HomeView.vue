<template>
  <div class="view-container">
    <!-- 主体双栏布局 -->
    <div class="home-layout">
      <!-- 左侧：今日必刷题目流 -->
      <div class="home-main">
        <div class="section-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h2 style="font-size: 18px; font-weight: 700; color: var(--text-main);">随机刷题</h2>
            <button
              class="refresh-btn"
              @click="handleRefreshToday"
              title="随机换一批推荐题目"
            >
              换一批
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="recite-toggle">
              <input
                type="checkbox"
                :checked="subjectStore.reciteMode"
                @change="handleReciteToggle"
              />
              <span class="toggle-slider"></span>
              <span style="font-size: 13px; font-weight: 600; color: var(--text-regular);">背诵模式</span>
            </label>
          </div>
        </div>

        <!-- 题目列表卡片 -->
        <div class="questions-flow">
          <div
            v-for="q in todayQuestions"
            :key="q.id"
            :id="'today-q-' + q.id"
            class="q-card"
            :class="{ 'target-highlighted': highlightedQuestionId === q.id }"
          >
            <h3 class="q-card-title">{{ q.title }}</h3>

            <!-- 核心解析区：默认展开全部显示，不进行任何行数截断；背诵模式下点击卡片或按钮就地切换 -->
            <div v-if="isAnswerShown(q.id) && (q.summary || q.answer)" class="q-summary-box">
              <div class="summary-text" v-html="formatAnswer(q.summary || q.answer)"></div>
              <div v-if="subjectStore.reciteMode" class="collapse-row">
                <span class="collapse-btn" @click="toggleAnswer(q.id, $event)">收起答案</span>
              </div>
            </div>
            <div v-else class="q-recite-placeholder" @click="toggleAnswer(q.id, $event)">
              <span>点击查看答案</span>
            </div>

            <div class="q-card-bottom">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="author-tag">考题作者: {{ q.author || '架构专家' }}</span>
                <span style="color: var(--border-color);">•</span>
                <span class="time-tag">更新于: {{ q.timeAgo || '3天前' }}</span>
                <span style="color: var(--border-color);">•</span>
                <span class="views-count">{{ q.views != null ? q.views : 0 }} 次研读</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：热门题榜与圈子热议 -->
      <div class="home-sidebar">
        <!-- 热门题目排行榜 TOP 5 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">🔥 全站高频题目榜 TOP 5</h3>
          <div class="rank-list">
            <div
              v-for="(hot, idx) in hotList"
              :key="hot.id"
              class="rank-item"
              @click="handleHotClick(hot)"
            >
              <span
                class="rank-num"
                :class="{ top1: idx === 0, top2: idx === 1, top3: idx === 2 }"
              >
                {{ idx + 1 }}
              </span>
              <span class="rank-title">{{ hot.title }}</span>
              <span class="rank-heat">🔥 {{ hot.views }}</span>
            </div>
          </div>
        </div>

        <!-- 社区热议速报 -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">圈子热议交流</h3>
          <div class="community-mini-list">
            <div
              v-for="m in circleStore.moments.slice(0, 3)"
              :key="m.id"
              class="mini-moment-item"
              @click="$router.push('/circle')"
            >
              <div class="mini-author">
                <img :src="m.avatar" class="mini-avatar" />
                <span class="mini-name">{{ m.author }}</span>
                <span class="mini-channel">#{{ m.channelName }}</span>
              </div>
              <p class="mini-content">{{ m.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubjectStore } from '@/stores/subject'
import { useCircleStore } from '@/stores/circle'
import { formatAnswer } from '@/utils/format'

const router = useRouter()
const subjectStore = useSubjectStore()
const circleStore = useCircleStore()

const revealedQuestions = ref(new Set())

onMounted(() => {
  subjectStore.fetchRandomTodayQuestions()
  subjectStore.fetchHotSubjectList()
})

function handleRefreshToday() {
  subjectStore.fetchRandomTodayQuestions(true)
  revealedQuestions.value = new Set()
}

function handleReciteToggle() {
  subjectStore.toggleReciteMode()
  revealedQuestions.value = new Set()
}

watch(() => subjectStore.reciteMode, () => {
  revealedQuestions.value = new Set()
})

function isAnswerShown(id) {
  if (!subjectStore.reciteMode) return true
  return revealedQuestions.value.has(id)
}

function toggleAnswer(id, e) {
  if (e) e.stopPropagation()
  const next = new Set(revealedQuestions.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  revealedQuestions.value = next
}

const todayQuestions = computed(() => {
  if (subjectStore.todayQuestions.length > 0) {
    return subjectStore.todayQuestions
  }
  return subjectStore.questions.slice(0, 6)
})

const hotList = computed(() => {
  return subjectStore.hotQuestions
})

const highlightedQuestionId = ref(null)

function handleHotClick(hot) {
  // 检查是否已经在今日推荐列表中；若不在则插入到最前，确保左侧流立即可见并能定位
  if (subjectStore.todayQuestions.length === 0) {
    subjectStore.todayQuestions = [...subjectStore.questions.slice(0, 6)]
  }
  const exists = subjectStore.todayQuestions.some((q) => q.id === hot.id)
  if (!exists) {
    subjectStore.todayQuestions.unshift({
      ...hot,
      summary: hot.summary || hot.answer || '该考点考查底层核心设计与工业级高并发实战方案。',
      answer: hot.answer || hot.summary || '该考点考查底层核心设计与工业级高并发实战方案。',
      author: hot.author || '架构专家',
      timeAgo: hot.timeAgo || '3天前',
      views: hot.views != null ? hot.views : '0'
    })
  }

  highlightedQuestionId.value = hot.id

  setTimeout(() => {
    const el = document.getElementById(`today-q-${hot.id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 50)

  setTimeout(() => {
    if (highlightedQuestionId.value === hot.id) {
      highlightedQuestionId.value = null
    }
  }, 2500)
}
</script>

<style scoped>
.home-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.refresh-btn:hover {
  color: var(--primary);
  border-color: var(--primary-border);
  background: var(--primary-light);
  transition: none;
}
.recite-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.recite-toggle input {
  display: none;
}
.toggle-slider {
  width: 36px;
  height: 20px;
  background: #cbd5e1;
  border-radius: 9999px;
  position: relative;
  transition: background 0.2s;
}
.toggle-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s;
}
.recite-toggle input:checked + .toggle-slider {
  background: var(--primary-hover, #4096ff);
}
.recite-toggle input:checked + .toggle-slider::after {
  transform: translateX(16px);
}
.questions-flow {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.q-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  cursor: default;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  transform: none;
}
.q-card:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
  transform: none !important;
}
.q-card.target-highlighted {
  border-color: var(--primary, #1677ff) !important;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.22), 0 8px 24px rgba(22, 119, 255, 0.16) !important;
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.company-badge {
  font-size: 11px;
  background: var(--duck-yellow-light);
  color: #d46b08;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.views-count {
  font-size: 11px;
  color: var(--text-muted);
}
.q-card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 12px;
  cursor: default;
}
.q-card-title:hover {
  color: var(--text-main) !important;
  text-decoration: none !important;
  cursor: default !important;
}
.q-summary-box {
  background: var(--bg-subtle, #f8fafc);
  border-left: 3px solid var(--primary, #66b2ff);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.summary-text {
  font-size: 13.5px;
  color: var(--text-regular);
  line-height: 1.7;
  word-break: break-word;
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
  margin: 10px 0;
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
:deep(.ans-img-inner) {
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  transform: none;
}
:deep(.ans-img-inner:hover) {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
  transform: none !important;
}
:deep(.ans-img) {
  transform: none !important;
}
:deep(.ans-img-inner:hover .ans-img) {
  transform: none !important;
}
.q-recite-placeholder {
  background: var(--duck-yellow-light);
  border: 1px dashed var(--duck-yellow-border);
  border-radius: var(--radius-sm);
  padding: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #b45309;
  margin-bottom: 12px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}
.q-recite-placeholder:hover {
  background: #fef08a;
}
.collapse-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.collapse-btn {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  user-select: none;
}
.collapse-btn:hover {
  text-decoration: underline;
}
.q-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
}
.sidebar-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 20px;
}

/* 深色模式针对 HomeView 的定向优化 */
:global(html.dark) .q-summary-box {
  background: #0d1526 !important;
  border-left-color: #3b82f6 !important;
}

:global(html.dark) .q-recite-placeholder {
  background: rgba(245, 158, 11, 0.12) !important;
  border-color: rgba(245, 158, 11, 0.35) !important;
  color: #fbbf24 !important;
}

:global(html.dark) .q-recite-placeholder:hover {
  background: rgba(245, 158, 11, 0.2) !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
}

:global(html.dark) .summary-text table,
:global(html.dark) .summary-text th,
:global(html.dark) .summary-text td {
  background-color: #111b2e !important;
  border-color: #243247 !important;
  color: #cbd5e1 !important;
}

:global(html.dark) .summary-text th {
  background-color: #162238 !important;
  color: #f1f5f9 !important;
}

:global(html.dark) .summary-text tr:nth-child(even) td {
  background-color: #0e1728 !important;
}
.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 14px;
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}
.rank-item:hover {
  background: var(--bg-hover);
}
.rank-num {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  width: 18px;
  text-align: center;
}
.rank-num.top1 {
  color: #ef4444;
}
.rank-num.top2 {
  color: #f97316;
}
.rank-num.top3 {
  color: #eab308;
}
.rank-title {
  font-size: 13px;
  color: var(--text-regular);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-heat {
  font-size: 11px;
  color: var(--text-muted);
}
.link-more {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
}
.community-mini-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mini-moment-item {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 10px;
  cursor: pointer;
}
.mini-moment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.mini-author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.mini-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
.mini-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
}
.mini-channel {
  font-size: 11px;
  color: var(--primary);
}
.mini-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
