<template>
  <div class="view-container">
    <!-- 模式一：全真模考错题复盘与深度逐题解析模式 (Review Mode) -->
    <div v-if="practiceStore.isReviewMode" class="review-mode-layout">
      <!-- 头部导航与操作 -->
      <div class="review-top-bar">
        <div class="review-top-left">
          <button class="btn btn-secondary back-btn" @click="practiceStore.exitReviewMode">
            ‹ 返回考场
          </button>
          <div class="review-heading-wrap">
            <h2 class="review-page-title">
              📋 试卷错题深度复盘与逐题解析
            </h2>
            <span class="review-set-tag">{{ practiceStore.examReport?.title || '全真模拟试卷' }}</span>
          </div>
        </div>
        <div class="review-top-right">
          <button class="btn btn-secondary" @click="practiceStore.openReportModal()">
            📊 重新查看能力雷达图
          </button>
          <button class="btn btn-primary" @click="practiceStore.exitReviewMode(); handleStartSet(practiceStore.currentSetId || 1)">
            🔄 重新模考挑战
          </button>
        </div>
      </div>

      <!-- 成绩概览与错题过滤栏 -->
      <div class="review-filter-bar">
        <div class="review-summary-chips">
          <div class="chip">
            <span class="chip-label">综合得分:</span>
            <span class="chip-val" style="color: var(--primary);">{{ practiceStore.examReport?.score }} 分</span>
          </div>
          <div class="chip">
            <span class="chip-label">正确题数:</span>
            <span class="chip-val" style="color: var(--success);">{{ practiceStore.examReport?.correctCount }} 题</span>
          </div>
          <div class="chip">
            <span class="chip-label">错题数:</span>
            <span class="chip-val" style="color: var(--danger);">{{ practiceStore.examReport?.wrongCount }} 题</span>
          </div>
          <div class="chip">
            <span class="chip-label">作答耗时:</span>
            <span class="chip-val">{{ practiceStore.examReport?.timeSpent }}</span>
          </div>
        </div>

        <div class="review-filter-buttons">
          <button
            class="filter-pill-btn"
            :class="{ active: practiceStore.reviewFilter === 'all' }"
            @click="practiceStore.setReviewFilter('all')"
          >
            全部考题 ({{ (practiceStore.examReport?.detailedSubjects || []).length }})
          </button>
          <button
            class="filter-pill-btn wrong"
            :class="{ active: practiceStore.reviewFilter === 'wrong' }"
            @click="practiceStore.setReviewFilter('wrong')"
          >
            🚨 仅看错题 ({{ practiceStore.examReport?.wrongCount || 0 }})
          </button>
        </div>
      </div>

      <!-- 错题解析卡片流 -->
      <div class="review-cards-list">
        <div
          v-if="displayedReviewQuestions.length === 0"
          class="empty-review"
        >
          <div style="font-size: 36px; margin-bottom: 8px;">🎉</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main);">太棒了！本套试卷全对无错题！</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 6px;">
            点击上方「全部考题」可回看全卷解析与标准答案。
          </p>
          <button class="btn btn-primary" style="margin-top: 14px;" @click="practiceStore.setReviewFilter('all')">
            查看全卷所有题目
          </button>
        </div>

        <div
          v-for="(q, idx) in displayedReviewQuestions"
          :key="q.id || idx"
          class="review-question-card"
          :class="{ 'is-wrong-card': !q.isCorrect }"
        >
          <!-- 题头 -->
          <div class="q-card-head">
            <div class="q-head-left">
              <span class="q-badge-num">第 {{ (q.index !== undefined ? q.index : idx) + 1 }} 题</span>
              <span class="badge" :class="getTypeBadgeClass(q.type)">{{ q.typeName || '单选题' }}</span>
              <span
                class="status-chip"
                :class="q.isCorrect ? 'chip-correct' : 'chip-wrong'"
              >
                {{ q.isCorrect ? '✓ 回答正确' : '✗ 作答错误' }}
              </span>
            </div>
          </div>

          <!-- 题干 -->
          <h3 class="q-card-title">{{ q.title }}</h3>

          <!-- 选项对比 -->
          <div v-if="q.options && q.options.length > 0" class="q-options-compare">
            <div
              v-for="(opt, optIdx) in q.options"
              :key="optIdx"
              class="review-opt-box"
              :class="{
                'opt-correct': isOptionInAnswers(opt.optionType, q.correctAnswer),
                'opt-wrong-selected': isUserSelectedOption(opt.optionType, q.userAnswer) && !isOptionInAnswers(opt.optionType, q.correctAnswer),
                'opt-correct-selected': isUserSelectedOption(opt.optionType, q.userAnswer) && isOptionInAnswers(opt.optionType, q.correctAnswer)
              }"
            >
              <div class="opt-prefix-badge">
                {{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || optIdx + 1 }}
              </div>
              <div class="opt-text">{{ opt.content }}</div>
              <div class="opt-indicator">
                <span v-if="isOptionInAnswers(opt.optionType, q.correctAnswer)" class="tag-correct-ans">
                  ✓ 标准正确选项
                </span>
                <span
                  v-if="isUserSelectedOption(opt.optionType, q.userAnswer)"
                  class="tag-user-ans"
                  :class="isOptionInAnswers(opt.optionType, q.correctAnswer) ? 'user-right' : 'user-wrong'"
                >
                  {{ isOptionInAnswers(opt.optionType, q.correctAnswer) ? '您的作答 (正确)' : '您的作答 (错误)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 深度解析与答题技巧 -->
          <div class="q-parse-container">
            <div class="parse-header">
              <span class="parse-title">💡 官方深度解析 & 考官核心考点</span>
            </div>
            <div class="parse-body" v-html="formatAnswer(q.subjectParse)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式二：沉浸式在线考场考试中 -->
    <div v-else-if="practiceStore.isExamActive" class="exam-active-layout">
      <!-- 考场头部状态栏 -->
      <div class="exam-top-bar">
        <div style="display: flex; align-items: center; gap: 12px;">
          <h2 style="font-size: 16px; font-weight: 700; color: var(--text-main);">
            {{ practiceStore.examTitle }}
          </h2>
          <span class="badge medium">全真机考进行中</span>
        </div>

        <div style="display: flex; align-items: center; gap: 20px;">
          <!-- 倒计时钟 -->
          <div class="timer-box">
            <span>⏱ 剩余作答时间:</span>
            <span class="timer-num">{{ practiceStore.formattedTime }}</span>
          </div>

          <button class="btn btn-primary" @click="confirmSubmit">
            交卷并查看评估报告
          </button>
        </div>
      </div>

      <!-- 考场做题双栏主体 -->
      <div class="exam-container">
        <!-- 左侧做题主区域 -->
        <div class="exam-main-card">
          <!-- 题目题头 -->
          <div class="exam-q-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="q-seq-badge">第 {{ practiceStore.currentIndex + 1 }} 题 / 共 {{ practiceStore.totalCount }} 题</span>
              <span class="badge" :class="getTypeBadgeClass(currentQ.type)">
                {{ currentQ.typeName || '单选题' }}
              </span>
              <span class="score-pill">分值: 25分</span>
            </div>
            <button
              class="flag-btn"
              :class="{ active: practiceStore.flagged[practiceStore.currentIndex] }"
              @click="practiceStore.toggleFlag"
            >
              🚩 {{ practiceStore.flagged[practiceStore.currentIndex] ? '已标记为疑难题' : '标记题目' }}
            </button>
          </div>

          <!-- 题干 -->
          <div class="exam-q-stem">
            {{ currentQ.title }}
          </div>

          <!-- 选项列表：单选题 / 多选题 / 判断题 -->
          <div v-if="currentQ.options && currentQ.options.length > 0" class="exam-options-list">
            <div
              v-for="(opt, optIdx) in currentQ.options"
              :key="optIdx"
              class="option-item"
              :class="{
                selected: isOptionSelected(opt.optionType)
              }"
              @click="handleSelect(opt.optionType)"
            >
              <span class="opt-prefix">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || (optIdx + 1) }}</span>
              <span class="opt-content">{{ opt.content }}</span>
              <span v-if="isOptionSelected(opt.optionType)" class="opt-check">✔</span>
            </div>
          </div>

          <!-- 简答题/主观分析题输入框 -->
          <div v-else class="exam-subjective-box">
            <textarea
              rows="7"
              placeholder="请输入您的技术解析与核心方案..."
              v-model="practiceStore.userAnswers[practiceStore.currentIndex]"
              class="exam-textarea"
            ></textarea>
          </div>

          <!-- 底部控制按钮 -->
          <div class="exam-bottom-actions">
            <button
              class="btn btn-secondary"
              :disabled="practiceStore.currentIndex === 0"
              @click="practiceStore.prevQuestion"
            >
              ‹ 上一题
            </button>
            <div style="font-size: 13px; color: var(--text-muted);">
              已作答: <span class="highlight-num">{{ practiceStore.answeredCount }}</span> / {{ practiceStore.totalCount }}
            </div>
            <button
              class="btn btn-primary"
              :disabled="practiceStore.currentIndex === practiceStore.totalCount - 1"
              @click="practiceStore.nextQuestion"
            >
              下一题 ›
            </button>
          </div>
        </div>

        <!-- 右侧答题卡与快速跳转 -->
        <div class="exam-sheet-card">
          <h3 class="sheet-title">答题卡 (Answer Sheet)</h3>
          <div class="sheet-legend">
            <div class="legend-item"><span class="legend-dot done"></span>已作答</div>
            <div class="legend-item"><span class="legend-dot un"></span>未作答</div>
            <div class="legend-item"><span class="legend-dot flag"></span>已标记</div>
          </div>

          <div class="sheet-grid">
            <div
              v-for="(q, idx) in practiceStore.questions"
              :key="idx"
              class="sheet-num"
              :class="{
                current: practiceStore.currentIndex === idx,
                answered: isQuestionAnswered(idx),
                flagged: practiceStore.flagged[idx]
              }"
              @click="practiceStore.jumpToQuestion(idx)"
            >
              {{ idx + 1 }}
            </div>
          </div>

          <div style="margin-top: 24px;">
            <button class="btn btn-primary" style="width: 100%;" @click="confirmSubmit">
              立即交卷
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式三：考场准备与组卷配置界面 (未进入考试) -->
    <div v-else class="practice-setup-layout">
      <div class="practice-setup-card">
        <div class="setup-header">
          <div class="duck-badge">PRO EXAM</div>
          <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
            随风 Club · 全真自适应专项在线考场
          </h2>
          <p style="font-size: 14px; color: var(--text-secondary); max-width: 620px; margin: 0 auto;">
            严选大厂高频真题与工业级场景题，模拟真实笔试机考环境。支持单选、多选、判断与简答综合考评，交卷后由后台即时输出综合能力评估报告。
          </p>
        </div>

        <!-- 考场分类导航切换 Tab -->
        <div class="practice-tabs-bar">
          <button
            class="practice-tab-btn"
            :class="{ active: practiceStore.activeTab === 'sets' }"
            @click="practiceStore.activeTab = 'sets'"
          >
            📜 精选模拟套卷
          </button>
          <button
            class="practice-tab-btn"
            :class="{ active: practiceStore.activeTab === 'history' }"
            @click="practiceStore.activeTab = 'history'"
          >
            📋 我的模考历史记录 (已测套卷)
            <span class="tab-badge">{{ practiceStore.examHistory?.length || 0 }}</span>
          </button>
        </div>

        <!-- TAB 1: 官方精选模拟套题列表 -->
        <div v-if="practiceStore.activeTab === 'sets'">
          <div class="section-title-bar">
            <h3 class="section-heading">📜 官方精选模拟套题</h3>
            <span class="section-sub">支持随机抽取后端真实题目组卷</span>
          </div>

          <div class="setup-modes">
            <!-- 官方后端真实套卷列表 -->
            <div
              v-for="set in practiceStore.preSets"
              :key="set.setId"
              class="mode-box"
            >
              <div class="mode-icon">📜</div>
              <h3 class="mode-title">{{ set.setName }}</h3>
              <p class="mode-desc">
                {{ set.setDesc || '精选大厂高频技术真题，涵盖核心原理、实战调优与架构考点。' }}
              </p>
              <div class="mode-meta">
                <span>⏱ 限时: 45 分钟</span>
                <span>•</span>
                <span>🔥 热度: {{ set.setHeat || 500 }}</span>
              </div>
              <div class="set-card-actions">
                <button class="btn btn-primary start-btn" @click="handleStartSet(set.setId)">
                  立即开启模考 ›
                </button>
                <button
                  class="btn btn-secondary random-btn"
                  title="从后端题库重新随机拼接考题"
                  :disabled="isRandomizing"
                  @click="handleRandomizeSet(set.setId)"
                >
                  🎲 随机重组试卷
                </button>
              </div>
            </div>

            <!-- 自定义自适应专项组卷 -->
            <div class="mode-box highlight-box" @click="handleOpenSpecialModal">
              <div class="mode-icon">⚡</div>
              <h3 class="mode-title">知识点自适应专项突击练</h3>
              <p class="mode-desc">
                针对特定技术栈定向智能组卷，攻坚薄弱考点，错题智能沉淀入库。
              </p>
              <div class="mode-meta">
                <span>⏱ 练习限时: 30 分钟</span>
                <span>•</span>
                <span>🎯 自适应标签抽取</span>
              </div>
              <button class="btn btn-secondary" style="margin-top: 16px; width: 100%;">
                开始自适应组卷 ›
              </button>
            </div>
          </div>

          <!-- 考场排行榜与数据概览 -->
          <div class="exam-dashboard-bottom">
            <div class="rank-board-card">
              <div class="rank-board-header">
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">
                  🏆 考场学员刷题战绩榜
                </h4>
                <span style="font-size: 12px; color: var(--text-muted);">实时同步</span>
              </div>
              <div class="rank-board-list">
                <div
                  v-for="(r, idx) in practiceStore.rankList"
                  :key="idx"
                  class="rank-row"
                >
                  <div class="rank-left">
                    <span class="rank-badge" :class="'top-' + (idx + 1)">{{ idx + 1 }}</span>
                    <img :src="r.avatar || defaultAvatar" class="rank-avatar" alt="avatar" />
                    <span class="rank-name">{{ r.name || '随风学员' }}</span>
                  </div>
                  <div class="rank-count">已完成 <strong>{{ r.count }}</strong> 场模考</div>
                </div>
              </div>
            </div>

            <div class="exam-records-summary">
              <div class="stat-col">
                <div class="stat-val" style="color: var(--primary);">92.6%</div>
                <div class="stat-name">综合测评合格率</div>
              </div>
              <div class="stat-col">
                <div class="stat-val" style="color: var(--success);">18,450</div>
                <div class="stat-name">全站学员参考次数</div>
              </div>
              <div class="stat-col">
                <div class="stat-val" style="color: #faad14;">45 min</div>
                <div class="stat-name">标准机考答题时限</div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: 我的模考历史记录 (已测套卷) -->
        <div v-else class="history-list-section">
          <div class="section-title-bar">
            <h3 class="section-heading">📋 我的模考历史记录 (已测套卷)</h3>
            <span class="section-sub">支持直接查看评测报告与错题复盘解析</span>
          </div>

          <div v-if="!practiceStore.examHistory || practiceStore.examHistory.length === 0" class="empty-history">
            <div style="font-size: 36px; margin-bottom: 8px;">📝</div>
            <p style="font-size: 14px; color: var(--text-secondary);">暂无模考记录，立即开启一场全真机考挑战吧！</p>
            <button class="btn btn-primary" style="margin-top: 14px;" @click="practiceStore.activeTab = 'sets'">
              前往精选模拟套卷
            </button>
          </div>

          <div v-else class="history-cards-list">
            <div
              v-for="hist in practiceStore.examHistory"
              :key="hist.id"
              class="history-card-item"
            >
              <div class="hist-info-col">
                <div class="hist-title">{{ hist.title }}</div>
                <div class="hist-meta-row">
                  <span>📅 考试时间: {{ hist.date }}</span>
                  <span>•</span>
                  <span>⏱ 作答耗时: {{ hist.timeSpent }}</span>
                  <span>•</span>
                  <span>🎯 正确率: {{ hist.correctCount }} / {{ hist.total }} 题</span>
                </div>
              </div>

              <div class="hist-score-col">
                <div class="hist-score-badge" :class="hist.score >= 60 ? 'score-pass' : 'score-fail'">
                  <span class="score-number">{{ hist.score }}</span>
                  <span class="score-unit">分 ({{ hist.score >= 60 ? '合格' : '未达标' }})</span>
                </div>
              </div>

              <div class="hist-actions-col">
                <button
                  class="btn btn-secondary hist-action-btn"
                  @click="practiceStore.openReportModal(hist.report)"
                >
                  📊 评测报告
                </button>
                <button
                  class="btn btn-primary hist-action-btn"
                  @click="practiceStore.openReviewMode(hist.wrongCount > 0 ? 'wrong' : 'all', hist.report)"
                >
                  🔍 错题解析
                </button>
                <button
                  class="btn btn-secondary hist-action-btn"
                  @click="handleStartSet(hist.setId || 1)"
                >
                  🔄 重新模考
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePracticeStore } from '@/stores/practice'
import { formatAnswer } from '@/utils/format'

