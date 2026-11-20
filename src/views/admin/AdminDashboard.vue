<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">系统管理</h2>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="$emit('switch-tab', 'subjects')">
          发布新题目
        </button>
      </div>
    </div>

    <!-- 顶部核心数据指标卡片 (纯净数值无多余图标与描述) -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">题库资源总量</span>
          <div class="stat-value">{{ adminStore.stats.totalSubjects }} <span class="stat-unit">道</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">分类与考点标签</span>
          <div class="stat-value">{{ totalCatCount }} <span class="stat-unit">类 / {{ totalLabelCount }} 标签</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">注册学员总数</span>
          <div class="stat-value">{{ adminStore.users.length }} <span class="stat-unit">人</span></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">累计在线模考人次</span>
          <div class="stat-value">{{ adminStore.stats.practiceRuns }} <span class="stat-unit">次</span></div>
        </div>
      </div>
    </div>

    <!-- 中间：微服务节点状态与鉴权信息 -->
    <div class="dashboard-grid">
      <!-- 微服务集群状态 -->
      <div class="card service-status-card">
        <div class="card-title-box">
          <h3 class="card-title">后端微服务集群健康状态</h3>
          <span class="badge-status healthy">正常运行</span>
        </div>
        <div class="service-list">
          <div v-for="srv in services" :key="srv.name" class="service-item">
            <div class="service-left">
              <div class="service-name">{{ srv.name }}</div>
            </div>
            <div class="service-right">
              <span class="service-port">端口: {{ srv.port }}</span>
              <span class="service-tag">{{ srv.tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前管理员鉴权凭证 -->
      <div class="card auth-info-card">
        <div class="card-title-box">
          <h3 class="card-title">当前管理员鉴权凭证</h3>
          <span class="badge-role">超级管理员</span>
        </div>
        <div class="auth-details">
          <div class="auth-row">
            <span class="auth-key">当前登录账号:</span>
            <span class="auth-val bold">admin (ID: 1)</span>
          </div>
          <div class="auth-row">
            <span class="auth-key">关联角色标识:</span>
            <span class="auth-val"><code class="code-badge">super_user</code></span>
          </div>
          <div class="auth-row">
            <span class="auth-key">网关访问路径:</span>
            <span class="auth-val"><code class="code-badge">http://localhost:5000/</code></span>
          </div>
          <div class="auth-row">
            <span class="auth-key">Sa-Token 凭据:</span>
            <span class="auth-val token-text" :title="adminStore.adminToken">
              {{ maskedToken }}
            </span>
          </div>
        </div>

        <div class="permission-pills-box">
          <div class="sub-heading">已生效微服务权限策略 (15项):</div>
          <div class="pills-wrap">
            <span v-for="p in adminStore.allPermissionsList" :key="p.id" class="perm-pill">
              {{ p.permissionKey }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'

defineEmits(['switch-tab'])
const adminStore = useAdminStore()

const services = [
  { name: 'sf-club-gateway', port: '5000', tag: 'Gateway' },
  { name: 'sf-club-subject', port: '3010', tag: 'Subject' },
  { name: 'sf-club-auth', port: '3011', tag: 'Auth' },
  { name: 'sf-club-practice', port: '3013', tag: 'Practice' },
  { name: 'sf-club-circle', port: '3014', tag: 'Circle' },
  { name: 'sf-club-interview', port: '3015', tag: 'Interview' },
  { name: 'sf-club-oss', port: '4000', tag: 'MinIO' }
]

const totalCatCount = computed(() => {
  const sum = adminStore.primaryCategories.length + adminStore.subCategories.length
  return sum > 0 ? sum : 24
})

const totalLabelCount = computed(() => {
  return adminStore.labels.length > 0 ? adminStore.labels.length : 86
})

const maskedToken = computed(() => {
  const tok = adminStore.adminToken || ''
  if (!tok) return '未持有 Token'
  if (tok.length <= 16) return tok
  return tok.slice(0, 8) + '...' + tok.slice(-8)
})
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
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.stat-unit {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.card-title-box {
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

.badge-status.healthy {
  font-size: 11px;
  padding: 3px 8px;
  background: #dcfce7;
  color: #166534;
  border-radius: 4px;
  font-weight: 600;
}

.badge-role {
  font-size: 11px;
  padding: 3px 8px;
  background: #ede9fe;
  color: #6d28d9;
  border-radius: 4px;
  font-weight: 600;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.service-left {
  display: flex;
  align-items: center;
}

.service-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.service-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-port {
  font-size: 12px;
  font-family: monospace;
  color: #475569;
}

.service-tag {
  font-size: 11px;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
}

.auth-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.auth-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.auth-key {
  color: #64748b;
}

.auth-val {
  color: #0f172a;
}

.auth-val.bold {
  font-weight: 600;
}

.token-text {
  font-family: monospace;
  color: #2563eb;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.code-badge {
  font-family: monospace;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.permission-pills-box .sub-heading {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

.pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perm-pill {
  font-size: 11px;
  font-family: monospace;
  background: #f1f5f9;
  color: #334155;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.btn-primary:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #2563eb;
}
</style>
