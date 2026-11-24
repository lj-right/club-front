<template>
  <div v-if="subjectStore.searchModalOpen" class="modal-overlay active" @click.self="subjectStore.closeSearchModal">
    <div class="search-modal-box">
      <div class="search-input-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref="inputRef"
          v-model="inputQuery"
          type="text"
          placeholder="键入关键词、高频标签或公司真题 (例如: Redis, HashMap, AQS)..."
          class="modal-search-input"
          @input="onInput"
        />
        <span class="esc-badge" @click="subjectStore.closeSearchModal">ESC</span>
      </div>

      <!-- 搜索结果列表 -->
      <div class="search-results-list">
        <div v-if="subjectStore.searchResults.length === 0" class="no-result">
          未检索到相关题目，换个关键词试试吧 ~
        </div>
        <div
          v-for="item in subjectStore.searchResults"
          :key="item.id"
          class="search-item"
          @click="selectResult(item)"
        >
          <div class="search-item-top">
            <span class="item-title" v-html="item.highlightTitle || item.title"></span>
            <span class="badge" :class="item.difficulty || 'medium'">
              {{ item.difficulty === 'easy' ? '简单' : item.difficulty === 'hard' ? '困难' : '中等' }}
            </span>
          </div>

          <!-- 题库位置反向路径引导 -->
          <div class="search-item-path">
            <span class="path-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <span class="path-label">题库位置:</span>
            <span class="path-crumb primary">{{ item.primaryCategoryName || '后端开发' }}</span>
            <span class="path-sep">/</span>
            <span class="path-crumb sub">{{ item.categoryName || (item.categoryNames && item.categoryNames[0]) || '核心技能' }}</span>
            <span class="path-sep">/</span>
            <span class="path-crumb label">{{ item.labelName || (item.labels && item.labels[0]) || '核心考点' }}</span>
            <span class="locate-action-tip">点击反向定位 ➔</span>
          </div>

          <div class="search-item-tags">
            <span v-for="cat in item.categoryNames || []" :key="'cat-' + cat" class="cat-pill">{{ cat }}</span>
            <span v-for="tag in item.labels || []" :key="'tag-' + tag" class="tag-pill">{{ tag }}</span>
            <span v-for="c in item.company || []" :key="'comp-' + c" class="company-pill">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSubjectStore } from '@/stores/subject'

const router = useRouter()
const subjectStore = useSubjectStore()
const inputQuery = ref('')
const inputRef = ref(null)

watch(
  () => subjectStore.searchModalOpen,
  (open) => {
    if (open) {
      inputQuery.value = ''
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
)

function onInput() {
  subjectStore.handleSearch(inputQuery.value)
}

function selectResult(item) {
  subjectStore.closeSearchModal()
  // 按照设计规范：直接移除弹窗抽屉定位，改为在题库对应的分类下精准定位
  subjectStore.locateSubjectInCategory(item, router)
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault()
      subjectStore.openSearchModal()
    }
    if (e.key === 'Escape' && subjectStore.searchModalOpen) {
      subjectStore.closeSearchModal()
    }
  })
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}
.search-modal-box {
  width: 640px;
  max-width: 92vw;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.modal-search-input {
  flex: 1;
  border: none;
  font-size: 16px;
  color: var(--text-main);
  outline: none;
}
.esc-badge {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
}
.search-results-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 8px;
}
.no-result {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-size: 14px;
}
.search-item {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}
.search-item:hover {
  background: var(--bg-hover);
}
.search-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}
.search-item-path {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: var(--text-secondary);
  background: var(--bg-subtle, rgba(0, 0, 0, 0.02));
  border: 1px dashed var(--border-color, #e2e8f0);
  border-radius: var(--radius-sm, 4px);
  padding: 4px 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}
.search-item:hover .search-item-path {
  background: var(--primary-light, #e6f4ff);
  border-color: var(--primary-border, #91caff);
  color: var(--primary, #1677ff);
}
.path-icon {
  display: inline-flex;
  align-items: center;
  opacity: 0.8;
}
.path-label {
  color: var(--text-muted);
  font-weight: 500;
}
.path-crumb.primary {
  font-weight: 600;
}
.path-crumb.sub {
  font-weight: 600;
}
.path-sep {
  color: var(--text-muted);
  font-size: 10px;
}
.locate-action-tip {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}
.search-item:hover .locate-action-tip {
  opacity: 1;
  transform: translateX(0);
}
.search-item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cat-pill {
  font-size: 11px;
  color: #0958d9;
  background: #e6f4ff;
  border: 1px solid #bae0ff;
  padding: 1px 6px;
  border-radius: 4px;
}
.tag-pill {
  font-size: 11px;
  color: var(--primary);
  background: var(--primary-light);
  padding: 1px 6px;
  border-radius: 4px;
}
.company-pill {
  font-size: 11px;
  color: #d46b08;
  background: var(--duck-yellow-light);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
