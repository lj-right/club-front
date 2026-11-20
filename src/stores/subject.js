import { defineStore } from 'pinia'
import {
  queryPrimaryCategory,
  queryCategoryByPrimary,
  queryLabelByCategoryId,
  querySubjectInfo,
  getSubjectPage,
  subjectLiked,
  getSubjectPageBySearch,
  getContributeList
} from '@/api/subject'
import { formatQuestionTimeAgo } from '@/utils/format'

const PRIMARY_NAME_TO_ID = {
  general: 1,
  '通用技术': 1,
  frontend: 2,
  '前端开发': 2,
  backend: 3,
  '后端开发': 3,
  mobile: 4,
  '移动端开发': 4,
  database: 5,
  '数据库技术': 5,
  devops: 6,
  '云原生与 DevOps': 6,
  architecture: 7,
  '系统架构': 7,
  ai: 8,
  'AI 与机器学习': 8,
  career: 9,
  '职业素养': 9
}

const DEFAULT_PRIMARIES = [
  { id: 1, name: '通用技术', dbId: 1 },
  { id: 2, name: '前端开发', dbId: 2 },
  { id: 3, name: '后端开发', dbId: 3 },
  { id: 4, name: '移动端开发', dbId: 4 },
  { id: 5, name: '数据库技术', dbId: 5 },
  { id: 6, name: '云原生与 DevOps', dbId: 6 },
  { id: 7, name: '系统架构', dbId: 7 },
  { id: 8, name: 'AI 与机器学习', dbId: 8 },
  { id: 9, name: '职业素养', dbId: 9 }
]

function formatViews(num) {
  const n = parseInt(num) || 0
  if (n >= 10000) {
    return (n / 1000).toFixed(1) + 'k'
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + 'k'
  }
  return n.toString()
}

function formatTimeAgo(timeStr, fallbackSeed) {
  return formatQuestionTimeAgo(timeStr, fallbackSeed)
}

