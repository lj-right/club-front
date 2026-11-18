import { defineStore } from 'pinia'
import {
  getCircleList,
  getMoments,
  saveMoment,
  removeMoment,
  getCommentList,
  saveComment,
  removeComment
} from '@/api/circle'
import { getUserAvatar } from '@/utils/avatars'

const LIKES_STORAGE_KEY = 'sf_circle_moment_likes'
const DEFAULT_AVATAR = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'

function getStoredLikes() {
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (_) {
    return {}
  }
}

function saveStoredLikes(likesMap) {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likesMap))
  } catch (_) {}
}

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

const DEFAULT_CHANNELS = [
  { id: 'all', name: '全部动态', circleId: null },
  { id: 'tech', name: '技术交流', circleId: 101 },
  { id: 'interview', name: '职场面经', circleId: 103 },
  { id: 'architecture', name: '架构心得', circleId: 102 },
  { id: 'daily', name: '每日打卡', circleId: 101 }
]

export const useCircleStore = defineStore('circle', {
  state: () => ({
    channels: DEFAULT_CHANNELS,
    currentChannel: 'all',
    moments: [],
    loadingMoments: false,
    momentModalOpen: false,
    momentCommentsMap: {}, // { [momentId]: [ { id, user, avatar, text, time } ] }
    loadingCommentsMap: {} // { [momentId]: boolean }
  }),
  getters: {
    filteredMoments: (state) => {
      if (state.currentChannel === 'all') return state.moments
      return state.moments.filter((m) => m.channel === state.currentChannel)
    }
  },
  actions: {
    async fetchCircles() {
      try {
        const res = await getCircleList()
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const loaded = [{ id: 'all', name: '全部动态', circleId: null }]
          res.data.forEach((p) => {
            if (Array.isArray(p.children)) {
              p.children.forEach((c) => {
                let code = 'tech'
                if (c.circleName.includes('面经')) code = 'interview'
                else if (c.circleName.includes('架构')) code = 'architecture'
                else if (c.circleName.includes('打卡')) code = 'daily'
                loaded.push({
                  id: code,
                  name: c.circleName.replace(/圈$/, ''),
                  circleId: c.id
                })
              })
            }
          })
          if (loaded.length > 1) {
            // Keep unique by id
            const unique = []
            const seen = new Set()
            loaded.forEach((ch) => {
              if (!seen.has(ch.id)) {
                seen.add(ch.id)
                unique.push(ch)
              }
            })
            if (!unique.some((c) => c.id === 'daily')) {
              unique.push({ id: 'daily', name: '每日打卡', circleId: 101 })
            }
            this.channels = unique
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
        const circleId = currentCh?.circleId || null
        const res = await getMoments(circleId, 1, 30)

        const stored = getStoredLikes()

        if (res && res.success && res.data && Array.isArray(res.data.result)) {
          const list = res.data.result.map((item) => {
            const likedInfo = stored[item.id]
            let ch = 'tech'
            if (item.circleId === 103) ch = 'interview'
            else if (item.circleId === 102) ch = 'architecture'
            else if (item.circleId === 101) ch = 'tech'

            const chObj = this.channels.find((c) => c.circleId === item.circleId) || { name: '技术交流' }

            let tags = ['#高并发实战', '#大厂考点']
            if (ch === 'interview') tags = ['#秋招面经', '#字节跳动', '#真实复盘']
            else if (ch === 'architecture') tags = ['#微服务架构', '#分布式锁', '#生产调优']
            else if (ch === 'daily') tags = ['#每日打卡', '#坚持刷题']

            const authorName = item.userName || item.createdBy || '随风'
            let avatar = item.userAvatar
            if (!avatar || avatar.includes('default_avatar.jpg')) {
              avatar = getUserAvatar(authorName)
            }

            let badge = '资深架构师'
            if (authorName.includes('架构')) badge = '中间件研发'
            else if (authorName.includes('菜鸟') || authorName.includes('前端')) badge = '全栈开发者'
            else if (authorName === '超级管理员') badge = '平台维护者'
            else if (authorName === '随风') badge = '全栈架构师'
            else if (authorName === '测试小伙伴') badge = '活跃开源答主'

            return {
              id: item.id,
              author: authorName,
              avatar,
              badge,
              time: formatTimeAgo(item.createdTime),
              channel: ch,
              channelName: chObj.name,
              circleId: item.circleId,
              content: item.content,
              tags,
              images: item.picUrlList || [],
              likes: likedInfo?.likes ?? 88,
              liked: likedInfo?.liked ?? false,
              replyCount: item.replyCount || 0
            }
          })

          this.moments = list
        }
      } catch (e) {
        console.warn('fetchMoments error:', e)
      } finally {
        this.loadingMoments = false
      }
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

            comments.push({
              id: root.id,
              momentId: root.momentId,
              user: rootName,
              avatar: rootAvatar,
              text: root.content,
              time: formatTimeAgo(root.createdTime)
            })
            if (Array.isArray(root.children)) {
              root.children.forEach((sub) => {
                const subName = sub.userName || sub.createdBy || '随风学员'
                let subAvatar = sub.avatar
                if (!subAvatar || subAvatar.includes('default_avatar.jpg')) {
                  subAvatar = getUserAvatar(subName)
                }

                comments.push({
                  id: sub.id,
                  momentId: sub.momentId,
                  user: subName,
                  avatar: subAvatar,
                  text: `@${rootName} ${sub.content}`,
                  time: formatTimeAgo(sub.createdTime)
                })
              })
            }
          })
          this.momentCommentsMap[momentId] = comments

          // Update replyCount on moment
          const m = this.moments.find((item) => item.id === momentId)
          if (m) {
            m.replyCount = comments.length
          }
        }
      } catch (e) {
        console.warn('fetchComments error:', e)
      } finally {
        this.loadingCommentsMap[momentId] = false
      }
    },

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
          // Immediately reload comments from backend database
          await this.fetchComments(momentId)
          return { success: true }
        } else {
          return { success: false, message: res?.message || '评论发布失败' }
        }
      } catch (e) {
        console.error('addComment error:', e)
        return { success: false, message: e.message || '网络异常' }
      }
    },

    async deleteComment(momentId, commentId) {
      try {
        const res = await removeComment(commentId, 1)
        if (res && res.success) {
          await this.fetchComments(momentId)
          return { success: true }
        }
      } catch (e) {
        console.error('deleteComment error:', e)
      }
      return { success: false }
    },

    async publishMoment({ content, channel, tags = [], images = [] }) {
      if (!content || !content.trim()) {
        return { success: false, message: '动态内容不能为空！' }
      }

      // Map channel to backend circleId
      let circleId = 101
      if (channel === 'interview') circleId = 103
      else if (channel === 'architecture') circleId = 102
      else if (channel === 'tech') circleId = 101

      try {
        const res = await saveMoment({
          circleId,
          content: content.trim(),
          picUrlList: images
        })

        if (res && res.success) {
          this.momentModalOpen = false
          // Reload from backend database
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

    toggleLikeMoment(id) {
      const m = this.moments.find((item) => item.id === id)
      if (m) {
        m.liked = !m.liked
        m.likes += m.liked ? 1 : -1

        // 持久化点赞状态至 localStorage
        const stored = getStoredLikes()
        stored[id] = {
          liked: m.liked,
          likes: m.likes
        }
        saveStoredLikes(stored)
      }
    }
  }
})