const practiceStore = usePracticeStore()
const defaultAvatar = 'http://127.0.0.1:9000/user/avatar/default_avatar.jpg'

const currentQ = computed(() => practiceStore.currentQuestion)

// 错题复盘题目筛选
const displayedReviewQuestions = computed(() => {
  const list = practiceStore.examReport?.detailedSubjects || []
  if (practiceStore.reviewFilter === 'wrong') {
    return list.filter((q) => !q.isCorrect)
  }
  return list
})

function isOptionInAnswers(optType, answers) {
  if (answers === undefined || answers === null) return false
  if (Array.isArray(answers)) {
    return answers.includes(optType) || answers.includes(Number(optType))
  }
  return answers === optType || Number(answers) === Number(optType)
}

function isUserSelectedOption(optType, userAns) {
  if (userAns === undefined || userAns === null || userAns === '') return false
  if (Array.isArray(userAns)) {
    return userAns.includes(optType) || userAns.includes(Number(optType))
  }
  return userAns === optType || Number(userAns) === Number(optType)
}

const isRandomizing = ref(false)
async function handleRandomizeSet(setId) {
  isRandomizing.value = true
  try {
    const res = await fetch('/api/custom/randomizeSet')
    const json = await res.json()
    if (json.success) {
      await practiceStore.loadPreSets()
      alert('🎲 该套卷考题已成功从后端题库随机重新组卷！点击立即开启模考即可作答全新真题。')
    } else {
      alert('随机组卷失败: ' + (json.error || '后端异常'))
    }
  } catch (err) {
    console.warn('randomize error:', err)
    // fallback directly by re-fetching
    await practiceStore.loadPreSets()
    alert('🎲 已为您重新载入最新组卷题目！')
  } finally {
    isRandomizing.value = false
  }
}

