<template>
  <div class="view-container">
    <div class="circle-detail-page">
      <!-- 顶部返回导航栏 -->
      <div class="detail-header-bar">
        <button class="btn-back" @click="$router.push('/circle')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>返回交流论坛</span>
        </button>
        <span v-if="moment?.channelName" class="detail-channel-tag">
          #{{ moment.channelName }}
        </span>
      </div>

      <!-- 动态正文卡片 -->
      <div v-if="moment" class="moment-main-card">
        <!-- 作者信息 -->
        <div class="m-header">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <img
              :src="moment.avatar || defaultAvatar"
              class="m-avatar"
              alt="avatar"
              @error="(e) => handleAvatarError(e, moment.author)"
            />
            <div class="m-user-info">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="m-author">{{ moment.author }}</span>
                <span v-if="moment.badge" class="m-badge">{{ moment.badge }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-muted);">
                <span>{{ moment.time }}</span>
                <span>•</span>
                <span class="m-channel-tag">#{{ moment.channelName }}</span>
              </div>
            </div>
          </div>
          <button
            v-if="canDeleteMoment(moment)"
            class="m-del-btn"
            title="删除动态"
            @click="handleDeleteMoment(moment.id)"
          >
            ✕
          </button>
        </div>

        <!-- 动态文本内容 -->
        <p class="m-content">{{ moment.content }}</p>

        <!-- 标签话题 -->
        <div v-if="moment.tags?.length" class="m-tags">
          <span v-for="tag in moment.tags" :key="tag" class="m-tag-pill">
            {{ tag }}
          </span>
        </div>

        <!-- 附带图片列表 -->
        <div v-if="moment.images?.length" class="m-images-grid">
          <img
            v-for="(img, idx) in moment.images"
            :key="idx"
            :src="img"
            class="m-img"
            alt="image"
            @error="(e) => (e.target.style.display = 'none')"
          />
        </div>

        <!-- 底部点赞与分享 -->
        <div class="m-footer">
          <div class="m-actions">
            <button
              class="m-action-btn"
              :class="{ liked: moment.liked }"
              @click="circleStore.toggleLikeMoment(moment.id, moment)"
            >
              <span>{{ moment.liked ? '❤️' : '🤍' }}</span>
              <span>{{ moment.likes }} 赞</span>
            </button>
            <div class="m-action-static">
              <span>💬</span>
              <span>{{ commentCount }} 条评论</span>
            </div>
            <button class="m-action-btn" @click="shareMoment">
              <span>🔗</span>
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="loadingDetail" class="moment-loading">
        <div class="spinner"></div>
        <span>正在加载动态详情...</span>
      </div>

      <div v-else class="empty-detail-card">
        <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
        <div style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">动态不存在或已被删除</div>
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">抱歉，未能查询到该动态内容，可能已被发布者删除</div>
        <button class="btn btn-primary" @click="$router.push('/circle')">
          返回交流论坛
        </button>
      </div>

      <!-- 评论互动与用户回复专区 -->
      <div v-if="moment" class="comments-container-card">
        <div class="comments-title-row">
          <h3 class="comments-title">
            全部评论与回复
            <span class="count-pill">{{ commentCount }}</span>
          </h3>
          <span class="comments-subtitle">畅所欲言 · 技术交流</span>
        </div>

        <!-- 主评论输入框 -->
        <div class="main-comment-input-wrap">
          <input
            v-model="newCommentText"
            type="text"
            placeholder="写下你的真实想法，与作者交流技术细节... (按 Enter 发送)"
            class="comment-input"
            :disabled="isSubmittingComment"
            @keyup.enter="handleSendMainComment"
          />
          <button
            class="btn btn-primary btn-submit-comment"
            :disabled="isSubmittingComment || !newCommentText.trim()"
            @click="handleSendMainComment"
          >
            {{ isSubmittingComment ? '发送中...' : '发表评论' }}
          </button>
        </div>

        <!-- 评论加载状态 -->
        <div v-if="circleStore.loadingCommentsMap[moment.id]" class="comments-loading">
          加载评论列表中...
        </div>

        <!-- 暂无评论空状态 -->
        <div
          v-else-if="!currentComments || currentComments.length === 0"
          class="empty-comments-box"
        >
          <div class="empty-icon">💬</div>
          <div class="empty-text">暂无评论，快来抢首评发表你的观点吧~</div>
        </div>

        <!-- 评论与多级回复树列表 -->
        <div v-else class="comments-tree-list">
          <div
            v-for="c in currentComments"
            :key="c.id"
            :id="'comment-' + c.id"
            class="root-comment-node"
          >
            <!-- 主评论信息行 -->
            <div class="comment-item-header">
              <img
                :src="c.avatar || defaultAvatar"
                class="comment-avatar"
                alt="avatar"
                @error="(e) => handleAvatarError(e, c.user)"
              />
              <div class="comment-author-info">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="comment-author-name">{{ c.user }}</span>
                  <span v-if="c.user === moment.author" class="badge-author">作者</span>
                </div>
                <span class="comment-time">{{ c.time }}</span>
              </div>
              <div class="comment-top-actions">
                <button
                  class="btn-action-text"
                  @click="triggerReply(c.id, c.user)"
                >
                  回复
                </button>
                <button
                  v-if="canDeleteComment(c)"
                  class="btn-action-text danger"
                  @click="handleDeleteComment(c.id)"
                >
                  删除
                </button>
              </div>
            </div>

            <!-- 主评论文本 -->
            <div class="root-comment-text">
              {{ c.text }}
            </div>

            <!-- 其他用户的多级回复内容列表 -->
            <div v-if="c.children && c.children.length > 0" class="replies-thread-box">
              <div class="thread-title">
                <span>其他用户的回复 ({{ c.children.length }})</span>
              </div>
              <div class="replies-list">
                <div
                  v-for="sub in c.children"
                  :key="sub.id"
                  :id="'reply-' + sub.id"
                  class="sub-reply-item"
                >
                  <img
                    :src="sub.avatar || defaultAvatar"
                    class="sub-reply-avatar"
                    alt="avatar"
                    @error="(e) => handleAvatarError(e, sub.user)"
                  />
                  <div class="sub-reply-body">
                    <div class="sub-reply-user-row">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="sub-user-name">{{ sub.user }}</span>
                        <span v-if="sub.user === moment.author" class="badge-author sm">作者</span>
                        <span v-if="sub.targetUser && sub.targetUser !== c.user" class="target-user-info">
                          回复 <strong class="target-name">@{{ sub.targetUser }}</strong>
                        </span>
                      </div>
                      <span class="sub-reply-time">{{ sub.time }}</span>
                    </div>

                    <div class="sub-reply-text">
                      {{ sub.text }}
                    </div>

                    <div class="sub-reply-actions">
                      <button
                        class="btn-action-text sm"
                        @click="triggerReply(c.id, sub.user)"
                      >
                        回复
                      </button>
                      <button
                        v-if="canDeleteComment(sub)"
                        class="btn-action-text sm danger"
                        @click="handleDeleteReply(sub.id)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 针对该评论的内联回复输入框 -->
            <div v-if="activeReplyRootId === c.id" class="inline-reply-box">
              <div class="reply-target-tag">
                <span>正在回复 <strong>@{{ activeReplyUser }}</strong>：</span>
                <button class="btn-cancel-reply" @click="cancelReply">✕ 取消</button>
              </div>
              <div class="inline-input-row">
                <input
                  ref="inlineInputRef"
                  v-model="replyText"
                  type="text"
                  :placeholder="`回复 @${activeReplyUser}... (按 Enter 发送)`"
                  class="comment-input"
                  :disabled="isSubmittingReply"
                  @keyup.enter="handleSendReply(c.id)"
                />
                <button
                  class="btn btn-primary btn-submit-inline"
                  :disabled="isSubmittingReply || !replyText.trim()"
                  @click="handleSendReply(c.id)"
                >
                  {{ isSubmittingReply ? '发送中...' : '发送回复' }}
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
import { ref, computed, onMounted, nextTick } from 'vue'
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

