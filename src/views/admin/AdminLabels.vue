<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">标签管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal">
          新增考点标签
        </button>
      </div>
    </div>

    <!-- 标签卡片列表 -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">考点标签列表</h3>
        <span class="count-badge">共 {{ adminStore.labels.length }} 个标签</span>
      </div>

      <div class="labels-grid">
        <div v-for="lbl in adminStore.labels" :key="lbl.id" class="label-badge-item">
          <div class="lbl-main">
            <span class="lbl-name">{{ lbl.name }}</span>
            <span class="lbl-cat">{{ lbl.categoryName || 'Java基础' }}</span>
          </div>
          <button class="lbl-del" @click="deleteLabel(lbl.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- 新增标签弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">新增考点标签</h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required">标签名称:</label>
            <input
              v-model="labelForm.name"
              type="text"
              class="admin-input"
              placeholder="例如: 线程池底层原理、CAS与Atomic"
            />
          </div>

          <div class="form-group">
            <label class="required">所属二级技术分类:</label>
            <select v-model.number="labelForm.categoryId" class="admin-select">
              <option v-for="c in adminStore.subCategories" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>排序权重 (数字越小越靠前):</label>
            <input v-model.number="labelForm.sortNum" type="number" class="admin-input" min="1" max="99" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitLabel">
            {{ submitting ? '保存中...' : '确认创建' }}
          </button>
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
const submitting = ref(false)

const labelForm = ref({
  name: '',
  categoryId: 101,
  sortNum: 1
})

function openModal() {
  labelForm.value = {
    name: '',
    categoryId: adminStore.subCategories[0]?.id || 101,
    sortNum: 1
  }
  showModal.value = true
}

async function submitLabel() {
  if (!labelForm.value.name.trim()) {
    alert('请输入标签名称')
    return
  }

  submitting.value = true
  try {
    await adminStore.createLabel(labelForm.value)
    showModal.value = false
  } finally {
    submitting.value = false
  }
}

async function deleteLabel(id) {
  if (confirm(`确定要删除此标签吗？`)) {
    await adminStore.removeLabel(id)
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
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.count-badge {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.label-badge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.label-badge-item:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.lbl-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lbl-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.lbl-cat {
  font-size: 11px;
  color: #64748b;
}

.lbl-del {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}

.lbl-del:hover {
  color: #ef4444;
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
