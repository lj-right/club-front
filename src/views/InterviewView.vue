<template>
  <div class="view-container">
    <div class="interview-layout">
      <!-- 左侧：简历解析与技能画像面板 -->
      <div class="resume-card">
        <h3 class="card-title">📄 智能简历技能画像</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
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
          <div style="font-size: 28px; margin-bottom: 8px;">📂</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">
            {{ interviewStore.resumeFileName || '点击上传或将简历拖曳至此' }}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
            支持 PDF / DOCX 格式（单文件 ≤ 10MB）
          </div>
        </div>

        <!-- 模拟一键解析简历 -->
        <div style="margin-top: 12px;">
          <button
            class="btn btn-secondary"
            style="width: 100%; font-size: 12px;"
            :disabled="interviewStore.isAnalyzing"
            @click="interviewStore.simulateResumeUpload('随风_资深全栈研发工程师.pdf')"
          >
            {{ interviewStore.isAnalyzing ? '正在智能提炼技能画像中...' : '⚡ 一键填入示范简历并分析' }}
          </button>
        </div>

        <!-- 提取到的技能标签画像 -->
        <div style="margin-top: 20px;">
          <h4 style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
            🔍 已提炼高频考察方向 ({{ interviewStore.extractedSkills.length }})
          </h4>
          <div class="skills-wrap">
            <span
              v-for="skill in interviewStore.extractedSkills"
              :key="skill"
              class="skill-pill"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- 历史模拟记录 -->
        <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <h4 style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 10px;">
            📜 历次模拟面试评分
          </h4>
          <div class="history-list">
            <div class="history-item">
              <div>
                <div style="font-size: 13px; font-weight: 600;">Java 后端高并发架构考</div>
                <div style="font-size: 11px; color: var(--text-muted);">2024-11-12 16:30</div>
              </div>
              <span class="score-badge">94.0分</span>
            </div>
            <div class="history-item">
              <div>
                <div style="font-size: 13px; font-weight: 600;">分布式系统与微服务</div>
                <div style="font-size: 11px; color: var(--text-muted);">2024-11-08 20:15</div>
              </div>
              <span class="score-badge">88.5分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：AI 模拟面试对话室 -->
      <div class="chat-card">
        <div class="chat-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="ai-avatar-wrap">
              <img src="http://127.0.0.1:9000/user/avatar/default_avatar.jpg" class="ai-avatar" />
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
              @click="interviewStore.startInterviewFlow"
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
            <img :src="msg.avatar" class="bubble-avatar" />
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

        <!-- 快捷操作与输入框 -->
        <div class="chat-input-area">
          <div class="quick-helpers">
            <span style="font-size: 12px; color: var(--text-muted);">答题辅助:</span>
            <button
              class="helper-pill"
              :disabled="!interviewStore.isInterviewActive"
              @click="handleFillSample"
            >
              ⚡ 一键填入高分标准回答范文
            </button>
          </div>

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
import { ref, nextTick } from 'vue'
import { useInterviewStore } from '@/stores/interview'

const interviewStore = useInterviewStore()

const fileInputRef = ref(null)
const chatFeedRef = ref(null)
const userAnswerText = ref('')
const sending = ref(false)

function handleUploadClick() {
  fileInputRef.value?.click()
}

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) {
    interviewStore.simulateResumeUpload(file.name)
  }
}

function handleFillSample() {
  userAnswerText.value = interviewStore.fillSampleAnswer()
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
.skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skill-pill {
  font-size: 11px;
  background: var(--primary-light);
  color: var(--primary);
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
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
.ai-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
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
  gap: 12px;
  max-width: 85%;
}
.chat-bubble-row.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.bubble-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
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
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}
.chat-input-area {
  border-top: 1px solid var(--border-color);
  padding: 14px 20px;
  background: #ffffff;
}
.quick-helpers {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.helper-pill {
  background: var(--duck-yellow-light);
  border: 1px solid var(--duck-yellow-border);
  color: #b45309;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
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