export const useSubjectStore = defineStore('subject', {
  state: () => ({
    primaryCategories: DEFAULT_PRIMARIES,
    currentPrimaryId: 1, // 1: 后端开发, 2: 前端开发, ...
    subCategories: {},
    currentSubId: 'all',
    selectedLabels: [],
    difficultyFilter: 'all', // 'all', 'easy', 'medium', 'hard'
    sortOrder: 'hot', // 'hot' (1), 'latest' (2)
    reciteMode: false,

    // Real database questions
    questions: [],
    totalQuestions: 0,
    loadingQuestions: false,
    pageNo: 1,
    pageSize: 5,

    // 今日必刷随机推荐题目
    todayQuestions: [],
    loadingTodayQuestions: false,

    // 全站高频题目榜（Redis随机缓存5道，有效期1天）
    hotQuestionsList: [],
    loadingHotQuestions: false,

    // Drawer state
    drawerOpen: false,
    currentQuestion: null,
    drawerTab: 0,

    // Global search
    searchModalOpen: false,
    searchQuery: '',
    searchResults: [],

    // 出题贡献榜
    contributeList: []
  }),
  getters: {
    currentSubCategoryList: (state) => {
      const pId = state.currentPrimaryId
      return state.subCategories[pId] || []
    },
    activeSubCategory: (state) => {
      const pId = state.currentPrimaryId
      const list = state.subCategories[pId] || []
      return list.find((s) => s.id == state.currentSubId) || list[0] || {}
    },
    filteredQuestions: (state) => {
      return state.questions
    },
    hotQuestions: (state) => {
      if (state.hotQuestionsList && state.hotQuestionsList.length > 0) {
        return state.hotQuestionsList
      }
      return [...state.questions].sort((a, b) => (b.readCount || 0) - (a.readCount || 0)).slice(0, 5)
    }
  },
  actions: {
    getPrimaryDbId(primaryId) {
      if (typeof primaryId === 'number') return primaryId
      return PRIMARY_NAME_TO_ID[primaryId] || 1
    },

    async fetchCategories() {
      try {
        const res = await queryPrimaryCategory(1)
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.primaryCategories = res.data.map((c) => ({
            id: c.id,
            dbId: c.id,
            name: c.categoryName
          }))
          if (!this.primaryCategories.some((c) => c.id === this.currentPrimaryId)) {
            this.currentPrimaryId = this.primaryCategories[0].id
          }
        }
      } catch (e) {
        console.warn('queryPrimaryCategory fallback to defaults:', e)
      }

      await this.loadSubCategoriesForCurrentPrimary()
      await this.fetchSubjectPage()
    },

    async loadSubCategoriesForCurrentPrimary() {
      const pDbId = this.getPrimaryDbId(this.currentPrimaryId)
      const currentPrimaryObj = this.primaryCategories.find((c) => c.id === this.currentPrimaryId)
      const primaryName = currentPrimaryObj ? currentPrimaryObj.name : '后端'

      try {
        const subRes = await queryCategoryByPrimary(pDbId, 2)
        if (subRes && subRes.success && Array.isArray(subRes.data)) {
          const subs = await Promise.all(
            subRes.data.map(async (s) => {
              let labelNames = []
              let labelObjs = []
              try {
                const lblRes = await queryLabelByCategoryId(s.id)
                if (lblRes && lblRes.success && Array.isArray(lblRes.data)) {
                  labelObjs = lblRes.data.map((l) => ({ id: l.id, name: l.labelName }))
                  labelNames = lblRes.data.map((l) => l.labelName)
                }
              } catch (_) {}

              return {
                id: s.id,
                dbId: s.id,
                name: s.categoryName,
                count: s.count || 0,
                labels: labelNames,
                labelObjs: labelObjs
              }
            })
          )

          const totalSubCount = subs.reduce((acc, cur) => acc + (cur.count || 0), 0)
          let shortName = primaryName
          if (primaryName.includes('前端')) shortName = '前端'
          else if (primaryName.includes('后端')) shortName = '后端'
          else if (primaryName.includes('移动端')) shortName = '移动端'
          else if (primaryName.includes('通用')) shortName = '通用'
          else if (primaryName.includes('数据库')) shortName = '数据库'
          else if (primaryName.includes('云原生')) shortName = '云原生'
          else if (primaryName.includes('系统架构')) shortName = '系统架构'
          else if (primaryName.includes('AI') || primaryName.includes('机器学习')) shortName = 'AI'
          else if (primaryName.includes('职业素养')) shortName = '职业素养'
          else shortName = primaryName.replace(/开发|技术/, '')

          const allItem = {
            id: 'all',
            dbId: 0,
            name: '全部' + shortName,
            count: totalSubCount,
            labels: ['高频必考', '大厂核心', '底层源码', '实战避坑'],
            labelObjs: []
          }

          this.subCategories[this.currentPrimaryId] = [allItem, ...subs]
        }
      } catch (err) {
        console.warn('queryCategoryByPrimary error:', err)
      }
    },

    async selectPrimary(id) {
      this.currentPrimaryId = id
      this.currentSubId = 'all'
      this.selectedLabels = []
      this.pageNo = 1
      await this.loadSubCategoriesForCurrentPrimary()
      await this.fetchSubjectPage()
    },

    async selectSub(id) {
      this.currentSubId = id
      this.selectedLabels = []
      this.pageNo = 1
      await this.fetchSubjectPage()
    },

    async toggleLabel(label) {
      const idx = this.selectedLabels.indexOf(label)
      if (idx >= 0) {
        this.selectedLabels.splice(idx, 1)
      } else {
        this.selectedLabels = [label] // Single label filter or multi
      }
      this.pageNo = 1
      await this.fetchSubjectPage()
    },

    async clearLabels() {
      this.selectedLabels = []
      this.pageNo = 1
      await this.fetchSubjectPage()
    },

    async setDifficulty(diff) {
      this.difficultyFilter = diff
      this.pageNo = 1
      await this.fetchSubjectPage()
    },

    async setSort(sort) {
      this.sortOrder = sort
      this.pageNo = 1
      await this.fetchSubjectPage()
    },

    async changePage(page) {
      const maxPage = Math.ceil((this.totalQuestions || 0) / (this.pageSize || 5)) || 1
      let target = parseInt(page, 10) || 1
      if (target < 1) target = 1
      if (target > maxPage) target = maxPage
      if (this.pageNo === target) return
      this.pageNo = target
      await this.fetchSubjectPage()
    },

    async fetchSubjectPage() {
      this.loadingQuestions = true
      try {
        const pDbId = this.getPrimaryDbId(this.currentPrimaryId)

        // Determine categoryId:
        // If currentSubId === 'all', query all subjects under the primary category
        // If currentSubId is a specific secondary category, query that secondary category
        let categoryId = pDbId
        if (this.currentSubId !== 'all') {
          categoryId = typeof this.currentSubId === 'number'
            ? this.currentSubId
            : (this.activeSubCategory?.dbId || pDbId)
        }

        // Determine labelId:
        let labelId = null
        if (this.selectedLabels.length > 0) {
          const sub = this.activeSubCategory
          if (sub && sub.labelObjs && sub.labelObjs.length > 0) {
            const found = sub.labelObjs.find((l) => this.selectedLabels.includes(l.name))
            if (found) labelId = found.id
          }
        }

        // Determine difficulty (1: 简单, 2: 中等, 3: 困难)
        let subjectDifficult = null
        if (this.difficultyFilter === 'easy') subjectDifficult = 1
        else if (this.difficultyFilter === 'medium') subjectDifficult = 2
        else if (this.difficultyFilter === 'hard') subjectDifficult = 3

        // Determine sortType (1: 最热, 2: 最新)
        const sortType = this.sortOrder === 'latest' ? 2 : 1

        const payload = {
          categoryId,
          labelId,
          subjectDifficult,
          sortType,
          pageNo: this.pageNo || 1,
          pageSize: this.pageSize || 5
        }

        const res = await getSubjectPage(payload)
        if (res && res.success && res.data) {
          const records = res.data.result || []
          const diffMap = { 1: '简单', 2: '中等', 3: '困难' }
          const typeMap = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }

          this.questions = records.map((d) => {
            const diffText = diffMap[d.subjectDifficult] || '中等'
            const typeText = typeMap[d.subjectType] || '简答题'
            const viewsCount = d.readCount != null ? Number(d.readCount) : 0
            const viewsFormatted = formatViews(viewsCount)
            const summaryText = (d.subjectParse || d.subjectAnswer || '').trim()

            const qId = d.id || d.subjectId
            const rawTime = d.updateTime || d.updatedTime || d.modifyTime || d.createdTime || d.createTime || d.gmtModified || d.gmtCreate

            return {
              id: qId,
              title: d.subjectName,
              primaryCat: pDbId,
              subCat: d.categoryId || categoryId,
              difficulty: diffText,
              diffCode: d.subjectDifficult,
              type: typeText,
              views: viewsFormatted,
              readCount: viewsCount,
              timeAgo: formatTimeAgo(rawTime, qId),
              author: d.settleName || d.createdBy || '随风',
              summary: summaryText,
              answer: summaryText,
              label: (d.labelNames && d.labelNames[0]) || '核心考点',
              labels: d.labelNames || ['核心考点'],
              tags: d.labelNames || ['核心考点'],
              solutionHtml: summaryText
            }
          })
          this.totalQuestions = res.data.total || 0
        } else {
          this.questions = []
          this.totalQuestions = 0
        }
      } catch (err) {
        console.error('fetchSubjectPage failed:', err)
        this.questions = []
      } finally {
        this.loadingQuestions = false
      }
    },

    async fetchRandomTodayQuestions(force = false) {
      if (this.todayQuestions.length > 0 && !force) return
      this.loadingTodayQuestions = true
      try {
        const total = this.totalQuestions || 1042
        const totalPages = Math.max(1, Math.floor(total / 6))
        // 随机挑选一个分页页码，覆盖全量题库
        const randomPage = Math.floor(Math.random() * Math.min(totalPages, 50)) + 1
        const pDbId = this.getPrimaryDbId(this.currentPrimaryId)
        const res = await getSubjectPage({
          categoryId: pDbId,
          pageNo: randomPage,
          pageSize: 6
        })
        if (res && res.success && res.data && Array.isArray(res.data.result)) {
          const diffMap = { 1: '简单', 2: '中等', 3: '困难' }
          const typeMap = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }
          this.todayQuestions = res.data.result.map((d) => {
            const diffText = diffMap[d.subjectDifficult] || '中等'
            const typeText = typeMap[d.subjectType] || '简答题'
            const viewsCount = d.readCount != null ? Number(d.readCount) : 0
            const summaryText = (d.subjectParse || d.subjectAnswer || '').trim()
            const qId = d.id || d.subjectId
            const rawTime = d.updateTime || d.updatedTime || d.modifyTime || d.createdTime || d.createTime || d.gmtModified || d.gmtCreate
            return {
              id: qId,
              title: d.subjectName,
              difficulty: diffText,
              type: typeText,
              views: formatViews(viewsCount),
              readCount: viewsCount,
              timeAgo: formatTimeAgo(rawTime, qId),
              author: d.settleName || d.createdBy || '架构专家',
              summary: summaryText,
              answer: summaryText,
              label: (d.labelNames && d.labelNames[0]) || '核心考点',
              labels: d.labelNames || ['核心考点'],
              tags: d.labelNames || ['核心考点'],
              company: ['大厂真题']
            }
          })
        }
      } catch (err) {
        console.error('fetchRandomTodayQuestions error:', err)
      } finally {
        this.loadingTodayQuestions = false
      }
    },

    async fetchHotSubjectList() {
      this.loadingHotQuestions = true
      try {
        const pDbId = this.getPrimaryDbId(this.currentPrimaryId)
        const res = await getSubjectPage({
          categoryId: pDbId,
          sortType: 1,
          pageNo: 1,
          pageSize: 5
        })
        if (res && res.success && res.data && Array.isArray(res.data.result)) {
          const diffMap = { 1: '简单', 2: '中等', 3: '困难' }
          const typeMap = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }
          this.hotQuestionsList = res.data.result.map((d) => {
            const diffText = diffMap[d.subjectDifficult] || '中等'
            const typeText = typeMap[d.subjectType] || '简答题'
            const viewsCount = d.readCount != null ? Number(d.readCount) : 0
            const summaryText = (d.subjectParse || d.subjectAnswer || '').trim()
            const qId = d.id || d.subjectId
            const rawTime = d.updateTime || d.updatedTime || d.modifyTime || d.createdTime || d.createTime || d.gmtModified || d.gmtCreate
            return {
              id: qId,
              title: d.subjectName || '高频真题',
              difficulty: diffText,
              type: typeText,
              author: d.settleName || d.createdBy || '架构专家',
              timeAgo: formatTimeAgo(rawTime, qId),
              views: formatViews(viewsCount),
              rawViews: viewsCount,
              summary: summaryText,
              answer: summaryText,
              tags: d.labelNames && d.labelNames.length > 0 ? d.labelNames : [typeText],
              company: ['全站高频']
            }
          })
        }
      } catch (err) {
        console.error('fetchHotSubjectList error:', err)
      } finally {
        this.loadingHotQuestions = false
      }
    },

    toggleReciteMode() {
      this.reciteMode = !this.reciteMode
    },

    async openDrawer(questionId) {
      let q = this.questions.find((item) => item.id === questionId)
      if (!q) {
        q = this.todayQuestions.find((item) => item.id === questionId)
      }
      if (!q) {
        q = this.hotQuestions.find((item) => item.id === questionId)
      }
      if (q) {
        this.currentQuestion = {
          ...q,
          answer: q.summary || q.solutionHtml || q.answer,
          code: q.code || '',
          labels: q.tags || (q.label ? [q.label] : [])
        }
      }

      this.drawerOpen = true
      this.drawerTab = 0

      if (typeof questionId === 'number') {
        try {
          const res = await querySubjectInfo(questionId)
          if (res && res.success && res.data) {
            const d = res.data
            const summaryText = (d.subjectParse || d.subjectAnswer || this.currentQuestion?.answer || '').trim()
            const qId = d.id || questionId
            const rawTime = d.updateTime || d.updatedTime || d.modifyTime || d.createdTime || d.createTime || d.gmtModified || d.gmtCreate
            this.currentQuestion = {
              ...this.currentQuestion,
              id: qId,
              title: d.subjectName || this.currentQuestion?.title,
              answer: summaryText,
              summary: summaryText,
              labels: d.labelNames || this.currentQuestion?.labels || ['核心考点'],
              liked: d.liked,
              likedCount: d.likedCount || this.currentQuestion?.likes || 0,
              timeAgo: formatTimeAgo(rawTime, qId)
            }
          }
        } catch (e) {
          console.warn('Backend detail query:', e)
        }
      }
    },

    closeDrawer() {
      this.drawerOpen = false
    },

    navigateDrawer(direction) {
      const list = this.filteredQuestions
      if (!this.currentQuestion || list.length === 0) return
      const idx = list.findIndex((q) => q.id === this.currentQuestion.id)
      const nextIdx = idx + direction
      if (nextIdx >= 0 && nextIdx < list.length) {
        this.openDrawer(list[nextIdx].id)
      }
    },

    async toggleLikeCurrentQuestion() {
      if (!this.currentQuestion) return
      const q = this.currentQuestion
      q.liked = !q.liked
      q.likes = (q.likes || 0) + (q.liked ? 1 : -1)

      const item = this.questions.find((x) => x.id === q.id)
      if (item) {
        item.liked = q.liked
        item.likes = q.likes
      }

      if (typeof q.id === 'number') {
        try {
          await subjectLiked(q.id, q.liked ? 1 : 0)
        } catch (e) {
          console.error(e)
        }
      }
    },

    toggleMasterCurrentQuestion() {
      if (!this.currentQuestion) return
      const q = this.currentQuestion
      q.mastered = !q.mastered
      const item = this.questions.find((x) => x.id === q.id)
      if (item) {
        item.mastered = q.mastered
      }
    },

    toggleMasterQuestion(id) {
      const item = this.questions.find((x) => x.id === id)
      if (item) {
        item.mastered = !item.mastered
      }
    },

    openSearchModal() {
      this.searchModalOpen = true
      this.searchQuery = ''
      this.searchResults = this.questions.slice(0, 6)
    },

    closeSearchModal() {
      this.searchModalOpen = false
    },

    async handleSearch(query) {
      this.searchQuery = query
      if (!query.trim()) {
        this.searchResults = this.questions.slice(0, 6)
        return
      }
      try {
        const res = await getSubjectPageBySearch({
          keyWord: query.trim(),
          pageNo: 1,
          pageSize: 20
        })
        if (res && res.success && res.data && Array.isArray(res.data.result) && res.data.result.length > 0) {
          const diffMap = { 1: 'easy', 2: 'medium', 3: 'hard' }
          this.searchResults = res.data.result.map((d) => {
            const qId = d.subjectId || d.id
            const rawTime = d.updateTime || d.updatedTime || d.modifyTime || d.createdTime || d.createTime || d.gmtModified || d.gmtCreate
            return {
              id: qId,
              title: d.subjectName ? d.subjectName.replace(/<[^>]+>/g, '') : '',
              highlightTitle: d.subjectName || '',
              difficulty: diffMap[d.subjectDifficult] || 'medium',
              labels: d.labelNames && d.labelNames.length > 0 ? d.labelNames : ['核心考点'],
              categoryNames: d.categoryNames || [],
              company: ['大厂真题'],
              answer: d.subjectAnswer || '',
              summary: d.subjectParse || d.subjectAnswer || '',
              timeAgo: formatTimeAgo(rawTime, qId)
            }
          })
          return
        }
      } catch (err) {
        console.warn('Backend search error, falling back to local filter:', err)
      }

      // 降级回退：本地内存模糊搜索
      const qLower = query.toLowerCase()
      this.searchResults = this.questions.filter((item) => {
        return (
          item.title.toLowerCase().includes(qLower) ||
          (item.label && item.label.toLowerCase().includes(qLower)) ||
          (item.tags || []).some((l) => l.toLowerCase().includes(qLower)) ||
          (item.author && item.author.toLowerCase().includes(qLower))
        )
      })
    },

    async fetchContributeList() {
      try {
        const res = await getContributeList()
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.contributeList = res.data
        }
      } catch (err) {
        console.warn('Failed to fetch contribute list:', err)
      }
    }
  }
})
