<template>
  <div class="view-container">
    <div class="interview-layout">
      <!-- 左侧：简历解析与技能画像面板 -->
      <div class="resume-card">
        <h3 class="card-title">智能简历技能画像</h3>
        <p class="card-desc">
          上传你的技术简历（PDF格式），大模型将自动提炼核心专长并定制匹配度最高的考官真题。
        </p>

        <!-- 简历上传区域 (支持点击选择与直接拖拽) -->
        <div
          class="upload-area"
          :class="{ 'is-dragover': isDragging }"
          @click="handleUploadClick"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf,.doc,.docx"
            style="display: none;"
            @change="onFileSelected"
          />
          <div class="upload-icon-box">
            <svg class="upload-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 15V3m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="upload-filename">
            {{ interviewStore.isAnalyzing ? '正在智能提炼技能画像中...' : (interviewStore.resumeFileName || (isDragging ? '释放以直接解析简历' : '点击上传或将简历直接拖拽至此')) }}
          </div>
          <div class="upload-hint">
            支持直接拖拽 PDF / DOCX 文件（单文件 ≤ 10MB）
          </div>
        </div>

        <!-- 1. 会话专属候选人档案画像（简历背景与核心项目） -->
        <div v-if="interviewStore.resumeProfile || interviewStore.resumeText" class="candidate-profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ (interviewStore.resumeProfile?.name || '考').charAt(0) }}
            </div>
            <div class="profile-info">
              <div class="profile-name">
                {{ interviewStore.resumeProfile?.name || '应聘者' }}
                <span v-if="interviewStore.resumeProfile?.yearsExp" class="profile-badge">
                  {{ interviewStore.resumeProfile.yearsExp }}
                </span>
              </div>
              <div class="profile-role">
                {{ interviewStore.resumeProfile?.jobRole || '技术开发工程师' }}
              </div>
            </div>
          </div>

          <!-- 核心项目标签 -->
          <div v-if="interviewStore.resumeProfile?.projects?.length" class="profile-projects">
            <div class="projects-label">核心项目经历：</div>
            <div class="projects-list">
              <span v-for="proj in interviewStore.resumeProfile.projects" :key="proj" class="project-tag">
                📁 {{ proj }}
              </span>
            </div>
          </div>

          <!-- 知识库状态与展开全文 -->
          <div class="knowledge-bar">
            <span class="knowledge-stat">📚 简历知识库: {{ interviewStore.resumeText?.length || 0 }} 字</span>
            <button class="knowledge-toggle-btn" @click="showResumeRaw = !showResumeRaw">
              {{ showResumeRaw ? '收起原文 ▲' : '查看原文 ▼' }}
            </button>
          </div>

          <div v-if="showResumeRaw" class="resume-raw-box">
            {{ interviewStore.resumeText }}
          </div>
        </div>

        <!-- 2. 纯粹的技术关键词考核维度（可多选/单选聚焦） -->
        <div v-if="interviewStore.extractedSkills && interviewStore.extractedSkills.length > 0" style="margin-top: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 class="section-title" style="margin-bottom: 0;">
              技能考核维度 ({{ interviewStore.selectedSkillNames.length }}/{{ interviewStore.extractedSkills.length }})
            </h4>
            <span style="font-size: 11px; color: var(--text-muted);">
              点击调整考察重点
            </span>
          </div>

          <div class="skills-wrap">
            <span
              v-for="skill in interviewStore.extractedSkills"
              :key="skill"
              class="skill-pill"
              :class="{ active: interviewStore.selectedSkillNames.includes(skill) }"
              @click="interviewStore.toggleSkill(skill)"
              title="点击勾选或取消该考核方向"
            >
              {{ skill }}
            </span>
          </div>

          <!-- Agent 智能模拟面试触发与模型配置入口 -->
          <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
            <button
              class="btn btn-primary"
              style="width: 100%; justify-content: center; font-size: 13px; font-weight: 600; padding: 8px 12px;"
              :disabled="interviewStore.isAiThinking || interviewStore.isAnalyzing"
              @click="handleStartInterview"
            >
              <span v-if="interviewStore.isAiThinking">🎙️ AI 考官正在审阅简历与题库...</span>
              <span v-else>🎙️ 开始 AI 全真模拟面试 (基于简历与关键词)</span>
            </button>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 2px;">
              <button
                class="btn btn-secondary"
                style="font-size: 11px; padding: 3px 8px;"
                :disabled="interviewStore.isAgentGenerating"
                @click="handleAgentGenerateQuestions"
                title="基于关键词检索题库生成参考考卷"
              >
                {{ interviewStore.isAgentGenerating ? '生成中...' : '📑 导出定制考卷' }}
              </button>
              <span style="font-size: 11px; color: var(--text-muted);">
                已选 {{ interviewStore.selectedSkillNames.length }} 个考核方向
              </span>
            </div>

            <!-- 切换大模型接入设置（API Key / 第三方 API） -->
            <div
              style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 4px 2px; font-size: 12px; color: var(--primary);"
              @click="showModelConfig = !showModelConfig"
            >
              <span>⚙️ 模型接入设置 ({{ getModeLabel(interviewStore.aiModelConfig.mode) }})</span>
              <span>{{ showModelConfig ? '▲ 收起' : '▼ 展开' }}</span>
            </div>

            <!-- 折叠配置面板 -->
            <div v-if="showModelConfig" class="model-config-panel">
              <div class="config-row">
                <label class="config-label">接入方式：</label>
                <div class="radio-group" style="flex-wrap: wrap;">
                  <label class="radio-item">
                    <input
                      type="radio"
                      value="CLI"
                      v-model="interviewStore.aiModelConfig.mode"
                    />
                    <span>Gemini CLI (推荐)</span>
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      value="API_KEY"
                      v-model="interviewStore.aiModelConfig.mode"
                    />
                    <span>官方 API Key</span>
                  </label>
                  <label class="radio-item">
                    <input
                      type="radio"
                      value="THIRD_PARTY"
                      v-model="interviewStore.aiModelConfig.mode"
                    />
                    <span>第三方 API (代理)</span>
                  </label>
                </div>
              </div>

              <!-- 模式 1: Gemini CLI / 本地命令行方式 -->
              <div v-if="interviewStore.aiModelConfig.mode === 'CLI'" style="display: flex; flex-direction: column; gap: 6px;">
                <div class="config-field">
                  <span class="field-title">CLI 命令行指令：</span>
                  <input
                    v-model="interviewStore.aiModelConfig.cliCommand"
                    type="text"
                    class="config-input"
                    placeholder="如 agy 或 gemini (本机已装)"
                  />
                </div>
                <div style="font-size: 11px; color: var(--success); display: flex; align-items: center; gap: 4px;">
                  <span>●</span> 已原生集成 Gemini CLI (agy)，可直接免 Key 本地高速调用！
                </div>
              </div>

              <!-- 模式 2: 第三方 API 需要配置 Base URL -->
              <div v-if="interviewStore.aiModelConfig.mode === 'THIRD_PARTY'" class="config-field">
                <span class="field-title">第三方 Base URL：</span>
                <input
                  v-model="interviewStore.aiModelConfig.baseUrl"
                  type="text"
                  class="config-input"
                  placeholder="如 https://api.deepseek.com/v1"
                />
              </div>

              <!-- 密钥输入 (API Key / 第三方 API 模式生效) -->
              <div v-if="interviewStore.aiModelConfig.mode !== 'CLI'" class="config-field">
                <span class="field-title">API Key (密钥)：</span>
                <input
                  v-model="interviewStore.aiModelConfig.apiKey"
                  type="password"
                  class="config-input"
                  placeholder="若为空则使用后端系统默认 Key"
                />
              </div>

              <div class="config-field">
                <span class="field-title">模型名称 (Model)：</span>
                <input
                  v-if="interviewStore.aiModelConfig.mode === 'CLI'"
                  v-model="interviewStore.aiModelConfig.modelName"
                  type="text"
                  class="config-input"
                  list="cli-model-options"
                  placeholder="gemini-3.8-flash-high (原生极速高算力推荐)"
                />
                <datalist id="cli-model-options">
                  <option value="gemini-3.8-flash-high">Gemini 3.8 Flash (High 算力 - 官方推荐)</option>
                  <option value="gemini-3.8-flash-medium">Gemini 3.8 Flash (Medium 算力)</option>
                  <option value="gemini-3.8-flash-low">Gemini 3.8 Flash (Low 算力)</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (深度思考)</option>
                  <option value="claude-opus-4-6-thinking">Claude Opus 4.6 (深度推理)</option>
                  <option value="gpt-oss-120b-medium">GPT-OSS 120B (开源大模型)</option>
                </datalist>
                <input
                  v-if="interviewStore.aiModelConfig.mode !== 'CLI'"
                  v-model="interviewStore.aiModelConfig.modelName"
                  type="text"
                  class="config-input"
                  :placeholder="interviewStore.aiModelConfig.mode === 'THIRD_PARTY' ? '如 deepseek-chat / gpt-4o' : '如 qwen-plus / qwen-max'"
                />
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <button
                  class="btn btn-secondary"
                  style="font-size: 11px; padding: 4px 8px;"
                  :disabled="testingConnection"
                  @click="handleTestConnection"
                >
                  {{ testingConnection ? '测试中...' : '测试连通性' }}
                </button>
                <span v-if="testResultMsg" :style="{ fontSize: '11px', color: testSuccess ? 'var(--success)' : '#ef4444' }">
                  {{ testResultMsg }}
                </span>
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
            💡 提示：点击「AI Agent 工具出题」将调用后端 langchain4j-spring-nexus，驱动 Agent 工具检索并生成真题！
          </div>
        </div>

        <!-- 历史模拟记录（数据库查询不到则不显示） -->
        <div
          v-if="interviewStore.historyList && interviewStore.historyList.length > 0"
          style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;"
        >
          <h4 class="section-title">
            历次模拟面试评分
          </h4>
          <div class="history-list">
            <div
              v-for="item in interviewStore.historyList"
              :key="item.id"
              class="history-item clickable"
              title="点击回看该场模拟面试考题与作答详情"
              @click="interviewStore.viewHistoryDetail(item)"
            >
              <div>
                <div style="font-size: 13px; font-weight: 600;">{{ item.keyWords || '技术模拟面试' }}</div>
                <div style="font-size: 11px; color: var(--text-muted);">{{ formatHistoryTime(item.createdTime) }}</div>
              </div>
              <span class="score-badge">{{ formatHistoryScore(item.avgScore) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：AI 模拟面试对话室 -->
      <div class="chat-card">
        <div class="chat-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="ai-avatar-wrap">
              <div class="ai-avatar-badge">
                <svg class="ai-badge-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <line x1="8" y1="16" x2="8.01" y2="16" stroke-width="2" stroke-linecap="round" />
                  <line x1="16" y1="16" x2="16.01" y2="16" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>
              <span class="pulse-dot"></span>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                <span>烤面筋 · AI 资深面试考官</span>
                <span v-if="interviewStore.resumeProfile?.name" class="candidate-header-pill">
                  考生: {{ interviewStore.resumeProfile.name }}
                </span>
              </div>
              <div style="font-size: 11px; color: var(--success); display: flex; align-items: center; gap: 4px;">
                <span>●</span> 全真项目追问引擎就绪 · 第 {{ interviewStore.aiInterviewStep }}/{{ interviewStore.aiTotalSteps }} 轮
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="font-size: 12px;" @click="interviewStore.resetChat">
              重置对话
            </button>
            <button
              v-if="!interviewStore.isInterviewActive"
              class="btn btn-primary"
              style="font-size: 12px;"
              @click="handleStartInterview"
            >
              开启模拟面试 ›
            </button>
          </div>
        </div>

        <!-- 聊天信息列表 -->
        <div ref="chatFeedRef" class="chat-feed">
          <div
            v-for="msg in interviewStore.chatMessages"
            :key="msg.id"
            class="chat-bubble-row"
            :class="msg.sender"
          >
            <div class="bubble-content-wrap">
              <div class="bubble-meta">
                <span class="bubble-sender">{{ msg.senderName }}</span>
                <span class="bubble-time">{{ msg.time }}</span>
              </div>
              <div v-if="msg.sender === 'ai'" class="bubble-text" v-html="formatAnswer(msg.content)"></div>
              <div v-else class="bubble-text" style="white-space: pre-wrap;">{{ msg.content }}</div>
            </div>
          </div>

          <!-- 考官分析与思考中状态指示 -->
          <div v-if="interviewStore.isAiThinking" class="chat-bubble-row ai thinking-bubble">
            <div class="bubble-content-wrap">
              <div class="bubble-meta">
                <span class="bubble-sender">烤面筋 AI 资深技术考官</span>
                <span class="bubble-time">思考研读中</span>
              </div>
              <div class="bubble-text thinking-text">
                <span class="thinking-spinner"></span>
                <span>考官正在深入研读并进行多维度考核分析（大模型推理中，约需 15~35 秒）...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 作答输入区域 -->
        <div class="chat-input-area">
          <div class="input-form">
            <textarea
              v-model="userAnswerText"
              class="answer-textarea"
              rows="3"
              placeholder="请在此输入你的回答或解题思路，支持 Markdown 格式..."
              :disabled="sending || interviewStore.isAiThinking"
              @keydown.enter.ctrl="handleSendAnswer"
            ></textarea>
            <button
              class="btn btn-primary send-btn"
              :disabled="!userAnswerText.trim() || sending || interviewStore.isAiThinking"
              @click="handleSendAnswer"
            >
              {{ sending || interviewStore.isAiThinking ? '考官分析中...' : '提交作答' }}
            </button>
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; text-align: right;">
            支持快捷键 Ctrl + Enter 快速发送
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useInterviewStore } from '@/stores/interview'
import { testModelConnection } from '@/api/ai'
import { formatAnswer } from '@/utils/format'

const interviewStore = useInterviewStore()

const fileInputRef = ref(null)
const chatFeedRef = ref(null)
const userAnswerText = ref('')
const sending = ref(false)

const showModelConfig = ref(false)
const testingConnection = ref(false)
const testResultMsg = ref('')
const testSuccess = ref(false)

const isDragging = ref(false)
const showResumeRaw = ref(false)

function handleDragOver(e) {
  isDragging.value = true
}

function handleDragLeave(e) {
  isDragging.value = false
}

async function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    await interviewStore.uploadAndAnalyseResume(file)
  }
}

