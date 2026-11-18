<template>
  <div class="view-container">
    <!-- 一级分类：职位 (Job Roles) - 支持展开/收起切换更多职位，无图标规范 -->
    <div class="primary-tabs-wrapper">
      <div class="primary-tabs-header" :class="{ 'is-expanded': isPositionsExpanded }">
        <div class="primary-tabs-list" :class="{ 'is-expanded': isPositionsExpanded }">
          <div
            v-for="cat in visiblePrimaryCategories"
            :key="cat.id"
            class="primary-tab"
            :class="{ active: subjectStore.currentPrimaryId == cat.id }"
            @click="selectPrimaryRole(cat.id)"
          >
            <span>{{ cat.name }}</span>
          </div>
        </div>
        <button
          class="primary-expand-btn"
          type="button"
          :title="isPositionsExpanded ? '收起' : '展开'"
          @click="isPositionsExpanded = !isPositionsExpanded"
        >
          <span>{{ isPositionsExpanded ? '收起' : '展开' }}</span>
        </button>
      </div>
    </div>

    <!-- 二级分类：技能与中间件 (Skills & Middlewares) - 必须且仅限本级展示高保真技术矢量SVG图标 -->
    <div class="sub-category-bar">
      <div
        v-for="sub in subjectStore.currentSubCategoryList"
        :key="sub.id"
        class="sub-pill"
        :class="{ active: subjectStore.currentSubId == sub.id }"
        @click="subjectStore.selectSub(sub.id)"
      >
        <span class="sub-icon">
          <TechIcon :name="sub.name" :sub-id="sub.id" />
        </span>
        <span class="sub-name">{{ sub.name }}</span>
        <span class="sub-count">{{ sub.count }}题</span>
      </div>
    </div>

    <!-- 三级分类：知识点标签 (Knowledge Point Labels) - 胶囊药丸式过滤标签，无图标规范 -->
    <div v-if="displayLabels.length > 0" class="label-filter-bar">
      <div class="label-filter-title">知识点标签:</div>
      <div class="label-pills">
        <span
          v-for="lbl in displayLabels"
          :key="lbl"
          class="label-pill"
          :class="{ active: subjectStore.selectedLabels.includes(lbl) }"
          @click="subjectStore.toggleLabel(lbl)"
        >
          {{ lbl }}
        </span>
        <span
          v-if="subjectStore.selectedLabels.length > 0"
          class="label-clear"
          @click="subjectStore.clearLabels"
        >
          ✕ 清空已选 ({{ subjectStore.selectedLabels.length }})
        </span>
      </div>
    </div>

    <!-- 工具与条件过滤栏 -->
    <div class="filter-tool-bar">
      <div class="filter-left">
        <!-- 难度筛选 -->
        <div class="filter-group">
          <span class="filter-label">难度:</span>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.difficultyFilter === 'all' }"
            @click="subjectStore.setDifficulty('all')"
          >
            全部
          </button>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.difficultyFilter === 'easy' }"
            @click="subjectStore.setDifficulty('easy')"
          >
            简单
          </button>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.difficultyFilter === 'medium' }"
            @click="subjectStore.setDifficulty('medium')"
          >
            中等
          </button>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.difficultyFilter === 'hard' }"
            @click="subjectStore.setDifficulty('hard')"
          >
            困难
          </button>
        </div>

        <!-- 排序方式 -->
        <div class="filter-group">
          <span class="filter-label">排序:</span>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.sortOrder === 'hot' }"
            @click="subjectStore.setSort('hot')"
          >
            最热 🔥
          </button>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.sortOrder === 'latest' }"
            @click="subjectStore.setSort('latest')"
          >
            最新 ⏱
          </button>
        </div>

        <!-- 背诵模式（位于排序右侧） -->
        <div class="filter-group recite-group">
          <label class="recite-toggle" title="开启背诵模式后，题目卡片默认隐藏解析，点击就地查看">
            <input
              type="checkbox"
              :checked="subjectStore.reciteMode"
              @change="subjectStore.toggleReciteMode"
            />
            <span class="recite-label-text">背诵模式</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 题目列表与侧栏主体 -->
    <div class="subject-layout">
      <!-- 题目列表 -->
      <div class="questions-list">
        <div v-if="subjectStore.filteredQuestions.length === 0" class="empty-list">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 14px; color: var(--text-muted);">暂无符合当前筛选条件的题目</div>
          <button class="btn btn-secondary" style="margin-top: 12px;" @click="resetFilters">
            重置所有筛选
          </button>
        </div>

        <div
          v-for="q in subjectStore.filteredQuestions"
          :key="q.id"
          class="subject-q-card"
        >
          <h3 class="q-title">{{ q.title }}</h3>

          <!-- 背诵模式内容控制（核心答案摘要）就地展开 -->
          <div v-if="isAnswerShown(q.id) && (q.summary || q.answer)" class="q-answer-preview">
            <div class="summary-text" v-html="formatAnswer(q.summary || q.answer)"></div>
            <div v-if="subjectStore.reciteMode" class="collapse-row">
              <span class="collapse-btn" @click.stop="toggleAnswer(q.id)">收起答案</span>
            </div>
          </div>
          <div v-else class="recite-bar" @click.stop="toggleAnswer(q.id)">
            <span>点击查看答案</span>
          </div>

          <!-- 卡片底部：整合作者、更新时间与研读次数（根据规范移除右下角冗余标签） -->
          <div class="q-footer">
            <div class="q-meta-left">
              <span class="author-tag">考题作者: {{ q.author || '随风' }}</span>
              <span class="meta-dot">•</span>
              <span class="time-tag">更新于: {{ q.timeAgo || '2天前' }}</span>
              <span class="meta-dot">•</span>
              <span class="views-count">{{ q.views || '42.8k' }} 次研读</span>
            </div>
          </div>
        </div>

        <!-- 分页控制器（每页不超过5条） -->
        <div v-if="totalPages > 1" class="pagination-bar">
          <div class="pagination-info">
            共 <span class="info-highlight">{{ subjectStore.totalQuestions }}</span> 道考题，第 <span class="info-highlight">{{ subjectStore.pageNo }}</span> / {{ totalPages }} 页
          </div>
          <div class="pagination-controls">
            <button
              class="page-btn page-nav"
              :disabled="subjectStore.pageNo <= 1"
              @click="handlePageChange(subjectStore.pageNo - 1)"
            >
              上一页
            </button>

            <template v-for="(p, idx) in visiblePages" :key="idx">
              <span v-if="p === '...'" class="page-ellipsis">...</span>
              <button
                v-else
                class="page-btn page-num"
                :class="{ active: subjectStore.pageNo === p }"
                @click="handlePageChange(p)"
              >
                {{ p }}
              </button>
            </template>

            <button
              class="page-btn page-nav"
              :disabled="subjectStore.pageNo >= totalPages"
              @click="handlePageChange(subjectStore.pageNo + 1)"
            >
              下一页
            </button>
          </div>
          <div class="pagination-jumper">
            <span>前往</span>
            <input
              type="number"
              min="1"
              :max="totalPages"
              v-model.number="jumpPageInput"
              @keyup.enter="handleJumpPage"
            />
            <span>页</span>
            <button class="jump-btn" @click="handleJumpPage">确定</button>
          </div>
        </div>
      </div>

      <!-- 右侧辅助面板：精简去除非必要知识结构，保留出题贡献榜且使用默认防破图头像 -->
      <div class="subject-side">
        <!-- 社区题解贡献榜 -->
        <div class="side-card">
          <h4 class="side-title">🏆 题库出题贡献榜</h4>
          <div class="contribute-list">
            <div class="contributor-item" v-for="(u, i) in contributors" :key="u.name">
              <span class="c-rank">{{ i + 1 }}</span>
              <img
                :src="u.avatar"
                class="c-avatar"
                alt="avatar"
                onerror="if (!this.dataset.errored) { this.dataset.errored = 'true'; this.src = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'; }"
                @error="handleContributorAvatarError"
              />
              <div class="c-info">
                <div class="c-name">{{ u.name }}</div>
                <div class="c-role">{{ u.role }}</div>
              </div>
              <span class="c-count">{{ u.questions }}题</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSubjectStore } from '@/stores/subject'
