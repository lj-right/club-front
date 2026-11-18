<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">用户管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="adminStore.fetchUsers()">
          刷新列表
        </button>
      </div>
    </div>

    <!-- 用户数据表格卡片 -->
    <div class="card table-card">
      <div class="table-meta">
        <span>全站注册学员共 <strong>{{ adminStore.users.length }}</strong> 人</span>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th width="70">ID</th>
              <th>用户名 / 账号</th>
              <th>昵称</th>
              <th>邮箱 / 联系电话</th>
              <th>系统角色</th>
              <th>账号状态</th>
              <th>注册时间</th>
              <th width="140" style="text-align: right;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in adminStore.users" :key="u.id">
              <td class="cell-id">{{ u.id }}</td>
              <td class="cell-username">
                <span class="username-text">{{ u.userName }}</span>
              </td>
              <td class="cell-nickname">{{ u.nickName }}</td>
              <td class="cell-contact">{{ u.email }}</td>
              <td>
                <span class="badge-role" :class="u.roleKey">{{ u.roleName }}</span>
              </td>
              <td>
                <span :class="u.status === 0 ? 'status-active' : 'status-frozen'">
                  {{ u.status === 0 ? '正常' : '冻结' }}
                </span>
              </td>
              <td class="cell-time">{{ u.createdTime }}</td>
              <td style="text-align: right;">
                <button
                  v-if="u.userName !== 'admin'"
                  class="btn-action"
                  :class="{ danger: u.status === 0 }"
                  @click="toggleStatus(u.id, u.userName, u.status)"
                >
                  {{ u.status === 0 ? '冻结账号' : '解冻恢复' }}
                </button>
                <span v-else class="text-disabled">保护账号</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

async function toggleStatus(userId, userName, currentStatus) {
  const actionText = currentStatus === 0 ? '冻结' : '解冻'
  if (confirm(`确定要${actionText}用户 [${userName}] 的账号吗？`)) {
    await adminStore.toggleUserStatus(userId)
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

.cell-id {
  font-family: monospace;
  color: #64748b;
  font-weight: 600;
}

.cell-username {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-super {
  font-size: 10px;
  background: #eff6ff;
  color: #2563eb;
  padding: 1px 6px;
  border-radius: 10px;
}

.cell-nickname {
  color: #334155;
}

.cell-contact {
  font-family: monospace;
  color: #64748b;
  font-size: 12px;
}

.badge-role {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-role.super_user {
  background: #ede9fe;
  color: #6d28d9;
}

.badge-role.normal_user {
  background: #f1f5f9;
  color: #475569;
}

.badge-role.vip_user {
  background: #fef3c7;
  color: #b45309;
}

.status-active {
  color: #10b981;
  font-weight: 600;
  font-size: 12px;
}

.status-frozen {
  color: #ef4444;
  font-weight: 600;
  font-size: 12px;
}

.cell-time {
  font-size: 12px;
  color: #64748b;
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

.text-disabled {
  font-size: 12px;
  color: #94a3b8;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #e2e8f0; }
</style>
