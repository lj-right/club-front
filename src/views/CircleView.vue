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
            <div style="font-size: 32px; margin-bottom: 8px;">💬</div>
            <div style="font-size: 14px; color: var(--text-muted);">当前频道暂无动态，快来抢先发布吧！</div>
            <button class="btn btn-primary" style="margin-top: 12px;" @click="circleStore.openMomentModal">
              立即发布
            </button>
          </div>

          <div
            v-for="m in circleStore.filteredMoments"
            :key="m.id"
            class="moment-card"
          >
            <!-- 头部作者信息 -->
            <div class="m-header">
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

            <!-- 正文内容 -->
            <p class="m-content">{{ m.content }}</p>

            <!-- 话题标签 -->
            <div v-if="m.tags?.length" class="m-tags">
              <span v-for="tag in m.tags" :key="tag" class="m-tag-pill">
                {{ tag }}
              </span>
            </div>

            <!-- 附带图片列表 -->
            <div v-if="m.images?.length" class="m-images-grid">
              <img
                v-for="(img, idx) in m.images"
                :key="idx"
                :src="img"
                class="m-img"
                alt="image"
                @error="(e) => (e.target.style.display = 'none')"
              />
            </div>

            <!-- 底部互动操作 -->
            <div class="m-footer">
              <div class="m-actions">
                <button
                  class="m-action-btn"
                  :class="{ liked: m.liked }"
                  @click="circleStore.toggleLikeMoment(m.id)"
                >
                  <span>{{ m.liked ? '❤️' : '🤍' }}</span>
                  <span>{{ m.likes }} 赞</span>
                </button>
                <button class="m-action-btn" @click="toggleComment(m.id)">
                  <span>{{ getCommentCount(m) }} 条评论</span>
                </button>
                <button class="m-action-btn" @click="shareMoment(m)">
                  <span>🔗</span>
                  <span>分享</span>
                </button>
              </div>
            </div>

            <!-- 展开的评论区 -->
            <div v-if="activeCommentMomentId === m.id" class="comment-section">
              <div class="comment-input-wrap">
                <input
                  v-model="commentText"
                  type="text"
                  placeholder="写下你的真实想法，与作者交流技术细节..."
                  class="comment-input"
                  :disabled="isSubmittingComment"
                  @keyup.enter="submitComment(m)"
                />
                <button
                  class="btn btn-primary"
                  style="padding: 6px 14px; font-size: 12px;"
                  :disabled="isSubmittingComment || !commentText.trim()"
                  @click="submitComment(m)"
                >
                  {{ isSubmittingComment ? '发送中...' : '回复' }}
                </button>
              </div>

              <!-- 评论加载中 -->
              <div v-if="circleStore.loadingCommentsMap[m.id]" class="comments-loading">
                加载评论列表中...
              </div>

              <!-- 评论列表 -->
              <div v-else class="comment-list">
                <div
                  v-for="c in (circleStore.momentCommentsMap[m.id] || [])"
                  :key="c.id"
                  class="comment-item"
                >
                  <img
                    :src="c.avatar || defaultAvatar"
                    class="c-avatar-mini"
                    alt="avatar"
                    @error="(e) => handleAvatarError(e, c.user)"
                  />
                  <div class="c-body">
                    <div class="c-header-line">
                      <span class="c-user">{{ c.user }}</span>
                      <span class="c-time">{{ c.time }}</span>
                    </div>
                    <div class="c-text">{{ c.text }}</div>
                  </div>
                </div>

                <div
                  v-if="!circleStore.momentCommentsMap[m.id] || circleStore.momentCommentsMap[m.id].length === 0"
                  class="no-comments"
                >
                  暂无评论，快来抢沙发吧~
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发表动态弹窗 (Publish Modal) -->
    <div v-if="circleStore.momentModalOpen" class="modal-overlay" @click.self="circleStore.closeMomentModal">
      <div class="moment-modal">
        <div class="modal-header">
          <h3 class="modal-title">发表圈子技术动态</h3>
          <button class="close-btn" @click="circleStore.closeMomentModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">选择频道:</label>
            <div class="channel-picker">
              <button
                v-for="ch in publishChannels"
                :key="ch.id"
                class="pick-btn"
                :class="{ active: newMomentChannel === ch.id }"
                @click="newMomentChannel = ch.id"
              >
                {{ ch.name }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">动态内容:</label>
            <textarea
              v-model="newMomentContent"
              rows="5"
              placeholder="分享今天的技术感悟、生产环境排坑记录或面试真题..."
              class="moment-textarea"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="circleStore.closeMomentModal">取消</button>
          <button
            class="btn btn-primary"
            :disabled="isPublishing || !newMomentContent.trim()"
            @click="handlePublish"
          >
            {{ isPublishing ? '发布中...' : '确认发布' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCircleStore } from '@/stores/circle'
import { getUserAvatar } from '@/utils/avatars'

const circleStore = useCircleStore()
const defaultAvatar = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'

function handleAvatarError(e, name) {
  const fallback = getUserAvatar(name)
  if (e.target.src !== fallback) {
    e.target.src = fallback
  }
}

const activeCommentMomentId = ref(null)
const commentText = ref('')
const isSubmittingComment = ref(false)

const newMomentChannel = ref('tech')
const newMomentContent = ref('')
const isPublishing = ref(false)

const publishChannels = computed(() => {
  return circleStore.channels.filter((c) => c.id !== 'all')
})

function getCommentCount(m) {
  if (circleStore.momentCommentsMap[m.id]) {
    return circleStore.momentCommentsMap[m.id].length
  }
  return m.replyCount || 0
}

async function toggleComment(id) {
  if (activeCommentMomentId.value === id) {
    activeCommentMomentId.value = null
  } else {
    activeCommentMomentId.value = id
    commentText.value = ''
    // Fetch live comments from backend database
    await circleStore.fetchComments(id)
  }
}

async function submitComment(moment) {
  const text = commentText.value.trim()
  if (!text) return

  isSubmittingComment.value = true
  try {
    const res = await circleStore.addComment({
      momentId: moment.id,
      content: text
    })

    if (res && res.success) {
      commentText.value = ''
    } else {
      alert(res?.message || '评论发送失败')
    }
  } finally {
    isSubmittingComment.value = false
  }
}

async function handlePublish() {
  const content = newMomentContent.value.trim()
  if (!content) return

  isPublishing.value = true
  try {
    const res = await circleStore.publishMoment({
      content,
      channel: newMomentChannel.value
    })

    if (res && res.success) {
      newMomentContent.value = ''
      circleStore.closeMomentModal()
    } else {
      alert(res?.message || '发布失败')
    }
  } finally {
    isPublishing.value = false
  }
}

function shareMoment(m) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    alert('动态链接已复制到剪贴板！')
  } else {
    alert('已分享！')
  }
}

