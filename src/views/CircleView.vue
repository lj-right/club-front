<template>
  <div class="view-container">
    <div class="circle-page-wrapper">
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCircleStore } from '@/stores/circle'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatar } from '@/utils/avatars'

const route = useRoute()
const router = useRouter()
const circleStore = useCircleStore()
const authStore = useAuthStore()

const defaultAvatar = 'http://127.0.0.1:9005/user/avatar/default_avatar.jpg'
const expandedMoments = ref(new Set())

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
  const fallback = getUserAvatar(name)
  if (e.target.src !== fallback) {
    e.target.src = fallback
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
  await circleStore.checkUnread()
})
</script>

<style scoped>
.circle-page-wrapper {
  max-width: 820px;
  margin: 0 auto;
}

.circle-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
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
  background: #eff6ff;
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
  background: #ffffff;
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
  background: #ffffff;
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
</style>