function getTypeBadgeClass(type) {
  if (type === 1) return 'easy' // 单选
  if (type === 2) return 'medium' // 多选
  if (type === 3) return 'hard' // 判断
  return 'badge'
}

function isOptionSelected(optType) {
  const ans = practiceStore.userAnswers[practiceStore.currentIndex]
  if (Array.isArray(ans)) {
    return ans.includes(optType)
  }
  return ans === optType
}

function handleSelect(optType) {
  practiceStore.selectAnswer(optType)
}

function isQuestionAnswered(idx) {
  const ans = practiceStore.userAnswers[idx]
  if (Array.isArray(ans)) return ans.length > 0
  return ans !== undefined && ans !== ''
}

function formatUserAnswer(ans) {
  if (ans === undefined || ans === '') return '未作答'
  if (Array.isArray(ans)) return ans.join(', ')
  if (ans === 1) return 'A / 正确'
  if (ans === 0 || ans === 2) return 'B / 错误'
  return String(ans)
}

function handleStartSet(setId) {
  practiceStore.startExamBySet(setId)
}

function handleOpenSpecialModal() {
  // If special categories available, use the first label
  practiceStore.startCustomPractice(['101-1'])
}

function confirmSubmit() {
  if (practiceStore.answeredCount < practiceStore.totalCount) {
    if (!confirm(`还有 ${practiceStore.totalCount - practiceStore.answeredCount} 道题未作答，确定现在交卷吗？`)) {
      return
    }
  }
  practiceStore.submitExam()
}

