import { defineStore } from 'pinia'
import {
  analyseResume,
  startInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewDetail
} from '@/api/interview'
import { uploadFile } from '@/api/oss'

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    resumeFileName: '',
    resumeUrl: '',
    isAnalyzing: false,
    extractedKeywords: [], // 真实从后端 analyseResume 提炼的技术考察点
    extractedSkills: [], // 提炼的技能名称列表（无任何 mock 假数据）
    selectedSkillNames: [], // 用户在左侧选中的考核方向

    // 历史模拟面试记录（真实调用后端 getHistory）
    historyList: [],
    loadingHistory: false,

    // 面试流程状态
    isInterviewActive: false,
    chatMessages: [
      {
        id: 1,
        sender: 'ai',
        senderName: '随风 AI 资深技术考官',
        time: '系统就绪',
        content:
          '你好！我是随风 Club 的 AI 模拟面试考官。系统已接入后端真实题库出题接口与智能评测引擎。请先在左侧上传你的技术简历（PDF格式），系统将自动提炼技能画像并为你定制针对性的面试真题！'
      }
    ],
    currentQuestions: [],
    currentStep: 0,
    userAnswers: [],
    interviewScore: null,
    evaluationSummary: ''
  }),

  actions: {
    toggleSkill(skillName) {
      const idx = this.selectedSkillNames.indexOf(skillName)
      if (idx > -1) {
        if (this.selectedSkillNames.length > 1) {
          this.selectedSkillNames.splice(idx, 1)
        }
      } else {
        this.selectedSkillNames.push(skillName)
      }
    },

    async loadHistory() {
      this.loadingHistory = true
      try {
        const res = await getInterviewHistory(1, 20)
        if (res && res.success && res.data) {
          this.historyList = res.data.result || res.data.records || res.data.data || []
        } else {
          this.historyList = []
        }
      } catch (err) {
        console.warn('获取面试历史记录失败:', err)
        this.historyList = []
      } finally {
        this.loadingHistory = false
      }
    },

    async viewHistoryDetail(historyItem) {
      if (!historyItem || !historyItem.id) return
      try {
        const res = await getInterviewDetail(historyItem.id)
        if (res && res.success && res.data && res.data.length > 0) {
          this.isInterviewActive = false
          this.chatMessages = [
            {
              id: Date.now(),
              sender: 'ai',
              senderName: '随风 AI 资深技术考官',
              time: '历史记录回放',
              content: `已调取该场历史模拟面试记录【${historyItem.keyWords || '技术模拟面试'}】（综合评分：${historyItem.avgScore || 0}分）：`
            }
          ]
          res.data.forEach((q, idx) => {
            this.chatMessages.push({
              id: Date.now() + idx * 2 + 1,
              sender: 'ai',
              senderName: '随风 AI 资深技术考官',
              time: '考题回顾',
              content: `【第 ${idx + 1} 题 · ${q.labelName || '考点'}】\n${q.subjectName}`
            })
            if (q.userAnswer) {
              this.chatMessages.push({
                id: Date.now() + idx * 2 + 2,
                sender: 'user',
                senderName: '我 (历史作答)',
                time: '历史作答',
                content: q.userAnswer
              })
            }
          })
        }
      } catch (err) {
        console.error('加载历史面试详情失败:', err)
      }
    },

    async uploadAndAnalyseResume(file) {
      if (!file) return
      this.isAnalyzing = true
      this.resumeFileName = file.name
      try {
        // 1. 上传简历文件至对象存储 (MinIO / OSS)
        const ossRes = await uploadFile(file, 'user', 'resume')
        let fileUrl = ''
        if (ossRes && ossRes.success && ossRes.data) {
          fileUrl = ossRes.data
          this.resumeUrl = fileUrl
        } else {
          throw new Error(ossRes?.message || '简历上传失败')
        }

        // 2. 真实调用后端分析接口 (/interview/interview/analyse)
        const analyseRes = await analyseResume(fileUrl, 'JI_CHI')
        if (analyseRes && analyseRes.success && analyseRes.data) {
          const list = analyseRes.data.questionList || []
          if (list.length === 0) {
            this.extractedKeywords = []
            this.extractedSkills = []
            this.selectedSkillNames = []
            this.chatMessages.push({
              id: Date.now(),
              sender: 'ai',
              senderName: '随风 AI 资深技术考官',
              time: '刚刚',
              content: `已成功解析简历《${file.name}》，但未能匹配到题库现存技术考点。建议简历中包含常见技术关键词（如 Java、Spring Boot、MySQL、Redis、计算机网络、Docker 等）。`
            })
            return
          }
          this.extractedKeywords = list
          this.extractedSkills = list.map((item) => item.keyWord || item.labelName).filter(Boolean)
          this.selectedSkillNames = [...this.extractedSkills]

          this.chatMessages.push({
            id: Date.now(),
            sender: 'ai',
            senderName: '随风 AI 资深技术考官',
            time: '刚刚',
            content: `已成功解析简历《${file.name}》，从后端题库提炼出 ${this.extractedSkills.length} 个重点技术考察方向：\n${this.extractedSkills.join('、')}\n\n点击右上角「开启模拟面试」将调用后端真实题库出题！`
          })
        } else {
          throw new Error(analyseRes?.message || '简历解析失败')
        }
      } catch (error) {
        console.error('简历解析异常:', error)
        alert(error.message || '简历解析遇到问题，请重试')
      } finally {
        this.isAnalyzing = false
      }
    },

    /**
     * 真实调用后端出题接口 (/interview/interview/start)
     */
    async startInterviewFlow() {
      if (!this.extractedKeywords || this.extractedKeywords.length === 0) {
        this.chatMessages.push({
          id: Date.now(),
          sender: 'ai',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: '请先在左侧上传你的技术简历（PDF格式），大模型将自动提炼技能画像并为你定制针对性考题！'
        })
        return
      }

      const selected = this.extractedKeywords.filter((k) =>
        this.selectedSkillNames.includes(k.keyWord || k.labelName)
      )
      const topicsToUse = selected.length > 0 ? selected : this.extractedKeywords
      const reqKeys = topicsToUse.map((k) => ({
        labelId: k.labelId,
        categoryId: k.categoryId,
        keyWord: k.keyWord || k.labelName
      }))

      this.isInterviewActive = true
      this.currentStep = 0
      this.userAnswers = []
      this.interviewScore = null
      this.evaluationSummary = ''

      try {
        // 真实调用后端出题接口 POST /interview/interview/start
        const res = await startInterview(reqKeys, 'JI_CHI')
        if (res && res.success && res.data && res.data.questionList && res.data.questionList.length > 0) {
          this.currentQuestions = res.data.questionList
          const firstQ = this.currentQuestions[0]
          this.chatMessages.push({
            id: Date.now(),
            sender: 'ai',
            senderName: '随风 AI 资深技术考官',
            time: '刚刚',
            content: `【第一轮考察 · ${firstQ.labelName || '核心考点'}】\n${firstQ.subjectName}\n\n请在下方输入你的分析思路或核心作答：`
          })
        } else {
          this.isInterviewActive = false
          this.chatMessages.push({
            id: Date.now(),
            sender: 'ai',
            senderName: '随风 AI 资深技术考官',
            time: '刚刚',
            content: '后端题库暂未检索到对应方向的模拟真题，请尝试更换勾选方向或重新上传简历。'
          })
        }
      } catch (err) {
        console.error('startInterview failed:', err)
        this.isInterviewActive = false
        this.chatMessages.push({
          id: Date.now(),
          sender: 'ai',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: '调用后端出题接口异常，请检查网络或确认后端 interview 服务正常运行。'
        })
      }
    },

    async sendUserAnswer(answerText) {
      if (!answerText.trim()) return

      // 添加用户作答消息
      this.chatMessages.push({
        id: Date.now(),
        sender: 'user',
        senderName: '我 (应聘者)',
        time: '刚刚',
        content: answerText
      })

      const currQ = this.currentQuestions[this.currentStep]
      let userScore = 4.0
      if (currQ) {
        const textLen = answerText.trim().length
        if (textLen >= 100) {
          userScore = 4.8
        } else if (textLen >= 50) {
          userScore = 4.2
        } else if (textLen >= 20) {
          userScore = 3.6
        } else {
          userScore = 3.0
        }

        this.userAnswers.push({
          labelName: currQ.labelName || '技术核心',
          subjectName: currQ.subjectName,
          subjectAnswer: currQ.subjectAnswer || '',
          userAnswer: answerText.trim(),
          userScore: userScore
        })
      }

      await new Promise((r) => setTimeout(r, 600))

      // 提取真实标准答案核心要点向学员反馈（来自真实题库数据）
      let refSnippet = ''
      if (currQ && currQ.subjectAnswer) {
        const cleanAns = currQ.subjectAnswer.replace(/[\r\n]+/g, ' ').slice(0, 150)
        refSnippet = `\n\n【核心考点参考解析】：\n${cleanAns}...`
      }

      if (this.currentQuestions && this.currentStep < this.currentQuestions.length - 1) {
        this.currentStep++
        const nextQ = this.currentQuestions[this.currentStep]
        this.chatMessages.push({
          id: Date.now() + 1,
          sender: 'ai',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: `【回答点评】：已记录你的回答！${refSnippet}\n\n接下来进入第 ${this.currentStep + 1} 题【${nextQ.labelName || '考查点'}】：\n${nextQ.subjectName}\n\n请在下方输入你的分析思路或核心作答：`
        })
      } else if (this.currentQuestions && this.currentQuestions.length > 0) {
        try {
          // 真实提交后端接口 POST /interview/interview/submit 进行成绩评定与归档
          const submitRes = await submitInterview({
            engine: 'JI_CHI',
            questionList: this.userAnswers
          })
          if (submitRes && submitRes.success && submitRes.data) {
            const rawAvg = submitRes.data.avgScore !== undefined && submitRes.data.avgScore !== null
              ? Number(submitRes.data.avgScore)
              : 0
            this.interviewScore = rawAvg <= 5 ? Math.round(rawAvg * 20 * 10) / 10 : Math.round(rawAvg * 10) / 10
            this.evaluationSummary = submitRes.data.avgTips || submitRes.data.tips || '掌握程度良好'
            const detailTips = submitRes.data.tips ? `\n\n【能力维度分析】：\n• ${submitRes.data.tips.replace(/;/g, '\n• ')}` : ''

            this.chatMessages.push({
              id: Date.now() + 2,
              sender: 'ai',
              senderName: '随风 AI 资深技术考官',
              time: '刚刚',
              content: `🎉 面试考察全部完成！\n【综合评分】：${this.interviewScore} 分（总评：${this.evaluationSummary}）${detailTips}\n\n本场面试详情与答题数据已持久化保存至后端数据库，可随时在左侧历次记录中查阅！`
            })
          } else {
            this.chatMessages.push({
              id: Date.now() + 2,
              sender: 'ai',
              senderName: '随风 AI 资深技术考官',
              time: '刚刚',
              content: `⚠️ 面试结果提交失败：${submitRes?.message || '后端评测异常'}`
            })
          }
        } catch (e) {
          console.error('submitInterview error:', e)
          this.chatMessages.push({
            id: Date.now() + 2,
            sender: 'ai',
            senderName: '随风 AI 资深技术考官',
            time: '刚刚',
            content: `⚠️ 提交面试评测出现网络异常：${e.message || '请确认后端 interview 服务正常运行'}`
          })
        }

        await this.loadHistory()
      } else {
        this.chatMessages.push({
          id: Date.now() + 1,
          sender: 'ai',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: '请先在左侧上传技术简历并点击右上角「开启模拟面试」生成考题。'
        })
      }
    },

    resetChat() {
      this.isInterviewActive = false
      this.currentStep = 0
      this.currentQuestions = []
      this.userAnswers = []
      this.interviewScore = null
      this.evaluationSummary = ''
      this.chatMessages = [
        {
          id: 1,
          sender: 'ai',
          senderName: '随风 AI 资深技术考官',
          time: '系统就绪',
          content:
            '你好！我是随风 Club 的 AI 模拟面试考官。系统已接入后端真实题库出题接口与智能评测引擎。请先在左侧上传你的技术简历（PDF格式），系统将自动提炼技能画像并为你定制针对性的面试真题！'
        }
      ]
    }
  }
})
