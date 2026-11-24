<template>
  <div class="view-container">
    <div class="circle-page-wrapper">
      <!-- 左侧：圈子热议 -->
      <aside class="circle-sidebar-left">
        <div class="sidebar-card hot-discussions-card">
          <div class="sidebar-header">
            <h3 class="sidebar-title">
              <span class="hot-flame-icon">🔥</span>
              <span>圈子热议</span>
            </h3>
            <span class="hot-badge-tag">HOT</span>
          </div>

          <!-- 热议动态列表 -->
          <div v-if="hotMoments.length > 0" class="hot-moment-list">
            <div
              v-for="(m, idx) in hotMoments"
              :key="m.id"
              class="hot-moment-item"
              @click="goToDetail(m.id)"
            >
              <div class="hot-moment-top">
                <span
                  class="hot-rank-badge"
                  :class="{ 'rank-1': idx === 0, 'rank-2': idx === 1, 'rank-3': idx === 2 }"
                >
                  {{ idx + 1 }}
                </span>
                <img
                  :src="m.avatar || defaultAvatar"
                  class="hot-avatar"
                  alt="avatar"
                  @error="(e) => handleAvatarError(e, m.author)"
                />
                <span class="hot-author" :title="m.author">{{ m.author }}</span>
                <span class="hot-channel">#{{ m.channelName }}</span>
              </div>
              <p class="hot-content">{{ m.content }}</p>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="hot-empty">
            <span class="hot-empty-text">暂无热议动态</span>
          </div>
        </div>
      </aside>

      <!-- 动态流主体 -->
      <div class="circle-main">
        <!-- 频道导航栏与发帖操作 -->
        <div class="circle-header-bar">
          <div class="channel-tabs">
            <div
              v-for="ch in circleStore.channels"
              :key="ch.id"
              class="ch-tab"
              :class="{ active: circleStore.currentChannel === ch.id }"
              @click="circleStore.switchChannel(ch.id)"
            >
              {{ ch.name }}
            </div>
          </div>
          <button class="btn btn-primary publish-trigger-btn" @click="circleStore.openMomentModal">
            发表圈子动态
          </button>
        </div>

        <!-- 动态流列表 -->
        <div class="moments-list">
          <div v-if="circleStore.loadingMoments" class="circle-loading">
            <div class="spinner"></div>
            <span>加载社区动态中...</span>
          </div>

          <div v-else-if="circleStore.filteredMoments.length === 0" class="empty-moments">
            <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 12px;">当前频道暂无动态，快来抢先发布吧！</div>
            <button class="btn btn-primary" @click="circleStore.openMomentModal">
              立即发布
            </button>
          </div>

          <div
            v-for="m in circleStore.filteredMoments"
            :key="m.id"
            :id="'moment-' + m.id"
            class="moment-card"
          >
            <!-- 头部作者信息 -->
            <div class="m-header">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <img
                  :src="m.avatar || defaultAvatar"
                  class="m-avatar"
                  alt="avatar"
                  @error="(e) => handleAvatarError(e, m.author)"
                />
                <div class="m-user-info">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="m-author">{{ m.author }}</span>
                    <span v-if="m.badge" class="m-badge">{{ m.badge }}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
                    <span>{{ m.time }}</span>
                    <span>•</span>
                    <span class="m-channel-tag">#{{ m.channelName }}</span>
                  </div>
                </div>
              </div>
              <button
                v-if="canDeleteMoment(m)"
                class="m-del-btn"
                title="删除动态"
                @click.stop="handleDeleteMoment(m.id)"
              >
                ✕
              </button>
            </div>

            <!-- 正文内容 (支持超长文本折叠/展开，点击进入详情页) -->
            <div class="m-content-wrap">
              <p
                class="m-content"
                :class="{ 'clamped': isLongContent(m.content) && !isExpanded(m.id) }"
                @click="goToDetail(m.id)"
              >
                {{ m.content }}
              </p>
              <button
                v-if="isLongContent(m.content)"
                class="btn-expand"
                @click.stop="toggleExpand(m.id)"
              >
                {{ isExpanded(m.id) ? '收起' : '展开全文' }}
              </button>
            </div>

            <!-- 话题标签 -->
            <div v-if="m.tags?.length" class="m-tags" @click="goToDetail(m.id)">
              <span v-for="tag in m.tags" :key="tag" class="m-tag-pill">
                {{ tag }}
              </span>
            </div>

            <!-- 附带图片列表 -->
            <div v-if="m.images?.length" class="m-images-grid" @click="goToDetail(m.id)">
              <img
                v-for="(img, idx) in m.images"
                :key="idx"
                :src="img"
                class="m-img"
                alt="image"
                @error="handleImageError"
              />
            </div>

            <!-- 底部互动操作 -->
            <div class="m-footer">
              <div class="m-actions">
                <button
                  class="m-action-btn"
                  :class="{ liked: m.liked }"
                  @click.stop="circleStore.toggleLikeMoment(m.id)"
                >
                  <span>{{ m.liked ? '❤️' : '🤍' }}</span>
                  <span>{{ m.likes }} 赞</span>
                </button>
                <!-- 点击评论按钮直接进入详情页面查看评论与多级回复 -->
                <button class="m-action-btn" @click="goToDetail(m.id)">
                  <span>💬</span>
                  <span>{{ getCommentCount(m) }} 条评论</span>
                </button>
                <button class="m-action-btn" @click.stop="shareMoment(m)">
                  <span>🔗</span>
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCircleStore } from '@/stores/circle'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatar } from '@/utils/avatars'
import defaultAvatarImg from '@/assets/default_avatar.jpg'

