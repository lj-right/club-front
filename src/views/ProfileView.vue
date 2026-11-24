<template>
  <div class="view-container">
    <!-- 用户个人名片卡 -->
    <div class="profile-header-card">
      <div class="profile-main-info">
        <div class="profile-avatar-wrap" @click="triggerAvatarUpload" title="点击上传/更换头像" style="cursor: pointer; position: relative;">
          <img :src="authStore.avatar" class="profile-avatar" @error="handleAvatarError" />
          <div class="avatar-hover-tip">更换头像</div>
          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            style="display: none;"
            @change="handleAvatarFileChange"
          />
        </div>
        <div class="profile-text">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <h2 class="profile-name">{{ authStore.nickname }}</h2>
            <span class="pro-badge">PRO 黄金会员</span>
            <span class="tag-level">Lv.5 架构求索者</span>
          </div>
          <p class="profile-bio">{{ authStore.userInfo?.introduce || '全栈架构师，sf-club 核心创作者' }}</p>
          <div class="profile-meta">
            <span>邮箱: {{ authStore.userInfo?.email || 'suifeng@sfclub.com' }}</span>
            <span>•</span>
            <span>手机: {{ authStore.userInfo?.phone || '未填写' }}</span>
            <template v-if="githubLink">
              <span>•</span>
              <a :href="githubLink" target="_blank" rel="noopener noreferrer" class="github-link">GitHub: {{ githubLink }}</a>
            </template>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-secondary" @click="openEditTab">
          编辑个人资料
        </button>
      </div>
    </div>

    <!-- 学习数据大盘统计 -->
    <div class="stats-overview-grid">
      <div class="stat-box">
        <div class="stat-val" style="color: var(--primary);">{{ authStore.streakDays }} 天</div>
        <div class="stat-label">连续打卡战绩</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color: var(--success);">{{ masteredCount }} 道</div>
        <div class="stat-label">已完全掌握题目</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color: #faad14;">{{ likedCount }} 道</div>
        <div class="stat-label">重点收藏题集</div>
      </div>
      <div class="stat-box">
        <div class="stat-val" style="color: #6366f1;">{{ maxExamScore !== null ? maxExamScore + ' 分' : '-' }}</div>
        <div class="stat-label">全真模考最高分</div>
      </div>
    </div>

    <!-- 选项卡切换区 -->
    <div class="profile-tabs-card">
      <div class="profile-tabs-nav">
        <div
          class="p-tab"
          :class="{ active: activeTab === 'mastered' }"
          @click="activeTab = 'mastered'"
        >
          已掌握与收藏题集 ({{ masteredCount }})
        </div>
        <div
          class="p-tab"
          :class="{ active: activeTab === 'records' }"
          @click="activeTab = 'records'"
        >
          机考练题记录 ({{ examHistory.length }})
        </div>
        <div
          class="p-tab"
          :class="{ active: activeTab === 'edit' }"
          @click="openEditTab"
        >
          账号与资料设置
        </div>
      </div>

      <!-- 内容区 1：已掌握与收藏 -->
      <div v-if="activeTab === 'mastered'" class="tab-content">
        <div class="mastered-grid">
          <div
            v-for="q in masteredList"
            :key="q.id"
            class="master-card"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="badge" :class="q.difficulty || 'medium'">
                {{ q.difficulty === 'easy' ? '简单' : q.difficulty === 'hard' ? '困难' : '中等' }}
              </span>
              <span style="font-size: 11px; color: var(--success); font-weight: 600;">已掌握</span>
            </div>
            <h4 class="master-q-title">{{ q.title }}</h4>

            <!-- 核心解析区：就地直接展开/收起 -->
            <div v-if="revealedMastered.has(q.id) && (q.summary || q.answer)" class="master-answer-preview">
              <p>{{ q.summary || q.answer }}</p>
              <div class="collapse-row">
                <span class="collapse-btn" @click.stop="toggleMasterAnswer(q.id)">收起答案</span>
              </div>
            </div>
            <div v-else class="master-recite-bar" @click.stop="toggleMasterAnswer(q.id)">
              <span>点击查看答案</span>
            </div>

            <div class="master-card-footer">
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <span v-for="tag in q.labels || []" :key="tag" class="category-pill">{{ tag }}</span>
              </div>
              <span class="master-views">{{ q.views != null ? q.views : 0 }} 次研读</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区 2：练题记录 -->
      <div v-else-if="activeTab === 'records'" class="tab-content">
        <div class="exam-history-table">
          <div class="table-header">
            <span>试卷名称</span>
            <span>完成时间</span>
            <span>答题用时</span>
            <span>综合得分</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          <div
            v-if="!examHistory || examHistory.length === 0"
            style="padding: 36px 20px; text-align: center; color: var(--text-secondary); font-size: 13px;"
          >
            暂无机考练题记录
          </div>
          <div
            v-for="rec in examHistory"
            :key="rec.id"
            class="table-row"
          >
            <span style="font-weight: 600; color: var(--text-main);">{{ rec.title }}</span>
            <span style="color: var(--text-muted);">{{ rec.date }}</span>
            <span style="color: var(--text-secondary);">{{ rec.timeSpent || rec.time }}</span>
            <span style="font-weight: 800; font-family: var(--font-mono); color: var(--primary);">
              {{ rec.score }} 分
            </span>
            <span class="badge" :class="rec.score >= 60 ? 'easy' : 'hard'">
              {{ rec.score >= 60 ? '合格通过' : '未达标' }}
            </span>
            <span>
              <button
                class="btn-delete-rec"
                title="删除此条记录"
                @click="deleteRecord(rec)"
              >
                删除
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- 内容区 3：资料编辑 -->
      <div v-else-if="activeTab === 'edit'" class="tab-content">
        <div class="edit-form-card">
          <div class="form-row">
            <label class="form-label">登录账号 (系统唯一标识，只读):</label>
            <input :value="authStore.userInfo?.userName || 'suifeng'" type="text" class="form-input form-input-disabled" disabled />
          </div>
          <div class="form-row">
            <label class="form-label">用户昵称:</label>
            <input v-model="editNickname" type="text" class="form-input" placeholder="请输入你的技术昵称" />
          </div>
          <div class="form-row">
            <label class="form-label">个性签名 / 求职意向:</label>
            <input v-model="editBio" type="text" class="form-input" placeholder="例如：全栈架构师，聚焦分布式高并发" />
          </div>
          <div class="form-row">
            <label class="form-label">联系邮箱:</label>
            <input v-model="editEmail" type="email" class="form-input" placeholder="suifeng@sfclub.com" />
          </div>
          <div class="form-row">
            <label class="form-label">手机号码:</label>
            <input v-model="editPhone" type="text" class="form-input" placeholder="请输入手机号码" />
          </div>
          <div class="form-row">
            <label class="form-label">GitHub / 个人主页链接:</label>
            <input v-model="editGithub" type="text" class="form-input" placeholder="https://github.com/..." />
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <button class="btn btn-primary" :disabled="saving" @click="handleSaveProfile">
              {{ saving ? '保存中...' : '保存修改并同步后端' }}
            </button>
          </div>
          <div v-if="saveTip" :class="['save-tip', saveSuccess ? 'save-tip-success' : 'save-tip-error']">
            {{ saveTip }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSubjectStore } from '@/stores/subject'