import { useAuthStore } from '@/stores/auth'
import TechIcon from '@/components/TechIcon.vue'
import { formatAnswer } from '@/utils/format'

const subjectStore = useSubjectStore()
const authStore = useAuthStore()

onMounted(async () => {
  await subjectStore.fetchCategories()
})

// 一级职位展开/收起状态
const isPositionsExpanded = ref(false)

const visiblePrimaryCategories = computed(() => {
  if (isPositionsExpanded.value) {
    return subjectStore.primaryCategories
  }
  const list = subjectStore.primaryCategories || []
  const top5 = list.slice(0, 5)
  const current = list.find((c) => c.id == subjectStore.currentPrimaryId)
  if (current && !top5.some((c) => c.id == current.id)) {
    return [...top5.slice(0, 4), current]
  }
  return top5
})

function selectPrimaryRole(id) {
  subjectStore.selectPrimary(id)
}

// 答案展开控制
const revealedQuestions = ref(new Set())

watch(() => subjectStore.reciteMode, () => {
  revealedQuestions.value = new Set()
})

function isAnswerShown(id) {
  if (!subjectStore.reciteMode) return true
  return revealedQuestions.value.has(id)
}

function toggleAnswer(id) {
  const next = new Set(revealedQuestions.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  revealedQuestions.value = next
}

const activeSub = computed(() => subjectStore.activeSubCategory)

const displayLabels = computed(() => {
  if (activeSub.value?.labels && activeSub.value.labels.length > 0) {
    return activeSub.value.labels
  }
  const list = subjectStore.currentSubCategoryList || []
  const set = new Set()
  list.forEach((sub) => {
    ;(sub.labels || []).forEach((l) => set.add(l))
  })
  return Array.from(set)
})

function resetFilters() {
  subjectStore.setDifficulty('all')
  subjectStore.clearLabels()
}

// 分页逻辑（每页不超过5条）
const totalPages = computed(() => {
  return Math.ceil((subjectStore.totalQuestions || 0) / (subjectStore.pageSize || 5)) || 1
})

const visiblePages = computed(() => {
  const current = subjectStore.pageNo || 1
  const total = totalPages.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = []
  pages.push(1)
  if (current > 3) {
    pages.push('...')
  }
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  if (current < total - 2) {
    pages.push('...')
  }
  pages.push(total)
  return pages
})

const jumpPageInput = ref('')

function handlePageChange(p) {
  if (p >= 1 && p <= totalPages.value) {
    subjectStore.changePage(p)
    const el = document.querySelector('.questions-list')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

function handleJumpPage() {
  const p = parseInt(jumpPageInput.value, 10)
  if (p && p >= 1 && p <= totalPages.value) {
    handlePageChange(p)
    jumpPageInput.value = ''
  }
}

const defaultContributorAvatar = 'https://loremflickr.com/g/320/240/paris,girl/all'

const contributors = computed(() => {
  const currentNick = authStore.userInfo?.nickName || authStore.userInfo?.userName || '随风'
  const currentAvatar = authStore.avatar || authStore.userInfo?.avatar || defaultContributorAvatar

  return [
    {
      name: currentNick,
      role: '全栈架构师 (PRO)',
      questions: 342,
      avatar: currentAvatar
    },
    {
      name: '超级管理员',
      role: '平台维护者',
      questions: 215,
      avatar: defaultContributorAvatar
    },
    {
      name: 'VIP 学员小张',
      role: '字节上岸学员',
      questions: 128,
      avatar: defaultContributorAvatar
    },
    {
      name: '测试小伙伴',
      role: '活跃开源答主',
      questions: 95,
      avatar: defaultContributorAvatar
    }
  ]
})

function handleContributorAvatarError(e) {
  // 占位图片外链若加载失败或网络波动，平滑优雅降级到默认头像，防止出现裂图图标
  e.target.onerror = null
  e.target.src = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'
}
</script>

<style scoped>
/* 一级分类：职位切换导航条 */
.primary-tabs-wrapper {
  background: #ffffff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 6px 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.primary-tabs-header {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}

.primary-tabs-header.is-expanded {
  flex-direction: column;
  align-items: stretch;
}

.primary-tabs-list {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
}

.primary-tabs-list.is-expanded {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.primary-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.primary-tabs-list.is-expanded .primary-tab {
  flex: none;
}

.primary-tab:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.primary-tab.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(22, 119, 255, 0.25);
}

.primary-expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
  padding: 0 14px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.primary-expand-btn:hover {
  background: #eff6ff;
  border-color: var(--primary-border);
}

.primary-tabs-header.is-expanded .primary-expand-btn {
  align-self: flex-end;
  margin-top: 4px;
}

/* 二级分类：技能与中间件卡片胶囊 */
.sub-category-bar {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px 8px 2px;
  margin-bottom: 14px;
}
.sub-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  box-sizing: border-box;
  transition: none;
}
.sub-pill:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
}
.sub-pill.active {
  background: #eff6ff;
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
  transition: none;
}
.sub-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.sub-name {
  font-size: 13px;
}
.sub-count {
  font-size: 11px;
  background: var(--bg-subtle);
  padding: 1px 6px;
  border-radius: 9999px;
  color: var(--text-muted);
}
.sub-pill.active .sub-count {
  background: #dbeafe;
  color: var(--primary);
}

/* 三级分类：知识点标签过滤栏 */
.label-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  margin-bottom: 16px;
}
.label-filter-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}
.label-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.label-pill {
  font-size: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.2s;
}
.label-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.label-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  font-weight: 600;
}
.label-clear {
  font-size: 11px;
  color: var(--danger);
  cursor: pointer;
  margin-left: 6px;
}

