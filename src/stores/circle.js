import { defineStore } from 'pinia'
import {
  getCircleList,
  getMoments,
  saveMoment,
  removeMoment,
  getCommentList,
  saveComment,
  removeComment,
  hasUnreadMessages,
  getMessages,
  likeMoment
} from '@/api/circle'
import { getUserAvatar } from '@/utils/avatars'
import { useAuthStore } from '@/stores/auth'

// 清除历史测试遗留的非隔离 localStorage 假数据
try {
  localStorage.removeItem('sf_circle_moment_likes')
} catch (_) {}

function formatTimeAgo(timeVal) {
  if (!timeVal) return '刚刚'
  const time = typeof timeVal === 'number' ? timeVal : new Date(timeVal).getTime()
  const diff = Math.floor((Date.now() - time) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`
  return `${Math.floor(diff / (86400 * 30))} 个月前`
}

// 递归提取所有子回复层级，组装扁平或嵌套回复树
function extractReplies(node, rootUserName) {
  const replies = []
  if (!node.children || !Array.isArray(node.children)) return replies

  function traverse(list, parentUser) {
    for (const sub of list) {
      const subName = sub.userName || sub.createdBy || '随风学员'
      let subAvatar = sub.avatar
      if (!subAvatar || subAvatar.includes('default_avatar.jpg')) {
        subAvatar = getUserAvatar(subName)
      }
      replies.push({
        id: sub.id,
        momentId: sub.momentId,
        parentId: sub.parentId,
        user: subName,
        avatar: subAvatar,
        text: sub.content,
        targetUser: parentUser,
        time: formatTimeAgo(sub.createdTime),
        createdTime: sub.createdTime,
        replyType: sub.replyType || 2
      })
      if (Array.isArray(sub.children) && sub.children.length > 0) {
        traverse(sub.children, subName)
      }
    }
  }

  traverse(node.children, rootUserName)
  return replies
}

// 默认真实板块通道定义
const DEFAULT_CHANNELS = [
  { id: 'all', name: '全部动态', circleId: null },
  { id: '101', name: 'Java技术交流圈', circleId: 101 },
  { id: '102', name: '架构设计与微服务', circleId: 102 },
  { id: '103', name: '秋招春招面经打卡', circleId: 103 }
]

export const useCircleStore = defineStore('circle', {
  state: () => ({
    channels: DEFAULT_CHANNELS,
    currentChannel: 'all',
    moments: [],
    loadingMoments: false,
    momentModalOpen: false,

    // 评论管理：{ [momentId]: [ { id, user, avatar, text, time, children: [...] } ] }
    momentCommentsMap: {},
    loadingCommentsMap: {},

    // 评论详情与回复弹窗
    commentDetailOpen: false,
    activeMoment: null,
    activeComment: null,

    // 通知与消息体系 (严格基于后端真实微服务数据，绝不使用任何 mock 假数据)
    hasUnread: false,
    unreadMessages: [],
    loadingUnread: false,
    readMessages: [],
    loadingRead: false,
    readPageNo: 1,
    readPageSize: 10,
    readTotal: 0,
    readHasMore: true,

    // 定位目标：{ momentId, msgType, timestamp }
    locateTarget: null
  }),

  getters: {
    filteredMoments: (state) => {
      // 动态数据已通过后端基于 circleId 精确过滤或全部加载返回
      return state.moments
    },
    unreadCount: (state) => {
      return state.unreadMessages.length
    }
  },

  actions: {
    formatMessage(item) {
      let content = item.content || {}
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content)
        } catch (_) {
          content = { msg: item.content }
        }
      }
      let authorName = item.fromId || content.fromId || content.author || item.author || ''
      if (!authorName && (content.msg || item.msg)) {
        const text = content.msg || item.msg || ''
        const m = text.match(/^(.*?)(?:在你的动态中|回复了你的|评论了你的)/)
        if (m && m[1].trim()) {
          authorName = m[1].trim()
        }
      }
      if (!authorName) {
        authorName = '圈友'
      }

      let avatar = item.avatar || content.avatar
      if (!avatar || avatar.includes('default_avatar.jpg')) {
        avatar = getUserAvatar(authorName)
      }
      return {
        id: item.id,
        msgType: content.msgType || 'COMMENT',
        msg: content.msg || item.msg || '有新的互动消息，快去看看吧',
        targetId: content.targetId || item.targetId || null,
        author: authorName,
        avatar,
        time: formatTimeAgo(item.createdTime),
        createdTime: item.createdTime,
        isRead: item.isRead ?? 1
      }
    },

    async fetchCircles() {
      try {
        const res = await getCircleList()
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const loaded = [
            { id: 'all', name: '全部动态', circleId: null }
          ]
          res.data.forEach((p) => {
            if (Array.isArray(p.children) && p.children.length > 0) {
              p.children.forEach((c) => {
                loaded.push({
                  id: String(c.id),
                  name: c.circleName,
                  circleId: c.id,
                  icon: c.icon
                })
              })
            } else {
              loaded.push({
                id: String(p.id),
                name: p.circleName,
                circleId: p.id,
                icon: p.icon
              })
            }
          })
          if (loaded.length > 1) {
            this.channels = loaded
            if (!this.channels.some((c) => c.id === this.currentChannel)) {
              this.currentChannel = 'all'
            }
          }
        }
      } catch (e) {
        console.warn('fetchCircles error:', e)
      }
    },

    async fetchMoments() {
      this.loadingMoments = true
      try {
        const currentCh = this.channels.find((c) => c.id === this.currentChannel)
        const circleId = (currentCh && currentCh.id !== 'all') ? currentCh.circleId : null
        const res = await getMoments(circleId, 1, 50)

        if (res && res.success && res.data && Array.isArray(res.data.result)) {
          const list = res.data.result.map((item) => {
            const chObj = this.channels.find((c) => c.circleId === item.circleId) || { name: '技术交流' }

            // 从内容中解析真实的 hashtag 标签（如 #高并发 #Redis），若无则保持真实空数组
            const tagMatches = item.content ? (item.content.match(/#[^\s#]+/g) || []) : []
            const tags = [...new Set(tagMatches)]

            const authorName = item.userName || item.createdBy || '随风'
            let avatar = item.userAvatar
            if (!avatar || avatar.includes('default_avatar.jpg')) {
              avatar = getUserAvatar(authorName)
            }

            const rawImages = item.picUrlList || []
            const validImages = Array.isArray(rawImages)
              ? rawImages.filter(
                  (img) =>
                    img &&
                    typeof img === 'string' &&
                    img.startsWith('http') &&
                    !img.includes('default_avatar') &&
                    !img.endsWith('.html')
                )
              : []

            return {
              id: item.id,
              author: authorName,
              avatar,
              badge: '',
              time: formatTimeAgo(item.createdTime),
              circleId: item.circleId,
              channelId: String(item.circleId),
              channelName: chObj.name,
              content: item.content,
              tags,
              images: validImages,
              likes: Number(item.likes ?? item.likeCount ?? 0),
              liked: Boolean(item.liked ?? item.hasLiked ?? false),
              replyCount: item.replyCount || 0
            }
          })

          this.moments = list
        } else {
          this.moments = []
        }
      } catch (e) {
        console.error('fetchMoments error:', e)
        this.moments = []
      } finally {
        this.loadingMoments = false
      }
    },

    async getMomentDetail(momentId) {
      const numericId = Number(momentId)
      let found = this.moments.find((m) => Number(m.id) === numericId)
      if (found) return found

      // 向后端拉取全量动态寻找该动态
      try {
        const res = await getMoments(null, 1, 100)
        if (res && res.success && res.data && Array.isArray(res.data.result)) {
          const raw = res.data.result.find((item) => Number(item.id) === numericId)
          if (raw) {
            const chObj = this.channels.find((c) => c.circleId === raw.circleId) || { name: '技术交流' }
            const tagMatches = raw.content ? (raw.content.match(/#[^\s#]+/g) || []) : []
            const authorName = raw.userName || raw.createdBy || '随风'
            let avatar = raw.userAvatar
            if (!avatar || avatar.includes('default_avatar.jpg')) {
              avatar = getUserAvatar(authorName)
            }
            return {
              id: raw.id,
              author: authorName,
              avatar,
              badge: '',
              time: formatTimeAgo(raw.createdTime),
              circleId: raw.circleId,
              channelId: String(raw.circleId),
              channelName: chObj.name,
              content: raw.content,
              tags: [...new Set(tagMatches)],
              images: raw.picUrlList || [],
              likes: Number(raw.likes ?? raw.likeCount ?? 0),
              liked: Boolean(raw.liked ?? raw.hasLiked ?? false),
              replyCount: raw.replyCount || 0
            }
          }
        }
      } catch (e) {
        console.error('getMomentDetail error:', e)
      }
      return null
    },

    async fetchComments(momentId) {
      this.loadingCommentsMap[momentId] = true
      try {
        const res = await getCommentList(momentId)
        if (res && res.success && Array.isArray(res.data)) {
          const comments = []
          res.data.forEach((root) => {
            const rootName = root.userName || root.createdBy || '随风学员'
            let rootAvatar = root.avatar
            if (!rootAvatar || rootAvatar.includes('default_avatar.jpg')) {
              rootAvatar = getUserAvatar(rootName)
            }

            const replies = extractReplies(root, rootName)

            comments.push({
              id: root.id,
              momentId: root.momentId,
              user: rootName,
              avatar: rootAvatar,
              text: root.content,
              time: formatTimeAgo(root.createdTime),
              createdTime: root.createdTime,
              replyType: root.replyType || 1,
              children: replies
            })
          })

          this.momentCommentsMap[momentId] = comments

          // 同步动态卡片评论总数
          const totalReplies = comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)
          const m = this.moments.find((item) => item.id === momentId)
          if (m) {
            m.replyCount = totalReplies
          }

          if (this.activeComment && this.activeMoment?.id === momentId) {
            const updated = comments.find((c) => c.id === this.activeComment.id)
            if (updated) {
              this.activeComment = updated
            }
          }
        }
      } catch (e) {
        console.warn('fetchComments error:', e)
      } finally {
        this.loadingCommentsMap[momentId] = false
      }
    },

    // 针对动态发布主评论（replyType = 1）
    async addComment({ momentId, content }) {
      if (!content || !content.trim()) return { success: false, message: '评论内容不能为空' }

      try {
        const res = await saveComment({
          momentId,
          replyType: 1,
          targetId: momentId,
          content: content.trim()
        })

        if (res && res.success) {
          await this.fetchComments(momentId)
          await this.checkUnread()
          return { success: true }
        } else {
          return { success: false, message: res?.message || '评论发布失败' }
        }
      } catch (e) {
        console.error('addComment error:', e)
        return { success: false, message: e.message || '网络异常' }
      }
    },

    // 针对已有评论或回复发表二级/深层回复（replyType = 2）
    async addReply({ momentId, targetId, content }) {
      if (!content || !content.trim()) return { success: false, message: '回复内容不能为空' }

      try {
        const res = await saveComment({
          momentId,
          replyType: 2,
          targetId,
          content: content.trim()
        })

        if (res && res.success) {
          await this.fetchComments(momentId)
          await this.checkUnread()
          return { success: true }
        } else {
          return { success: false, message: res?.message || '回复发布失败' }
        }
      } catch (e) {
        console.error('addReply error:', e)
        return { success: false, message: e.message || '网络连接异常' }
      }
    },

    async deleteComment(momentId, commentId, replyType = 1) {
      try {
        const res = await removeComment(commentId, replyType)
        if (res && res.success) {
          await this.fetchComments(momentId)
          return { success: true }
        }
      } catch (e) {
        console.error('deleteComment error:', e)
      }
      return { success: false }
    },

    openCommentDetail(moment, comment) {
      this.activeMoment = moment
      this.activeComment = comment
      this.commentDetailOpen = true
    },

    closeCommentDetail() {
      this.commentDetailOpen = false
      this.activeMoment = null
      this.activeComment = null
    },

    checkSensitiveWords() {
      return []
    },

    async publishMoment({ content, channel, images = [] }) {
      if (!content || !content.trim()) {
        return { success: false, message: '动态内容不能为空！' }
      }

      const targetChannel = this.channels.find(
        (c) => c.id === String(channel) || c.circleId === Number(channel)
      )
      const circleId = targetChannel?.circleId || (this.currentChannel !== 'all' ? Number(this.currentChannel) : 101)

      try {
        const res = await saveMoment({
          circleId,
          content: content.trim(),
          picUrlList: images
        })

        if (res && res.success) {
          this.momentModalOpen = false
          await this.fetchMoments()
          return { success: true }
        } else {
          return { success: false, message: res?.message || '发布动态失败' }
        }
      } catch (e) {
        console.error('publishMoment error:', e)
        return { success: false, message: e.message || '网络连接异常' }
      }
    },

    switchChannel(channelId) {
      this.currentChannel = channelId
      this.fetchMoments()
    },

    openMomentModal() {
      this.momentModalOpen = true
    },

    closeMomentModal() {
      this.momentModalOpen = false
    },

    async toggleLikeMoment(id, targetMoment = null) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        authStore.openLoginModal()
        return
      }

      const numericId = Number(id)
      const m = this.moments.find((item) => Number(item.id) === numericId)
      const target = targetMoment || m || (Number(this.activeMoment?.id) === numericId ? this.activeMoment : null)
      if (!target) return

      const oldLiked = Boolean(target.liked)
      const oldLikes = Number(target.likes || 0)
      const nextLiked = !oldLiked
      const nextLikes = Math.max(0, oldLikes + (nextLiked ? 1 : -1))

      // 乐观更新 UI
      target.liked = nextLiked
      target.likes = nextLikes

      if (m && m !== target) {
        m.liked = nextLiked
        m.likes = nextLikes
      }

      try {
        const res = await likeMoment(numericId, nextLiked ? 1 : 0)
        if (!res || !res.success) {
          // 回滚
          target.liked = oldLiked
          target.likes = oldLikes
          if (m && m !== target) {
            m.liked = oldLiked
            m.likes = oldLikes
          }
          alert(res?.message || '点赞操作失败，请稍后重试')
        }
      } catch (e) {
        // 网络异常回滚
        target.liked = oldLiked
        target.likes = oldLikes
        if (m && m !== target) {
          m.liked = oldLiked
          m.likes = oldLikes
        }
        console.error('toggleLikeMoment error:', e)
      }
    },

    async deleteMoment(momentId) {
      try {
        const res = await removeMoment(momentId)
        if (res && res.success) {
          this.moments = this.moments.filter((item) => item.id !== momentId)
          return { success: true }
        }
      } catch (e) {
        console.error('deleteMoment error:', e)
      }
      return { success: false }
    },

    // =========================================================================
    // 消息通知模块 (基于后端 /share/message 真实数据)
    // =========================================================================
    async checkUnread() {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (!token) {
        this.hasUnread = false
        this.unreadMessages = []
        return
      }
      try {
        const res = await hasUnreadMessages()
        if (res && res.success) {
          this.hasUnread = Boolean(res.data)
        } else {
          this.hasUnread = false
        }
      } catch (e) {
        console.warn('checkUnread error:', e)
        this.hasUnread = false
      }
    },

    async fetchUnreadMessages() {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (!token) {
        this.unreadMessages = []
        this.hasUnread = false
        return
      }
      this.loadingUnread = true
      try {
        const res = await getMessages(1, 20, 2) // isRead: 2 查未读
        if (res && res.success && res.data) {
          const records = res.data.result || res.data.records || []
          this.unreadMessages = records.map((item) => this.formatMessage(item))
          this.hasUnread = this.unreadMessages.length > 0
        } else {
          this.unreadMessages = []
          this.hasUnread = false
        }
      } catch (e) {
        console.error('fetchUnreadMessages error:', e)
        this.unreadMessages = []
        this.hasUnread = false
      } finally {
        this.loadingUnread = false
      }
    },

    // 已读通知滑动加载实现 (每次分页请求 pageSize 条，滚动触底继续自增追加)
    async fetchReadMessages(reset = false) {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (!token) {
        this.readMessages = []
        this.readTotal = 0
        this.readHasMore = false
        return
      }
      if (this.loadingRead) return
      if (reset) {
        this.readPageNo = 1
        this.readMessages = []
        this.readHasMore = true
      } else if (!this.readHasMore) {
        return
      }

      this.loadingRead = true
      try {
        const res = await getMessages(this.readPageNo, this.readPageSize, 1) // isRead: 1 查已读
        if (res && res.success && res.data) {
          const records = res.data.result || res.data.records || []
          const total = res.data.total ?? records.length
          this.readTotal = total
          const formatted = records.map((item) => this.formatMessage(item))

          if (reset) {
            this.readMessages = formatted
          } else {
            const existingIds = new Set(this.readMessages.map((m) => m.id))
            formatted.forEach((item) => {
              if (!existingIds.has(item.id)) {
                this.readMessages.push(item)
              }
            })
          }

          this.readHasMore = this.readMessages.length < total
          if (this.readHasMore) {
            this.readPageNo += 1
          }
        } else {
          if (reset) {
            this.readMessages = []
            this.readTotal = 0
          }
          this.readHasMore = false
        }
      } catch (e) {
        console.error('fetchReadMessages error:', e)
        if (reset) {
          this.readMessages = []
          this.readTotal = 0
        }
        this.readHasMore = false
      } finally {
        this.loadingRead = false
      }
    },

    // 标为已读
    markMessageRead(messageId) {
      const idx = this.unreadMessages.findIndex((m) => m.id === messageId)
      if (idx !== -1) {
        const [msg] = this.unreadMessages.splice(idx, 1)
        msg.isRead = 1
        this.readMessages.unshift(msg)
        this.readTotal += 1
        if (this.unreadMessages.length === 0) {
          this.hasUnread = false
        }
      }
    },

    markAllRead() {
      if (this.unreadMessages.length > 0) {
        const moved = this.unreadMessages.map((m) => ({ ...m, isRead: 1 }))
        this.readMessages.unshift(...moved)
        this.readTotal += moved.length
        this.unreadMessages = []
        this.hasUnread = false
      }
    },

    setLocateTarget(target) {
      this.locateTarget = {
        momentId: target.momentId,
        msgType: target.msgType,
        targetCommentId: target.targetCommentId,
        timestamp: Date.now()
      }
    }
  }
})