function getModeLabel(mode) {
  if (mode === 'CLI') return 'Gemini CLI (推荐)'
  if (mode === 'THIRD_PARTY') return '第三方 API'
  return '官方 API Key'
}

onMounted(() => {
  interviewStore.loadHistory()
})

function handleUploadClick() {
  fileInputRef.value?.click()
}

async function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) {
    await interviewStore.uploadAndAnalyseResume(file)
  }
}

async function handleAgentGenerateQuestions() {
  await interviewStore.generateAgentQuestions()
  nextTick(() => {
    if (chatFeedRef.value) {
      chatFeedRef.value.scrollTop = chatFeedRef.value.scrollHeight
    }
  })
}

async function handleTestConnection() {
  testingConnection.value = true
  testResultMsg.value = ''
  try {
    const configToTest = interviewStore.aiModelConfig.apiKey || interviewStore.aiModelConfig.mode === 'THIRD_PARTY'
      ? interviewStore.aiModelConfig
      : null
    const res = await testModelConnection(configToTest)
    if (res && res.success && res.data) {
      testSuccess.value = true
      testResultMsg.value = `连接成功 (${res.data.costMs}ms)`
    } else {
      testSuccess.value = false
      testResultMsg.value = res?.message || '连接失败'
    }
  } catch (e) {
    testSuccess.value = false
    testResultMsg.value = '连通异常: ' + (e.message || '请检查服务状态')
  } finally {
    testingConnection.value = false
  }
}

