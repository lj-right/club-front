import { defineStore } from 'pinia'
import {
  analyseResume,
  startInterview,
  submitInterview,
  getInterviewHistory
} from '@/api/interview'

export const useInterviewStore = defineStore('interview', {
  state: () => ({
    resumeFileName: '',
    resumeUrl: '',
    isAnalyzing: false,
    extractedSkills: ['Java 8/17', 'Spring Boot 3', 'MySQL / InnoDB', 'Redis 缓存', 'JVM 调优', '分布式微服务'],
    
    // Interview status
    isInterviewActive: false,
    chatMessages: [
      {
        id: 1,
        sender: 'ai',
        avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
        senderName: '随风 AI 资深技术考官',
        time: '14:00',
        content:
          '你好！我是随风 Club 的 AI 模拟面试官。我已针对你的技术画像准备了针对性深度考察题。准备好了吗？点击下方快捷操作或者直接输入你的想法开始模拟面试！'
      }
    ],
    currentStep: 0,
    sampleQuestions: [
      {
        skill: 'Redis 缓存架构',
        question: '你好，我们首先聊聊高并发场景下的缓存。请详细谈谈 Redis 缓存穿透与缓存击穿的区别，以及你在项目中是如何使用布隆过滤器或互斥锁来落地方案的？',
        sampleAnswer:
          '缓存穿透指查询一个不存在的数据，请求穿透到DB；防范可采用布隆过滤器（BloomFilter）进行快速存在性判定，或对空结果设置短TTL缓存。\n缓存击穿指热点Key在失效瞬间有大量并发请求击溃DB；解决方案是使用互斥锁（如分布式锁/DCL）保证只有一个线程回源构建缓存，或开启热点数据永不过期+后台异步刷新。'
      },
      {
        skill: 'Java 并发编程',
        question: '非常好！接着聊聊多线程。在 Java 中 AQS (AbstractQueuedSynchronizer) 的核心原理是什么？CLH 队列如何协调线程的排队与唤醒？',
        sampleAnswer:
          'AQS 内部使用 volatile int state 表示同步状态，通过 CAS 完成原子状态变更。线程获取资源失败时，会被封装成 Node 节点加入基于双向链表的 CLH 变体队列并由 LockSupport.park() 阻塞挂起。前驱节点在释放同步状态时，会显式 unparkSuccessor 唤醒后继阻塞节点再次尝试 CAS 争抢锁。'
      },
      {
        skill: 'MySQL 索引优化',
        question: '最后一个核心问题：MySQL InnoDB 的聚簇索引与非聚簇索引底层有何区别？什么情况下会触发“回表”，如何利用覆盖索引进行 SQL 查询调优？',
        sampleAnswer:
          '聚簇索引的叶子节点直接存放完整的行记录数据（主键索引）；而普通二级索引的叶子节点仅存放索引列值与对应的主键ID。\n当通过普通索引查询且 SELECT 的列未被该二级索引完全覆盖时，必须凭借主键ID再去聚簇索引树上再次检索整行数据，这就是回表。\n调优方式是建立联合索引使得查询所需字段全部包含在索引树内，实现 Index Only 扫描免去回表开销。'
      }
    ],
    interviewScore: null,
    evaluationSummary: ''
  }),
  actions: {
    async simulateResumeUpload(fileName = '随风_3年Java后端研发简历.pdf') {
      this.isAnalyzing = true
      this.resumeFileName = fileName
      // Simulate real delay or backend analyse
      try {
        await new Promise((r) => setTimeout(r, 1200))
        this.extractedSkills = ['Java 并发与多线程', 'Spring Cloud 微服务', 'Redis 架构', 'MySQL 深度调优', '分布式事务 Seata', 'Kafka 消息队列']
      } finally {
        this.isAnalyzing = false
      }
    },
    startInterviewFlow() {
      this.isInterviewActive = true
      this.currentStep = 0
      this.interviewScore = null
      this.evaluationSummary = ''
      
      const firstQ = this.sampleQuestions[0]
      this.chatMessages.push({
        id: Date.now(),
        sender: 'ai',
        avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
        senderName: '随风 AI 资深技术考官',
        time: '刚刚',
        content: `【第一轮考察 · ${firstQ.skill}】\n${firstQ.question}`
      })
    },
    async sendUserAnswer(answerText) {
      if (!answerText.trim()) return

      // Add user message
      this.chatMessages.push({
        id: Date.now(),
        sender: 'user',
        avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
        senderName: '我 (应聘者)',
        time: '刚刚',
        content: answerText
      })

      // AI evaluation thinking
      const step = this.currentStep
      await new Promise((r) => setTimeout(r, 800))

      if (step < this.sampleQuestions.length - 1) {
        this.currentStep++
        const nextQ = this.sampleQuestions[this.currentStep]
        this.chatMessages.push({
          id: Date.now() + 1,
          sender: 'ai',
          avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: `【回答点评】：条理清晰，命中技术核心要点！得分：92 / 100。\n\n接下来进入第 ${this.currentStep + 1} 题【${nextQ.skill}】：\n${nextQ.question}`
        })
      } else {
        // Complete interview
        this.interviewScore = 93.5
        this.evaluationSummary =
          '综合技术评估报告：候选人对底层原理（AQS、缓存异常治理、B+树索引机制）理解扎实深刻，技术表达清晰敏捷，完全具备中高级研发工程师核心能力！建议在系统高可用容灾与分库分表运维实践上进一步丰富细节。'
        
        this.chatMessages.push({
          id: Date.now() + 2,
          sender: 'ai',
          avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
          senderName: '随风 AI 资深技术考官',
          time: '刚刚',
          content: `🎉 面试考察全部完成！\n【总评分】：${this.interviewScore} 分 (评级: 卓越 - A+)\n\n【专家总评】：\n${this.evaluationSummary}`
        })
      }
    },
    fillSampleAnswer() {
      const q = this.sampleQuestions[this.currentStep]
      return q ? q.sampleAnswer : ''
    },
    resetChat() {
      this.isInterviewActive = false
      this.currentStep = 0
      this.chatMessages = [
        {
          id: 1,
          sender: 'ai',
          avatar: 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg',
          senderName: '随风 AI 资深技术考官',
          time: '14:00',
          content:
            '你好！我是随风 Club 的 AI 模拟面试官。我已针对你的技术画像准备了针对性深度考察题。准备好了吗？点击下方快捷操作或者直接输入你的想法开始模拟面试！'
        }
      ]
    }
  }
})
