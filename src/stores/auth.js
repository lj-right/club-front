import { defineStore } from 'pinia'
import { doLogin, getUserInfo, logOut, updateUserInfo } from '@/api/auth'
import { uploadFile } from '@/api/oss'

const DEFAULT_AVATAR = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    loginModalOpen: false,
    checkedIn: localStorage.getItem('checkedIn_today') === '1',
    streakDays: 42
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
    avatar: (state) => {
      const a = state.userInfo?.avatar
      if (a) {
        if (a.includes('oss.sfclub.com')) {
          return DEFAULT_AVATAR
        }
        return a
      }
      return DEFAULT_AVATAR
    },
    nickname: (state) => state.userInfo?.nickName || state.userInfo?.userName || '随风'
  },
  actions: {
    openLoginModal() {
      this.loginModalOpen = true
    },
    closeLoginModal() {
      this.loginModalOpen = false
    },
    async login(validCode) {
      try {
        const res = await doLogin(validCode)
        if (res && res.success && res.data) {
          const tokenValue = res.data.tokenValue
          this.token = tokenValue
          localStorage.setItem('token', tokenValue)

          const loginId = res.data.loginId || 'suifeng'
          await this.loadUserInfo(loginId)
          this.loginModalOpen = false
          return { success: true }
        } else {
          return { success: false, message: res?.message || '验证码错误或已过期' }
        }
      } catch (err) {
        return { success: false, message: err.message || '网络连接失败' }
      }
    },
    async quickLogin(username = 'suifeng') {
      try {
        const res = await doLogin('123456')
        if (res && res.success && res.data) {
          const tokenValue = res.data.tokenValue
          this.token = tokenValue
          localStorage.setItem('token', tokenValue)
          await this.loadUserInfo(username)
          this.loginModalOpen = false
          return
        }
      } catch (e) {
        console.warn('Real quickLogin attempt:', e)
      }
      const tokenValue = '1skSwOnWQKKhMSRwufQ9UILIGQ3zDG1H'
      this.token = tokenValue
      localStorage.setItem('token', tokenValue)
      await this.loadUserInfo(username)
      this.loginModalOpen = false
    },
    async loadUserInfo(userName) {
      try {
        const res = await getUserInfo(userName)
        if (res && res.success && res.data) {
          let u = res.data
          if (!u.avatar || u.avatar.includes('oss.sfclub.com')) {
            u.avatar = DEFAULT_AVATAR
          }
          this.userInfo = u
          localStorage.setItem('userInfo', JSON.stringify(u))
        } else {
          this.userInfo = {
            id: 2,
            userName: userName,
            nickName: userName === 'suifeng' ? '随风' : '测试小伙伴',
            avatar: DEFAULT_AVATAR,
            introduce: '全栈架构师，sf-club 核心创作者',
            email: `${userName}@sfclub.com`
          }
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        }
      } catch (e) {
        this.userInfo = {
          id: 2,
          userName: userName,
          nickName: '随风',
          avatar: DEFAULT_AVATAR,
          introduce: '全栈架构师，sf-club 核心创作者'
        }
      }
    },
    async uploadAvatar(file) {
      try {
        const res = await uploadFile(file, 'user', 'avatar')
        if (res && res.success && res.data) {
          const newUrl = res.data
          if (this.userInfo) {
            this.userInfo.avatar = newUrl
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
            await updateUserInfo(this.userInfo)
          }
          return newUrl
        }
      } catch (e) {
        console.error('uploadAvatar error:', e)
        throw e
      }
    },
    async logout() {
      if (this.userInfo?.userName) {
        try {
          await logOut(this.userInfo.userName)
        } catch (e) {
          console.error(e)
        }
      }
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    toggleCheckIn() {
      this.checkedIn = !this.checkedIn
      if (this.checkedIn) {
        this.streakDays++
        localStorage.setItem('checkedIn_today', '1')
      } else {
        this.streakDays = Math.max(0, this.streakDays - 1)
        localStorage.removeItem('checkedIn_today')
      }
    },
    async updateProfile(updates) {
      if (!this.userInfo) return
      this.userInfo = { ...this.userInfo, ...updates }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      try {
        await updateUserInfo(this.userInfo)
      } catch (e) {
        console.error(e)
      }
    }
  }
})
