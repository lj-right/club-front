<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">敏感词管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showModal = true">
          添加敏感词
        </button>
      </div>
    </div>

    <!-- 敏感词与风控状态 -->
    <div class="card table-card">
      <div class="table-meta">
        <span>当前敏感词库: <strong>{{ adminStore.sensitiveWords.length }}</strong> 条</span>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="70">ID</th>
              <th>敏感词内容</th>
              <th width="120">违规类型</th>
              <th width="100">过滤策略</th>
              <th width="140">创建时间</th>
              <th width="120" style="text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in adminStore.sensitiveWords" :key="w.id">
              <td class="cell-id">{{ w.id }}</td>
              <td class="cell-word">
                <span class="word-badge">{{ w.words }}</span>
              </td>
              <td>
                <span class="type-tag" :class="w.type === 1 ? 'type-block' : 'type-warn'">
                  {{ w.type === 1 ? '违禁敏感词' : '广告引流词' }}
                </span>
              </td>
              <td>
                <span class="status-shield">拦截替换</span>
              </td>
              <td class="cell-time">{{ w.createdTime }}</td>
              <td style="text-align: right;">
                <button class="btn-action danger" @click="deleteWord(w.id, w.words)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 敏感词测试沙盒 -->
    <div class="card test-card">
      <h3 class="card-title" style="margin-bottom: 12px;">实时合规检测</h3>
      <div class="test-row">
        <input
          v-model="testText"
          type="text"
          class="admin-input flex-1"
          placeholder="在此输入一段文本进行违规检测..."
        />
        <button class="btn btn-secondary" @click="runCheck">开始检测</button>
      </div>
      <div v-if="checkResult" class="check-result" :class="{ hit: checkResult.hasHit }">
        {{ checkResult.message }}
      </div>
    </div>

    <!-- 添加敏感词弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">添加敏感词</h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required">敏感词文本:</label>
            <input v-model="newWord" type="text" class="admin-input" placeholder="输入要屏蔽或过滤的关键词..." />
          </div>
          <div class="form-group">
            <label class="required">违规类别:</label>
            <select v-model.number="wordType" class="admin-select">
              <option :value="1">违禁内容 (涉黄赌毒/代考/外挂)</option>
              <option :value="2">营销引流 (微信群/广告链接/刷赞)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="submitWord">确认录入词库</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const showModal = ref(false)
const newWord = ref('')
const wordType = ref(1)

const testText = ref('')
const checkResult = ref(null)

async function submitWord() {
  if (!newWord.value.trim()) {
    alert('请输入敏感词')
    return
  }

  await adminStore.createSensitiveWord(newWord.value.trim(), wordType.value)
  newWord.value = ''
  showModal.value = false
}

async function deleteWord(id, text) {
  if (confirm(`确定要从词库中移除敏感词 [${text}] 吗？`)) {
    await adminStore.removeSensitiveWord(id)
  }
}

function runCheck() {
  if (!testText.value.trim()) return
  const hit = adminStore.sensitiveWords.find((w) => testText.value.includes(w.words))
  if (hit) {
    checkResult.value = {
      hasHit: true,
      message: `检测到违规词汇: [${hit.words}]，发布时将被自动拦截。`
    }
  } else {
    checkResult.value = {
      hasHit: false,
      message: '未检测到违禁词汇，内容合规，允许发布。'
    }
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

.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
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
}

.word-badge {
  font-weight: 600;
  color: #dc2626;
  background: #fef2f2;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.type-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.type-block {
  background: #fee2e2;
  color: #b91c1c;
}

.type-warn {
  background: #fef3c7;
  color: #b45309;
}

.status-shield {
  font-size: 12px;
  color: #475569;
}

.cell-time {
  font-size: 12px;
  color: #64748b;
}

.btn-action.danger {
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.btn-action.danger:hover {
  text-decoration: underline;
}

.test-card {
  padding: 20px;
}

.test-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.check-result {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.check-result.hit {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
.btn-primary:hover { background: #dbeafe; border-color: #93c5fd; color: #2563eb; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #e2e8f0; }

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
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 15px;
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  padding: 14px 20px;
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

.admin-input, .admin-select {
  font-size: 13px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}
</style>
