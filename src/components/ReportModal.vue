<template>
  <div v-if="practiceStore.reportModalOpen" class="modal-overlay active" @click.self="practiceStore.closeReportModal">
    <div class="modal-box" style="width: 600px; text-align: center;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main);">
          全真机考成绩评估报告 (Report)
        </h3>
        <button class="btn btn-secondary" @click="practiceStore.closeReportModal" style="padding: 2px 8px; border: none;">✕</button>
      </div>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
        基于随风微服务专项评测引擎 · 全方位能力雷达剖析
      </p>

      <!-- 得分统计卡片 -->
      <div class="score-card-grid">
        <div class="score-stat-item">
          <div class="stat-num" style="color: var(--primary);">{{ report.score }}</div>
          <div class="stat-label">综合得分 (满分100)</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num" style="color: var(--success);">{{ report.correctCount }} / {{ report.total }}</div>
          <div class="stat-label">正确题数</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num" style="color: #faad14;">超过 {{ report.rankPercent }}%</div>
          <div class="stat-label">全站战胜学员</div>
        </div>
        <div class="score-stat-item">
          <div class="stat-num" style="color: var(--text-main);">{{ report.timeSpent }}</div>
          <div class="stat-label">作答耗时</div>
        </div>
      </div>

      <!-- 五维雷达图 (SVG 矢量计算) -->
      <div style="margin: 20px 0;">
        <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">
          📊 核心技能维度雷达模型
        </h4>
        <div style="display: flex; justify-content: center; align-items: center;">
          <svg width="280" height="260" viewBox="0 0 300 280">
            <!-- 背景同心五边形网格 -->
            <polygon
              v-for="level in [0.2, 0.4, 0.6, 0.8, 1.0]"
              :key="level"
              :points="getPolygonPoints(level)"
              fill="none"
              stroke="#e2e8f0"
              stroke-width="1"
            />
            <!-- 轴线 -->
            <line
              v-for="(axis, i) in axisPoints"
              :key="'axis-' + i"
              x1="150"
              y1="140"
              :x2="axis.x"
              :y2="axis.y"
              stroke="#e2e8f0"
              stroke-width="1"
            />
            <!-- 数据多边形填充 -->
            <polygon
              :points="dataPolygonPoints"
              fill="rgba(22, 119, 255, 0.2)"
              stroke="#1677ff"
              stroke-width="2"
            />
            <!-- 数据点 -->
            <circle
              v-for="(pt, i) in dataPoints"
              :key="'pt-' + i"
              :cx="pt.x"
              :cy="pt.y"
              r="4"
              fill="#1677ff"
            />
            <!-- 标签文字 -->
            <text
              v-for="(t, i) in labelPoints"
              :key="'label-' + i"
              :x="t.x"
              :y="t.y"
              font-size="11"
              font-weight="600"
              fill="#475569"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {{ t.name }} ({{ t.score }}分)
            </text>
          </svg>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div style="display: flex; justify-content: center; gap: 12px; margin-top: 10px;">
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
  const r = practiceStore.examReport
  if (r) {
    if (!r.radarData || r.radarData.length === 0) {
      const s = r.score || 70
      r.radarData = [
        { name: 'Java基础核心', score: Math.min(100, Math.max(45, Math.round(s * 1.05))) },
        { name: '多线程并发', score: Math.min(100, Math.max(40, Math.round(s * 0.95))) },
        { name: 'MySQL调优', score: Math.min(100, Math.max(45, Math.round(s * 1.02))) },
        { name: '架构设计', score: Math.min(100, Math.max(40, Math.round(s * 0.9))) },
        { name: '算法实战', score: Math.min(100, Math.max(40, Math.round(s * 0.98))) }
      ]
    }
    return r
  }
  return {
    score: 85,
    total: 5,
    correctCount: 4,
    wrongCount: 1,
    rankPercent: 88,
    timeSpent: '12 分钟',
    radarData: [
      { name: 'Java基础核心', score: 90 },
      { name: '多线程并发', score: 92 },
      { name: 'MySQL调优', score: 80 },
      { name: '架构设计', score: 85 },
      { name: '算法实战', score: 78 }
    ]
  }
})

const cx = 150
const cy = 140
const maxR = 90
const totalAxes = 5

function getPolygonPoints(scale) {
  const pts = []
  for (let i = 0; i < totalAxes; i++) {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2
    const x = cx + maxR * scale * Math.cos(angle)
    const y = cy + maxR * scale * Math.sin(angle)
    pts.push(`${x},${y}`)
  }
  return pts.join(' ')
}

const axisPoints = computed(() => {
  const list = []
  for (let i = 0; i < totalAxes; i++) {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2
    list.push({
      x: cx + maxR * Math.cos(angle),
      y: cy + maxR * Math.sin(angle)
    })
  }
  return list
})

const dataPoints = computed(() => {
  const radar = (report.value.radarData && report.value.radarData.length === totalAxes)
    ? report.value.radarData
    : [
        { name: 'Java基础核心', score: 85 },
        { name: '多线程并发', score: 80 },
        { name: 'MySQL调优', score: 88 },
        { name: '架构设计', score: 75 },
        { name: '算法实战', score: 82 }
      ]
  return radar.map((d, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2
    const ratio = Math.max(0.18, Math.min(1.0, (d.score || 70) / 100))
    return {
      x: cx + maxR * ratio * Math.cos(angle),
      y: cy + maxR * ratio * Math.sin(angle)
    }
  })
})

const dataPolygonPoints = computed(() => {
  return dataPoints.value.map((p) => `${p.x},${p.y}`).join(' ')
})

const labelPoints = computed(() => {
  const radar = (report.value.radarData && report.value.radarData.length === totalAxes)
    ? report.value.radarData
    : [
        { name: 'Java基础核心', score: 85 },
        { name: '多线程并发', score: 80 },
        { name: 'MySQL调优', score: 88 },
        { name: '架构设计', score: 75 },
        { name: '算法实战', score: 82 }
      ]
  return radar.map((d, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2
    const r = maxR + 26
    return {
      name: d.name,
      score: d.score,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
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
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: #ffffff;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}
.score-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.score-stat-item {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px 6px;
}
.stat-num {
  font-size: 20px;
  font-weight: 800;
  font-family: var(--font-mono);
  margin-bottom: 2px;
}
.stat-label {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
