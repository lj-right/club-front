<template>
  <div v-if="practiceStore.reportModalOpen" class="modal-overlay active" @click.self="practiceStore.closeReportModal">
    <div class="modal-box">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">全真机考成绩评估报告</h3>
          <p class="modal-subtitle">核心技能维度与作答统计分析</p>
        </div>
        <button class="close-btn" @click="practiceStore.closeReportModal" title="关闭">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- 得分统计卡片 -->
      <div class="score-card-grid">
        <div class="score-stat-item">
          <div class="stat-num text-primary">{{ report.score }}</div>
          <div class="stat-label">综合得分 (满分100)</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num text-success">{{ report.correctCount }} / {{ report.total }}</div>
          <div class="stat-label">正确题数</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num">{{ report.rankPercent }}%</div>
          <div class="stat-label">全站战胜学员</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num">{{ report.timeSpent }}</div>
          <div class="stat-label">作答耗时</div>
        </div>
      </div>

      <!-- 五维/六维技能雷达图 (SVG 矢量计算) -->
      <div v-if="displayRadarData && displayRadarData.length >= 3" class="radar-container">
        <div class="radar-title">核心技能维度模型</div>
        <div class="radar-svg-wrap">
          <svg width="380" height="270" viewBox="0 0 380 270" style="overflow: visible;">
            <!-- 背景同心多边形网格 -->
            <polygon
              v-for="level in [0.2, 0.4, 0.6, 0.8, 1.0]"
              :key="level"
              :points="getPolygonPoints(level)"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <!-- 轴线 -->
            <line
              v-for="(axis, i) in axisPoints"
              :key="'axis-' + i"
              :x1="cx"
              :y1="cy"
              :x2="axis.x"
              :y2="axis.y"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <!-- 数据多边形填充 -->
            <polygon
              :points="dataPolygonPoints"
              fill="rgba(22, 119, 255, 0.12)"
              stroke="#1677ff"
              stroke-width="1.8"
            />
            <!-- 数据点 -->
            <circle
              v-for="(pt, i) in dataPoints"
              :key="'pt-' + i"
              :cx="pt.x"
              :cy="pt.y"
              r="3.5"
              fill="#1677ff"
            />
            <!-- 标签文字 -->
            <text
              v-for="(t, i) in labelPoints"
              :key="'label-' + i"
              :x="t.x"
              :y="t.y"
              font-size="11"
              font-weight="500"
              fill="#4b5563"
              :text-anchor="t.anchor"
              dominant-baseline="central"
            >
              {{ t.displayName }} ({{ t.score }})
            </text>
          </svg>
        </div>
      </div>
      <div v-else class="radar-empty" style="padding: 24px 0; text-align: center; color: #9ca3af; font-size: 13px;">
        暂无技能维度评测数据
      </div>

      <!-- 操作按钮 -->
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="practiceStore.closeReportModal">返回考场</button>
        <button class="btn btn-primary" @click="handleReviewErrors">查看错题解析</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePracticeStore } from '@/stores/practice'
import { useSubjectStore } from '@/stores/subject'

const practiceStore = usePracticeStore()
const subjectStore = useSubjectStore()

const report = computed(() => {
  return practiceStore.examReport || {
    score: 0,
    total: 0,
    correctCount: 0,
    wrongCount: 0,
    rankPercent: 0,
    timeSpent: '0 分钟',
    radarData: []
  }
})