onMounted(async () => {
  await circleStore.fetchCircles()
  await circleStore.fetchMoments()
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
  padding: 10px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.channel-tabs {
  display: flex;
  gap: 8px;
}

.ch-tab {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
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
  font-size: 13px;
  padding: 6px 14px;
}

.moments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.circle-loading,
.empty-moments {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 48px 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
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

.moment-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.moment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.m-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.m-avatar {
  width: 40px;
  height: 40px;
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
  font-size: 14px;
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

.m-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-regular);
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.m-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
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
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.m-img {
  max-width: 240px;
  max-height: 160px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #edf2f7;
}

.m-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.m-actions {
  display: flex;
  gap: 20px;
}

.m-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 6px;
  border-radius: 4px;
}

.m-action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.m-action-btn.liked {
  color: #ef4444;
  font-weight: 600;
}

/* 评论区 */
.comment-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--border-color);
  background: #fafbfc;
  border-radius: 6px;
  padding: 12px;
}

.comment-input-wrap {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  outline: none;
}

.comment-input:focus {
  border-color: var(--primary);
}

.comments-loading {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 8px 0;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
  background: #ffffff;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #edf2f7;
}

.c-avatar-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.c-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.c-header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.c-user {
  font-weight: 700;
  color: var(--text-main);
  font-size: 12px;
}

.c-time {
  font-size: 11px;
  color: var(--text-muted);
}

.c-text {
  color: var(--text-regular);
  line-height: 1.4;
  font-size: 13px;
}

.no-comments {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
  text-align: center;
}

/* 发表弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.moment-modal {
  background: #ffffff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 560px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.channel-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pick-btn {
  background: #f1f5f9;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pick-btn.active {
  background: #eff6ff;
  border-color: var(--primary);
  color: var(--primary);
}

.moment-textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
}

.moment-textarea:focus {
  border-color: var(--primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
</style>
