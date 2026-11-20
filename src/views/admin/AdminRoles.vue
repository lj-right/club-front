<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">角色管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">
          新增角色
        </button>
      </div>
    </div>

    <!-- 角色列表卡片网格 -->
    <div class="roles-grid">
      <div v-for="role in adminStore.roles" :key="role.id" class="card role-card">
        <div class="role-header">
          <div class="role-name-box">
            <span class="role-title">{{ role.roleName }}</span>
            <code class="role-key">{{ role.roleKey }}</code>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge-users">{{ role.userCount || 1 }} 位成员</span>
            <button v-if="role.roleKey !== 'super_user'" class="btn-role-action" title="编辑角色" @click="openEditModal(role)">✎</button>
            <button v-if="role.roleKey !== 'super_user'" class="btn-role-action danger" title="删除角色" @click="deleteRole(role.id, role.roleName)">✕</button>
          </div>
        </div>

        <p class="role-desc">{{ role.description }}</p>

        <div class="role-perms-box">
          <div class="perms-label">接口权限 ({{ role.permissions.length }} 项):</div>
          <div class="perms-pills">
            <span v-for="p in role.permissions" :key="p" class="perm-pill">
              {{ p }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 全系统 15 项接口权限清单 -->
    <div class="card perms-card">
      <div class="card-header">
        <h3 class="card-title">接口鉴权矩阵清单</h3>
        <span class="count-badge">已注册 15 项权限策略</span>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="70">ID</th>
              <th>权限名称</th>
              <th>权限标识</th>
              <th>所属模块</th>
              <th>网关拦截路由</th>
              <th>超管预设</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in adminStore.allPermissionsList" :key="p.id">
              <td class="cell-id">{{ p.id }}</td>
              <td class="cell-name">{{ p.name }}</td>
              <td><code class="code-pill">{{ p.permissionKey }}</code></td>
              <td><span class="module-tag">{{ p.module }}</span></td>
              <td class="cell-route">
                <code>{{ getRouteForPerm(p.permissionKey) }}</code>
              </td>
              <td><span class="status-yes">全权放行</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增角色弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">新增系统角色</h3>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="required">角色名称:</label>
            <input v-model="newRole.roleName" type="text" class="admin-input" placeholder="例如: 考官评审组" />
          </div>
          <div class="form-group">
            <label class="required">角色标识 Key (英文唯一):</label>
            <input v-model="newRole.roleKey" type="text" class="admin-input" placeholder="例如: exam_reviewer" />
          </div>
          <div class="form-group">
            <label>角色描述:</label>
            <input v-model="newRole.description" type="text" class="admin-input" placeholder="描述此角色职责..." />
          </div>
          <div class="form-group">
            <label>分配接口权限:</label>
            <div class="perms-check-grid">
              <label v-for="p in adminStore.allPermissionsList" :key="p.id" class="check-item">
                <input
                  type="checkbox"
                  :checked="newRole.permissions.includes(p.permissionKey)"
                  @change="togglePerm(p.permissionKey)"
                />
                <span>{{ p.name }} ({{ p.permissionKey }})</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="submitNewRole">确认新增角色</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()
const showAddModal = ref(false)
const editingRoleId = ref(null)

onMounted(async () => {
  await adminStore.fetchUserPermissions('admin')
})

const newRole = ref({
  roleName: '',
  roleKey: '',
  description: '',
  permissions: ['subject:query', 'subject:detail']
})

function openCreateModal() {
  editingRoleId.value = null
  newRole.value = {
    roleName: '',
    roleKey: '',
    description: '',
    permissions: ['subject:query', 'subject:detail']
  }
  showAddModal.value = true
}

function openEditModal(role) {
  editingRoleId.value = role.id
  newRole.value = {
    roleName: role.roleName,
    roleKey: role.roleKey,
    description: role.description || '',
    permissions: role.permissions || ['subject:query']
  }
  showAddModal.value = true
}

async function deleteRole(id, name) {
  if (confirm(`确定要删除系统角色 [${name}] 吗？`)) {
    await adminStore.removeRole(id)
  }
}

function getRouteForPerm(key) {
  if (key === 'subject:add') return '/subject/subject/add'
  if (key.startsWith('subject')) return '/subject/**'
  if (key.startsWith('practice')) return '/practice/**'
  if (key.startsWith('interview')) return '/interview/**'
  if (key.startsWith('circle')) return '/circle/**'
  if (key.startsWith('auth')) return '/auth/**'
  return '/*'
}

function togglePerm(key) {
  const idx = newRole.value.permissions.indexOf(key)
  if (idx > -1) {
    newRole.value.permissions.splice(idx, 1)
  } else {
    newRole.value.permissions.push(key)
  }
}

async function submitNewRole() {
  if (!newRole.value.roleName.trim() || !newRole.value.roleKey.trim()) {
    alert('请填写角色名称和角色Key')
    return
  }

  if (editingRoleId.value) {
    await adminStore.editRole({
      id: editingRoleId.value,
      roleName: newRole.value.roleName.trim(),
      roleKey: newRole.value.roleKey.trim()
    })
  } else {
    await adminStore.createRole(newRole.value)
  }
  showAddModal.value = false
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px;
}

.role-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.role-name-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.role-key {
  font-size: 11px;
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #475569;
}

.badge-users {
  font-size: 11px;
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.btn-role-action {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
}

.btn-role-action:hover {
  color: #2563eb;
}

.btn-role-action.danger:hover {
  color: #ef4444;
}

.role-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.perms-label {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.perms-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.perm-pill {
  font-size: 10px;
  font-family: monospace;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
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
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.code-pill {
  font-size: 12px;
  font-family: monospace;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #0f172a;
}

.module-tag {
  font-size: 11px;
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-yes {
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
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
  max-width: 580px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
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

.admin-input {
  font-size: 13px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

.perms-check-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  background: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}
</style>