onMounted(async () => {
  await practiceStore.loadPreSets()
  await practiceStore.loadRankList()
  await practiceStore.loadSpecialConfig()
})
</script>

<style scoped>
.practice-setup-layout {
  max-width: 1040px;
  margin: 0 auto;
}

.practice-setup-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.duck-badge {
  display: inline-block;
  background: #eff6ff;
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 12px;
  border: 1px solid #bfdbfe;
  letter-spacing: 0.5px;
}

.section-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-heading {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.section-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.setup-modes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.mode-box {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.mode-box:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
  transform: translateY(-2px);
}

.mode-box.highlight-box {
  background: #fcfdfe;
}

.mode-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.mode-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
  line-height: 1.4;
}

.mode-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.mode-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 8px;
  align-items: center;
}

.exam-dashboard-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
}

.rank-board-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
}

.rank-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rank-board-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #edf2f7;
}

.rank-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-badge.top-1 {
  background: #fef08a;
  color: #854d0e;
}

.rank-badge.top-2 {
  background: #e2e8f0;
  color: #334155;
}

.rank-badge.top-3 {
  background: #ffedd5;
  color: #9a3412;
}

.rank-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.rank-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.rank-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.exam-records-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  text-align: center;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
}

.stat-val {
  font-size: 24px;
  font-weight: 800;
  font-family: var(--font-mono);
  margin-bottom: 4px;
}

