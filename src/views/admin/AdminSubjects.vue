<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">题目管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">
          录入新考题
        </button>
      </div>
    </div>

    <!-- 顶部综合筛选与检索栏 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label>题型筛选:</label>
          <select v-model="adminStore.subjectFilter.type" class="admin-select">
            <option value="all">全部题型</option>
            <option value="单选">单选题</option>
            <option value="多选">多选题</option>
            <option value="判断">判断题</option>
            <option value="简答">简答题</option>
          </select>
        </div>

        <div class="filter-item">
          <label>难度级别:</label>
          <select v-model="adminStore.subjectFilter.difficulty" class="admin-select">
            <option value="all">全部难度</option>
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
          </select>
        </div>

        <div class="filter-item search-box">
          <input
            v-model="adminStore.subjectFilter.keyWord"
            type="text"
            placeholder="搜索题目标题、考点关键词..."
            class="admin-input"
          />
        </div>

        <button class="btn btn-secondary" @click="resetFilters">
          重置
        </button>
      </div>
    </div>

    <!-- 题目数据表格 -->
    <div class="card table-card">
      <div class="table-meta">
        <span>共匹配到 <strong>{{ adminStore.activeSubjectList.length }}</strong> 道题目</span>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="70">ID</th>
              <th>题目标题</th>
              <th width="90">题型</th>
              <th width="90">难度</th>
              <th width="80">分值</th>
              <th width="120">分类</th>
              <th width="120">核心标签</th>
              <th width="90">作者</th>
              <th width="90">状态</th>
              <th width="150" style="text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in paginatedSubjects" :key="q.id">
              <td class="cell-id">{{ q.id }}</td>
              <td class="cell-title">
                <div class="title-text" @click="viewDetail(q)">{{ q.title }}</div>
                <div v-if="q.answer" class="title-sub">{{ truncate(q.answer, 50) }}</div>
              </td>
              <td>
                <span class="badge-type" :class="getTypeClass(q.type)">{{ q.type }}</span>
              </td>
              <td>
                <span class="badge-diff" :class="getDiffClass(q.difficulty)">{{ q.difficulty }}</span>
              </td>
              <td class="cell-score">{{ q.score || 5 }} 分</td>
              <td class="cell-cat">{{ q.categoryName || 'Java基础' }}</td>
              <td>
                <span v-for="tag in (q.labelNames || []).slice(0, 1)" :key="tag" class="tag-pill">
                  {{ tag }}
                </span>
              </td>
              <td class="cell-author">{{ q.author || '随风' }}</td>
              <td>
                <span class="status-online">正常</span>
              </td>
              <td style="text-align: right;">
                <button class="btn-action" @click="viewDetail(q)">详情</button>
                <button class="btn-action danger" @click="deleteItem(q.id)">删除</button>
              </td>
            </tr>
            <tr v-if="paginatedSubjects.length === 0">
              <td colspan="10" class="empty-cell">未找到匹配的考题数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页栏 -->
      <div v-if="totalPages > 1" class="pagination-bar">
        <button
          class="btn-page"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button
          class="btn-page"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 录入题目弹窗 -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">录入新考题</h3>
          <button class="modal-close" @click="isModalOpen = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="required">题目标题:</label>
            <input
              v-model="createForm.title"
              type="text"
              class="admin-input"
              placeholder="例如: 详细讲解 Java 中 HashMap 的扩容机制与死循环原因？"
            />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label class="required">考题题型:</label>
              <select v-model.number="createForm.typeCode" class="admin-select" @change="handleTypeChange">
                <option :value="1">单选题</option>
                <option :value="2">多选题</option>
                <option :value="3">判断题</option>
                <option :value="4">简答题</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required">难度级别:</label>
              <select v-model.number="createForm.difficultyCode" class="admin-select">
                <option :value="1">简单</option>
                <option :value="2">中等</option>
                <option :value="3">困难</option>
              </select>
            </div>

            <div class="form-group">
              <label class="required">分值:</label>
              <input v-model.number="createForm.score" type="number" class="admin-input" min="1" max="100" />
            </div>

            <div class="form-group">
              <label class="required">归属分类:</label>
              <select v-model.number="createForm.categoryId" class="admin-select">
                <option v-for="c in adminStore.subCategories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 客观题选项配置区 (单选/多选/判断) -->
          <div v-if="createForm.typeCode !== 4" class="options-config-box">
            <div class="options-header">
              <label class="required">选项设置与正确答案勾选:</label>
              <button class="btn-mini" @click="addOption">添加选项</button>
            </div>

            <div class="options-list">
              <div v-for="(opt, idx) in createForm.options" :key="idx" class="option-row">
                <label class="option-check-label">
                  <input
                    :type="createForm.typeCode === 1 ? 'radio' : 'checkbox'"
                    name="correctOption"
                    :checked="opt.isCorrect === 1"
                    @change="toggleOptionCorrect(idx)"
                  />
                  <span>正确答案</span>
                </label>
                <input
                  v-model="opt.optionContent"
                  type="text"
                  class="admin-input flex-1"
                  :placeholder="'选项 ' + String.fromCharCode(65 + idx) + ' 内容'"
                />
                <button class="btn-del-opt" @click="removeOption(idx)">✕</button>
              </div>
            </div>
          </div>

          <!-- 核心标准答案与解析 -->
          <div class="form-group">
            <label class="required">核心解析:</label>
            <textarea
              v-model="createForm.answer"
              class="admin-textarea"
              rows="4"
              placeholder="请输入标准答案、底层架构原理与重点考核维度..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>追问与避坑要点:</label>
            <textarea
              v-model="createForm.parse"
              class="admin-textarea"
              rows="2"
              placeholder="例如: 生产高并发分布式场景下如何调优避坑？"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isModalOpen = false">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitCreate">
            {{ submitting ? '正在提交...' : '确认发布' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 题目详情预览抽屉/弹窗 -->
    <div v-if="detailTarget" class="modal-overlay" @click.self="detailTarget = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">考题详情 (ID: {{ detailTarget.id }})</h3>
          <button class="modal-close" @click="detailTarget = null">✕</button>
        </div>
        <div class="modal-body detail-body">
          <div class="detail-title">{{ detailTarget.title }}</div>
          <div class="detail-tags">
            <span class="badge-type">{{ detailTarget.type }}</span>
            <span class="badge-diff">{{ detailTarget.difficulty }}</span>
            <span class="tag-pill">{{ detailTarget.categoryName }}</span>
            <span class="cell-score">{{ detailTarget.score }} 分</span>
          </div>

          <div v-if="detailTarget.options && detailTarget.options.length > 0" class="detail-options">
            <div class="sub-h">选项列表:</div>
            <div
              v-for="(o, idx) in detailTarget.options"
              :key="idx"
              class="detail-opt-item"
              :class="{ correct: o.isCorrect === 1 }"
            >
              <span class="opt-prefix">{{ String.fromCharCode(65 + idx) }}.</span>
              <span class="opt-text">{{ o.optionContent }}</span>
              <span v-if="o.isCorrect === 1" class="opt-correct-badge">正确选项</span>
            </div>
          </div>

          <div class="sub-h">核心解析:</div>
          <div class="detail-text">{{ detailTarget.answer || '暂无解析' }}</div>

          <div v-if="detailTarget.parse" class="sub-h" style="margin-top: 14px;">追问要点:</div>
          <div v-if="detailTarget.parse" class="detail-text">{{ detailTarget.parse }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="detailTarget = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const isModalOpen = ref(false)
const submitting = ref(false)
const detailTarget = ref(null)

const currentPage = ref(1)
const pageSize = 8

const createForm = ref({
  title: '',
  typeCode: 4, // 简答题默认
  difficultyCode: 2, // 中等
  score: 10,
  categoryId: 101,
  categoryName: 'Java基础',
  labelId: 1,
  labelName: '集合框架',
  answer: '',
  parse: '',
  options: []
})

const paginatedSubjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return adminStore.activeSubjectList.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  return Math.ceil(adminStore.activeSubjectList.length / pageSize) || 1
})

function resetFilters() {
  adminStore.subjectFilter.type = 'all'
  adminStore.subjectFilter.difficulty = 'all'
  adminStore.subjectFilter.keyWord = ''
  currentPage.value = 1
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function getTypeClass(type) {
  if (type === '单选') return 'type-radio'
  if (type === '多选') return 'type-multi'
  if (type === '判断') return 'type-judge'
  return 'type-brief'
}

function getDiffClass(diff) {
  if (diff === '简单') return 'diff-easy'
  if (diff === '困难') return 'diff-hard'
  return 'diff-medium'
}

function openCreateModal() {
  createForm.value = {
    title: '',
    typeCode: 4,
    difficultyCode: 2,
    score: 10,
    categoryId: adminStore.subCategories[0]?.id || 101,
    categoryName: adminStore.subCategories[0]?.name || 'Java基础',
    labelId: adminStore.labels[0]?.id || 1,
    labelName: adminStore.labels[0]?.name || '集合框架',
    answer: '',
    parse: '',
    options: []
  }
  isModalOpen.value = true
}

function handleTypeChange() {
  if (createForm.value.typeCode === 1 || createForm.value.typeCode === 2) {
    if (createForm.value.options.length === 0) {
      createForm.value.options = [
        { optionType: 1, optionContent: '', isCorrect: 1 },
        { optionType: 2, optionContent: '', isCorrect: 0 },
        { optionType: 3, optionContent: '', isCorrect: 0 },
        { optionType: 4, optionContent: '', isCorrect: 0 }
      ]
    }
  } else if (createForm.value.typeCode === 3) {
    createForm.value.options = [
      { optionType: 1, optionContent: '正确', isCorrect: 1 },
      { optionType: 2, optionContent: '错误', isCorrect: 0 }
    ]
  } else {
    createForm.value.options = []
  }
}

function addOption() {
  const nextType = createForm.value.options.length + 1
  createForm.value.options.push({
    optionType: nextType,
    optionContent: '',
    isCorrect: 0
  })
}

function removeOption(idx) {
  createForm.value.options.splice(idx, 1)
}

function toggleOptionCorrect(idx) {
  if (createForm.value.typeCode === 1 || createForm.value.typeCode === 3) {
    createForm.value.options.forEach((o, i) => {
      o.isCorrect = i === idx ? 1 : 0
    })
  } else {
    createForm.value.options[idx].isCorrect = createForm.value.options[idx].isCorrect === 1 ? 0 : 1
  }
}

async function submitCreate() {
  if (!createForm.value.title.trim()) {
    alert('请输入题目标题')
    return
  }
  if (!createForm.value.answer.trim()) {
    alert('请输入核心答案解析')
    return
  }

  submitting.value = true
  try {
    const res = await adminStore.createSubject(createForm.value)
    if (res.success) {
      alert(res.message)
      isModalOpen.value = false
    } else {
      alert(res.message)
    }
  } finally {
    submitting.value = false
  }
}

function viewDetail(q) {
  detailTarget.value = q
}

function deleteItem(id) {
  if (confirm(`确定要从题库中删除考题 #${id} 吗？`)) {
    adminStore.removeSubject(id)
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.page-desc {
  font-size: 13px;
  color: #64748b;
}

.filter-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

.search-box {
  flex: 1;
  min-width: 240px;
}

.admin-input,
.admin-select,
.admin-textarea {
  font-size: 13px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s;
}

.admin-input:focus,
.admin-select:focus,
.admin-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.table-card {
  overflow: hidden;
}

.table-meta {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #64748b;
}

.source-tag {
  font-size: 11px;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  color: #475569;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.admin-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

.admin-table tr:hover {
  background: #f8fafc;
}

.cell-id {
  font-family: monospace;
  color: #64748b;
  font-weight: 600;
}

.cell-title {
  max-width: 320px;
}

.title-text {
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: color 0.2s;
}

.title-text:hover {
  color: #2563eb;
}

.title-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.badge-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.type-radio { background: #eff6ff; color: #1d4ed8; }
.type-multi { background: #faf5ff; color: #7e22ce; }
.type-judge { background: #fef3c7; color: #b45309; }
.type-brief { background: #f0fdf4; color: #15803d; }

.badge-diff {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.diff-easy { background: #ecfdf5; color: #047857; }
.diff-medium { background: #fff7ed; color: #c2410c; }
.diff-hard { background: #fef2f2; color: #b91c1c; }

.cell-score {
  font-weight: 600;
  color: #0f172a;
}

.tag-pill {
  font-size: 11px;
  background: #f1f5f9;
  color: #334155;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-online {
  font-size: 11px;
  color: #10b981;
  font-weight: 600;
}

.btn-action {
  background: transparent;
  border: none;
  font-size: 12px;
  color: #2563eb;
  cursor: pointer;
  padding: 4px 6px;
}

.btn-action.danger {
  color: #ef4444;
}

.btn-action:hover {
  text-decoration: underline;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #f1f5f9;
}

.btn-page {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 12px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: #64748b;
}

/* 弹窗通用样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.form-group label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.options-config-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
}

.options-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.options-header label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-check-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #059669;
  cursor: pointer;
  white-space: nowrap;
}

.btn-del-opt {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
}

.detail-body {
  gap: 12px;
}

.detail-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.detail-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sub-h {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-top: 8px;
}

.detail-text {
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
}

.detail-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-opt-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.detail-opt-item.correct {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.opt-prefix {
  font-weight: 600;
}

.opt-correct-badge {
  font-size: 11px;
  color: #059669;
  font-weight: 600;
  margin-left: auto;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary { background: #2563eb; color: #ffffff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #e2e8f0; }

.btn-mini {
  padding: 4px 8px;
  font-size: 11px;
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
