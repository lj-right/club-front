import request from './request'

/**
 * AI Agent 与多模型服务接口
 */

/**
 * 1. 通过 Agent 工具调用检索关键词相关题目
 * @param {Array<string>} keywords 简历提炼的技能关键词
 * @param {string} jobRole 岗位方向
 * @param {Object} modelConfig 自定义模型配置（支持 API_KEY / CLI / THIRD_PARTY）
 */
export function generateQuestionsByAgent(keywords, jobRole = '', modelConfig = null) {
  return request({
    url: '/ai/interview/generate-questions',
    method: 'POST',
    timeout: 180000,
    data: {
      keywords,
      jobRole,
      modelConfig
    }
  })
}

/**
 * 2. 测试大模型连通性（API Key 方式、Gemini CLI 方式或第三方 API 方式）
 * @param {Object} modelConfig 
 */
export function testModelConnection(modelConfig = null) {
  return request({
    url: '/ai/interview/test-connection',
    method: 'POST',
    timeout: 60000,
    data: modelConfig || {}
  })
}

/**
 * 3. 通过 AI 微服务直传解析简历文件 (提取 5~8 个核心技术专长关键词)
 * @param {File} file 
 */
export function analyseResumeByAi(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/ai/interview/analyse-file',
    method: 'POST',
    timeout: 180000,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 4. 根据简历完整文本档案、结构化画像与核心关键词开启 AI 全真模拟面试（考官亲切开场并抛出第 1 题）
 */
export function startAiInterview(keywords, jobRole = '', modelConfig = null, memoryId = '', resumeText = '', profile = null) {
  return request({
    url: '/ai/interview/start-interview',
    method: 'POST',
    timeout: 180000,
    data: {
      keywords,
      jobRole,
      modelConfig,
      memoryId,
      resumeText,
      profile,
      totalSteps: 4
    }
  })
}

/**
 * 5. 候选人作答与 AI 面试官多轮动态交互（智能点评、深挖追问、下一模块考核或总结评分）
 */
export function sendAiInterviewChat(memoryId, userAnswer, currentStep = 1, totalSteps = 4, keywords = [], modelConfig = null, finish = false, resumeText = '') {
  return request({
    url: '/ai/interview/chat',
    method: 'POST',
    timeout: 180000,
    data: {
      memoryId,
      userAnswer,
      currentStep,
      totalSteps,
      keywords,
      modelConfig,
      finish,
      resumeText
    }
  })
}