.stat-name {
  font-size: 12px;
  color: var(--text-muted);
}

/* 考试进行中样式 */
.exam-active-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-top-bar {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.timer-num {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--font-mono);
  color: #ef4444;
}

.exam-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

.exam-main-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.exam-q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.q-seq-badge {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}

.score-pill {
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
}

.flag-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.flag-btn.active {
  background: var(--warning-light);
  border-color: var(--warning-border);
  color: #b45309;
}

.exam-q-stem {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.6;
  margin-bottom: 24px;
}

.exam-options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  background: var(--bg-hover);
  border-color: var(--primary-border);
}

.option-item.selected {
  background: #eff6ff;
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}

.opt-prefix {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.option-item.selected .opt-prefix {
  background: var(--primary);
  color: #fff;
}

.opt-content {
  flex: 1;
  font-size: 14px;
}

.opt-check {
  font-weight: 800;
  color: var(--primary);
}

.exam-textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.exam-textarea:focus {
  border-color: var(--primary);
}

.exam-bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
  margin-top: auto;
}

.highlight-num {
  font-weight: 700;
  color: var(--primary);
}

.exam-sheet-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20px;
}

.sheet-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12px;
}

.sheet-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.done {
  background: var(--success);
}

.legend-dot.un {
  background: #cbd5e1;
}