const momentId = computed(() => Number(route.params.id || route.query.id))
const moment = ref(null)
const loadingDetail = ref(true)

const newCommentText = ref('')
const isSubmittingComment = ref(false)

const activeReplyRootId = ref(null)
const activeReplyUser = ref(null)
const replyText = ref('')
const isSubmittingReply = ref(false)
const inlineInputRef = ref(null)

const currentComments = computed(() => {
  if (!moment.value) return []
  return circleStore.momentCommentsMap[moment.value.id] || []
})

const commentCount = computed(() => {
  if (!currentComments.value) return moment.value?.replyCount || 0
  return currentComments.value.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)
})

function canDeleteMoment(m) {
  const current = authStore.userInfo?.userName || authStore.userInfo?.nickName
  return current === m?.author || current === 'admin' || current === 'suifeng'
}

async function handleDeleteMoment(id) {
  if (confirm('确定要删除这条动态吗？')) {
    await circleStore.deleteMoment(id)
    router.push('/circle')
  }
}

function canDeleteComment(c) {
  const current = authStore.userInfo?.userName || authStore.userInfo?.nickName
  return current === c.user || current === 'admin' || current === 'suifeng'
}

async function handleDeleteComment(commentId) {
  if (confirm('确定要删除这条评论吗？')) {
    await circleStore.deleteComment(moment.value.id, commentId, 1)
  }
}