import { usePracticeStore } from '@/stores/practice'
import defaultAvatarImg from '@/assets/default_avatar.jpg'

function handleAvatarError(e) {
  if (e?.target) {
    e.target.onerror = null
    e.target.src = defaultAvatarImg
  }
}

const authStore = useAuthStore()
const subjectStore = useSubjectStore()
const practiceStore = usePracticeStore()

const activeTab = ref('mastered')

const githubLink = computed(() => {
  if (authStore.userInfo?.extJson) {
    try {
      const ext = JSON.parse(authStore.userInfo.extJson)
      if (ext.github) return ext.github
    } catch (_) {}
  }
  return 'https://github.com/jingdiansuifeng'
})

const masteredList = computed(() => {
  return subjectStore.questions.filter((q) => q.mastered || q.liked)
})

const revealedMastered = ref(new Set())

function toggleMasterAnswer(id) {
  const next = new Set(revealedMastered.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  revealedMastered.value = next
}

const masteredCount = computed(() => {
  return subjectStore.questions.filter((q) => q.mastered).length
})

const likedCount = computed(() => {
  return subjectStore.questions.filter((q) => q.liked).length
})

const examHistory = computed(() => {
  return practiceStore.examHistory || []
})

const maxExamScore = computed(() => {
  if (!examHistory.value || examHistory.value.length === 0) return null
  const scores = examHistory.value.map((r) => Number(r.score) || 0)
  return Math.max(...scores)
})

async function deleteRecord(rec) {
  if (confirm(`确定要删除「${rec.title}」的模考记录吗？`)) {
    await practiceStore.deleteHistoryItem(rec.id || rec.practiceId)
  }
}

const editNickname = ref('')
const editBio = ref('')
const editEmail = ref('')
const editPhone = ref('')
const editGithub = ref('')
const saving = ref(false)
const saveTip = ref('')
const saveSuccess = ref(true)

function syncFormWithStore() {
  editNickname.value = authStore.nickname || ''
  editBio.value = authStore.userInfo?.introduce || ''
  editEmail.value = authStore.userInfo?.email || ''
  editPhone.value = authStore.userInfo?.phone || ''
  let gh = 'https://github.com/jingdiansuifeng'
  if (authStore.userInfo?.extJson) {
    try {
      const ext = JSON.parse(authStore.userInfo.extJson)
      if (ext.github) gh = ext.github
    } catch (_) {}
  }
  editGithub.value = gh
}

watch(
  () => authStore.userInfo,
  () => {
    syncFormWithStore()
  },
  { immediate: true, deep: true }
)

function openEditTab() {
  syncFormWithStore()
  saveTip.value = ''
  activeTab.value = 'edit'
}

onMounted(async () => {
  const currentUserName = authStore.userInfo?.userName || 'suifeng'
  await authStore.loadUserInfo(currentUserName)
  syncFormWithStore()
  await practiceStore.loadExamHistory()
})

const avatarInputRef = ref(null)
const uploadingAvatar = ref(false)

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function handleAvatarFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    await authStore.uploadAvatar(file)
    saveSuccess.value = true
    saveTip.value = '头像已成功上传至 MinIO 并同步更新！'
  } catch (err) {
    saveSuccess.value = false
    saveTip.value = '头像上传失败：' + (err.message || '网络异常')
  } finally {
    uploadingAvatar.value = false
    e.target.value = ''
  }
}