/* 工具与过滤操作栏 */
.filter-tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  margin-bottom: 20px;
}
.filter-left {
  display: flex;
  gap: 20px;
  align-items: center;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-label {
  font-size: 12px;
  color: var(--text-muted);
}
.filter-btn {
  background: none;
  border: 1px solid transparent;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-btn.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 500;
  border-color: var(--primary-border);
}

/* 背诵模式复选框（位于排序右侧） */
.recite-group {
  display: flex;
  align-items: center;
}
.recite-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--text-regular);
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}
.recite-toggle:hover {
  background: var(--bg-hover, #f8fafc);
}
.recite-toggle input[type="checkbox"] {
  cursor: pointer;
  width: 14px;
  height: 14px;
  accent-color: var(--primary, #1677ff);
  margin: 0;
}
.recite-label-text {
  font-size: 12px;
  color: var(--text-regular);
  font-weight: 500;
}

/* 分页控制器（每页不超过5条） */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 18px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  flex-wrap: wrap;
  gap: 12px;
}
.pagination-info {
  font-size: 13px;
  color: var(--text-muted);
}
.info-highlight {
  color: var(--primary, #1677ff);
  font-weight: 600;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  background: #ffffff;
  color: var(--text-regular);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
  background: #eff6ff;
}
.page-btn.active {
  background: var(--primary, #1677ff);
  border-color: var(--primary, #1677ff);
  color: #ffffff;
  font-weight: 600;
}
.page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: var(--border-color);
  color: var(--text-muted);
}
.page-ellipsis {
  padding: 0 4px;
  color: var(--text-muted);
  user-select: none;
  font-size: 13px;
}
.pagination-jumper {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.pagination-jumper input {
  width: 44px;
  height: 30px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  outline: none;
  color: var(--text-regular);
}
.pagination-jumper input:focus {
  border-color: var(--primary, #1677ff);
}
.jump-btn {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  background: #f8fafc;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-regular);
  cursor: pointer;
  transition: all 0.15s ease;
}
.jump-btn:hover {
  background: var(--primary-light, #eff6ff);
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
}

/* 布局网格 */
.subject-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 520px;
}
.empty-list {
  background: #ffffff;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 40px;
  text-align: center;
}
.subject-q-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  transition: all 0.2s ease;
}
.subject-q-card:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
}
.q-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.45;
  margin-bottom: 12px;
}
.q-answer-preview {
  font-size: 13.5px;
  color: var(--text-regular);
  line-height: 1.7;
  background: var(--bg-hover);
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  border-left: 3px solid var(--primary);
  animation: fadeIn 0.2s ease-in-out;
}
.summary-text {
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
  font-weight: 500;
}
.collapse-btn:hover {
  text-decoration: underline;
}
.recite-bar {
  background: #fefce8;
  border: 1px dashed #fde047;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #ca8a04;
  text-align: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.recite-bar:hover {
  background: #fef9c3;
  border-color: #eab308;
}

/* 卡片底部 */
.q-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}
.q-meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-tag {
  color: var(--text-secondary);
  font-weight: 500;
}
.meta-dot {
  color: var(--border-color);
}
.time-tag {
  color: var(--text-muted);
}
.views-count {
  color: var(--text-muted);
}
.q-checkpoint {
  display: flex;
  align-items: center;
  gap: 6px;
}
.checkpoint-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}
.checkpoint-val {
  font-size: 12px;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid #dbeafe;
}

/* 列表末尾加载完毕提示 */
.list-end-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 12px 16px;
  color: #94a3b8;
  font-size: 13px;
  justify-content: center;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  max-width: 140px;
}
.divider-text {
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.5px;
}

/* 右侧边栏 */
.side-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 20px;
}
.side-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 14px;
}
.contribute-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.contributor-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.c-rank {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  width: 14px;
}
.c-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}
.c-info {
  flex: 1;
}
.c-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.c-role {
  font-size: 11px;
  color: var(--text-muted);
}
.c-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
}
</style>
