<template>
  <div class="notification-popover" @click.stop>
    <!-- 顶部标签切换与操作栏 -->
    <div class="popover-tabs">
      <div class="tabs-left">
        <div
          class="tab-btn"
          :class="{ active: activeTab === 'unread' }"
          @click="switchTab('unread')"
        >
          <span>未读通知</span>
          <span v-if="circleStore.unreadCount > 0" class="tab-dot"></span>
        </div>
        <div
          class="tab-btn"
          :class="{ active: activeTab === 'read' }"
          @click="switchTab('read')"
        >
          <span>已读通知</span>
          <span v-if="circleStore.readTotal > 0" class="tab-count">
            ({{ circleStore.readTotal }})
          </span>
        </div>
      </div>

      <div class="tabs-right">
        <button
          v-if="activeTab === 'unread' && circleStore.unreadMessages.length > 0"
          class="btn-text-action"
          title="将所有未读消息标记为已读"
          @click="circleStore.markAllRead"
        >
          全部已读
        </button>
        <button class="btn-close-popover" title="关闭" @click="$emit('close')">
          ✕
        </button>
      </div>
    </div>

    <!-- 列表主体容器 -->
    <div class="popover-body">
      <!-- 0. 未登录状态 -->
      <div v-if="!authStore.isLoggedIn" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="empty-text">请先登录账号</div>
        <div class="empty-sub">登录后即可查看与接收互动消息通知</div>
        <button class="btn btn-primary" style="margin-top: 10px; font-size: 12.5px; padding: 4px 14px;" @click="handleLoginClick">
          立即登录
        </button>
      </div>

      <!-- 1. 未读通知面板 -->
      <div v-else-if="activeTab === 'unread'" class="messages-container">
        <div v-if="circleStore.loadingUnread" class="loading-state">
          <div class="mini-spinner"></div>
          <span>加载未读消息...</span>
        </div>

        <div v-else-if="circleStore.unreadMessages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              <polyline points="9 11 12 14 22 4"></polyline>
            </svg>
          </div>
          <div class="empty-text">暂无未读通知</div>
        </div>

        <div v-else class="message-list">
          <div
            v-for="msg in circleStore.unreadMessages"
            :key="msg.id"
            class="message-card unread-card"
            @click="handleMessageClick(msg)"
          >
            <div class="msg-avatar-wrap">
              <img :src="msg.avatar || defaultAvatarImg" class="msg-avatar" alt="avatar" @error="handleAvatarError" />
              <span class="unread-dot"></span>
            </div>
            <div class="msg-content-wrap">
              <div class="msg-header-line">
                <span class="msg-author">{{ msg.author }}</span>
                <span class="msg-type-pill" :class="msg.msgType === 'COMMENT_REPLY' ? 'reply' : 'comment'">
                  {{ msg.msgType === 'COMMENT_REPLY' ? '回复了你' : '评论了你' }}
                </span>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
              <div class="msg-text">{{ msg.msg }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 已读通知面板（支持无限滚动 / 滑动加载） -->
      <div
        v-else
        class="messages-container scrollable"
        ref="readScrollContainer"
        @scroll="handleReadScroll"
      >
        <div v-if="circleStore.readMessages.length === 0 && circleStore.loadingRead" class="loading-state">
          <div class="mini-spinner"></div>
          <span>加载已读通知...</span>
        </div>

        <div v-else-if="circleStore.readMessages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="M7 15h0M2 9.5h20"></path>
            </svg>
          </div>
          <div class="empty-text">暂无历史已读记录</div>
        </div>

        <div v-else class="message-list">
          <div
            v-for="msg in circleStore.readMessages"
            :key="msg.id"
            class="message-card read-card"
            @click="handleMessageClick(msg)"
          >
            <div class="msg-avatar-wrap">
              <img :src="msg.avatar || defaultAvatarImg" class="msg-avatar" alt="avatar" @error="handleAvatarError" />
            </div>
            <div class="msg-content-wrap">
              <div class="msg-header-line">
                <span class="msg-author">{{ msg.author }}</span>
                <span class="msg-type-pill muted">
                  {{ msg.msgType === 'COMMENT_REPLY' ? '回复' : '评论' }}
                </span>
                <span class="msg-time">{{ msg.time }}</span>
              </div>
              <div class="msg-text read-text">{{ msg.msg }}</div>
            </div>
          </div>

          <!-- 滑动加载状态反馈 -->
          <div class="scroll-status-bar">
            <div v-if="circleStore.loadingRead" class="loading-more">
              <div class="mini-spinner sm"></div>
              <span>滑动加载更多已读消息...</span>
            </div>
            <div v-else-if="!circleStore.readHasMore" class="no-more">
              —— 已滑动到底部，全部已读加载完毕 ——
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCircleStore } from '@/stores/circle'
import { useAuthStore } from '@/stores/auth'
import defaultAvatarImg from '@/assets/default_avatar.jpg'