async function handleSaveProfile() {
  if (!editNickname.value.trim()) {
    saveSuccess.value = false
    saveTip.value = '用户昵称不能为空！'
    return
  }
  saving.value = true
  saveTip.value = ''
  try {
    const extObj = {}
    if (editGithub.value.trim()) {
      extObj.github = editGithub.value.trim()
    }
    await authStore.updateProfile({
      id: authStore.userInfo?.id,
      userName: authStore.userInfo?.userName || 'suifeng',
      nickName: editNickname.value.trim(),
      introduce: editBio.value.trim(),
      email: editEmail.value.trim(),
      phone: editPhone.value.trim(),
      extJson: JSON.stringify(extObj)
    })
    saveSuccess.value = true
    saveTip.value = '个人信息修改成功，已实时同步至后台数据库！'
  } catch (err) {
    saveSuccess.value = false
    saveTip.value = '保存失败：' + (err.message || '网络异常')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-header-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.profile-main-info {
  display: flex;
  align-items: center;
  gap: 24px;
}
.profile-avatar-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid var(--primary-light);
  overflow: hidden;
  position: relative;
}
.profile-avatar-wrap:hover .avatar-hover-tip {
  opacity: 1;
}
.avatar-hover-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 11px;
  text-align: center;
  padding: 2px 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
}
.pro-badge {
  font-size: 11px;
  background: var(--duck-yellow);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
}
.tag-level {
  font-size: 11px;
  background: var(--primary-light);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.profile-bio {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.profile-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 8px;
}
.github-link {
  color: var(--primary);
}
.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px;
  text-align: center;
}
.stat-val {
  font-size: 24px;
  font-weight: 800;
  font-family: var(--font-mono);
  margin-bottom: 4px;
}
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}
.profile-tabs-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.profile-tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 0 24px;
}
.p-tab {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.p-tab:hover {
  color: var(--text-main);
}
.p-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.tab-content {
  padding: 24px;
}
.mastered-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.master-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.master-card:hover {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-sm);
}
.master-q-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 8px;
}
.master-answer-preview {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--bg-hover);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  border-left: 3px solid var(--primary);
  animation: fadeIn 0.2s ease;
}
.collapse-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}
.collapse-btn {
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  user-select: none;
}
.collapse-btn:hover {
  text-decoration: underline;
}
.master-recite-bar {
  background: #fefce8;
  border: 1px dashed #fde047;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: #ca8a04;
  text-align: center;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.master-recite-bar:hover {
  background: #fef9c3;
  border-color: #eab308;
}
.master-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
}
.master-views {
  color: var(--text-muted);
  font-size: 11px;
}
.exam-history-table {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px;
  padding: 12px 16px;
  background: var(--bg-subtle);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 80px;
  padding: 14px 16px;
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  align-items: center;
}
.btn-delete-rec {
  background: none;
  border: 1px solid #fee2e2;
  color: #ef4444;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-delete-rec:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}
.edit-form-card {
  max-width: 520px;
}
.form-row {
  margin-bottom: 16px;
}
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-regular);
  margin-bottom: 6px;
}
.form-input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
}
.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}
.form-input-disabled {
  background: #f8fafc;
  color: var(--text-muted);
  cursor: not-allowed;
  border-style: dashed;
}
.save-tip {
  margin-top: 14px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  line-height: 1.5;
}
.save-tip-success {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.save-tip-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
</style>