async function handleStartInterview() {
  await interviewStore.startInterviewFlow()
  nextTick(() => {
    if (chatFeedRef.value) {
      chatFeedRef.value.scrollTop = chatFeedRef.value.scrollHeight
    }
  })
}

async function handleSendAnswer() {
  if (!userAnswerText.value.trim() || sending.value) return
  sending.value = true
  const text = userAnswerText.value
  userAnswerText.value = ''
  try {
    await interviewStore.sendUserAnswer(text)
    nextTick(() => {
      if (chatFeedRef.value) {
        chatFeedRef.value.scrollTop = chatFeedRef.value.scrollHeight
      }
    })
  } finally {
    sending.value = false
  }
}

function formatHistoryScore(score) {
  if (score === null || score === undefined) return '已完成'
  const num = Number(score)
  if (isNaN(num)) return '已完成'
  const finalScore = num <= 5 ? num * 20 : num
  return finalScore.toFixed(1) + '分'
}

function formatHistoryTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp)
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}`
}

watch(
  () => [interviewStore.chatMessages.length, interviewStore.isAiThinking],
  () => {
    nextTick(() => {
      if (chatFeedRef.value) {
        chatFeedRef.value.scrollTop = chatFeedRef.value.scrollHeight
      }
    })
  }
)
</script>

<style scoped>
.interview-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  height: calc(100vh - 120px);
  min-height: 560px;
}
.resume-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
  overflow-y: auto;
}
.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}
.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 10px;
}
.empty-tip {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 12px;
  border-radius: var(--radius-sm);
  text-align: center;
}
.upload-area {
  border: 2px dashed var(--border-color);
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.upload-area:hover,
.upload-area.is-dragover {
  border-color: var(--primary);
  background: var(--primary-light, #eff6ff);
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.15);
}
.upload-icon-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}
.upload-svg {
  width: 24px;
  height: 24px;
  color: var(--primary);
}
.upload-filename {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.upload-hint {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
.skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skill-pill {
  font-size: 11px;
  background: var(--bg-hover, #f3f4f6);
  color: var(--text-secondary, #4b5563);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}
.skill-pill:hover {
  border-color: var(--primary, #1677ff);
  color: var(--primary, #1677ff);
}
.skill-pill.active {
  background: var(--primary-light, #eff6ff);
  color: var(--primary, #1677ff);
  border-color: var(--primary-border, #bfdbfe);
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-subtle);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}
.history-item.clickable:hover {
  background: var(--primary-light, #eff6ff);
  border: 1px solid var(--primary-border, #bfdbfe);
  transform: translateY(-1px);
}
.score-badge {
  font-size: 13px;
  font-weight: 800;
  color: var(--success);
  font-family: var(--font-mono);
}

.chat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ai-avatar-wrap {
  position: relative;
  width: 36px;
  height: 36px;
}
.ai-avatar-badge {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(22, 119, 255, 0.2);
}
.ai-badge-svg {
  width: 20px;
  height: 20px;
}
.pulse-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  border: 2px solid var(--bg-card);
}
.chat-feed {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: var(--bg-page);
}
.chat-bubble-row {
  display: flex;
  max-width: 85%;
}
.chat-bubble-row.user {
  align-self: flex-end;
}
.bubble-content-wrap {
  display: flex;
  flex-direction: column;
}
.chat-bubble-row.user .bubble-content-wrap {
  align-items: flex-end;
}
.bubble-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.bubble-text {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.68;
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  word-break: break-word;
}
:deep(.bubble-text .ans-h1) {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin: 12px 0 6px 0;
}
:deep(.bubble-text .ans-h2) {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin: 10px 0 5px 0;
}
:deep(.bubble-text .ans-h3),
:deep(.bubble-text .ans-h4) {
  font-size: 14px;
  font-weight: 700;
  color: #1e3a8a;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding: 4px 10px;
  border-radius: 0 4px 4px 0;
  margin: 10px 0 6px 0;
}
:deep(.bubble-text .ans-hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 12px 0;
}
:deep(.bubble-text .ans-li),
:deep(.bubble-text .ans-ol) {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 0;
  line-height: 1.6;
}
:deep(.bubble-text .li-dot) {
  color: var(--primary);
  font-weight: 700;
}
:deep(.bubble-text .ol-num) {
  color: var(--primary);
  font-weight: 600;
}
:deep(.bubble-text .ans-quote) {
  margin: 8px 0;
  padding: 8px 12px;
  border-left: 3px solid #3b82f6;
  background: rgba(59, 130, 246, 0.06);
  border-radius: 0 4px 4px 0;
  color: var(--text-main);
  font-size: 13px;
}
:deep(.bubble-text .ans-gap) {
  height: 8px;
}
:deep(.bubble-text .md-code) {
  background: rgba(22, 119, 255, 0.08);
  color: #1d4ed8;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 13px;
  border: 1px solid rgba(22, 119, 255, 0.15);
}
:deep(.bubble-text .md-pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px 14px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
}
:deep(.bubble-text strong) {
  font-weight: 700;
  color: #0f172a;
}
.chat-bubble-row.user .bubble-text {
  background: var(--primary-light, #eff6ff);
  color: var(--text-main);
  border-color: var(--primary-border, #bfdbfe);
}
.chat-input-area {
  border-top: 1px solid var(--border-color);
  padding: 14px 20px;
  background: var(--bg-card);
}
.input-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.answer-textarea {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  resize: none;
  background: var(--bg-page);
  color: var(--text-main);
}
.answer-textarea:focus {
  border-color: var(--primary);
}
.send-btn {
  height: 44px;
  padding: 0 20px;
}

.model-config-panel {
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm, 6px);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.config-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.config-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}
.radio-group {
  display: flex;
  gap: 12px;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-main);
  cursor: pointer;
}
.config-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.field-title {
  font-size: 11px;
  color: var(--text-muted);
}
.config-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-main);
  outline: none;
  box-sizing: border-box;
}
.config-input:focus {
  border-color: var(--primary);
}

.thinking-text {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 13px;
  background: var(--bg-card);
}
.thinking-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #93c5fd;
  border-top-color: var(--primary, #1677ff);
  border-radius: 50%;
  animation: interview-spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes interview-spin {
  to { transform: rotate(360deg); }
}

/* 候选人专属档案与会话画像卡片样式 */
.candidate-profile-card {
  margin-top: 18px;
  background: var(--bg-page);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md, 8px);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.profile-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}
.profile-badge {
  font-size: 11px;
  font-weight: 500;
  color: #2563eb;
  background: #dbeafe;
  padding: 1px 6px;
  border-radius: 4px;
}
.profile-role {
  font-size: 12px;
  color: var(--text-muted);
}
.profile-projects {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.projects-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}
.projects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.project-tag {
  font-size: 11px;
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 2px 7px;
  border-radius: 4px;
  line-height: 1.4;
}
.knowledge-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
  font-size: 11px;
}
.knowledge-stat {
  color: #16a34a;
  font-weight: 500;
}
.knowledge-toggle-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 11px;
  cursor: pointer;
  padding: 0;
}
.knowledge-toggle-btn:hover {
  text-decoration: underline;
}
.resume-raw-box {
  max-height: 140px;
  overflow-y: auto;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  white-space: pre-wrap;
  word-break: break-all;
}
.candidate-header-pill {
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 12px;
}
</style>
