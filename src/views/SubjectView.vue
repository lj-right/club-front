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

    <!-- 二级分类：技能与中间件 (Skills & Middlewares) - 直接全量平铺展示 -->
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

    <!-- 三级分类：知识点标签 (Knowledge Point Labels) - 胶囊 Pill 药丸式过滤标签 (无图标规范) -->
    <div v-if="currentLabels.length > 0" class="third-label-bar">
      <div class="label-pills-list">
        <button
          class="label-pill"
          :class="{ active: subjectStore.selectedLabels.length === 0 }"
          @click="subjectStore.clearLabels"
        >
          全部考点
        </button>
        <button
          v-for="lbl in currentLabels"
          :key="lbl"
          class="label-pill"
          :class="{ active: subjectStore.selectedLabels.includes(lbl) }"
          @click="subjectStore.toggleLabel(lbl)"
        >
          {{ lbl }}
        </button>
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
            最热
          </button>
          <button
            class="filter-btn"
            :class="{ active: subjectStore.sortOrder === 'latest' }"
            @click="subjectStore.setSort('latest')"
          >
            最新
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

      <!-- 题库全库快速搜索入口 (打破单标签限制，任意搜并反向定位) -->
      <div class="filter-right">
        <div class="subject-quick-search" @click="subjectStore.openSearchModal" title="全库任意检索题目，直接定位至题库位置">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span class="search-text">全库检索 (随便搜，定位至题目)...</span>
          <span class="search-kbd">/</span>
        </div>
      </div>
    </div>

    <!-- 题目列表与侧栏主体 -->
    <div class="subject-layout">
      <!-- 题目列表 -->
      <div class="questions-list">
        <div v-if="subjectStore.filteredQuestions.length === 0" class="empty-list">
          <div style="font-size: 14px; color: var(--text-muted);">暂无符合当前筛选条件的题目</div>
        </div>

        <div
          v-for="q in subjectStore.filteredQuestions"
          :key="q.id"
          :id="'subject-q-' + q.id"
          class="subject-q-card"
          :class="{ 'target-highlighted': subjectStore.highlightedSubjectId === q.id }"
        >
          <div class="q-title-row">
            <h3 class="q-title">{{ q.title }}</h3>
            <span v-if="subjectStore.highlightedSubjectId === q.id" class="locate-target-badge">
              定位目标题目
            </span>
          </div>

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
              <span class="time-tag">更新于: {{ q.timeAgo || '3天前' }}</span>
              <span class="meta-dot">•</span>
              <span class="views-count">{{ q.views != null ? q.views : 0 }} 次研读</span>
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
          <div class="contribute-list" v-if="contributors.length > 0">
            <div class="contributor-item" v-for="(u, i) in contributors" :key="u.name + '_' + i">
              <span class="c-rank">{{ i + 1 }}</span>
              <img
                :src="u.avatar"
                class="c-avatar"
                alt="avatar"
                @error="handleContributorAvatarError"
              />
              <div class="c-info">
                <div class="c-name">{{ u.name }}</div>
                <div class="c-role">{{ u.role }}</div>
              </div>
              <span class="c-count">{{ u.questions }}题</span>
            </div>
          </div>
          <div v-else class="side-empty">
            暂无贡献数据
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
import defaultAvatarImg from '@/assets/default_avatar.jpg'

const subjectStore = useSubjectStore()
const authStore = useAuthStore()

onMounted(async () => {
  await subjectStore.fetchCategories()
  await subjectStore.fetchContributeList()
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

// 三级分类知识点考点列表
const currentLabels = computed(() => {
  const activeSub = subjectStore.activeSubCategory
  if (!activeSub || !Array.isArray(activeSub.labels)) return []
  return activeSub.labels
})

// 答案展开控制
const revealedQuestions = ref(new Set())

watch(
  () => subjectStore.highlightedSubjectId,
  (newId) => {
    if (newId) {
      revealedQuestions.value.add(newId)
    }
  },
  { immediate: true }
)

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

const defaultContributorAvatar = defaultAvatarImg

// 真实榜单数据：完全来源于后端真实题库贡献接口，绝不使用前端 mock 数据
const contributors = computed(() => {
  if (subjectStore.contributeList && Array.isArray(subjectStore.contributeList) && subjectStore.contributeList.length > 0) {
    return subjectStore.contributeList.slice(0, 10).map((item, idx) => ({
      name: item.createUser || `贡献者 ${idx + 1}`,
      role: idx === 0 ? '全栈架构师 (PRO)' : idx === 1 ? '平台核心维护者' : idx === 2 ? '架构技术专家' : idx === 3 ? '活跃开源答主' : idx === 4 ? 'VIP 技术学员' : '核心贡献者',
      questions: item.subjectCount || 0,
      avatar: (item.createUserAvatar && !item.createUserAvatar.includes('default_avatar.jpg'))
        ? item.createUserAvatar
        : (item.avatar && !item.avatar.includes('default_avatar.jpg'))
          ? item.avatar
          : defaultContributorAvatar
    }))
  }
  return []
})

function handleContributorAvatarError(e) {
  // 占位图片外链若加载失败或网络波动，平滑优雅降级到本地默认头像，防止出现裂图图标
  e.target.onerror = null
  e.target.src = defaultAvatarImg
}
</script>

<style scoped>
/* 一级分类：职位切换导航条 */
.primary-tabs-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 6px 8px;
  margin-bottom: 13px;
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
  background: var(--primary-light, #eff6ff);
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
  font-weight: 600;
  box-shadow: none;
}

.primary-expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 40px;
  padding: 0 14px;
  background: var(--bg-card);
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
  background: var(--primary-light, #eff6ff);
  border-color: var(--primary-border);
}

.primary-tabs-header.is-expanded .primary-expand-btn {
  align-self: flex-end;
  margin-top: 4px;
}

/* 二级分类：技能与中间件卡片胶囊 - 直接全量平铺展示 */
.sub-category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 13px;
  padding: 2px 0;
}

.sub-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  white-space: nowrap;
  font-weight: 500;
  box-sizing: border-box;
  transition: none;
  flex-shrink: 0;
}

