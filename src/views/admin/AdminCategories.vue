<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">分类管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openModal(1)">新增一级分类</button>
        <button class="btn btn-secondary" @click="openModal(2)">新增二级分类</button>
      </div>
    </div>

    <!-- 分类双栏布局 -->
    <div class="categories-grid">
      <!-- 左栏：一级技术大类 -->
      <div class="card cat-card">
        <div class="card-header">
          <h3 class="card-title">一级分类</h3>
          <span class="count-badge">{{ adminStore.primaryCategories.length }} 个</span>
        </div>
        <div class="cat-list">
          <div
            v-for="cat in adminStore.primaryCategories"
            :key="cat.id"
            class="cat-item"
            :class="{ active: selectedPrimaryId === cat.id }"
            @click="selectedPrimaryId = cat.id"
          >
            <div class="cat-info">
              <div>
                <div class="cat-name">{{ cat.name }}</div>
                <div class="cat-sub">ID: {{ cat.id }}</div>
              </div>
            </div>
            <div class="cat-actions" @click.stop>
              <button class="btn-del" @click="deleteCat(cat.id, 1)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏：对应技术栈二级专项分类 -->
      <div class="card cat-card">
        <div class="card-header">
          <h3 class="card-title">二级分类</h3>
          <span class="count-badge">{{ adminStore.subCategories.length }} 个</span>
        </div>
        <div class="cat-list">
          <div
            v-for="sub in adminStore.subCategories"
            :key="sub.id"
            class="cat-item sub-item"
          >
            <div class="cat-info">
              <div>
                <div class="cat-name">{{ sub.name }}</div>
                <div class="cat-sub">ID: {{ sub.id }}</div>
              </div>
            </div>
            <div class="cat-actions">
              <span class="badge-count">{{ sub.count || 120 }} 题</span>
              <button class="btn-del" @click="deleteCat(sub.id, 2)">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增分类弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ modalType === 1 ? '新增一级技术大类' : '新增二级技术专项' }}
          </h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required">分类名称:</label>
            <input
              v-model="catForm.name"
              type="text"
              class="admin-input"
              :placeholder="modalType === 1 ? '例如: 云原生与DevOps' : '例如: Kafka与消息中间件'"
            />
          </div>

          <div v-if="modalType === 2" class="form-group">
            <label class="required">所属一级大类:</label>
            <select v-model.number="catForm.parentId" class="admin-select">
              <option v-for="p in adminStore.primaryCategories" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">取消</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitCat">
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

const selectedPrimaryId = ref(1)
const showModal = ref(false)
const modalType = ref(1) // 1: 一级, 2: 二级
const submitting = ref(false)

const catForm = ref({
  name: '',
  parentId: 1
})

function openModal(type) {
  modalType.value = type
  catForm.value = {
    name: '',
    parentId: selectedPrimaryId.value || 1
  }
  showModal.value = true
}

async function submitCat() {
  if (!catForm.value.name.trim()) {
    alert('请输入分类名称')
    return
  }

  submitting.value = true
  try {
    await adminStore.createCategory({
      name: catForm.value.name.trim(),
      type: modalType.value,
      parentId: modalType.value === 1 ? 0 : catForm.value.parentId
    })
    showModal.value = false
  } finally {
    submitting.value = false
  }
}

async function deleteCat(id, type) {
  if (confirm(`确定要删除此分类吗？`)) {
    await adminStore.removeCategory(id, type)
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

.categories-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  margin-bottom: 16px;
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

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-item:hover,
.cat-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cat-icon {
  font-size: 18px;
}

.cat-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.cat-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.cat-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-count {
  font-size: 11px;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
}

.btn-del {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}

.btn-del:hover {
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