async function handleDeleteReply(replyId) {
  if (confirm('确定要删除这条回复吗？')) {
    await circleStore.deleteComment(moment.value.id, replyId, 2)
  }
}

function handleAvatarError(e, name) {
  if (e?.target) {
    e.target.onerror = null
    e.target.src = defaultAvatarImg
  }
}

function shareMoment() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    alert('动态链接已复制到剪贴板！')
  } else {
    alert('已分享！')
  }
}

// 发表针对动态的主评论
async function handleSendMainComment() {
  const text = newCommentText.value.trim()
  if (!text) return

  isSubmittingComment.value = true
  try {
    const res = await circleStore.addComment({
      momentId: moment.value.id,
      content: text
    })
    if (res && res.success) {
      newCommentText.value = ''
    } else {
      alert(res?.message || '评论发送失败')
    }
  } finally {
    isSubmittingComment.value = false
  }
}

// 激活内联回复
function triggerReply(rootCommentId, targetUser) {
  activeReplyRootId.value = rootCommentId
  activeReplyUser.value = targetUser
  replyText.value = ''
  nextTick(() => {
    if (inlineInputRef.value && inlineInputRef.value[0]) {
      inlineInputRef.value[0].focus()
    } else if (inlineInputRef.value) {
      inlineInputRef.value.focus()
    }
  })
}

function cancelReply() {
  activeReplyRootId.value = null
  activeReplyUser.value = null
  replyText.value = ''
}

// 发送对主评论或其他用户的二级回复
async function handleSendReply(rootCommentId) {
  const text = replyText.value.trim()
  if (!text) return

  isSubmittingReply.value = true
  try {
    const res = await circleStore.addReply({
      momentId: moment.value.id,
      targetId: rootCommentId,
      content: text
    })
    if (res && res.success) {
      cancelReply()
    } else {
      alert(res?.message || '回复发送失败')
    }
  } finally {
    isSubmittingReply.value = false
  }
}

onMounted(async () => {
  const id = momentId.value
  if (!id) {
    router.replace('/circle')
    return
  }

  loadingDetail.value = true
  try {
    if (circleStore.channels.length <= 1) {
      await circleStore.fetchCircles()
    }
    const found = await circleStore.getMomentDetail(id)
    moment.value = found
    if (found) {
      await circleStore.fetchComments(id)
    }
  } finally {
    loadingDetail.value = false
  }
})
</script>