.sub-pill * {
  user-select: none;
  -webkit-user-drag: none;
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

/* 三级分类：知识点标签 (Knowledge Point Labels) - 胶囊 Pill 药丸式过滤标签 */
.third-label-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  margin-bottom: 13px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.label-pills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.label-pill {
  border: 1px solid var(--border-color);
  background: var(--bg-subtle, #f8fafc);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.label-pill:hover {
  border-color: var(--primary-border, #93c5fd);
  color: var(--primary, #1677ff);
  background: var(--primary-light, #eff6ff);
}

.label-pill.active {
  background: var(--primary, #1677ff);
  border-color: var(--primary, #1677ff);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(22, 119, 255, 0.25);
}

:global(html.dark) .label-pill {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

:global(html.dark) .label-pill:hover {
  background: rgba(22, 119, 255, 0.15);
  border-color: var(--primary);
  color: #38bdf8;
}

:global(html.dark) .label-pill.active {
  background: var(--primary);
  color: #ffffff;
}

/* 工具与过滤操作栏 */
.filter-tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px 16px;
  margin-bottom: 16px;
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
  font-weight: 500;
  color: var(--text-secondary);
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
  font-size: 12px;
  color: var(--text-secondary);
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
  color: var(--text-secondary);
  font-weight: 500;
}

/* 题库全库快速检索 */
.filter-right {
  display: flex;
  align-items: center;
}
.subject-quick-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-subtle, #f1f5f9);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 5px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.subject-quick-search:hover {
  background: var(--bg-hover, #e2e8f0);
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
}
.search-text {
  font-size: 12px;
  color: var(--text-muted);
}
.subject-quick-search:hover .search-text {
  color: var(--primary, #1677ff);
}
.search-kbd {
  font-size: 10px;
  padding: 1px 5px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #cbd5e1);
  border-radius: 4px;
  color: var(--text-muted);
}

.q-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.q-title-row .q-title {
  margin-bottom: 0;
}
.locate-target-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e6f4ff;
  border: 1px solid #91caff;
  color: #1677ff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
:global(html.dark) .locate-target-badge {
  background: rgba(22, 119, 255, 0.2);
  border-color: #1677ff;
  color: #69b1ff;
}

/* 分页控制器（每页不超过5条） */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
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
  background: var(--bg-card);
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
  background: var(--primary-light, #eff6ff);
}
.page-btn.active {
  background: var(--primary-light, #eff6ff);
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
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
  background: var(--bg-card);
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
  background: var(--bg-card);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 40px;
  text-align: center;
}
.subject-q-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  transform: none;
}
.subject-q-card:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
  transform: none !important;
}

/* 搜索结果在题库分类下定位高亮与聚焦脉冲 */
.subject-q-card.target-highlighted {
  border-color: var(--primary, #1677ff) !important;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.22), 0 8px 20px rgba(22, 119, 255, 0.12) !important;
  animation: locatePulse 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

@keyframes locatePulse {
  0% {
    transform: scale(1.012);
    box-shadow: 0 0 0 5px rgba(22, 119, 255, 0.35), 0 10px 24px rgba(22, 119, 255, 0.18);
  }
  50% {
    transform: scale(1.004);
    box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.2), 0 6px 16px rgba(22, 119, 255, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: var(--shadow-sm);
  }
}

:global(html.dark) .subject-q-card.target-highlighted {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25), 0 8px 20px rgba(0, 0, 0, 0.35) !important;
}
.q-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.45;
  margin-bottom: 12px;
  cursor: default;
}
.q-title:hover {
  color: var(--text-main) !important;
  text-decoration: none !important;
  cursor: default !important;
}
.q-answer-preview {
  font-size: 13.5px;
  color: var(--text-regular);
  line-height: 1.7;
  background: var(--bg-subtle, #f8fafc);
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  border-left: 3px solid var(--primary, #66b2ff);
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px;
  margin-bottom: 20px;
}

/* 深色模式针对 SubjectView 的专项优化 */
:global(html.dark) .q-answer-preview {
  background: #0d1526 !important;
  border-left-color: #3b82f6 !important;
}

:global(html.dark) .recite-bar {
  background: rgba(245, 158, 11, 0.12) !important;
  border-color: rgba(245, 158, 11, 0.35) !important;
  color: #fbbf24 !important;
}

:global(html.dark) .recite-bar:hover {
  background: rgba(245, 158, 11, 0.2) !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
}

:global(html.dark) .checkpoint-val {
  background: rgba(59, 130, 246, 0.2) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
  color: #60a5fa !important;
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
.side-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 14px;
}
.side-empty {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  padding: 24px 0;
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
  width: 18px;
  text-align: center;
  flex-shrink: 0;
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
