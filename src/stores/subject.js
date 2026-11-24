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
  backend: 1,
  '后端开发': 1,
  frontend: 2,
  '前端开发': 2,
  bigdata: 3,
  '大数据与数仓': 3,
  algorithm: 4,
  '算法与数据结构': 4,
  architecture: 5,
  '高并发系统架构': 5,
  mobile: 6,
  '移动端开发': 6,
  qa: 7,
  '测试与质量保障': 7,
  devops: 8,
  '运维与DevOps': 8,
  ai: 9,
  '人工智能与大模型': 9,
  cloudnative: 10,
  '云原生与微服务': 10
}

const DEFAULT_PRIMARIES = [
  { id: 1, name: '后端开发', dbId: 1 },
  { id: 2, name: '前端开发', dbId: 2 },
  { id: 3, name: '大数据与数仓', dbId: 3 },
  { id: 4, name: '算法与数据结构', dbId: 4 },
  { id: 5, name: '高并发系统架构', dbId: 5 },
  { id: 6, name: '移动端开发', dbId: 6 },
  { id: 7, name: '测试与质量保障', dbId: 7 },
  { id: 8, name: '运维与DevOps', dbId: 8 },
  { id: 9, name: '人工智能与大模型', dbId: 9 },
  { id: 10, name: '云原生与微服务', dbId: 10 }
]

