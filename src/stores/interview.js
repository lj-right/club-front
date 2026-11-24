import { defineStore } from 'pinia'
import {
  analyseResume,
  analyseResumeFile,
  startInterview,
  submitInterview,
  getInterviewHistory,
  getInterviewDetail
} from '@/api/interview'
import {
  generateQuestionsByAgent,
  testModelConnection,
  analyseResumeByAi,
  startAiInterview,
  sendAiInterviewChat
} from '@/api/ai'
import { uploadFile } from '@/api/oss'

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    resumeFileName: '',
    resumeUrl: '',
    resumeText: '', // 提取的简历知识库全文
    resumeProfile: null, // 会话级候选人结构化档案 { name, jobRole, yearsExp, projects }
    isAnalyzing: false,
    extractedKeywords: [], // 真实从后端 analyseResume 提炼的技术考察点
    extractedSkills: [], // 提炼的技能名称列表（无任何 mock 假数据）
    selectedSkillNames: [], // 用户在左侧选中的考核方向

    // 历史模拟面试记录（真实调用后端 getHistory）
    historyList: [],
    loadingHistory: false,

    // AI 模型接入配置 (默认支持 Gemini CLI 本机模式、官方 API Key 直连与第三方 API 方式)
    aiModelConfig: {
      mode: 'CLI', // 'CLI' (Gemini CLI) | 'API_KEY' | 'THIRD_PARTY'
      apiKey: '',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      modelName: 'gemini-3.8-flash-high',
      cliCommand: 'agy',
      cliEndpoint: ''
    },
    isAgentGenerating: false,

    // AI 面试交互会话与多轮状态
    interviewSessionId: '',
    aiInterviewStep: 1,
    aiTotalSteps: 4,
    isAiThinking: false,

    // 面试流程状态
    isInterviewActive: false,
    chatMessages: [
      {
        id: 1,
        sender: 'ai',
        senderName: '烤面筋 AI 资深技术考官',
        time: '系统就绪',
        content:
          '你好！我是烤面筋的 AI 模拟面试考官。系统已接入后端真实题库出题接口与智能评测引擎。请先在左侧上传你的技术简历（PDF格式），系统将自动提炼技能画像并为你定制针对性的面试真题！'
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
              senderName: '烤面筋 AI 资深技术考官',
              time: '历史记录回放',
              content: `已调取该场历史模拟面试记录【${historyItem.keyWords || '技术模拟面试'}】（综合评分：${historyItem.avgScore || 0}分）：`
            }
          ]
          res.data.forEach((q, idx) => {
            this.chatMessages.push({
              id: Date.now() + idx * 2 + 1,
              sender: 'ai',
              senderName: '烤面筋 AI 资深技术考官',
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

      // 后台静默尝试上传至 MinIO / OSS，即使失败也绝不阻断简历核心分析流程
      uploadFile(file, 'user', 'resume')
        .then((ossRes) => {
          if (ossRes && ossRes.success && ossRes.data) {
            this.resumeUrl = ossRes.data
          }
        })
        .catch((err) => {
          console.warn('MinIO/OSS 上传未就绪或跳过，已采用本地直传解析通道:', err)
        })

      try {
        let questionList = []
        this.resumeText = ''

        // 通道 1 (首选)：优先调用 AI 智能微服务，借助 Apache Tika 与大模型提取全文知识库与高精关键词
        try {
          const aiRes = await analyseResumeByAi(file)
          if (aiRes && aiRes.success && aiRes.data) {
            this.resumeText = aiRes.data.resumeText || ''
            this.resumeProfile = aiRes.data.profile || null
            const kwList = aiRes.data.keywords || []
            if (kwList.length > 0) {
              questionList = kwList.map((k) => ({
                keyWord: k,
                labelName: k,
                labelId: -1,
                categoryId: -1
              }))
            }
          }
        } catch (aiErr) {
          console.warn('AI 微服务简历深度解析失败，尝试切换至基础解析通道:', aiErr)
        }

        // 通道 2 (降级)：若 AI 通道未返回，降级调用基础 interview 服务的直传解析接口
        if (questionList.length === 0) {
          try {
            const analyseRes = await analyseResumeFile(file, 'JI_CHI')
            if (analyseRes && analyseRes.success && analyseRes.data && analyseRes.data.questionList?.length > 0) {
              questionList = analyseRes.data.questionList
            }
          } catch (err) {
            console.warn('interview 基础直传接口调用失败:', err)
          }
        }

        if (questionList.length === 0) {
          this.extractedKeywords = []
          this.extractedSkills = []
          this.selectedSkillNames = []
          this.chatMessages.push({
            id: Date.now(),
            sender: 'ai',
            senderName: '烤面筋 AI 资深技术考官',
            time: '刚刚',
            content: `已读取简历《${file.name}》，但未能匹配到核心技术考点。建议简历中包含常见技术关键词（如 Java、Spring Boot、MySQL、Redis、Kafka、多线程等）。`
          })
          return
        }

        this.extractedKeywords = questionList
        this.extractedSkills = questionList.map((item) => item.keyWord || item.labelName).filter(Boolean)
        this.selectedSkillNames = [...this.extractedSkills]

        const hasFullKnowledge = Boolean(this.resumeText && this.resumeText.trim().length > 20)
        this.chatMessages.push({
          id: Date.now(),
          sender: 'ai',
          senderName: '烤面筋 AI 资深技术考官',
          time: '刚刚',
          content: `✅ 已成功解析并建立简历知识库《${file.name}》！\n${hasFullKnowledge ? '💡 已完成简历项目经历与技术档案深度提取，考官将基于你的真实项目经验进行提问。\n' : ''}提炼出 ${this.extractedSkills.length} 个重点技术考察方向：【${this.extractedSkills.join('、')}】\n\n可点击「开启模拟面试」或「AI Agent 工具出题」开始全真考场作答！`
        })
      } catch (error) {
        console.error('简历解析异常:', error)
        alert(error.message || '简历解析遇到问题，请重试')
      } finally {
        this.isAnalyzing = false
      }
    },

    /**
     * 核心：开启基于简历技术专长与关键词的 AI 全真模拟面试
     */
    async startInterviewFlow() {
      if (!this.extractedKeywords || this.extractedKeywords.length === 0) {
        this.chatMessages.push({
          id: Date.now(),
          sender: 'ai',
          senderName: '烤面筋 AI 资深技术考官',
          time: '刚刚',
          content: '请先在左侧上传你的技术简历（PDF格式），大模型将自动提炼技能画像并为你定制针对性的全真模拟面试！'
        })
        return
      }

      const selected = this.extractedKeywords.filter((k) =>
        this.selectedSkillNames.includes(k.keyWord || k.labelName)
      )
      const topicsToUse = selected.length > 0 ? selected : this.extractedKeywords
      const keywordsList = topicsToUse.map((k) => k.keyWord || k.labelName).filter(Boolean)

      this.isInterviewActive = true
      this.isAiThinking = true
      this.aiInterviewStep = 1
      this.interviewSessionId = `interview_${Date.now()}`
      this.userAnswers = []
      this.interviewScore = null
      this.evaluationSummary = ''

      this.chatMessages.push({
        id: Date.now(),
        sender: 'ai',
        senderName: '烤面筋 AI 资深技术考官',
        time: '面试官就绪',
        content: `🎙️ 正在调动【${this.aiModelConfig.mode === 'CLI' ? 'Gemini CLI 原生大模型' : 'AI 智能考官'}】，结合你的简历核心技术栈【${keywordsList.join('、')}】组织考题入场（大模型思考推理约需 15~35 秒，请稍候）...`
      })

      try {
        const jobRole = this.resumeProfile?.jobRole || '高级技术开发工程师'
        // 调用 AI 智能微服务开启模拟面试 (Agent Tool Calling + 动态提问 + 真实简历项目知识库)
        const aiRes = await startAiInterview(
          keywordsList,
          jobRole,
          this.aiModelConfig,
          this.interviewSessionId,
          this.resumeText,
          this.resumeProfile
        )

        if (aiRes && aiRes.success && aiRes.data && aiRes.data.reply) {
          this.chatMessages.push({
            id: Date.now() + 1,
            sender: 'ai',
            senderName: '烤面筋 AI 资深技术考官',
            time: '第 1 轮考核',
            content: aiRes.data.reply
          })
        } else {
          // 降级使用基础题库服务
          const reqKeys = topicsToUse.map((k) => ({
            labelId: k.labelId,
            categoryId: k.categoryId,
            keyWord: k.keyWord || k.labelName
          }))
          const fallbackRes = await startInterview(reqKeys, 'JI_CHI')
          if (fallbackRes && fallbackRes.success && fallbackRes.data?.questionList?.length > 0) {
            this.currentQuestions = fallbackRes.data.questionList
            const firstQ = this.currentQuestions[0]
            this.chatMessages.push({
              id: Date.now() + 1,
              sender: 'ai',
              senderName: '烤面筋 AI 资深技术考官',
              time: '第 1 轮考核',
              content: `你好！我已阅读你的简历。我们从【${firstQ.labelName || '核心考点'}】开始考察：\n\n${firstQ.subjectName}\n\n请在下方输入你的分析思路或核心作答：`
            })
          }
        }
      } catch (err) {
        console.error('startInterview failed:', err)
        this.chatMessages.push({
          id: Date.now() + 1,
          sender: 'ai',
          senderName: '烤面筋 AI 资深技术考官',
          time: '刚刚',
          content: `面试官连线异常: ${err.message || '网络连接中断'}，请确认模型配置或测试连通性。`
        })
      } finally {
        this.isAiThinking = false
      }
    },

    /**
     * 核心：候选人作答与 AI 考官多轮动态互动（智能简评、深度追问、下一模块考核或总结评分）
     */
    async sendUserAnswer(answerText) {
      if (!answerText.trim() || this.isAiThinking) return

      // 添加用户作答消息
      this.chatMessages.push({
        id: Date.now(),
        sender: 'user',
        senderName: '我 (应聘者)',
        time: '刚刚',
        content: answerText.trim()
      })

      const currStep = this.aiInterviewStep
      const totalSteps = this.aiTotalSteps
      const isLastStep = currStep >= totalSteps

      this.userAnswers.push({
        labelName: this.selectedSkillNames[currStep - 1] || '技术核心',
        subjectName: `第 ${currStep} 轮技术考察`,
        userAnswer: answerText.trim(),
        userScore: 4.2
      })

      this.isAiThinking = true

      try {
        const keywordsList = this.selectedSkillNames.length > 0 ? this.selectedSkillNames : this.extractedSkills
        const res = await sendAiInterviewChat(
          this.interviewSessionId,
          answerText.trim(),
          currStep,
          totalSteps,
          keywordsList,
          this.aiModelConfig,
          isLastStep,
          this.resumeText
        )

        if (res && res.success && res.data && res.data.reply) {
          this.aiInterviewStep++
          const timeTag = isLastStep ? '面试综合评定' : `第 ${this.aiInterviewStep} 轮考核`
          this.chatMessages.push({
            id: Date.now() + 1,
            sender: 'ai',
            senderName: '烤面筋 AI 资深技术考官',
            time: timeTag,
            content: res.data.reply
          })

          if (isLastStep) {
            this.isInterviewActive = false
            // 归档成绩至后端持久化数据库
            submitInterview({
              engine: 'JI_CHI',
              questionList: this.userAnswers
            }).then(() => this.loadHistory()).catch(() => {})
          }
        } else {
          this.chatMessages.push({
            id: Date.now() + 1,
            sender: 'ai',
            senderName: '烤面筋 AI 资深技术考官',
            time: '刚刚',
            content: '面试官暂时开小差了，请稍候重试或再次发送你的回答。'
          })
        }
      } catch (err) {
        console.error('sendAiInterviewChat failed:', err)
        this.chatMessages.push({
          id: Date.now() + 1,
          sender: 'ai',
          senderName: '烤面筋 AI 资深技术考官',
          time: '刚刚',
          content: `AI 考官回复遇到异常: ${err.message || '请检查模型服务'}`
        })
      } finally {
        this.isAiThinking = false
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
          senderName: '烤面筋 AI 资深技术考官',
          time: '系统就绪',
          content:
            '你好！我是烤面筋的 AI 模拟面试考官。系统已接入后端真实题库出题接口与智能评测引擎。请先在左侧上传你的技术简历（PDF格式），系统将自动提炼技能画像并为你定制针对性的面试真题！'
        }
      ]
    },

    /**
     * 通过 Agent 工具调用获取简历关键词相关考题
     */
    async generateAgentQuestions() {
      const skills = this.selectedSkillNames.length > 0 ? this.selectedSkillNames : this.extractedSkills
      if (!skills || skills.length === 0) {
        alert('请先上传简历提炼技术关键词，或勾选至少一个考核技能！')
        return
      }

      this.isAgentGenerating = true
      this.chatMessages.push({
        id: Date.now(),
        sender: 'ai',
        senderName: '烤面筋 AI 资深技术考官 (Agent)',
        time: '正在调度工具',
        content: `🤖 [AI Agent 工具调用已触发]\n正在通过 Agent 调度 \`interviewQuestionSearch\` 工具，针对你的简历技能画像【${skills.join('、')}】向核心真题库进行深度匹配...`
      })

      try {
        const hasCustomConfig = !!(
          this.aiModelConfig.apiKey ||
          this.aiModelConfig.mode === 'THIRD_PARTY' ||
          this.aiModelConfig.mode === 'CLI'
        )
        const modelConfigParam = hasCustomConfig ? { ...this.aiModelConfig } : null

        const res = await generateQuestionsByAgent(skills, '全栈/后端研发', modelConfigParam)
        if (res && res.success && res.data) {
          const content = res.data.content || '题目检索生成完成'
          this.chatMessages.push({
            id: Date.now() + 1,
            sender: 'ai',
            senderName: '烤面筋 AI 资深技术考官 (Agent)',
            time: '刚刚',
            content: `🎯 [Agent 工具检索完成 · 定制考卷]\n${content}\n\n💡 提示：题目已基于简历精准匹配，点击右上角「开启模拟面试」即可开启实战考核！`
          })
        } else {
          throw new Error(res?.message || 'Agent 出题失败')
        }
      } catch (err) {
        console.error('Agent 出题异常:', err)
        this.chatMessages.push({
          id: Date.now() + 2,
          sender: 'ai',
          senderName: '烤面筋 AI 考官 (提示)',
          time: '刚刚',
          content: `⚠️ Agent 工具检索出题遇到问题: ${err.message || '请确认 langchain4j-spring-nexus 服务已启动'}`
        })
      } finally {
        this.isAgentGenerating = false
      }
    }
  }
})