.legend-dot.flag {
  background: #f59e0b;
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.sheet-num {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-regular);
  cursor: pointer;
  transition: all 0.2s;
}

.sheet-num:hover {
  background: var(--bg-hover);
}

.sheet-num.answered {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success-border);
}

.sheet-num.flagged {
  background: var(--warning-light);
  color: #b45309;
  border: 1px solid var(--warning-border);
}

.sheet-num.current {
  outline: 2px solid var(--primary);
  font-weight: 800;
}

/* 评估报告弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.report-modal {
  background: #ffffff;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  position: relative;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 24px;
  margin-bottom: 24px;
  position: relative;
}

.report-score-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
  flex-shrink: 0;
}

.report-score-num {
  font-size: 36px;
  font-weight: 800;
  font-family: var(--font-mono);
}

.report-score-unit {
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
}

.report-header-info {
  flex: 1;
}

.report-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 10px;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.report-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
}

.report-badge.highlight {
  background: #eff6ff;
  color: var(--primary);
  border: 1px solid #bfdbfe;
}

.modal-close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
}

.report-section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.skill-item {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 16px;
}

.skill-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 6px;
}

.skill-progress-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.skill-progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
}

.skill-score {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.answers-review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.review-item {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.review-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.review-idx {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}

.review-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.review-result-row {
  display: flex;
  gap: 24px;
  font-size: 13px;
  margin-bottom: 12px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
}

.review-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}

.review-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  background: #fcfcfc;
  border: 1px solid #f0f0f0;
}

.review-opt.is-correct {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.review-parse {
  font-size: 13px;
  line-height: 1.6;
  background: #eff6ff;
  border-left: 3px solid var(--primary);
  padding: 10px 12px;
  border-radius: 4px;
}

.parse-title {
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.parse-content {
  color: var(--text-regular);
}

.report-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

/* ==========================================================================
   考场 Tab 切换条 (精选套卷 vs 模考历史)
   ========================================================================== */