<style scoped>
.circle-detail-page {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

/* 顶部返回导航栏 */
.detail-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 16px;
}

.btn-back {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--bg-hover);
  color: var(--primary);
}

.detail-channel-tag {
  font-size: 13px;
  color: var(--primary);
  font-weight: 600;
}

/* 动态正文卡片 */
.moment-main-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.m-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.m-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.m-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.m-author {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.m-badge {
  font-size: 11px;
  background: #eff6ff;
  color: var(--primary);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.m-channel-tag {
  color: var(--primary);
  font-weight: 600;
}

.m-del-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.m-del-btn:hover {
  color: #ef4444;
  background: #fee2e2;
}

.m-content {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-main);
  margin-bottom: 14px;
  white-space: pre-wrap;
}

.m-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.m-tag-pill {
  font-size: 12px;
  color: var(--primary);
  background: #f0f7ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.m-images-grid {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.m-img {
  max-width: 260px;
  max-height: 180px;
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
  border-top: 1px solid var(--border-color);
  padding-top: 14px;
}

.m-actions {
  display: flex;
  gap: 24px;
  align-items: center;
}

.m-action-btn,
.m-action-static {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 4px;
}

.m-action-btn {
  cursor: pointer;
  transition: all 0.2s;
}

.m-action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.m-action-btn.liked {
  color: #ef4444;
  font-weight: 600;
}

.moment-loading {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 评论互动专区卡片 */
.comments-container-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.comments-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comments-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.count-pill {
  font-size: 12px;
  background: #eff6ff;
  color: var(--primary);
  padding: 1px 8px;
  border-radius: 12px;
}

.comments-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

/* 主评论发表输入框 */
.main-comment-input-wrap {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.comment-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s;
}

.comment-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
}

.btn-submit-comment {
  padding: 0 20px;
  font-size: 13px;
  font-weight: 600;
}

.comments-loading,
.empty-comments-box {
  padding: 36px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

/* 评论树结构 */
.comments-tree-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.root-comment-node {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
}

.root-comment-node:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.comment-author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-author-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.badge-author {
  font-size: 10px;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-author.sm {
  font-size: 9px;
  padding: 0 4px;
}

.comment-time {
  font-size: 11px;
  color: var(--text-muted);
}

.comment-top-actions {
  display: flex;
  gap: 8px;
}

.btn-action-text {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-action-text:hover {
  background: #eff6ff;
}

.btn-action-text.danger {
  color: #ef4444;
}

.btn-action-text.danger:hover {
  background: #fee2e2;
}

.btn-action-text.sm {
  font-size: 11px;
}

.root-comment-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-main);
  margin-bottom: 12px;
  padding-left: 44px;
  white-space: pre-wrap;
}

/* 二级回复盒子 (其他用户的回复内容) */
.replies-thread-box {
  margin-left: 44px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.thread-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-reply-item {
  display: flex;
  gap: 10px;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 10px;
}

.sub-reply-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.sub-reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
}

.sub-reply-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.sub-reply-user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-user-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-main);
}

.target-user-info {
  font-size: 11.5px;
  color: var(--text-muted);
}

.target-name {
  color: var(--primary);
  font-weight: 600;
}

.sub-reply-time {
  font-size: 11px;
  color: var(--text-muted);
}

.sub-reply-text {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-regular);
  word-break: break-all;
}

.sub-reply-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

/* 内联回复输入框 */
.inline-reply-box {
  margin-left: 44px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-target-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #334155;
}

.btn-cancel-reply {
  background: none;
  border: none;
  font-size: 11px;
  color: #ef4444;
  cursor: pointer;
  font-weight: 600;
}

.inline-input-row {
  display: flex;
  gap: 8px;
}

.btn-submit-inline {
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
}

.empty-detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
</style>
