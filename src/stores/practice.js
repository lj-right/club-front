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
  getPracticeRankList,
  getPracticeHistory,
  giveUpPractice,
  deletePractice,
  getUnCompletePractice
} from '@/api/practice'
import { querySubjectInfo } from '@/api/subject'

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

// Clean up legacy mock data from storage on module load
try {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (raw && (raw.includes('2024届Java核心技术') || raw.includes('MySQL与Redis高并发'))) {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
  }
} catch (_) {}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list)) {
        return list.filter((item) => item.id !== 18 && item.id !== 17 && item.title !== '2024届Java核心技术高频考点必刷试卷' && item.title !== 'MySQL与Redis高并发高可用经典真题集')
      }
    }
  } catch (_) {}
  return []
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
    examTitle: '烤面筋 · 全真自适应专项在线考场',
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
          this.examTitle = d.title || '在线考场模拟考试'

          const rawSubjects = d.subjectList || []
          if (rawSubjects.length === 0) {
            alert('该试卷暂无考题数据')
            return
          }

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
        } else {
          alert('获取试卷考题失败，请检查服务连接')
        }
      } catch (e) {
        console.error('startExamBySet error:', e)
        alert('启动考场失败，请确认后端考场服务正常运行')
      } finally {
        this.loadingExam = false
      }
    },

    async startOfficialExam() {
      await this.startExamBySet(1)
    },

    async startCustomPractice(assembleIds = []) {
      if (!assembleIds || assembleIds.length === 0) return
      this.loadingExam = true
      try {
        const addRes = await addPractice(assembleIds)
        if (addRes && addRes.success && addRes.data && addRes.data.setId) {
          await this.startExamBySet(addRes.data.setId)
        } else {
          alert('自定义组卷失败，请重试')
        }
      } catch (e) {
        console.warn('startCustomPractice error:', e)
        alert('组卷服务异常，请稍后再试')
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

    async saveCurrentAnswerToBackend(idx = null) {
      const qIdx = idx !== null ? idx : this.currentIndex
      const q = this.questions[qIdx]
      if (!q || !this.practiceId || !q.subjectId) return
      const sId = q.subjectId
      const userAns = this.userAnswers[sId] !== undefined ? this.userAnswers[sId] : this.userAnswers[qIdx]
      if (userAns === undefined || userAns === '' || (Array.isArray(userAns) && userAns.length === 0)) return

      try {
        const timeSpent = this.examDuration - this.timerSeconds
        const timeUse = formatSecondsToHHmmss(timeSpent)
        let answerContents = []
        let answerText = ''
        if (q.type === 4) {
          // 简答题/主观题：持久化文本内容至后端 practice_detail.answer_content
          answerText = typeof userAns === 'string' ? userAns.trim() : String(userAns || '')
          answerContents = []
        } else if (q.type === 2) {
          answerContents = Array.isArray(userAns) ? userAns : [userAns]
        } else if (typeof userAns === 'number') {
          answerContents = [userAns]
        } else {
          const n = parseInt(userAns, 10)
          if (!isNaN(n)) answerContents = [n]
        }

        if (answerContents.length > 0 || answerText) {
          await submitSubject({
            practiceId: this.practiceId,
            subjectId: q.subjectId,
            subjectType: q.type || 1,
            timeUse,
            answerContents,
            answerText
          })
        }
      } catch (e) {
        console.warn('submitSubject async error:', e)
      }
    },

    async selectAnswer(optionVal) {
      const curQ = this.currentQuestion
      if (!curQ) return
      const sId = curQ.subjectId || curQ.id

      if (curQ.type === 2) {
        let currentAnswers = Array.isArray(this.userAnswers[sId])
          ? [...this.userAnswers[sId]]
          : []
        const pos = currentAnswers.indexOf(optionVal)
        if (pos > -1) {
          currentAnswers.splice(pos, 1)
        } else {
          currentAnswers.push(optionVal)
        }
        this.userAnswers[sId] = currentAnswers
      } else {
        this.userAnswers[sId] = optionVal
      }

      await this.saveCurrentAnswerToBackend()
    },

    toggleFlag() {
      this.flagged[this.currentIndex] = !this.flagged[this.currentIndex]
    },

    async nextQuestion() {
      await this.saveCurrentAnswerToBackend()
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },

    async prevQuestion() {
      await this.saveCurrentAnswerToBackend()
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    async jumpToQuestion(index) {
      await this.saveCurrentAnswerToBackend()
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

      // 1. Flush all answers to backend
      if (this.practiceId) {
        await Promise.all(
          this.questions.map(async (_, idx) => {
            await this.saveCurrentAnswerToBackend(idx)
          })
        )
      }

      // 2. Submit practice to backend
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

      // 3. Query report, score details and subject details from backend
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
              let detailData = null
              try {
                const detRes = await getSubjectDetail(this.practiceId, q.subjectId, q.type)
                if (detRes && detRes.success && detRes.data) {
                  detailData = detRes.data
                }
              } catch (_) {}

              // Fallback to querySubjectInfo if parse is missing or empty
              if (!detailData || !detailData.subjectParse) {
                try {
                  const subInfoRes = await querySubjectInfo(q.subjectId)
                  if (subInfoRes && subInfoRes.success && subInfoRes.data) {
                    const info = subInfoRes.data
                    detailData = {
                      ...(detailData || {}),
                      subjectName: info.subjectName || q.title,
                      subjectParse: info.subjectParse || info.subjectAnswer || q.subjectParse,
                      subjectAnswer: info.subjectAnswer || info.subjectParse || q.subjectParse,
                      labelNames: info.labelNames || q.detail?.labelNames
                    }
                  }
                } catch (_) {}
              }

              return {
                ...q,
                detail: {
                  ...(q.detail || {}),
                  ...(detailData || {}),
                  subjectParse: detailData?.subjectParse || detailData?.subjectAnswer || q.subjectParse || q.detail?.subjectParse,
                  subjectAnswer: detailData?.subjectAnswer || detailData?.subjectParse || q.subjectAnswer || q.detail?.subjectAnswer
                },
                subjectParse: detailData?.subjectParse || detailData?.subjectAnswer || q.subjectParse || q.detail?.subjectParse
              }
            })
          )
        } catch (_) {}
      } else {
        // Fallback without practiceId (or custom exam)
        detailedSubjects = await Promise.all(
          this.questions.map(async (q) => {
            let detailData = null
            try {
              const subInfoRes = await querySubjectInfo(q.subjectId)
              if (subInfoRes && subInfoRes.success && subInfoRes.data) {
                const info = subInfoRes.data
                detailData = {
                  subjectName: info.subjectName || q.title,
                  subjectParse: info.subjectParse || info.subjectAnswer || q.subjectParse,
                  subjectAnswer: info.subjectAnswer || info.subjectParse || q.subjectParse,
                  labelNames: info.labelNames || q.detail?.labelNames,
                  optionList: info.optionList || q.options,
                  correctAnswer: q.correctAnswer
                }
              }
            } catch (_) {}
            return {
              ...q,
              detail: {
                ...(q.detail || {}),
                ...(detailData || {}),
                subjectParse: detailData?.subjectParse || detailData?.subjectAnswer || q.subjectParse || q.detail?.subjectParse,
                subjectAnswer: detailData?.subjectAnswer || detailData?.subjectParse || q.subjectAnswer || q.detail?.subjectAnswer
              },
              subjectParse: detailData?.subjectParse || detailData?.subjectAnswer || q.subjectParse || q.detail?.subjectParse
            }
          })
        )
      }

      const totalQ = this.questions.length || 0
      const answeredQ = Object.keys(this.userAnswers).length

      const formattedDetailedSubjects = (detailedSubjects.length > 0 ? detailedSubjects : this.questions).map((q, idx) => {
        const sId = q.subjectId || q.id
        let cAns = (q.detail?.correctAnswer && q.detail.correctAnswer.length > 0) ? q.detail.correctAnswer : []
        if (cAns.length === 0 && q.options && q.options.length > 0) {
          cAns = q.options.filter((o) => o.isCorrect).map((o) => o.optionType)
        }
        if (cAns.length === 0 && q.correctAnswer && q.correctAnswer.length > 0) {
          cAns = q.correctAnswer
        }

        const rawUserAns = this.userAnswers[sId]
        const userText = q.detail?.answerContent || (rawUserAns !== undefined && rawUserAns !== null ? String(rawUserAns) : '')
        const respAns = q.detail?.respondAnswer && q.detail.respondAnswer.length > 0
          ? q.detail.respondAnswer
          : (Array.isArray(rawUserAns) ? rawUserAns : (rawUserAns !== undefined && rawUserAns !== null && rawUserAns !== '' ? [Number(rawUserAns)] : []))

        const uAns = q.type === 4 ? userText : (respAns.length === 1 ? respAns[0] : respAns)

        let isCorrect = false
        // Check if scoreDetails explicitly rated this question
        const foundScore = scoreDetails.find((s) => s.subjectId === q.subjectId)
        if (foundScore && foundScore.isCorrect !== undefined) {
          isCorrect = foundScore.isCorrect === 1
        } else if (q.type === 4) {
          // 简答题：填写了作答内容即视为主观作答完成
          isCorrect = typeof uAns === 'string' ? uAns.trim().length > 0 : !!uAns
        } else if (q.type === 2) {
          const arrU = Array.isArray(uAns) ? [...uAns].map(Number).sort() : (uAns !== undefined && uAns !== null ? [Number(uAns)] : [])
          const arrC = [...cAns].map(Number).sort()
          isCorrect = arrU.length > 0 && JSON.stringify(arrU) === JSON.stringify(arrC)
        } else {
          const numU = Array.isArray(uAns) ? (uAns.length > 0 ? Number(uAns[0]) : null) : (uAns !== undefined && uAns !== null ? Number(uAns) : null)
          isCorrect = numU !== null && cAns.map(Number).includes(numU)
        }

        let options = []
        if (q.detail?.optionList && q.detail.optionList.length > 0) {
          options = q.detail.optionList.map((opt) => ({
            optionType: opt.optionType,
            content: opt.optionContent || opt.content,
            isCorrect: opt.isCorrect === 1 || cAns.map(Number).includes(Number(opt.optionType))
          }))
        } else if (q.type === 3) {
          options = [
            { optionType: 1, content: '正确 (True)', isCorrect: cAns.map(Number).includes(1) },
            { optionType: 0, content: '错误 (False)', isCorrect: cAns.map(Number).includes(0) }
          ]
        } else if (q.options && q.options.length > 0) {
          options = q.options.map((opt) => ({
            ...opt,
            isCorrect: opt.isCorrect ?? cAns.map(Number).includes(Number(opt.optionType))
          }))
        }

        const parseText = q.detail?.subjectParse || q.detail?.subjectAnswer || q.subjectParse || q.answer || '该考点标准解析已沉淀至题库。'

        return {
          ...q,
          index: idx,
          title: q.detail?.subjectName || q.title || `考题 #${sId}`,
          options,
          userAnswer: uAns,
          correctAnswer: cAns,
          isCorrect,
          subjectParse: parseText
        }
      })

      let correctCount = 0
      if (realReport?.correctSubject) {
        const parts = realReport.correctSubject.split('/')
        correctCount = parseInt(parts[0], 10) || 0
      } else if (scoreDetails.length > 0) {
        correctCount = scoreDetails.filter((s) => s.isCorrect === 1).length
      } else {
        correctCount = formattedDetailedSubjects.filter((s) => s.isCorrect).length
      }

      const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0

      // Construct dynamic radar and skill dimensions
      let reportSkills = []
      if (realReport?.skill && Array.isArray(realReport.skill) && realReport.skill.length > 0) {
        // 同名标签去重合并取均值
        const sMap = new Map()
        realReport.skill.forEach((s) => {
          const name = String(s.name || '核心技能').trim()
          const star = typeof s.star === 'number' && !isNaN(s.star) ? Math.round(s.star) : (score ?? 0)
          if (sMap.has(name)) {
            const prev = sMap.get(name)
            prev.star = Math.round((prev.star + star) / 2)
          } else {
            sMap.set(name, { name, star })
          }
        })
        reportSkills = Array.from(sMap.values())
      } else {
        // Build skills dynamically from questions
        const labelMap = {}
        formattedDetailedSubjects.forEach((q) => {
          const lbls = q.detail?.labelNames || ['核心技术']
          lbls.forEach((l) => {
            if (!labelMap[l]) labelMap[l] = { total: 0, correct: 0 }
            labelMap[l].total++
            if (q.isCorrect) labelMap[l].correct++
          })
        })
        reportSkills = Object.keys(labelMap).slice(0, 6).map((l) => ({
          name: l,
          star: labelMap[l].total > 0 ? Math.round((labelMap[l].correct / labelMap[l].total) * 100) : 0
        }))
      }

      // 控制 radarData 最多 5~6 个维度，保障雷达图多边形不拥挤
      const radarData = reportSkills.slice(0, 6).map((s) => ({
        name: s.name,
        score: Math.min(100, Math.max(0, typeof s.star === 'number' && !isNaN(s.star) ? s.star : score))
      }))

      this.examReport = {
        title: realReport?.title || this.examTitle,
        score,
        total: totalQ,
        correctCount,
        wrongCount: Math.max(0, totalQ - correctCount),
        timeSpent: `${minSpent} 分钟`,
        rankPercent: score === 0 ? 0 : Math.min(99, Math.max(0, Math.round(score * 0.95))),
        radarData,
        skills: reportSkills,
        detailedSubjects: formattedDetailedSubjects
      }

      // Persist to examHistory and sync with backend
      if (String(this.practiceId).startsWith('custom_')) {
        const customHistItem = {
          id: this.practiceId,
          practiceId: this.practiceId,
          setId: this.currentSetId,
          title: this.examTitle,
          date: submitTime,
          timeSpent: `${minSpent} 分钟`,
          score,
          total: totalQ,
          correctCount,
          wrongCount: Math.max(0, totalQ - correctCount),
          completeStatus: 1,
          report: this.examReport
        }
        this.examHistory = [customHistItem, ...this.examHistory.filter((h) => h.id !== this.practiceId)]
        saveStoredHistory(this.examHistory)
      } else {
        try {
          await this.loadExamHistory()
        } catch (_) {}
      }

      this.reportModalOpen = true
      await this.loadRankList()
    },

    async loadExamHistory() {
      try {
        const res = await getPracticeHistory({ pageInfo: { pageNo: 1, pageSize: 50 } })
        if (res && res.success && res.data) {
          const records = res.data.records || res.data.result || []
          this.examHistory = records.map((r) => ({
            id: r.practiceId || r.id,
            practiceId: r.practiceId || r.id,
            setId: r.setId,
            title: r.title,
            date: r.practiceTime,
            timeSpent: r.timeSpent,
            score: r.score,
            total: r.total || 0,
            correctCount: r.correctCount || 0,
            wrongCount: r.wrongCount !== undefined ? r.wrongCount : Math.max(0, (r.total || 0) - (r.correctCount || 0)),
            completeStatus: r.completeStatus
          }))
          saveStoredHistory(this.examHistory)
          return this.examHistory
        }
      } catch (e) {
        console.warn('loadExamHistory error:', e)
      }
    },

    async deleteHistoryItem(idOrPracticeId) {
      const target = this.examHistory.find(
        (h) => h.id === idOrPracticeId || h.practiceId === idOrPracticeId
      )
      const pId = target?.practiceId || target?.id || idOrPracticeId

      // 乐观更新：先在前端移除
      this.examHistory = this.examHistory.filter(
        (h) => h.id !== idOrPracticeId && h.practiceId !== idOrPracticeId && h.id !== pId && h.practiceId !== pId
      )
      saveStoredHistory(this.examHistory)

      if (pId) {
        try {
          await deletePractice(pId)
          await this.loadExamHistory()
        } catch (e) {
          console.warn('deletePractice error, keeping local store update:', e)
        }
      }
      return true
    },

    async batchDeleteHistory(idList = []) {
      if (!idList || idList.length === 0) return true
      const idSet = new Set(idList.map(String))
      const targets = this.examHistory.filter(
        (h) => idSet.has(String(h.id)) || idSet.has(String(h.practiceId))
      )
      const pIds = targets.map((t) => t.practiceId || t.id).filter(Boolean)

      // 乐观更新：先在前端全量移除
      this.examHistory = this.examHistory.filter(
        (h) => !idSet.has(String(h.id)) && !idSet.has(String(h.practiceId))
      )
      saveStoredHistory(this.examHistory)

      if (pIds.length > 0) {
        try {
          await Promise.allSettled(pIds.map((pId) => deletePractice(pId)))
          await this.loadExamHistory()
        } catch (e) {
          console.warn('batchDeleteHistory error:', e)
        }
      }
      return true
    },

    async clearAllHistory() {
      const list = [...this.examHistory]
      const pIds = list.map((h) => h.practiceId || h.id).filter(Boolean)

      // 乐观更新：清空本地数据
      this.examHistory = []
      saveStoredHistory([])

      if (pIds.length > 0) {
        try {
          await Promise.allSettled(pIds.map((pId) => deletePractice(pId)))
          await this.loadExamHistory()
        } catch (e) {
          console.warn('clearAllHistory error:', e)
        }
      }
      return true
    },

    async openReviewFromHistory(hist, filter = 'wrong') {
      const practiceId = hist.practiceId || hist.id
      const setId = hist.setId
      if (!practiceId) return

      if (String(practiceId).startsWith('custom_') || (hist.report && hist.report.detailedSubjects && hist.report.detailedSubjects.length > 0)) {
        if (hist.report) {
          this.examReport = hist.report
          this.reviewFilter = filter
          this.isReviewMode = true
          this.reportModalOpen = false
          return
        }
      }

      let reportData = null
      try {
        const repRes = await getReport(practiceId)
        if (repRes && repRes.success && repRes.data) {
          reportData = repRes.data
        }
      } catch (e) {}

      let scoreDetails = []
      try {
        const scRes = await getScoreDetail(practiceId)
        if (scRes && scRes.success && Array.isArray(scRes.data)) {
          scoreDetails = scRes.data
        }
      } catch (e) {}

      let subjectList = []
      try {
        const sRes = await getSubjects(setId, practiceId)
        if (sRes && sRes.success && sRes.data?.subjectList) {
          subjectList = sRes.data.subjectList
        }
      } catch (e) {}

      // Fallback: 如果 getSubjects 查不到题目列表，直接从 scoreDetails 反查该次考卷的全部考题 ID
      if ((!subjectList || subjectList.length === 0) && scoreDetails.length > 0) {
        subjectList = scoreDetails.map((s) => ({
          subjectId: s.subjectId,
          subjectType: s.subjectType
        }))
      }

      const detailedSubjects = await Promise.all(
        subjectList.map(async (item, idx) => {
          let det = null
          try {
            const dRes = await getSubjectDetail(practiceId, item.subjectId, item.subjectType)
            if (dRes && dRes.success && dRes.data) {
              det = dRes.data
            }
          } catch (e) {}

          if (!det || !det.subjectParse) {
            try {
              const infoRes = await querySubjectInfo(item.subjectId)
              if (infoRes && infoRes.success && infoRes.data) {
                det = {
                  ...(det || {}),
                  subjectName: infoRes.data.subjectName,
                  subjectParse: infoRes.data.subjectParse || infoRes.data.subjectAnswer,
                  labelNames: infoRes.data.labelNames
                }
              }
            } catch (_) {}
          }

          const scoreItem = scoreDetails.find((s) => s.subjectId === item.subjectId)
          const cAns = det?.correctAnswer || []
          let options = (det?.optionList || []).map((o) => ({
            optionType: o.optionType,
            content: o.optionContent,
            isCorrect: o.isCorrect === 1 || cAns.map(Number).includes(Number(o.optionType))
          }))

          if (item.subjectType === 3 && options.length === 0) {
            options = [
              { optionType: 1, content: '正确 (True)', isCorrect: cAns.map(Number).includes(1) },
              { optionType: 0, content: '错误 (False)', isCorrect: cAns.map(Number).includes(0) }
            ]
          }

          const respAns = det?.respondAnswer || []
          const userText = det?.answerContent || ''

          let isCorrect = false
          if (scoreItem && scoreItem.isCorrect !== undefined) {
            isCorrect = scoreItem.isCorrect === 1
          } else if (item.subjectType === 4) {
            isCorrect = userText.trim().length > 0
          } else if (item.subjectType === 2) {
            const arrU = [...respAns].map(Number).sort()
            const arrC = [...cAns].map(Number).sort()
            isCorrect = arrU.length > 0 && JSON.stringify(arrU) === JSON.stringify(arrC)
          } else {
            const numU = respAns.length > 0 ? Number(respAns[0]) : null
            isCorrect = numU !== null && cAns.map(Number).includes(numU)
          }

          return {
            id: item.subjectId,
            subjectId: item.subjectId,
            index: idx,
            title: det?.subjectName || `考题 #${item.subjectId}`,
            type: item.subjectType,
            typeName: item.subjectType === 1 ? '单选题' : item.subjectType === 2 ? '多选题' : item.subjectType === 3 ? '判断题' : '简答题',
            options,
            userAnswer: item.subjectType === 4 ? userText : (respAns.length === 1 ? respAns[0] : respAns),
            correctAnswer: cAns,
            isCorrect,
            subjectParse: det?.subjectParse || det?.subjectAnswer || '该考点标准解析已收录至题库。'
          }
        })
      )

      if (!detailedSubjects || detailedSubjects.length === 0) {
        alert('暂未查询到该套试卷的作答解析明细')
        return
      }

      const total = detailedSubjects.length || hist.total || 0
      const correctCount = detailedSubjects.filter((q) => q.isCorrect).length
      const wrongCount = Math.max(0, total - correctCount)
      const score = hist.score !== undefined ? hist.score : (total > 0 ? Math.round((correctCount / total) * 100) : 0)

      let reportSkills = []
      if (reportData?.skill && Array.isArray(reportData.skill) && reportData.skill.length > 0) {
        const sMap = new Map()
        reportData.skill.forEach((s) => {
          const name = String(s.name || '核心技能').trim()
          const star = Math.round(Number(s.star) || 0)
          if (sMap.has(name)) {
            const prev = sMap.get(name)
            prev.star = Math.round((prev.star + star) / 2)
          } else {
            sMap.set(name, { name, star })
          }
        })
        reportSkills = Array.from(sMap.values())
      }

      const radarData = reportSkills.slice(0, 6).map((s) => ({
        name: s.name,
        score: Math.min(100, Math.max(0, typeof s.star === 'number' && !isNaN(s.star) ? s.star : score))
      }))

      this.examReport = {
        title: hist.title || reportData?.title || '全真模拟试卷',
        score,
        total,
        correctCount,
        wrongCount,
        timeSpent: hist.timeSpent || '10 分钟',
        rankPercent: score === 0 ? 0 : Math.min(99, Math.max(0, Math.round(score * 0.95))),
        skills: reportSkills,
        radarData: radarData.length > 0 ? radarData : [],
        detailedSubjects
      }

      this.reviewFilter = filter
      this.isReviewMode = true
      this.reportModalOpen = false
    },

    async openReportFromHistory(hist) {
      await this.openReviewFromHistory(hist, 'all')
      this.isReviewMode = false
      this.reportModalOpen = true
    },

    async openReviewMode(filter = 'all', customReport = null) {
      if (customReport) {
        this.examReport = customReport
      }
      if (!this.examReport || !this.examReport.detailedSubjects || this.examReport.detailedSubjects.length === 0) {
        this.isReviewMode = false
        return
      }
      this.reviewFilter = filter
      this.isReviewMode = true
      this.reportModalOpen = false
    },

    cleanLegacyMockData() {
      try {
        const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (raw && (raw.includes('2024届Java核心技术') || raw.includes('MySQL与Redis高并发'))) {
          localStorage.removeItem(HISTORY_STORAGE_KEY)
        }
      } catch (_) {}
      this.examHistory = getStoredHistory()
      if (this.isReviewMode && (!this.examReport || this.examReport.title?.includes('2024届Java核心技术') || this.examReport.title?.includes('MySQL与Redis高并发'))) {
        this.isReviewMode = false
        this.examReport = null
      }
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
    },

    /**
     * 放弃当前练习 (真实调用 /practice/practice/detail/giveUp)
     */
    async abandonCurrentPractice() {
      if (this.currentPracticeId) {
        try {
          await giveUpPractice(this.currentPracticeId)
        } catch (err) {
          console.warn('giveUpPractice error:', err)
        }
      }
      this.currentPracticeId = null
      this.currentPracticeSubjectList = []
      this.examReport = null
      this.activeTab = 'sets'
    },

    /**
     * 获取未完成练习记录 (调用 /practice/practice/set/getUnCompletePractice)
     */
    async loadUnCompletePractice() {
      try {
        const res = await getUnCompletePractice({ pageNo: 1, pageSize: 5 })
        if (res && res.success && res.data) {
          return res.data
        }
      } catch (err) {
        console.warn('loadUnCompletePractice error:', err)
      }
      return null
    }
  }
})
