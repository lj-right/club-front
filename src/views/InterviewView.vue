<template>
  <div class="view-container">
    <div class="interview-layout">
      <!-- 左侧：简历解析与技能画像面板 -->
      <div class="resume-card">
        <h3 class="card-title">智能简历技能画像</h3>
        <p class="card-desc">
          上传你的技术简历（PDF格式），大模型将自动提炼核心专长并定制匹配度最高的考官真题。
        </p>

        <!-- 简历上传区域 -->
        <div class="upload-area" @click="handleUploadClick">
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
            {{ interviewStore.isAnalyzing ? '正在智能提炼技能画像中...' : (interviewStore.resumeFileName || '点击上传或将简历拖曳至此') }}
          </div>
          <div class="upload-hint">
            支持 PDF / DOCX 格式（单文件 ≤ 10MB）
          </div>
        </div>

        <!-- 提取到的技能标签画像（数据库/简历分析未查询到则不显示） -->
        <div v-if="interviewStore.extractedSkills && interviewStore.extractedSkills.length > 0" style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 class="section-title" style="margin-bottom: 0;">
              简历提炼考核点 ({{ interviewStore.extractedSkills.length }})
            </h4>
            <span style="font-size: 11px; color: var(--text-muted);">
              点击勾选方向
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
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
            💡 提示：可勾选上方考核方向，点击「开启模拟面试」将调用后端真实出题接口！
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
              <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">
                随风 Club · AI 资深面试考官
              </div>
              <div style="font-size: 11px; color: var(--success); display: flex; align-items: center; gap: 4px;">
                <span>●</span> 智能多轮追问引擎已就绪
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
              <div class="bubble-text" style="white-space: pre-line;">
                {{ msg.content }}
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
              @keydown.enter.ctrl="handleSendAnswer"
            ></textarea>
            <button
              class="btn btn-primary send-btn"
              :disabled="!userAnswerText.trim() || sending"
              @click="handleSendAnswer"
            >
              {{ sending ? '评估中...' : '提交作答' }}
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
import { ref, onMounted, nextTick } from 'vue'
import { useInterviewStore } from '@/stores/interview'

const interviewStore = useInterviewStore()

const fileInputRef = ref(null)
const chatFeedRef = ref(null)
const userAnswerText = ref('')
const sending = ref(false)

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
  background: #ffffff;
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
  transition: all 0.2s;
}
.upload-area:hover {
  border-color: var(--primary);
  background: var(--primary-light);
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
  background: #ffffff;
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
  border: 2px solid #fff;
}
.chat-feed {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #f8fafc;
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
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.chat-bubble-row.user .bubble-text {
  background: var(--primary-light, #eff6ff);
  color: var(--text-main);
  border-color: var(--primary-border, #bfdbfe);
}
.chat-input-area {
  border-top: 1px solid var(--border-color);
  padding: 14px 20px;
  background: #ffffff;
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
}
.answer-textarea:focus {
  border-color: var(--primary);
}
.send-btn {
  height: 44px;
  padding: 0 20px;
}
</style>