const route = useRoute()
const router = useRouter()
const circleStore = useCircleStore()
const authStore = useAuthStore()

const defaultAvatar = defaultAvatarImg
const expandedMoments = ref(new Set())
const allMomentsCache = ref([])

// 计算圈子热议列表：优先按点赞数与评论数综合热度降序，展示 Top 5 高频讨论
const hotMoments = computed(() => {
  const pool = allMomentsCache.value.length ? allMomentsCache.value : circleStore.moments
  return [...pool]
    .sort((a, b) => {
      const heatA = (a.likes || 0) * 2 + (getCommentCount(a) || 0) * 3
      const heatB = (b.likes || 0) * 2 + (getCommentCount(b) || 0) * 3
      if (heatB !== heatA) return heatB - heatA
      return (b.id || 0) - (a.id || 0)
    })
    .slice(0, 5)
})

function toggleExpand(id) {
  if (expandedMoments.value.has(id)) {
    expandedMoments.value.delete(id)
  } else {
    expandedMoments.value.add(id)
  }
}

function isExpanded(id) {
  return expandedMoments.value.has(id)
}

function isLongContent(content) {
  return content && content.length > 130
}

function handleImageError(e) {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  if (parent && parent.querySelectorAll('img:not([style*="display: none"])').length === 0) {
    parent.style.display = 'none'
  }
}

function canDeleteMoment(m) {
  const current = authStore.userInfo?.userName || authStore.userInfo?.nickName
  return current === m.author || current === 'admin' || current === 'suifeng'
}

async function handleDeleteMoment(momentId) {
  if (confirm('确定要删除这条动态吗？')) {
    await circleStore.deleteMoment(momentId)
  }
}

function handleAvatarError(e, name) {
  if (e?.target) {
    e.target.onerror = null
    e.target.src = defaultAvatarImg
  }
}

function getCommentCount(m) {
  if (circleStore.momentCommentsMap[m.id]) {
    const list = circleStore.momentCommentsMap[m.id]
    return list.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)
  }
  return m.replyCount || 0
}

// 进入该动态的评论与回复详情页面
function goToDetail(momentId) {
  router.push(`/circle/detail/${momentId}`)
}