.practice-tabs-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.practice-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  background: var(--bg-subtle, #f8fafc);
  border: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.practice-tab-btn:hover {
  background: #eff6ff;
  border-color: var(--primary-border);
  color: var(--primary);
}

.practice-tab-btn.active {
  background: var(--primary, #1677ff);
  border-color: var(--primary, #1677ff);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.25);
}

.tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
}

.practice-tab-btn:not(.active) .tab-badge {
  background: #e2e8f0;
  color: #475569;
}

/* 套卷卡片操作按钮组 */
.set-card-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.set-card-actions .start-btn {
  flex: 1.2;
}

.set-card-actions .random-btn {
  flex: 1;
  font-size: 12px;
  padding: 6px 10px;
}

/* ==========================================================================
   模考历史记录列表 (已测套卷)
   ========================================================================== */
.history-list-section {
  padding-top: 4px;
}

.empty-history {
  background: #ffffff;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 48px 24px;
  text-align: center;
}

.history-cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 22px;
  transition: all 0.2s ease;
  gap: 20px;
}

.history-card-item:hover {
  border-color: var(--primary-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.hist-info-col {
  flex: 1;
}

.hist-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.hist-meta-row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: var(--text-muted);
}

.hist-score-col {
  display: flex;
  align-items: center;
}

.hist-score-badge {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
}

.score-pass {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.score-fail {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.score-number {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--font-mono, monospace);
  line-height: 1;
}

.score-unit {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
}

.hist-actions-col {
  display: flex;
  gap: 8px;
}

.hist-action-btn {
  font-size: 12px;
  padding: 6px 12px;
  white-space: nowrap;
}

/* ==========================================================================
   错题深度复盘与逐题解析模式 (Review Mode)
   ========================================================================== */
.review-mode-layout {
  max-width: 1040px;
  margin: 0 auto;
}

.review-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.review-top-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.review-heading-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-page-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.review-set-tag {
  background: #eff6ff;
  color: var(--primary);
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.review-top-right {
  display: flex;
  gap: 10px;
}

.review-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 20px;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.review-summary-chips {
  display: flex;
  gap: 14px;
  align-items: center;
}

.chip {
  background: var(--bg-subtle, #f8fafc);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.chip-label {
  color: var(--text-muted);
  margin-right: 4px;
}

.chip-val {
  font-weight: 700;
  font-family: var(--font-mono, monospace);
}

.review-filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-pill-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 5px 14px;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill-btn.active {
  background: var(--primary, #1677ff);
  color: #fff;
  border-color: var(--primary, #1677ff);
}

.filter-pill-btn.wrong.active {
  background: #ef4444;
  border-color: #ef4444;
}

.review-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-review {
  background: #ffffff;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 48px;
  text-align: center;
}

.review-question-card {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 22px 26px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.review-question-card.is-wrong-card {
  border-left: 4px solid #ef4444;
}

.q-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.q-head-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-badge-num {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-secondary);
  background: var(--bg-subtle, #f8fafc);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-family: var(--font-mono, monospace);
}

.status-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.chip-correct {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.chip-wrong {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.q-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.5;
  margin-bottom: 16px;
}

.q-options-compare {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.review-opt-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: #ffffff;
  font-size: 13.5px;
  transition: all 0.15s ease;
}

.review-opt-box.opt-correct {
  background: #f0fdf4;
  border-color: #86efac;
}

.review-opt-box.opt-wrong-selected {
  background: #fef2f2;
  border-color: #fca5a5;
}

.review-opt-box.opt-correct-selected {
  background: #ecfdf5;
  border-color: #34d399;
}

.opt-prefix-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-subtle, #f1f5f9);
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-correct .opt-prefix-badge,
.opt-correct-selected .opt-prefix-badge {
  background: #16a34a;
  color: #ffffff;
}

.opt-wrong-selected .opt-prefix-badge {
  background: #ef4444;
  color: #ffffff;
}

.opt-text {
  flex: 1;
  color: var(--text-main);
  line-height: 1.5;
}

.opt-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.tag-correct-ans {
  font-size: 11px;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-user-ans {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-user-ans.user-right {
  color: #16a34a;
  background: #dcfce7;
}

.tag-user-ans.user-wrong {
  color: #ef4444;
  background: #fee2e2;
}

.q-parse-container {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--primary, #1677ff);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin-top: 10px;
}

.parse-header {
  margin-bottom: 8px;
}

.parse-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary, #1677ff);
}

.parse-body {
  font-size: 13.5px;
  color: var(--text-regular);
  line-height: 1.7;
}

:deep(.parse-body strong) {
  color: var(--text-main);
  font-weight: 700;
}

:deep(.parse-body .md-code) {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  background: rgba(22, 119, 255, 0.08);
  color: var(--primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid rgba(22, 119, 255, 0.15);
}

:deep(.parse-body .md-pre) {
  margin: 10px 0;
  padding: 12px 14px;
  background: #1e1e24;
  color: #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.parse-body .ans-h1),
:deep(.parse-body .ans-h2),
:deep(.parse-body .ans-h3) {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin-top: 10px;
  margin-bottom: 4px;
}

:deep(.parse-body .ans-li),
:deep(.parse-body .ans-ol) {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 0;
}
</style>