// 智能去重、规范化并限制最适展示维度 (5~6 维)
const displayRadarData = computed(() => {
  const rawList = report.value?.radarData || []
  const map = new Map()

  rawList.forEach((item) => {
    const rawName = String(item.name || '技术考点').trim()
    const num = Number(item.score)
    const score = typeof item.score === 'number' && !isNaN(item.score) ? item.score : (!isNaN(num) ? num : 0)
    if (map.has(rawName)) {
      const prev = map.get(rawName)
      prev.score = Math.round((prev.score + score) / 2)
    } else {
      map.set(rawName, { name: rawName, score })
    }
  })

  let list = Array.from(map.values())
  if (list.length > 6) {
    list = list.slice(0, 6)
  } else if (list.length < 3) {
    const fallbacks = ['基础概念', '源码机制', '实战调优', '架构思维', '异常治理']
    const s = typeof report.value?.score === 'number' && !isNaN(report.value.score) ? report.value.score : 0
    let fIdx = 0
    while (list.length < 5) {
      const fName = fallbacks[fIdx++]
      if (!list.some((m) => m.name === fName)) {
        list.push({ name: fName, score: s })
      }
    }
  }
  return list
})

// 动态响应式轴数：与实际维度数量严格 1:1 绑定，彻底杜绝回卷重叠
const totalAxes = computed(() => displayRadarData.value.length || 5)

const cx = 190
const cy = 135
const maxR = 75

function getPolygonPoints(scale) {
  const pts = []
  const count = totalAxes.value
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    const x = cx + maxR * scale * Math.cos(angle)
    const y = cy + maxR * scale * Math.sin(angle)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

const axisPoints = computed(() => {
  const pts = []
  const count = totalAxes.value
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    pts.push({
      x: Number((cx + maxR * Math.cos(angle)).toFixed(1)),
      y: Number((cy + maxR * Math.sin(angle)).toFixed(1))
    })
  }
  return pts
})

const dataPoints = computed(() => {
  const count = totalAxes.value
  return displayRadarData.value.map((d, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    const rawScore = typeof d.score === 'number' && !isNaN(d.score) ? d.score : 0
    // 0分时缩回圆心 (scale = 0)，100分时拉满外圈 (scale = 1)
    const scale = Math.min(1, Math.max(0, rawScore / 100))
    return {
      x: Number((cx + maxR * scale * Math.cos(angle)).toFixed(1)),
      y: Number((cy + maxR * scale * Math.sin(angle)).toFixed(1)),
      score: rawScore
    }
  })
})

const dataPolygonPoints = computed(() => {
  return dataPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
})

const labelPoints = computed(() => {
  const count = totalAxes.value
  return displayRadarData.value.map((d, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    const cosVal = Math.cos(angle)
    const sinVal = Math.sin(angle)
    const r = maxR + 25

    let anchor = 'middle'
    if (cosVal > 0.22) anchor = 'start'
    else if (cosVal < -0.22) anchor = 'end'

    let yOffset = 0
    if (sinVal < -0.8) yOffset = -4
    else if (sinVal > 0.8) yOffset = 4

    const rawName = String(d.name || '技术考点').trim()
    const displayName = rawName.length > 7 ? rawName.slice(0, 7) + '…' : rawName
    const scoreVal = typeof d.score === 'number' && !isNaN(d.score) ? d.score : 0

    return {
      displayName,
      score: scoreVal,
      x: Number((cx + r * cosVal).toFixed(1)),
      y: Number((cy + r * sinVal + yOffset).toFixed(1)),
      anchor
    }
  })
})

function handleReviewErrors() {
  practiceStore.closeReportModal()
  practiceStore.openReviewMode(report.value.wrongCount > 0 ? 'wrong' : 'all')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 24px 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 580px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 12.5px;
  color: #737373;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #737373;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.close-btn:hover {
  color: #171717;
}

.score-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.score-stat-item {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}

.stat-num {
  font-size: 18px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
  color: #171717;
}

.stat-label {
  font-size: 11px;
  color: #737373;
}

.text-primary {
  color: #1677ff !important;
}

.text-success {
  color: #16a34a !important;
}

.radar-container {
  margin: 16px 0 20px 0;
}

.radar-title {
  font-size: 13px;
  font-weight: 600;
  color: #171717;
  text-align: center;
  margin-bottom: 12px;
}

.radar-svg-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f4f4f5;
  padding-top: 16px;
}
</style>