const GLOBAL_SUBJECT_MOCK_POOL = [
  {
    id: 1,
    title: '在Java中，HashMap在JDK 1.8中的底层数据结构是以下哪种组合？',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 101,
    categoryName: 'Java基础',
    labelId: 1,
    labelName: '集合框架',
    labels: ['集合框架'],
    categoryNames: ['Java基础'],
    difficulty: 'easy',
    type: '单选题',
    summary: 'JDK 1.8 中 HashMap 采用数组+链表+红黑树实现，当链表长度大于8且数组容量大于等于64时树化。',
    answer: 'JDK 1.8 中 HashMap 采用数组+链表+红黑树实现，当链表长度大于8且数组容量大于等于64时树化。'
  },
  {
    id: 2,
    title: '下列关于 Java 垃圾回收（GC）垃圾收集器的说法，哪些是正确的？',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 102,
    categoryName: 'JVM原理',
    labelId: 3,
    labelName: '垃圾回收GC',
    labels: ['垃圾回收GC'],
    categoryNames: ['JVM原理'],
    difficulty: 'medium',
    type: '多选题',
    summary: 'CMS收集器以获取最短回收停顿时间为目标，基于标记-清除算法；G1将堆划分为多个等大的Region；ZGC采用着色指针和读屏障技术。',
    answer: 'CMS收集器以获取最短回收停顿时间为目标，基于标记-清除算法；G1将堆划分为多个等大的Region；ZGC采用着色指针和读屏障技术。'
  },
  {
    id: 3,
    title: 'MySQL中的InnoDB存储引擎，默认的事务隔离级别是可重复读（Repeatable Read）。',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 104,
    categoryName: 'MySQL数据库',
    labelId: 8,
    labelName: '事务与MVCC',
    labels: ['事务与MVCC'],
    categoryNames: ['MySQL数据库'],
    difficulty: 'easy',
    type: '判断题',
    summary: 'InnoDB默认隔离级别为REPEATABLE READ，并通过Next-Key Lock锁算法在很大程度上解决了幻读问题。',
    answer: 'InnoDB默认隔离级别为REPEATABLE READ，并通过Next-Key Lock锁算法在很大程度上解决了幻读问题。'
  },
  {
    id: 4,
    title: '请简述 Spring 中 Bean 的生命周期流程。',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 103,
    categoryName: 'Spring生态',
    labelId: 5,
    labelName: 'IOC与AOP',
    labels: ['IOC与AOP'],
    categoryNames: ['Spring生态'],
    difficulty: 'hard',
    type: '简答题',
    summary: '生命周期核心步骤包括：实例化(Instantiation) -> 属性赋值(Populate) -> Aware接口回调 -> BeanPostProcessor前置处理 -> 初始化(InitializingBean/init-method) -> BeanPostProcessor后置处理 -> 投入使用 -> 销毁(DisposableBean)。',
    answer: '生命周期核心步骤包括：实例化(Instantiation) -> 属性赋值(Populate) -> Aware接口回调 -> BeanPostProcessor前置处理 -> 初始化(InitializingBean/init-method) -> BeanPostProcessor后置处理 -> 投入使用 -> 销毁(DisposableBean)。'
  },
  {
    id: 5,
    title: '在多线程编程中，volatile 关键字能够保证什么特性？',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 106,
    categoryName: '多线程与并发',
    labelId: 10,
    labelName: 'AQS与Lock',
    labels: ['AQS与Lock'],
    categoryNames: ['多线程与并发'],
    difficulty: 'medium',
    type: '单选题',
    summary: 'volatile 保证线程间的变量可见性并禁止指令重排序，但不保证复合操作的原子性。',
    answer: 'volatile 保证线程间的变量可见性并禁止指令重排序，但不保证复合操作的原子性。'
  },
  {
    id: 6,
    title: 'Redis 缓存穿透、缓存击穿与缓存雪崩的核心区别与对应解决方案是什么？',
    primaryCategoryId: 1,
    primaryCategoryName: '后端开发',
    categoryId: 105,
    categoryName: 'Redis缓存',
    labelId: 9,
    labelName: '缓存穿透与击穿',
    labels: ['缓存穿透与击穿'],
    categoryNames: ['Redis缓存'],
    difficulty: 'medium',
    type: '简答题',
    summary: '穿透：请求不存在的数据，用布隆过滤器或缓存空对象；击穿：热点Key瞬间失效高并发打崩DB，加互斥锁或逻辑永不过期；雪崩：大量Key同时过期，加随机TTL或Redis集群高可用。',
    answer: '穿透：请求不存在的数据，用布隆过滤器或缓存空对象；击穿：热点Key瞬间失效高并发打崩DB，加互斥锁或逻辑永不过期；雪崩：大量Key同时过期，加随机TTL或Redis集群高可用。'
  },
  {
    id: 7,
    title: 'Vue 3 的响应式原理与 Vue 2 的 Object.defineProperty 相比有哪些核心优势？',
    primaryCategoryId: 2,
    primaryCategoryName: '前端开发',
    categoryId: 201,
    categoryName: 'Vue.js生态',
    labelId: 21,
    labelName: '响应式原理',
    labels: ['响应式原理'],
    categoryNames: ['Vue.js生态'],
    difficulty: 'medium',
    type: '简答题',
    summary: 'Vue 3 采用 ES6 Proxy 代理整个对象，天然支持属性动态增删以及数组索引与长度变化的监听，且无需在初始化时深度递归遍历所有属性，性能与内存占用大幅优化。',
    answer: 'Vue 3 采用 ES6 Proxy 代理整个对象，天然支持属性动态增删以及数组索引与长度变化的监听，且无需在初始化时深度递归遍历所有属性，性能与内存占用大幅优化。'
  },
  {
    id: 8,
    title: '如何设计一个高可用的分布式锁？基于 Redis Redlock 算法有哪些关键权衡？',
    primaryCategoryId: 5,
    primaryCategoryName: '高并发系统架构',
    categoryId: 501,
    categoryName: '分布式组件',
    labelId: 51,
    labelName: '分布式锁',
    labels: ['分布式锁'],
    categoryNames: ['分布式组件'],
    difficulty: 'hard',
    type: '简答题',
    summary: 'Redlock 算法在多独立 Redis 节点上按序获取锁，当半数以上节点成功且耗时小于有效时间时判定加锁成功。权衡点在于时钟漂移、GC 暂停引发的安全性问题，需配合看门狗自动续期。',
    answer: 'Redlock 算法在多独立 Redis 节点上按序获取锁，当半数以上节点成功且耗时小于有效时间时判定加锁成功。权衡点在于时钟漂移、GC 暂停引发的安全性问题，需配合看门狗自动续期。'
  }
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
    contributeList: [],

    // 搜索定位专属高亮题目ID (用于题库列表平滑滚动与聚焦高亮)
    highlightedSubjectId: null
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
              labels: d.labelNames && d.labelNames.length > 0 ? d.labelNames : (d.labelName ? [d.labelName] : ['核心考点']),
              categoryNames: d.categoryNames || (d.categoryName ? [d.categoryName] : []),
              primaryCategoryId: d.primaryCategoryId,
              primaryCategoryName: d.primaryCategoryName,
              categoryId: d.categoryId,
              categoryName: d.categoryName,
              labelId: d.labelId,
              labelName: d.labelName,
              company: ['大厂真题'],
              answer: d.subjectAnswer || '',
              summary: d.subjectParse || d.subjectAnswer || '',
              timeAgo: formatTimeAgo(rawTime, qId)
            }
          })
          return
        }
      } catch (err) {
        console.warn('Backend search error, falling back to global mock pool:', err)
      }

      // 降级回退：全题库多维检索（覆盖所有一级职位、二级技术栈、三级知识点标签，支持无约束任意搜）
      const qLower = query.toLowerCase().trim()
      const searchPool = [...GLOBAL_SUBJECT_MOCK_POOL, ...this.questions]
      const seenIds = new Set()
      const uniquePool = []
      for (const item of searchPool) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id)
          uniquePool.push(item)
        }
      }

      this.searchResults = uniquePool
        .filter((item) => {
          return (
            (item.title && item.title.toLowerCase().includes(qLower)) ||
            (item.primaryCategoryName && item.primaryCategoryName.toLowerCase().includes(qLower)) ||
            (item.categoryName && item.categoryName.toLowerCase().includes(qLower)) ||
            (item.labelName && item.labelName.toLowerCase().includes(qLower)) ||
            (item.labels || []).some((l) => l.toLowerCase().includes(qLower)) ||
            (item.categoryNames || []).some((c) => c.toLowerCase().includes(qLower)) ||
            (item.summary && item.summary.toLowerCase().includes(qLower)) ||
            (item.answer && item.answer.toLowerCase().includes(qLower))
          )
        })
        .map((item) => {
          // 高亮匹配关键字
          let highlightTitle = item.title
          if (highlightTitle) {
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
            highlightTitle = highlightTitle.replace(regex, '<b style="color:red">$&</b>')
          }
          return {
            ...item,
            highlightTitle
          }
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
    },

    /**
     * 核心业务：搜索框定位重构（反向穿透定位）
     * 消除必须在指定标签中搜索的限制：支持全站任意检索，并在选中题目后精准定位到对应一级职位、二级技能分类、三级知识点胶囊及目标卡片
     */
    async locateSubjectInCategory(item, router) {
      if (!item) return

      // 1. 记录待高亮定位的目标题目ID
      this.highlightedSubjectId = item.id

      // 2. 路由跳转到题库页面
      if (router && router.currentRoute.value.path !== '/subject') {
        await router.push('/subject')
      }

      // 3. 确保一级分类已初始化
      if (!this.primaryCategories || this.primaryCategories.length === 0) {
        await this.fetchCategories()
      }

      // 4. 解析目标题目的一级职位ID、二级技能ID、三级标签名
      let targetPrimaryId = item.primaryCategoryId
      let targetSubId = item.categoryId
      let targetLabelName = item.labelName

      const targetCatNames = Array.isArray(item.categoryNames) ? item.categoryNames : []
      const targetLabels = Array.isArray(item.labels) ? item.labels : []
      const subCatName = item.categoryName || targetCatNames[0] || ''
      const lblName = targetLabelName || targetLabels[0] || ''

      // 若未直接提供数值 ID，通过职位与二级分类名称智能反查
      if (!targetPrimaryId || !targetSubId) {
        // 先在当前一级岗位下尝试查找二级技能
        let currentSubs = this.currentSubCategoryList || []
        let foundSub = currentSubs.find(
          (s) => s.name && (s.name.includes(subCatName) || subCatName.includes(s.name))
        )

        if (foundSub) {
          targetPrimaryId = this.currentPrimaryId
          targetSubId = foundSub.id
        } else {
          // 遍历全量岗位查找所属技能
          for (const p of this.primaryCategories) {
            const pId = p.dbId || p.id
            let subs = this.subCategories[pId]
            if (!subs || subs.length === 0) {
              try {
                const subRes = await queryCategoryByPrimary(pId, 2)
                if (subRes && subRes.success && Array.isArray(subRes.data)) {
                  subs = subRes.data.map((s) => ({
                    id: s.id,
                    dbId: s.id,
                    name: s.categoryName,
                    count: s.count || 0
                  }))
                  this.subCategories[pId] = subs
                }
              } catch (_) {}
            }
            if (subs && subs.length > 0) {
              const matched = subs.find(
                (s) => s.name && (s.name.includes(subCatName) || subCatName.includes(s.name))
              )
              if (matched) {
                targetPrimaryId = pId
                targetSubId = matched.id
                break
              }
            }
          }
        }
      }

      // 5. 切换一级职位 (Job Role)
      if (targetPrimaryId && targetPrimaryId !== this.currentPrimaryId) {
        this.currentPrimaryId = targetPrimaryId
        await this.loadSubCategoriesForCurrentPrimary()
      }

      // 6. 切换二级分类 (Skill & Middleware)
      if (targetSubId) {
        this.currentSubId = targetSubId
      }

      // 7. 切换三级知识点标签 (Knowledge Point Label)
      const activeSub = this.activeSubCategory
      if (activeSub && Array.isArray(activeSub.labels) && activeSub.labels.length > 0) {
        const foundLbl = activeSub.labels.find(
          (l) => lblName && (l.includes(lblName) || lblName.includes(l))
        )
        if (foundLbl) {
          this.selectedLabels = [foundLbl]
        } else {
          this.selectedLabels = []
        }
      } else {
        this.selectedLabels = []
      }

      // 8. 刷新题库题目列表
      this.pageNo = 1
      await this.fetchSubjectPage()

      // 9. 保证目标考题在当前题目列表中必现（若在后面的页码，将其置顶以便视觉焦点定位）
      const existsIndex = this.questions.findIndex((q) => q.id === item.id)
      if (existsIndex === -1) {
        const summaryText = (item.summary || item.answer || '').trim()
        const diffText = item.difficulty === 'easy' ? '简单' : item.difficulty === 'hard' ? '困难' : '中等'
        const rawTime = item.updateTime || item.updatedTime || item.createTime || ''
        this.questions.unshift({
          id: item.id,
          title: item.title || (item.highlightTitle ? item.highlightTitle.replace(/<[^>]+>/g, '') : '高频真题'),
          primaryCat: this.currentPrimaryId,
          subCat: this.currentSubId,
          difficulty: diffText,
          diffCode: item.difficulty === 'easy' ? 1 : item.difficulty === 'hard' ? 3 : 2,
          type: item.type || '简答题',
          views: '1.2k',
          readCount: 1200,
          timeAgo: formatTimeAgo(rawTime, item.id),
          author: item.author || '随风',
          summary: summaryText,
          answer: summaryText,
          label: lblName || '核心考点',
          labels: item.labels && item.labels.length > 0 ? item.labels : [lblName || '核心考点'],
          tags: item.labels && item.labels.length > 0 ? item.labels : [lblName || '核心考点'],
          solutionHtml: summaryText
        })
        this.totalQuestions = (this.totalQuestions || 0) + 1
      }

      // 10. 平滑滚动并高亮至视口中央
      setTimeout(() => {
        const el = document.getElementById(`subject-q-${item.id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 200)

      // 11. 保持高亮动画 3.5 秒
      setTimeout(() => {
        if (this.highlightedSubjectId === item.id) {
          this.highlightedSubjectId = null
        }
      }, 3500)
    }
  }
})
