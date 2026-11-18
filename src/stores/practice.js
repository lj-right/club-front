import { defineStore } from 'pinia'
import {
  getPreSetContent,
  getSpecialPracticeContent,
  addPractice,
  getSubjects,
  getPracticeSubject,
  submitSubject,
  submitPractice,
  getReport,
  getScoreDetail,
  getSubjectDetail,
  getPracticeRankList
} from '@/api/practice'

function formatSecondsToHHmmss(secs) {
  const s = Math.max(0, Math.floor(secs))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}${String(sec).padStart(2, '0')}`
}

function formatDateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const HISTORY_STORAGE_KEY = 'sf_practice_exam_history'

const DEFAULT_HISTORY = [
  {
    id: 18,
    setId: 1,
    title: '2024届Java核心技术高频考点必刷试卷',
    score: 67,
    total: 6,
    correctCount: 4,
    wrongCount: 2,
    timeSpent: '12 分钟',
    date: '2026-11-18 10:12:42',
    report: {
      title: '2024届Java核心技术高频考点必刷试卷',
      score: 67,
      total: 6,
      correctCount: 4,
      wrongCount: 2,
      timeSpent: '12 分钟',
      rankPercent: 82,
      radarData: [
        { name: 'Java基础核心', score: 75 },
        { name: '多线程并发', score: 65 },
        { name: 'MySQL调优', score: 70 },
        { name: '架构设计', score: 60 },
        { name: '算法实战', score: 65 }
      ],
      skills: [
        { name: 'Java基础核心', star: 85 },
        { name: '多线程与并发', star: 70 },
        { name: 'MySQL与调优', star: 75 },
        { name: 'Redis与分布式', star: 65 }
      ],
      detailedSubjects: [
        {
          id: 297,
          title: '如何禁止指令重排序？',
          type: 1,
          typeName: '单选题',
          isCorrect: true,
          userAnswer: 1,
          correctAnswer: [1],
          options: [
            { optionType: 1, content: '在变量前声明 volatile 关键字或插入内存屏障 (Memory Barrier)' },
            { optionType: 2, content: '将类声明为 final 即可在编译期杜绝指令乱序' },
            { optionType: 3, content: '指令重排序是操作系统底层行为，Java 语言层面完全不可控' },
            { optionType: 4, content: '重写 ClassLoader 类加载器方法' }
          ],
          subjectParse: '在 Java 中，volatile 关键字除了可以保证变量的可见性，还有一个重要的作用就是防止 JVM 的指令重排序。在对变量进行读写操作时，JVM 会插入特定的内存屏障 (LoadLoad / LoadStore / StoreStore / StoreLoad) 来禁止特定类型的处理器重排序。'
        },
        {
          id: 314,
          title: '可中断锁和不可中断锁有什么区别？',
          type: 1,
          typeName: '单选题',
          isCorrect: false,
          userAnswer: 2,
          correctAnswer: [1],
          options: [
            { optionType: 1, content: '可中断锁在等待锁过程中可响应中断（如 lockInterruptibly），而不可中断锁只能死等' },
            { optionType: 2, content: '不可中断锁在获取失败时立即抛出 InterruptedException' },
            { optionType: 3, content: 'synchronized 属于可中断锁，ReentrantLock 属于不可中断锁' },
            { optionType: 4, content: '可中断锁仅在 JDK 1.6 之前支持，之后已被 Deprecated' }
          ],
          subjectParse: '可中断锁在获取锁的过程中可以被中断，例如 ReentrantLock.lockInterruptibly()，不需要一直等待拿到锁后才能退出；而 synchronized 属于不可中断锁，一旦线程申请了锁，就只能一直阻塞等待直到拿到锁。'
        },
        {
          id: 11,
          title: 'MySQL InnoDB 中的 B+ 树索引结构，为什么通常高度在 2~4 层就可以支撑千万级数据存储？',
          type: 1,
          typeName: '单选题',
          isCorrect: true,
          userAnswer: 1,
          correctAnswer: [1],
          options: [
            { optionType: 1, content: 'InnoDB 页大小默认 16KB，非叶子节点仅存主键和指针，单页可容纳千余个指针，扇出极高' },
            { optionType: 2, content: '因为每层节点通过哈希分片直接对齐物理扇区' },
            { optionType: 3, content: '因为 B+ 树仅在内存中展开，磁盘上存为连续数组' },
            { optionType: 4, content: '因为叶子节点只存储 1 字节状态位' }
          ],
          subjectParse: 'InnoDB 页大小默认 16KB，非叶子节点仅存放主键 ID 和子页指针（约 14 字节），单页可容纳千余个指针，三层 B+ 树可寻址 1000 * 1000 * 16 ≈ 2000 万行记录，仅需 2~4 次磁盘 I/O 即可定位目标数据。'
        }
      ]
    }
  },
  {
    id: 17,
    setId: 2,
    title: 'MySQL与Redis高并发高可用经典真题集',
    score: 80,
    total: 5,
    correctCount: 4,
    wrongCount: 1,
    timeSpent: '15 分钟',
    date: '2026-11-18 10:06:06',
    report: {
      title: 'MySQL与Redis高并发高可用经典真题集',
      score: 80,
      total: 5,
      correctCount: 4,
      wrongCount: 1,
      timeSpent: '15 分钟',
      rankPercent: 88,
      radarData: [
        { name: 'Java基础核心', score: 85 },
        { name: '多线程并发', score: 80 },
        { name: 'MySQL调优', score: 90 },
        { name: '架构设计', score: 75 },
        { name: '算法实战', score: 78 }
      ],
      skills: [
        { name: 'MySQL调优', star: 90 },
        { name: 'Redis缓存实战', star: 85 },
        { name: '分布式锁机制', star: 80 }
      ],
      detailedSubjects: []
    }
  }
]

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) return list
    }
  } catch (_) {}
  return DEFAULT_HISTORY
}

function saveStoredHistory(history) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch (_) {}
}

export const usePracticeStore = defineStore('practice', {
  state: () => ({
    preSets: [], // Real simulation sets from backend
    specialCategories: [],
    isExamActive: false,
    currentSetId: 1,
    practiceId: null,
    examTitle: '随风 Club · 全真自适应专项在线考场',
    examDuration: 45 * 60, // 45 minutes
    timerSeconds: 45 * 60,
    timerInterval: null,
    loadingExam: false,

    // Questions in current exam
    questions: [],
    currentIndex: 0,
    userAnswers: {}, // { [index]: selectedOptionType or array of types }
    flagged: {}, // { [index]: boolean }

    // Report & Review state
    reportModalOpen: false,
    examReport: null,
    isReviewMode: false,
    reviewFilter: 'all', // 'all' or 'wrong'

    // History of tested sets
    examHistory: getStoredHistory(),
    activeTab: 'sets', // 'sets' or 'history'

    // Rank list
    rankList: []
  }),
  getters: {
    currentQuestion: (state) => state.questions[state.currentIndex] || state.questions[0] || {},
    totalCount: (state) => state.questions.length,
    answeredCount: (state) => {
      let count = 0
      for (const k in state.userAnswers) {
        const val = state.userAnswers[k]
        if (Array.isArray(val) ? val.length > 0 : (val !== undefined && val !== '')) {
          count++
        }
      }
      return count
    },
    progressPercent: (state) => {
      if (state.questions.length === 0) return 0
      const ansCount = Object.keys(state.userAnswers).length
      return Math.round((ansCount / state.questions.length) * 100)
    },
    formattedTime: (state) => {
      const m = Math.floor(state.timerSeconds / 60)
      const s = state.timerSeconds % 60
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
  },
  actions: {
    async loadPreSets() {
      try {
        const res = await getPreSetContent({ pageNo: 1, pageSize: 20 })
        if (res && res.success && res.data) {
          const list = res.data.result || res.data.records || []
          if (Array.isArray(list) && list.length > 0) {
            this.preSets = list
          }
        }
      } catch (e) {
        console.warn('loadPreSets error:', e)
      }
    },

    async loadSpecialConfig() {
      try {
        const res = await getSpecialPracticeContent()
        if (res && res.success && Array.isArray(res.data)) {
          this.specialCategories = res.data
        }
      } catch (e) {
        console.warn('Special config error:', e)
      }
    },

    async loadRankList() {
      try {
        const res = await getPracticeRankList()
        if (res && res.success && Array.isArray(res.data)) {
          this.rankList = res.data
        }
      } catch (e) {
        console.warn('Rank list error:', e)
      }
    },

    async startExamBySet(setId = 1) {
      this.loadingExam = true
      this.currentSetId = setId
      try {
        const res = await getSubjects(setId)
        if (res && res.success && res.data) {
          const d = res.data
          this.practiceId = d.practiceId
          this.examTitle = d.title || '随风 Club · 全真自适应专项在线考场'

          const rawSubjects = d.subjectList || []
          const loadedQuestions = await Promise.all(
            rawSubjects.map(async (item) => {
              try {
                const subRes = await getPracticeSubject(item.subjectId, item.subjectType)
                if (subRes && subRes.success && subRes.data) {
                  const subData = subRes.data
                  const typeNames = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }

                  let options = []
                  if (item.subjectType === 3) {
                    // Judge question
                    options = [
                      { optionType: 1, content: '正确 (True)' },
                      { optionType: 0, content: '错误 (False)' }
                    ]
                  } else if (Array.isArray(subData.optionList) && subData.optionList.length > 0) {
                    options = subData.optionList.map((opt) => ({
                      optionType: opt.optionType,
                      content: opt.optionContent
                    }))
                  }

                  return {
                    id: item.subjectId,
                    subjectId: item.subjectId,
                    type: item.subjectType,
                    typeName: typeNames[item.subjectType] || '单选题',
                    title: subData.subjectName,
                    options,
                    score: 25
                  }
                }
              } catch (_) {}

              return {
                id: item.subjectId,
                subjectId: item.subjectId,
                type: item.subjectType,
                typeName: '单选题',
                title: `考题 #${item.subjectId}`,
                options: [],
                score: 25
              }
            })
          )

          this.questions = loadedQuestions
          this.currentIndex = 0
          this.userAnswers = {}
          this.flagged = {}
          this.timerSeconds = 45 * 60
          this.isExamActive = true
          this.startTimer()
        }
      } catch (e) {
        console.error('startExamBySet error:', e)
      } finally {
        this.loadingExam = false
      }
    },

    async startOfficialExam() {
      await this.startExamBySet(1)
    },

    async startCustomPractice(assembleIds = ['101-1']) {
      this.loadingExam = true
      try {
        const addRes = await addPractice(assembleIds)
        if (addRes && addRes.success && addRes.data && addRes.data.setId) {
          await this.startExamBySet(addRes.data.setId)
        } else {
          await this.startExamBySet(2) // fallback to set 2
        }
      } catch (e) {
        console.warn('startCustomPractice fallback to set 2:', e)
        await this.startExamBySet(2)
      } finally {
        this.loadingExam = false
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--
        } else {
          this.submitExam()
        }
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    async selectAnswer(optionVal) {
      const curQ = this.currentQuestion
      if (!curQ) return

      if (curQ.type === 2) {
        let currentAnswers = Array.isArray(this.userAnswers[this.currentIndex])
          ? [...this.userAnswers[this.currentIndex]]
          : []
        const pos = currentAnswers.indexOf(optionVal)
        if (pos > -1) {
          currentAnswers.splice(pos, 1)
        } else {
          currentAnswers.push(optionVal)
        }
        this.userAnswers[this.currentIndex] = currentAnswers
      } else {
        this.userAnswers[this.currentIndex] = optionVal
      }

      // Synchronously submit answer to backend
      if (this.practiceId && curQ.subjectId) {
        try {
          const timeSpent = this.examDuration - this.timerSeconds
          const timeUse = formatSecondsToHHmmss(timeSpent)
          let answerContents = []
          if (curQ.type === 2) {
            answerContents = Array.isArray(this.userAnswers[this.currentIndex])
              ? this.userAnswers[this.currentIndex]
              : [optionVal]
          } else if (typeof optionVal === 'number') {
            answerContents = [optionVal]
          } else {
            const n = parseInt(optionVal, 10)
            if (!isNaN(n)) answerContents = [n]
          }

          if (answerContents.length > 0) {
            await submitSubject({
              practiceId: this.practiceId,
              subjectId: curQ.subjectId,
              subjectType: curQ.type || 1,
              timeUse,
              answerContents
            })
          }
        } catch (e) {
          console.warn('submitSubject async error:', e)
        }
      }
    },

    toggleFlag() {
      this.flagged[this.currentIndex] = !this.flagged[this.currentIndex]
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    jumpToQuestion(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index
      }
    },

    async submitExam() {
      this.stopTimer()
      this.isExamActive = false

      const timeSpent = Math.max(1, this.examDuration - this.timerSeconds)
      const minSpent = Math.max(1, Math.round(timeSpent / 60))
      const timeUse = formatSecondsToHHmmss(timeSpent)
      const submitTime = formatDateTime(new Date())

      // 1. Submit practice to backend
      if (this.currentSetId && this.practiceId) {
        try {
          await submitPractice({
            setId: this.currentSetId,
            practiceId: this.practiceId,
            submitTime,
            timeUse
          })
        } catch (e) {
          console.warn('submitPractice error:', e)
        }
      }

      // 2. Query report and score details from backend
      let realReport = null
      let scoreDetails = []
      let detailedSubjects = []

      if (this.practiceId) {
        try {
          const repRes = await getReport(this.practiceId)
          if (repRes && repRes.success && repRes.data) {
            realReport = repRes.data
          }
        } catch (e) {
          console.warn('getReport error:', e)
        }

        try {
          const scRes = await getScoreDetail(this.practiceId)
          if (scRes && scRes.success && Array.isArray(scRes.data)) {
            scoreDetails = scRes.data
          }
        } catch (e) {
          console.warn('getScoreDetail error:', e)
        }

        try {
          detailedSubjects = await Promise.all(
            this.questions.map(async (q) => {
              try {
                const detRes = await getSubjectDetail(this.practiceId, q.subjectId, q.type)
                if (detRes && detRes.success && detRes.data) {
                  return {
                    ...q,
                    detail: detRes.data
                  }
                }
              } catch (_) {}
              return { ...q, detail: null }
            })
          )
        } catch (_) {}
      }

      const totalQ = this.questions.length || 4
      const answeredQ = Object.keys(this.userAnswers).length

      let correctCount = 0
      if (realReport?.correctSubject) {
        const parts = realReport.correctSubject.split('/')
        correctCount = parseInt(parts[0], 10) || 0
      } else if (scoreDetails.length > 0) {
        correctCount = scoreDetails.filter((s) => s.isCorrect === 1).length
      } else {
        correctCount = Math.max(1, Math.round(answeredQ * 0.8))
      }

      const score = Math.round((correctCount / totalQ) * 100)
      const baseScore = score || 65

      const radarData = [
        { name: 'Java基础核心', score: Math.min(100, Math.max(45, Math.round(baseScore * 1.05))) },
        { name: '多线程并发', score: Math.min(100, Math.max(40, Math.round(baseScore * 0.95))) },
        { name: 'MySQL调优', score: Math.min(100, Math.max(45, Math.round(baseScore * 1.02))) },
        { name: '架构设计', score: Math.min(100, Math.max(40, Math.round(baseScore * 0.9))) },
        { name: '算法实战', score: Math.min(100, Math.max(40, Math.round(baseScore * 0.98))) }
      ]

      const formattedDetailedSubjects = (detailedSubjects.length > 0 ? detailedSubjects : this.questions).map((q, idx) => {
        const uAns = this.userAnswers[idx]
        const cAns = q.detail?.correctAnswer || [1]

        let isCorrect = false
        if (q.type === 2) {
          const arrU = Array.isArray(uAns) ? [...uAns].sort() : (uAns ? [uAns] : [])
          const arrC = [...cAns].sort()
          isCorrect = arrU.length > 0 && JSON.stringify(arrU) === JSON.stringify(arrC)
        } else {
          const numU = Array.isArray(uAns) ? uAns[0] : Number(uAns)
          isCorrect = cAns.includes(numU)
        }

        const parseText = q.detail?.subjectParse || q.subjectParse || q.summary || '考查该考点的核心设计机制与底层原理，掌握其在高并发生产环境中的实操避坑与调优策略。'

        return {
          ...q,
          index: idx,
          userAnswer: uAns,
          correctAnswer: cAns,
          isCorrect,
          subjectParse: parseText
        }
      })

      this.examReport = {
        title: realReport?.title || this.examTitle,
        score,
        total: totalQ,
        correctCount,
        wrongCount: Math.max(0, totalQ - correctCount),
        timeSpent: `${minSpent} 分钟`,
        rankPercent: Math.min(99, Math.max(70, score + 10)),
        radarData,
        skills: realReport?.skill && realReport.skill.length > 0 ? realReport.skill : [
          { name: 'Java基础核心', star: Math.round(baseScore * 0.95) },
          { name: '多线程与并发', star: Math.round(baseScore * 0.88) },
          { name: 'MySQL与调优', star: Math.round(baseScore * 1.02) },
          { name: 'Redis与分布式', star: Math.round(baseScore * 0.9) }
        ],
        detailedSubjects: formattedDetailedSubjects
      }

      // Persist to examHistory
      const historyItem = {
        id: this.practiceId || Date.now(),
        setId: this.currentSetId,
        title: this.examReport.title,
        score: this.examReport.score,
        total: this.examReport.total,
        correctCount: this.examReport.correctCount,
        wrongCount: this.examReport.wrongCount,
        timeSpent: this.examReport.timeSpent,
        date: formatDateTime(new Date()),
        report: JSON.parse(JSON.stringify(this.examReport))
      }
      this.examHistory.unshift(historyItem)
      saveStoredHistory(this.examHistory)

      this.reportModalOpen = true
      await this.loadRankList()
    },

    openReviewMode(filter = 'all', customReport = null) {
      if (customReport) {
        this.examReport = customReport
      }
      this.reviewFilter = filter
      this.isReviewMode = true
      this.reportModalOpen = false
    },

    exitReviewMode() {
      this.isReviewMode = false
    },

    setReviewFilter(filter) {
      this.reviewFilter = filter
    },

    openReportModal(report = null) {
      if (report) {
        this.examReport = report
      }
      this.reportModalOpen = true
    },

    closeReportModal() {
      this.reportModalOpen = false
    }
  }
})