const emit = defineEmits(['close'])
const router = useRouter()
const circleStore = useCircleStore()
const authStore = useAuthStore()

function handleAvatarError(e) {
  if (e?.target) {
    e.target.onerror = null
    e.target.src = defaultAvatarImg
  }
}

const activeTab = ref('unread')
const readScrollContainer = ref(null)

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'read' && authStore.isLoggedIn && circleStore.readMessages.length === 0) {
    circleStore.fetchReadMessages(true)
  }
}

// 监听已读列表滚动事件实现触底滑动加载 (Infinite Scroll)
function handleReadScroll(e) {
  const target = e.target
  if (!target) return
  const { scrollTop, clientHeight, scrollHeight } = target
  if (scrollTop + clientHeight >= scrollHeight - 30) {
    if (!circleStore.loadingRead && circleStore.readHasMore) {
      circleStore.fetchReadMessages(false)
    }
  }
}

// 点击通知直接进入动态详情页面
function handleMessageClick(msg) {
  if (msg.isRead === 2) {
    circleStore.markMessageRead(msg.id)
  }

  emit('close')
  const targetMomentId = msg.targetId
  if (targetMomentId) {
    router.push(`/circle/detail/${targetMomentId}`)
  } else {
    router.push('/circle')
  }
}

function handleLoginClick() {
  emit('close')
  authStore.openLoginModal()
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    circleStore.fetchUnreadMessages()
  }
})
</script>

<style scoped>
.notification-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 396px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg, 10px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12), 0 3px 8px rgba(15, 23, 42, 0.05);
  z-index: 500;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: popoverFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popoverFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 顶部标签切换与操作栏 */
.popover-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
}

.tabs-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tabs-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
}

.tab-btn:hover {
  color: var(--primary);
}

.tab-btn.active {
  color: var(--primary);
  font-weight: 700;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary);
  border-radius: 2px;
}

.tab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
}

.tab-count {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-text-action {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--primary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.btn-text-action:hover {
  background: #eff6ff;
}

.btn-close-popover {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-popover:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

/* 内容主体与消息列表 */
.popover-body {
  height: 300px;
  overflow: hidden;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

.messages-container {
  height: 100%;
  overflow-y: auto;
  padding: 10px 12px;
}

.messages-container.scrollable {
  /* 平滑滚动与滚动条美化 */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.messages-container::-webkit-scrollbar {
  width: 5px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.message-card {
  display: flex;
  gap: 11px;
  padding: 11px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.message-card:hover {
  border-color: var(--primary-border, #93c5fd);
  background: #fafcff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(22, 119, 255, 0.08);
}

.message-card.unread-card {
  border-left: 3px solid var(--primary);
  background: #fdfefe;
}

.msg-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #ffffff;
}

.msg-content-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-header-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.msg-author {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-type-pill {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.msg-type-pill.reply {
  background: #e0f2fe;
  color: #0284c7;
}

.msg-type-pill.comment {
  background: #dcfce7;
  color: #16a34a;
}

.msg-type-pill.muted {
  background: #f1f5f9;
  color: #64748b;
}

.msg-time {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.msg-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--text-regular);
  word-break: break-all;
}

.msg-text.read-text {
  color: var(--text-secondary);
}

/* 滑动加载状态提示 */
.scroll-status-bar {
  padding: 8px 0;
  text-align: center;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: var(--primary);
  padding: 6px 0;
}

.no-more {
  font-size: 11px;
  color: var(--text-muted);
  padding: 8px 0;
}

/* 加载中与空状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.mini-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.mini-spinner.sm {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 24px;
}

.empty-icon {
  margin-bottom: 8px;
}

.empty-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