function shareMoment(m) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.origin + '/circle/detail/' + m.id)
    alert('动态链接已复制到剪贴板！')
  } else {
    alert('已分享！')
  }
}

onMounted(async () => {
  // 如果携带了 momentId 参数（例如外部链接或旧通知），直接重定向至详情页面
  if (route.query.momentId) {
    router.replace(`/circle/detail/${route.query.momentId}`)
    return
  }

  await circleStore.fetchCircles()
  await circleStore.fetchMoments()
  if (circleStore.moments?.length) {
    allMomentsCache.value = [...circleStore.moments]
  }
  await circleStore.checkUnread()
})
</script>

<style scoped>
.circle-page-wrapper {
  max-width: 1160px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 20px;
  align-items: start;
}

.circle-sidebar-left {
  position: sticky;
  top: 76px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hot-discussions-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.hot-flame-icon {
  font-size: 16px;
  line-height: 1;
}

.hot-badge-tag {
  font-size: 11px;
  font-weight: 700;
  color: #ff4d4f;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

html.dark .hot-badge-tag {
  background: rgba(255, 77, 79, 0.15);
  border-color: rgba(255, 77, 79, 0.35);
  color: #ff7875;
}

.hot-moment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hot-moment-item {
  border-bottom: 1px solid var(--border-subtle);
  padding: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.hot-moment-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.hot-moment-item:last-child {
  border-bottom: none;
}

.hot-moment-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.hot-rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  background: var(--bg-subtle);
  color: var(--text-muted);
  flex-shrink: 0;
}

.hot-rank-badge.rank-1 {
  background: #ff4d4f;
  color: #ffffff;
}

.hot-rank-badge.rank-2 {
  background: #ff7a45;
  color: #ffffff;
}

.hot-rank-badge.rank-3 {
  background: #ffa940;
  color: #ffffff;
}

.hot-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.hot-author {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-main);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-channel {
  font-size: 11px;
  color: var(--primary);
  font-weight: 500;
  margin-left: auto;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-content {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.hot-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.circle-main {
  min-width: 0;
}

.circle-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.channel-tabs {
  display: flex;
  gap: 6px;
}

.ch-tab {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.ch-tab:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.ch-tab.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
}

.publish-trigger-btn {
  font-size: 12.5px;
  padding: 5px 12px;
}

.moments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.circle-loading,
.empty-moments {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 36px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13.5px;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.moment-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.15s;
  margin: 0;
}

.moment-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.m-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.m-del-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.m-del-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

.m-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.m-user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.m-author {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
}

.m-badge {
  font-size: 11px;
  background: #eff6ff;
  color: var(--primary);
  padding: 0 5px;
  border-radius: 3px;
  font-weight: 600;
  line-height: 18px;
}

.m-channel-tag {
  color: var(--primary);
  font-weight: 600;
}

.m-content-wrap {
  margin-bottom: 8px;
}

.m-content {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-regular);
  margin-bottom: 0;
  white-space: pre-wrap;
  cursor: pointer;
}

.m-content.clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-expand {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 3px;
}

.btn-expand:hover {
  text-decoration: underline;
}

.m-content:hover {
  color: var(--text-main);
}

.m-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  cursor: pointer;
}

.m-tag-pill {
  font-size: 11.5px;
  color: var(--primary);
  background: #f0f7ff;
  padding: 1px 6px;
  border-radius: 3px;
}

.m-images-grid {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  cursor: pointer;
}

.m-img {
  max-width: 200px;
  max-height: 140px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #edf2f7;
  cursor: zoom-in;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.m-img:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
  transform: none;
}

.m-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
  margin-top: 2px;
}

.m-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.m-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.15s;
  padding: 2px 4px;
  border-radius: 3px;
}

.m-action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.m-action-btn.liked {
  color: #ef4444;
  font-weight: 600;
}

@media (max-width: 960px) {
  .circle-page-wrapper {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .circle-sidebar-left {
    position: static;
  }
}
</style>
