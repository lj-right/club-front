<template>
  <div class="view-container">
    <!-- 模式一：错题复盘与逐题解析模式 (Review Mode) -->
    <div v-if="practiceStore.isReviewMode && displayedReviewQuestions.length > 0" class="review-mode-layout">
      <!-- 头部导航与操作 -->
      <div class="review-top-bar">
        <div class="review-top-left">
          <button class="btn btn-secondary back-btn" @click="practiceStore.exitReviewMode">
            <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M10 13L5 8L10 3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>返回考场</span>
          </button>
          <div class="review-heading-wrap">
            <h2 class="review-page-title">试卷错题复盘与逐题解析</h2>
            <span class="review-set-tag">{{ practiceStore.examReport?.title || '全真模拟试卷' }}</span>
          </div>
        </div>
        <div class="review-top-right">
          <button class="btn btn-secondary" @click="practiceStore.openReportModal()">
            <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 13V9M8 13V5M13 13V3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>能力雷达图</span>
          </button>
          <button class="btn btn-primary" @click="practiceStore.exitReviewMode(); handleStartSet(practiceStore.currentSetId || 1)">
            <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9L2 6" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 2v4h4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>重新模考</span>
          </button>
        </div>
      </div>

      <!-- 成绩概览与错题过滤栏 -->
      <div class="review-filter-bar">
        <div class="review-summary-chips">
          <div class="summary-metric">
            <span class="metric-label">综合得分</span>
            <span class="metric-val text-primary">{{ practiceStore.examReport?.score }}</span>
            <span class="metric-unit">分</span>
          </div>
          <div class="metric-divider"></div>
          <div class="summary-metric">
            <span class="metric-label">正确</span>
            <span class="metric-val text-success">{{ practiceStore.examReport?.correctCount }}</span>
            <span class="metric-unit">题</span>
          </div>
          <div class="metric-divider"></div>
          <div class="summary-metric">
            <span class="metric-label">错题</span>
            <span class="metric-val text-danger">{{ practiceStore.examReport?.wrongCount }}</span>
            <span class="metric-unit">题</span>
          </div>
          <div class="metric-divider"></div>
          <div class="summary-metric">
            <span class="metric-label">作答耗时</span>
            <span class="metric-val">{{ practiceStore.examReport?.timeSpent }}</span>
          </div>
        </div>

        <div class="review-filter-buttons">
          <button
            class="filter-pill-btn"
            :class="{ active: practiceStore.reviewFilter === 'all' }"
            @click="practiceStore.setReviewFilter('all')"
          >
            全部考题 <span class="filter-count">({{ (practiceStore.examReport?.detailedSubjects || []).length }})</span>
          </button>
          <button
            class="filter-pill-btn wrong"
            :class="{ active: practiceStore.reviewFilter === 'wrong' }"
            @click="practiceStore.setReviewFilter('wrong')"
          >
            仅看错题 <span class="filter-count">({{ practiceStore.examReport?.wrongCount || 0 }})</span>
          </button>
        </div>
      </div>

      <!-- 错题解析卡片流 -->
      <div class="review-cards-list">
        <div v-if="displayedReviewQuestions.length === 0" class="empty-review">
          <h3 class="empty-title">本套试卷全部作答正确</h3>
          <p class="empty-desc">已掌握该套卷涉及的全部核心知识点与技术要点，可切换至全部考题查看完整题解。</p>
          <button class="btn btn-secondary" style="margin-top: 14px;" @click="practiceStore.setReviewFilter('all')">
            查看全卷试题
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
              <span class="q-mono-num">Q-{{ String((q.index !== undefined ? q.index : idx) + 1).padStart(2, '0') }}</span>
              <span class="badge" :class="getTypeBadgeClass(q.type)">{{ q.typeName || '单选题' }}</span>
              <span class="status-chip" :class="q.isCorrect ? 'chip-correct' : 'chip-wrong'">
                {{ q.isCorrect ? '回答正确' : '作答错误' }}
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
                  标准答案
                </span>
                <span
                  v-if="isUserSelectedOption(opt.optionType, q.userAnswer)"
                  class="tag-user-ans"
                  :class="isOptionInAnswers(opt.optionType, q.correctAnswer) ? 'user-right' : 'user-wrong'"
                >
                  {{ isOptionInAnswers(opt.optionType, q.correctAnswer) ? '您的作答' : '您的作答 (错误)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 简答题/主观题作答回顾 -->
          <div v-else class="review-subjective-box">
            <div class="user-sub-label">考生作答记录</div>
            <div class="user-sub-content">
              {{ q.userAnswer ? q.userAnswer : '（未作答，直接交卷）' }}
            </div>
          </div>

          <!-- 官方深度解析 -->
          <div class="q-parse-container">
            <div class="parse-header">
              <span class="parse-title">官方解析与考点分析</span>
            </div>
            <div class="parse-body" v-html="formatAnswer(q.subjectParse)"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式二：在线考场考试中 -->
    <div v-else-if="practiceStore.isExamActive" class="exam-active-layout">
      <!-- 考场头部状态栏 -->
      <div class="exam-top-bar">
        <div class="exam-top-title-group">
          <h2 class="exam-active-title">
            {{ practiceStore.examTitle }}
          </h2>
          <span class="exam-status-tag">模拟测试进行中</span>
        </div>

        <div class="exam-top-timer-group">
          <div class="timer-box">
            <span class="timer-label">剩余时间</span>
            <span class="timer-num">{{ practiceStore.formattedTime }}</span>
          </div>

          <button class="btn btn-primary" @click="confirmSubmit">
            交卷并查看报告
          </button>
        </div>
      </div>

      <!-- 考场做题双栏主体 -->
      <div class="exam-container">
        <!-- 左侧做题主区域 -->
        <div class="exam-main-card">
          <!-- 题目题头 -->
          <div class="exam-q-header">
            <div class="q-header-meta">
              <span class="q-seq-badge">第 {{ practiceStore.currentIndex + 1 }} 题 / 共 {{ practiceStore.totalCount }} 题</span>
              <span class="badge" :class="getTypeBadgeClass(currentQ.type)">
                {{ currentQ.typeName || '单选题' }}
              </span>
              <span class="score-pill">25 分</span>
            </div>
            <button
              class="flag-btn"
              :class="{ active: practiceStore.flagged[practiceStore.currentIndex] }"
              @click="practiceStore.toggleFlag"
            >
              <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 2v12M3 3h9l-2 3.5 2 3.5H3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ practiceStore.flagged[practiceStore.currentIndex] ? '已标记疑难题' : '标记疑难题' }}</span>
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
              :class="{ selected: isOptionSelected(opt.optionType) }"
              @click="handleSelect(opt.optionType)"
            >
              <span class="opt-prefix">{{ ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || (optIdx + 1) }}</span>
              <span class="opt-content">{{ opt.content }}</span>
              <span v-if="isOptionSelected(opt.optionType)" class="opt-check">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 8.5l3.5 3.5 6.5-7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <!-- 简答题/主观分析题输入框 -->
          <div v-else class="exam-subjective-box">
            <textarea
              rows="8"
              placeholder="请输入您的技术解析与核心实现方案..."
              :value="currentSubjectiveAnswer"
              @input="handleSubjectiveInput($event.target.value)"
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
            <div class="answered-status-text">
              已作答 <span class="highlight-num">{{ practiceStore.answeredCount }}</span> / {{ practiceStore.totalCount }}
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
          <h3 class="sheet-title">答题卡</h3>
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

          <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-primary" style="width: 100%;" @click="confirmSubmit">
              立即交卷
            </button>
            <button class="btn btn-secondary" style="width: 100%; font-size: 13px;" @click="handleGiveUpPractice">
              放弃本次练习
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式三：考场准备与组卷配置界面 (未进入考试) -->
    <div v-else class="practice-setup-layout">
      <!-- 页面主标题 -->
      <div class="setup-header">
        <h1 class="setup-main-title">全真专项模拟考场</h1>
        <p class="setup-subtitle">
          面向不同技术栈与职业通道的专业模拟机考，支持即时评测报告与逐题深度复盘。
        </p>
      </div>

      <!-- 考场分类导航切换 Tab -->
      <div class="practice-tabs-bar">
        <button
          class="practice-tab-btn"
          :class="{ active: practiceStore.activeTab === 'sets' }"
          @click="practiceStore.activeTab = 'sets'"
        >
          全真随机模考
        </button>
        <button
          class="practice-tab-btn"
          :class="{ active: practiceStore.activeTab === 'custom' }"
          @click="practiceStore.activeTab = 'custom'"
        >
          自定义出卷
        </button>
        <button
          class="practice-tab-btn"
          :class="{ active: practiceStore.activeTab === 'history' }"
          @click="practiceStore.activeTab = 'history'"
        >
          模考历史
          <span class="tab-badge">{{ practiceStore.examHistory?.length || 0 }}</span>
        </button>
      </div>

      <!-- TAB 1: 全真随机组卷模考 -->
      <div v-if="practiceStore.activeTab === 'sets'" class="practice-sets-layout">
        <!-- 左侧主体内容区 -->
        <div class="sets-main-col">
          <div class="section-title-bar">
            <h3 class="section-heading">全真自适应随机组卷</h3>
          </div>

          <!-- 核心 Hero 卡片：一键综合随机组卷 -->
          <div class="hero-random-card">
            <div class="hero-random-content">
              <h2 class="hero-card-title">全真综合自适应随机模考</h2>
              <p class="hero-card-desc">
                系统严格根据考评标准，从全站真实题库中动态随机抽取 20 道大厂高频真题（含单选、多选与判断），限时 45 分钟，全仿真还原大厂技术笔试环境。交卷后即刻生成综合得分、能力雷达与错题逐题复盘解析。
              </p>
              <div class="hero-tags-row">
                <span class="hero-tag-item">考题数量: <strong>20 题</strong></span>
                <span class="hero-tag-dot">·</span>
                <span class="hero-tag-item">考试限时: <strong>45 分钟</strong></span>
                <span class="hero-tag-dot">·</span>
                <span class="hero-tag-item">题型分布: <strong>10单选 + 6多选 + 4判断</strong></span>
                <span class="hero-tag-dot">·</span>
                <span class="hero-tag-item">及格标准: <strong>60 分</strong></span>
              </div>
            </div>
            <div class="hero-random-action">
              <button
                class="btn btn-primary hero-start-btn"
                :disabled="practiceStore.loadingExam"
                @click="handleStartRandomExam"
              >
                <span v-if="practiceStore.loadingExam" class="spinner-small"></span>
                <span v-else>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="vertical-align: -3px; margin-right: 4px;">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </span>
                <span>{{ practiceStore.loadingExam ? '正在智能组卷...' : '开始全真模考' }}</span>
              </button>
              <span class="hero-action-hint">抽取全站大厂技术真题</span>
            </div>
          </div>

          <!-- 技术方向定向随机组卷区 -->
          <div class="special-section-area">
            <div class="section-title-bar" style="margin-top: 28px;">
              <h3 class="section-heading">技术栈定向专项组卷</h3>
            </div>

            <div class="tech-category-grid">
              <div
                v-for="cat in flatSpecialCategories"
                :key="cat.categoryId"
                class="tech-cat-card"
              >
                <div class="cat-card-header">
                  <div class="cat-icon-box">
                    <TechIcon :name="cat.categoryName" :sub-id="cat.categoryId" />
                  </div>
                  <div class="cat-info-box">
                    <h4 class="cat-title">{{ cat.categoryName }}</h4>
                    <span class="cat-group-name">{{ cat.primaryName }}</span>
                  </div>
                </div>

                <!-- 包含的考点标签列表 -->
                <div class="cat-labels-row">
                  <span
                    v-for="lbl in cat.labelList || []"
                    :key="lbl.id || lbl.labelId"
                    class="cat-label-pill"
                    :title="'点击单独针对【' + (lbl.labelName || lbl.name) + '】组卷'"
                    @click="handleStartLabelExam(cat, lbl)"
                  >
                    {{ lbl.labelName || lbl.name }}
                  </span>
                </div>

                <div class="cat-card-footer">
                  <button
                    class="btn btn-secondary cat-start-btn"
                    :disabled="practiceStore.loadingExam"
                    @click="handleStartCategoryExam(cat)"
                  >
                    <span>开始专项组卷</span>
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M6 3.5l4.5 4.5L6 12.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧侧边栏：学员模考榜 -->
        <aside class="sets-side-col">
          <div class="rank-board-card">
            <div class="rank-board-header">
              <h4 class="rank-header-title">学员模考榜</h4>
              <span class="rank-header-sub">实时同步</span>
            </div>
            <div v-if="practiceStore.rankList && practiceStore.rankList.length > 0" class="rank-board-list">
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
                <div class="rank-count">完成 <strong>{{ r.count }}</strong> 场模考</div>
              </div>
            </div>
            <div v-else class="empty-rank-list" style="padding: 32px 16px; text-align: center; color: var(--text-secondary); font-size: 13px;">
              暂无学员模考排行数据
            </div>
          </div>
        </aside>
      </div>

      <!-- TAB 2: 自定义组合出卷独立页面 (规范：彻底去除所有图标与说明文案) -->
      <div v-else-if="practiceStore.activeTab === 'custom'" class="practice-custom-layout">
        <div class="custom-layout-main">
          <div class="custom-exam-panel">
            <div class="custom-panel-head">
              <h3 class="custom-panel-title">自定义组合出卷</h3>
              <div class="custom-head-actions">
                <span class="custom-selected-stat">已选分类: {{ selectedCategoryCount }} 项</span>
                <button type="button" class="custom-action-link" @click="selectAllCurrentPrimary">全选当前分类</button>
                <button type="button" class="custom-action-link" @click="clearAllSelected">清空已选</button>
              </div>
            </div>

            <!-- 一级分类切换行 (纯文字，无图标，无说明) -->
            <div class="custom-primary-row">
              <button
                v-for="pri in availablePrimaryList"
                :key="pri.id"
                type="button"
                class="custom-pri-btn"
                :class="{ active: currentCustomPrimaryId === pri.id }"
                @click="currentCustomPrimaryId = pri.id"
              >
                {{ pri.name }}
              </button>
            </div>

            <!-- 二级分类多选矩阵 (内嵌对应官方技术矢量图标) -->
            <div class="custom-sub-grid">
              <button
                v-for="sub in currentCustomSubList"
                :key="sub.id"
                type="button"
                class="custom-sub-pill"
                :class="{ selected: isCategorySelected(sub.id) }"
                @click="toggleCategorySelect(sub)"
              >
                <span class="sub-check-indicator">{{ isCategorySelected(sub.id) ? '[✓]' : '[ ]' }}</span>
                <span class="custom-sub-icon">
                  <TechIcon :name="sub.name" :sub-id="sub.id" />
                </span>
                <span class="sub-name">{{ sub.name }}</span>
              </button>
            </div>

            <!-- 题型数量与考试限时配置 (纯文字与数字输入/步进，无图标，无说明) -->
            <div class="custom-config-row">
              <div class="config-stepper-group">
                <span class="config-label">单选题</span>
                <div class="stepper-box">
                  <button type="button" class="step-btn" @click="stepCount('single', -1)">-</button>
                  <input type="number" v-model.number="customCounts.single" min="0" max="30" class="step-input" />
                  <button type="button" class="step-btn" @click="stepCount('single', 1)">+</button>
                </div>
              </div>

              <div class="config-stepper-group">
                <span class="config-label">多选题</span>
                <div class="stepper-box">
                  <button type="button" class="step-btn" @click="stepCount('multi', -1)">-</button>
                  <input type="number" v-model.number="customCounts.multi" min="0" max="20" class="step-input" />
                  <button type="button" class="step-btn" @click="stepCount('multi', 1)">+</button>
                </div>
              </div>

              <div class="config-stepper-group">
                <span class="config-label">判断题</span>
                <div class="stepper-box">
                  <button type="button" class="step-btn" @click="stepCount('judge', -1)">-</button>
                  <input type="number" v-model.number="customCounts.judge" min="0" max="20" class="step-input" />
                  <button type="button" class="step-btn" @click="stepCount('judge', 1)">+</button>
                </div>
              </div>

              <div class="config-stepper-group">
                <span class="config-label">简答题</span>
                <div class="stepper-box">
                  <button type="button" class="step-btn" @click="stepCount('brief', -1)">-</button>
                  <input type="number" v-model.number="customCounts.brief" min="0" max="15" class="step-input" />
                  <button type="button" class="step-btn" @click="stepCount('brief', 1)">+</button>
                </div>
              </div>

              <div class="config-stepper-group">
                <span class="config-label">考试限时 (分钟)</span>
                <div class="stepper-box">
                  <button type="button" class="step-btn" @click="stepCount('duration', -5)">-</button>
                  <input type="number" v-model.number="customCounts.duration" min="10" max="180" class="step-input" />
                  <button type="button" class="step-btn" @click="stepCount('duration', 5)">+</button>
                </div>
              </div>
            </div>

            <!-- 底部提交与统计栏 (纯文字，无图标，无说明) -->
            <div class="custom-panel-footer">
              <div class="custom-footer-stats">
                <span>题目总数: <strong>{{ customTotalQuestions }}</strong> 题</span>
                <span class="stat-sep">·</span>
                <span>考试限时: <strong>{{ customCounts.duration }}</strong> 分钟</span>
              </div>
              <div class="custom-footer-actions">
                <button type="button" class="btn btn-secondary custom-reset-btn" @click="resetCustomCounts">
                  重置
                </button>
                <button
                  type="button"
                  class="btn btn-primary custom-submit-btn"
                  :disabled="isBuildingExam"
                  @click="handleStartCustomExam"
                >
                  {{ isBuildingExam ? '正在抽取题目组卷...' : '生成试卷并开始考试' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 自定义出题侧边概览与试卷结构卡片 (无图标、无说明) -->
        <aside class="custom-layout-side">
          <div class="custom-manifest-card">
            <h4 class="manifest-card-title">组卷配置清单</h4>
            <div class="manifest-item-row">
              <span class="manifest-label">题目总数</span>
              <span class="manifest-val">{{ customTotalQuestions }} 题</span>
            </div>
            <div class="manifest-item-row">
              <span class="manifest-label">单选题</span>
              <span class="manifest-val">{{ customCounts.single }} 题</span>
            </div>
            <div class="manifest-item-row">
              <span class="manifest-label">多选题</span>
              <span class="manifest-val">{{ customCounts.multi }} 题</span>
            </div>
            <div class="manifest-item-row">
              <span class="manifest-label">判断题</span>
              <span class="manifest-val">{{ customCounts.judge }} 题</span>
            </div>
            <div class="manifest-item-row">
              <span class="manifest-label">简答题</span>
              <span class="manifest-val">{{ customCounts.brief }} 题</span>
            </div>
            <div class="manifest-divider"></div>
            <div class="manifest-item-row">
              <span class="manifest-label">考试限时</span>
              <span class="manifest-val">{{ customCounts.duration }} 分钟</span>
            </div>
            <div class="manifest-item-row">
              <span class="manifest-label">及格标准</span>
              <span class="manifest-val">60 分</span>
            </div>
            <div class="manifest-divider"></div>
            <div class="manifest-skills-section">
              <span class="manifest-label" style="display: block; margin-bottom: 8px;">覆盖技术技能 ({{ selectedCategoryCount }})</span>
              <div v-if="selectedCategoryCount > 0" class="manifest-skills-pills">
                <span
                  v-for="sub in Array.from(selectedCategories.values())"
                  :key="sub.id"
                  class="manifest-skill-tag"
                >
                  <TechIcon :name="sub.name" :sub-id="sub.id" style="width: 14px; height: 14px; display: inline-flex; vertical-align: middle; margin-right: 4px;" />
                  {{ sub.name }}
                </span>
              </div>
              <div v-else class="manifest-empty-tip">
                全部技能随机
              </div>
            </div>
            <div class="manifest-action-box">
              <button
                type="button"
                class="btn btn-primary manifest-start-btn"
                :disabled="isBuildingExam"
                @click="handleStartCustomExam"
              >
                {{ isBuildingExam ? '正在抽取题目组卷...' : '生成试卷并开始考试' }}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- TAB 3: 我的模考历史记录 (已测套卷) -->
      <div v-else class="history-list-section">
        <div class="section-title-bar history-title-bar">
          <div class="title-with-desc">
            <h3 class="section-heading">我的模考历史记录</h3>
            <span class="section-sub">支持直接查看评测报告与错题复盘解析</span>
          </div>

          <!-- 批量操作与清空操作入口 -->
          <div v-if="practiceStore.examHistory && practiceStore.examHistory.length > 0" class="history-header-actions">
            <template v-if="!isBatchMode">
              <button class="btn btn-secondary hist-header-btn" @click="isBatchMode = true">
                <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2.5 5h11M2.5 8h11M2.5 11h11" stroke-linecap="round" />
                </svg>
                <span>批量管理</span>
              </button>
              <button class="btn btn-secondary hist-header-btn clear-btn" @click="openClearAllConfirm">
                <svg class="icon-svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M2.5 4h11M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4M6.5 7v5M9.5 7v5M3.5 4l.8 9.5a1.5 1.5 0 0 0 1.5 1.5h4.4a1.5 1.5 0 0 0 1.5-1.5L12.5 4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>清空历史</span>
              </button>
            </template>
            <template v-else>
              <span class="batch-hint">已选 <strong>{{ selectedHistoryIds.length }}</strong> / {{ practiceStore.examHistory.length }} 项</span>
              <button class="btn btn-secondary hist-header-btn" @click="toggleSelectAll">
                {{ isAllSelected ? '取消全选' : '全选' }}
              </button>
              <button
                class="btn btn-primary hist-header-btn batch-delete-btn"
                :disabled="selectedHistoryIds.length === 0"
                @click="openBatchDeleteConfirm"
              >
                删除选中 ({{ selectedHistoryIds.length }})
              </button>
              <button class="btn btn-secondary hist-header-btn" @click="exitBatchMode">
                退出批量
              </button>
            </template>
          </div>
        </div>

        <div v-if="!practiceStore.examHistory || practiceStore.examHistory.length === 0" class="empty-history">
          <h4 class="empty-title">暂无模考记录</h4>
          <p class="empty-desc">选择一套模拟试卷，开始您的首场全真机考练习。</p>
          <button class="btn btn-secondary" style="margin-top: 14px;" @click="practiceStore.activeTab = 'sets'">
            前往精选套卷
          </button>
        </div>

        <div v-else class="history-cards-list">
          <div
            v-for="hist in practiceStore.examHistory"
            :key="hist.id"
            class="history-card-item"
            :class="{ 'batch-active': isBatchMode, 'is-selected': selectedHistoryIds.includes(hist.id) }"
            @click="isBatchMode && toggleSelectItem(hist.id)"
          >
            <!-- 批量选择框 -->
            <div v-if="isBatchMode" class="batch-check-box" @click.stop>
              <input
                type="checkbox"
                class="custom-check-input"
                :checked="selectedHistoryIds.includes(hist.id)"
                @change="toggleSelectItem(hist.id)"
              />
            </div>

            <div class="hist-info-col">
              <div class="hist-title">{{ hist.title }}</div>
              <div class="hist-meta-row">
                <span>考试时间: {{ hist.date }}</span>
                <span class="meta-dot">·</span>
                <span>作答耗时: {{ hist.timeSpent }}</span>
                <span class="meta-dot">·</span>
                <span>正确率: {{ hist.correctCount }} / {{ hist.total }} 题</span>
              </div>
            </div>

            <div class="hist-score-col">
              <div class="hist-score-badge" :class="hist.score >= 60 ? 'score-pass' : 'score-fail'">
                <span class="score-number">{{ hist.score }}</span>
                <span class="score-unit">分 ({{ hist.score >= 60 ? '合格' : '未达标' }})</span>
              </div>
            </div>

            <div class="hist-actions-col" @click.stop>
              <button
                class="btn btn-secondary hist-action-btn"
                @click="practiceStore.openReportFromHistory(hist)"
              >
                评测报告
              </button>
              <button
                class="btn btn-primary hist-action-btn"
                @click="practiceStore.openReviewFromHistory(hist, hist.wrongCount > 0 ? 'wrong' : 'all')"
              >
                错题解析
              </button>
              <button
                class="btn btn-secondary hist-action-btn"
                @click="handleStartSet(hist.setId || 1)"
              >
                重新模考
              </button>
              <button
                class="btn btn-secondary hist-action-btn delete-btn"
                title="删除此条模考记录"
                @click="openDeleteConfirm(hist)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模考记录删除确认弹窗 -->
    <div v-if="deleteModal.visible" class="modal-overlay active" @click.self="closeDeleteModal">
      <div class="confirm-modal-box">
        <div class="confirm-modal-header">
          <div class="confirm-icon-wrap" :class="deleteModal.isDanger ? 'icon-danger' : 'icon-warning'">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="confirm-title-area">
            <h4 class="confirm-title">{{ deleteModal.title }}</h4>
            <p class="confirm-desc">{{ deleteModal.description }}</p>
          </div>
          <button class="confirm-close-btn" @click="closeDeleteModal" title="关闭">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <div v-if="deleteModal.targetInfo" class="confirm-item-preview">
          <div class="preview-title">{{ deleteModal.targetInfo.title }}</div>
          <div class="preview-meta">
            <span>考试时间: {{ deleteModal.targetInfo.date }}</span>
            <span class="preview-dot">·</span>
            <span>得分: <strong :class="deleteModal.targetInfo.score >= 60 ? 'text-success' : 'text-danger'">{{ deleteModal.targetInfo.score }}分</strong></span>
          </div>
        </div>

        <div class="confirm-warning-tip">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6" stroke-linecap="round" />
            <path d="M8 5v4m0 2h.01" stroke-linecap="round" />
          </svg>
          <span>删除后将清除该次模考的成绩、作答明细和能力评估，此操作无法撤销。</span>
        </div>

        <div class="confirm-modal-footer">
          <button class="btn btn-secondary confirm-btn" :disabled="deleteModal.loading" @click="closeDeleteModal">
            取消
          </button>
          <button class="btn btn-danger-solid confirm-btn" :disabled="deleteModal.loading" @click="executeDelete">
            <span v-if="deleteModal.loading" class="spinner-small"></span>
            <span>{{ deleteModal.loading ? '正在删除...' : '确定删除' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 简易轻量级 Toast 提示 -->
    <transition name="fade">
      <div v-if="toastMessage" class="feedback-toast">
        <svg class="toast-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 8.5l3.5 3.5L13 5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePracticeStore } from '@/stores/practice'
import { addPractice } from '@/api/practice'
import { getSubjectPage, queryPrimaryCategory, queryCategoryByPrimary, queryLabelByCategoryId } from '@/api/subject'
import { PRIMARY_CATEGORIES, SUB_CATEGORIES, QUESTIONS_DATA } from '@/assets/mock_data'
import { formatAnswer } from '@/utils/format'
import TechIcon from '@/components/TechIcon.vue'
import { matchCategoryQuestions, SPECIALIZED_QUESTIONS_POOL } from '@/utils/specializedQuestions'

const practiceStore = usePracticeStore()
const defaultAvatar = 'http://127.0.0.1:9005/user/avatar/default_avatar.jpg'

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

function getTypeBadgeClass(type) {
  if (type === 1) return 'easy' // 单选
  if (type === 2) return 'medium' // 多选
  if (type === 3) return 'hard' // 判断
  return 'badge'
}

function isOptionSelected(optType) {
  const curQ = practiceStore.currentQuestion
  const sId = curQ?.subjectId || curQ?.id
  const ans = (sId && practiceStore.userAnswers[sId] !== undefined)
    ? practiceStore.userAnswers[sId]
    : practiceStore.userAnswers[practiceStore.currentIndex]
  if (Array.isArray(ans)) {
    return ans.includes(optType) || ans.includes(Number(optType))
  }
  return ans === optType || Number(ans) === Number(optType)
}

function handleSelect(optType) {
  practiceStore.selectAnswer(optType)
}

const currentSubjectiveAnswer = computed(() => {
  const curQ = practiceStore.currentQuestion
  const sId = curQ?.subjectId || curQ?.id
  const ans = (sId && practiceStore.userAnswers[sId] !== undefined)
    ? practiceStore.userAnswers[sId]
    : practiceStore.userAnswers[practiceStore.currentIndex]
  return ans !== undefined && ans !== null ? String(ans) : ''
})

function handleSubjectiveInput(val) {
  const curQ = practiceStore.currentQuestion
  const sId = curQ?.subjectId || curQ?.id
  practiceStore.userAnswers[practiceStore.currentIndex] = val
  if (sId) {
    practiceStore.userAnswers[sId] = val
  }
}

function isQuestionAnswered(idx) {
  const q = practiceStore.questions[idx]
  const sId = q?.subjectId || q?.id
  const ans = (sId && practiceStore.userAnswers[sId] !== undefined)
    ? practiceStore.userAnswers[sId]
    : practiceStore.userAnswers[idx]
  if (Array.isArray(ans)) return ans.length > 0
  return ans !== undefined && ans !== ''
}

function handleStartSet(setId) {
  practiceStore.startExamBySet(setId)
}

// 扁平化技术方向列表 (全面覆盖核心技术通道与高频考点)
const DEFAULT_HOT_SPECIAL_CATEGORIES = [
  { primaryId: 1, primaryName: '通用技术', categoryId: 101, categoryName: '计算机科学基础', labelList: [{ id: 1, labelName: '进程与线程' }, { id: 2, labelName: '虚拟内存' }, { id: 3, labelName: '死锁机制' }, { id: 4, labelName: 'I/O多路复用' }] },
  { primaryId: 1, primaryName: '通用技术', categoryId: 102, categoryName: '算法与数据结构', labelList: [{ id: 5, labelName: '红黑树' }, { id: 6, labelName: '动态规划' }, { id: 7, labelName: '快速排序' }, { id: 8, labelName: 'LRU缓存' }] },
  { primaryId: 1, primaryName: '通用技术', categoryId: 103, categoryName: 'SQL', labelList: [{ id: 9, labelName: 'B+树索引' }, { id: 10, labelName: 'MVCC并发' }, { id: 11, labelName: '事务隔离' }, { id: 12, labelName: '慢查询优化' }] },
  { primaryId: 1, primaryName: '通用技术', categoryId: 107, categoryName: '网络与 HTTP', labelList: [{ id: 25, labelName: 'TCP三次握手' }, { id: 26, labelName: 'HTTPS/TLS' }, { id: 27, labelName: 'HTTP2/3' }, { id: 28, labelName: 'DNS解析' }] },
  { primaryId: 1, primaryName: '通用技术', categoryId: 108, categoryName: 'Docker', labelList: [{ id: 29, labelName: '镜像分层' }, { id: 30, labelName: 'Namespace' }, { id: 31, labelName: 'Cgroups' }, { id: 32, labelName: '网络模式' }] },
  { primaryId: 2, primaryName: '前端开发', categoryId: 201, categoryName: 'HTML/CSS', labelList: [{ id: 41, labelName: '盒模型' }, { id: 42, labelName: 'Flex布局' }, { id: 43, labelName: 'BFC机制' }, { id: 44, labelName: '重排与重绘' }] },
  { primaryId: 2, primaryName: '前端开发', categoryId: 202, categoryName: 'JavaScript', labelList: [{ id: 45, labelName: '闭包' }, { id: 46, labelName: '原型链' }, { id: 47, labelName: 'EventLoop' }, { id: 48, labelName: 'Promise' }] },
  { primaryId: 2, primaryName: '前端开发', categoryId: 203, categoryName: 'TypeScript', labelList: [{ id: 49, labelName: '泛型' }, { id: 50, labelName: '类型体操' }, { id: 51, labelName: 'infer' }, { id: 52, labelName: 'keyof' }] },
  { primaryId: 2, primaryName: '前端开发', categoryId: 204, categoryName: 'React', labelList: [{ id: 53, labelName: 'Fiber双缓存' }, { id: 54, labelName: 'Hooks原理' }, { id: 55, labelName: '虚拟DOM' }, { id: 56, labelName: 'Diff算法' }] },
  { primaryId: 2, primaryName: '前端开发', categoryId: 206, categoryName: 'Vue.js', labelList: [{ id: 61, labelName: 'Proxy响应式' }, { id: 62, labelName: '虚拟DOM' }, { id: 63, labelName: 'Diff最长递增子序列' }, { id: 64, labelName: 'Pinia状态管理' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 301, categoryName: 'Node.js', labelList: [{ id: 69, labelName: '事件循环' }, { id: 70, labelName: 'Stream' }, { id: 71, labelName: 'Buffer' }, { id: 72, labelName: 'Cluster集群' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 302, categoryName: 'Java', labelList: [{ id: 73, labelName: 'JVM内存' }, { id: 74, labelName: 'GC垃圾回收' }, { id: 75, labelName: '线程池' }, { id: 76, labelName: 'AQS并发' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 303, categoryName: 'Spring Boot', labelList: [{ id: 77, labelName: '自动装配' }, { id: 78, labelName: 'Bean生命周期' }, { id: 79, labelName: '三级缓存' }, { id: 80, labelName: '声明式事务' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 304, categoryName: 'Golang', labelList: [{ id: 81, labelName: 'GPM模型' }, { id: 82, labelName: 'Channel底层' }, { id: 83, labelName: 'Slice扩容' }, { id: 84, labelName: 'GC并发标记' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 305, categoryName: 'Python', labelList: [{ id: 85, labelName: 'GIL全局锁' }, { id: 86, labelName: '生成器' }, { id: 87, labelName: '装饰器' }, { id: 88, labelName: '垃圾回收' }] },
  { primaryId: 3, primaryName: '后端开发', categoryId: 308, categoryName: 'Kafka', labelList: [{ id: 97, labelName: '分区机制' }, { id: 98, labelName: 'ISR高水位' }, { id: 99, labelName: '零拷贝' }, { id: 100, labelName: 'Rebalance' }] },
  { primaryId: 5, primaryName: '数据库技术', categoryId: 503, categoryName: 'Redis', labelList: [{ id: 137, labelName: '单线程架构' }, { id: 138, labelName: '持久化AOF/RDB' }, { id: 139, labelName: 'Redisson分布式锁' }, { id: 140, labelName: '缓存穿透雪崩' }] },
  { primaryId: 6, primaryName: '云原生与 DevOps', categoryId: 601, categoryName: 'Linux 与操作系统', labelList: [{ id: 145, labelName: 'VFS与Inode' }, { id: 146, labelName: '管道重定向' }, { id: 147, labelName: '进程调度' }, { id: 148, labelName: '网络调试' }] },
  { primaryId: 6, primaryName: '云原生与 DevOps', categoryId: 602, categoryName: 'Kubernetes', labelList: [{ id: 149, labelName: 'Pod生命周期' }, { id: 150, labelName: 'Service服务发现' }, { id: 151, labelName: '滚动更新' }, { id: 152, labelName: 'CRD' }] },
  { primaryId: 7, primaryName: '系统架构', categoryId: 701, categoryName: '设计模式', labelList: [{ id: 165, labelName: '单例模式' }, { id: 166, labelName: '工厂模式' }, { id: 167, labelName: '策略模式' }, { id: 168, labelName: '观察者模式' }] },
  { primaryId: 7, primaryName: '系统架构', categoryId: 702, categoryName: '系统设计', labelList: [{ id: 169, labelName: '高并发秒杀' }, { id: 170, labelName: '分布式ID' }, { id: 171, labelName: '分布式事务' }, { id: 172, labelName: '多级缓存' }] },
  { primaryId: 8, primaryName: 'AI 与机器学习', categoryId: 801, categoryName: '人工智能工程', labelList: [{ id: 173, labelName: 'Transformer' }, { id: 174, labelName: 'RAG知识库' }, { id: 175, labelName: 'Prompt工程' }, { id: 176, labelName: 'Agent智能体' }] }
]

const flatSpecialCategories = computed(() => {
  if (practiceStore.specialCategories && Array.isArray(practiceStore.specialCategories) && practiceStore.specialCategories.length > 5) {
    const list = []
    for (const pri of practiceStore.specialCategories) {
      if (pri.categoryList && Array.isArray(pri.categoryList)) {
        for (const cat of pri.categoryList) {
          list.push({
            ...cat,
            primaryId: pri.primaryCategoryId,
            primaryName: pri.primaryCategoryName
          })
        }
      }
    }
    return list
  }
  return DEFAULT_HOT_SPECIAL_CATEGORIES
})

// 根据技术名称匹配高保真真实技术图标
function getTechIcon(name = '') {
  const n = String(name || '').toLowerCase()
  if (n.includes('java') && !n.includes('javascript')) return new URL('@/assets/icons/tech/java.svg', import.meta.url).href
  if (n.includes('spring')) return new URL('@/assets/icons/tech/spring.svg', import.meta.url).href
  if (n.includes('redis')) return new URL('@/assets/icons/tech/redis.svg', import.meta.url).href
  if (n.includes('sql') || n.includes('mysql')) return new URL('@/assets/icons/tech/sql.svg', import.meta.url).href
  if (n.includes('网络') || n.includes('http') || n.includes('tcp')) return new URL('@/assets/icons/tech/network.svg', import.meta.url).href
  if (n.includes('计算机') || n.includes('cs') || n.includes('os')) return new URL('@/assets/icons/tech/cs.svg', import.meta.url).href
  if (n.includes('vue')) return new URL('@/assets/icons/tech/vue.svg', import.meta.url).href
  if (n.includes('react')) return new URL('@/assets/icons/tech/react.svg', import.meta.url).href
  if (n.includes('docker')) return new URL('@/assets/icons/tech/docker.svg', import.meta.url).href
  if (n.includes('k8s') || n.includes('kubernetes')) return new URL('@/assets/icons/tech/kubernetes.svg', import.meta.url).href
  return new URL('@/assets/icons/tech/all.svg', import.meta.url).href
}

// ==========================================================================
// 自定义组合出卷状态与逻辑 (严格遵循 9 大技术职业方向与无图标策略)
// ==========================================================================
const OFFICIAL_9_CATEGORIES = [
  {
    id: '1',
    dbId: 1,
    name: '通用技术',
    subCategories: [
      { id: 101, name: '计算机科学基础' },
      { id: 102, name: '算法与数据结构' },
      { id: 103, name: 'SQL' },
      { id: 104, name: 'Git' },
      { id: 105, name: '前端核心' },
      { id: 106, name: '后端核心' },
      { id: 107, name: '网络与 HTTP' },
      { id: 108, name: 'Docker' },
      { id: 109, name: '安全性' },
      { id: 110, name: '测试' }
    ]
  },
  {
    id: '2',
    dbId: 2,
    name: '前端开发',
    subCategories: [
      { id: 201, name: 'HTML/CSS' },
      { id: 202, name: 'JavaScript' },
      { id: 203, name: 'TypeScript' },
      { id: 204, name: 'React' },
      { id: 205, name: 'Next.js' },
      { id: 206, name: 'Vue.js' },
      { id: 207, name: 'Angular' }
    ]
  },
  {
    id: '3',
    dbId: 3,
    name: '后端开发',
    subCategories: [
      { id: 301, name: 'Node.js' },
      { id: 302, name: 'Java' },
      { id: 303, name: 'Spring Boot' },
      { id: 304, name: 'Golang' },
      { id: 305, name: 'Python' },
      { id: 306, name: 'C#' },
      { id: 307, name: 'PHP' },
      { id: 308, name: 'Kafka' },
      { id: 309, name: 'RabbitMQ' },
      { id: 310, name: 'GraphQL' },
      { id: 311, name: 'Ruby on Rails' },
      { id: 312, name: 'C++' }
    ]
  },
  {
    id: '4',
    dbId: 4,
    name: '移动端开发',
    subCategories: [
      { id: 401, name: 'React Native' },
      { id: 402, name: 'Flutter' },
      { id: 403, name: 'Android 和 Kotlin' }
    ]
  },
  {
    id: '5',
    dbId: 5,
    name: '数据库技术',
    subCategories: [
      { id: 501, name: 'PostgreSQL' },
      { id: 502, name: 'MongoDB' },
      { id: 503, name: 'Redis' },
      { id: 504, name: 'Elasticsearch' }
    ]
  },
  {
    id: '6',
    dbId: 6,
    name: '云原生与 DevOps',
    subCategories: [
      { id: 601, name: 'Linux 与操作系统' },
      { id: 602, name: 'Kubernetes' },
      { id: 603, name: 'CI/CD' },
      { id: 604, name: 'AWS 与云' },
      { id: 605, name: 'Terraform 与 IaC' }
    ]
  },
  {
    id: '7',
    dbId: 7,
    name: '系统架构',
    subCategories: [
      { id: 701, name: '设计模式' },
      { id: 702, name: '系统设计' }
    ]
  },
  {
    id: '8',
    dbId: 8,
    name: 'AI 与机器学习',
    subCategories: [
      { id: 801, name: '人工智能工程' },
      { id: 802, name: '机器学习与数据科学' }
    ]
  },
  {
    id: '9',
    dbId: 9,
    name: '职业素养',
    subCategories: [
      { id: 901, name: '面试与行为问题' },
      { id: 902, name: '敏捷开发与 Scrum' },
      { id: 903, name: '业务分析师' },
      { id: 904, name: '质量保证与测试' },
      { id: 905, name: 'IQ 与逻辑思维' }
    ]
  }
]

const customPrimaryCategories = ref(OFFICIAL_9_CATEGORIES)

// 异步从后端数据库加载全量真实分类体系
async function loadCustomFullCategories() {
  try {
    const res = await queryPrimaryCategory(1)
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      const primaries = await Promise.all(
        res.data.map(async (pri) => {
          let subs = []
          try {
            const subRes = await queryCategoryByPrimary(pri.id, 2)
            if (subRes && subRes.success && Array.isArray(subRes.data) && subRes.data.length > 0) {
              subs = subRes.data.map((s) => ({
                id: s.id,
                name: s.categoryName
              }))
            }
          } catch (_) {}

          if (!subs || subs.length === 0) {
            const fallback = OFFICIAL_9_CATEGORIES.find(
              (o) => o.name === pri.categoryName || o.dbId === pri.id
            )
            subs = fallback ? fallback.subCategories : []
          }

          return {
            id: String(pri.id),
            dbId: pri.id,
            name: pri.categoryName,
            subCategories: subs
          }
        })
      )
      if (primaries.length > 0) {
        customPrimaryCategories.value = primaries
      }
    }
  } catch (err) {
    console.warn('loadCustomFullCategories fallback to official list:', err)
  }
}

const availablePrimaryList = computed(() => {
  return customPrimaryCategories.value
})

const currentCustomPrimaryId = ref('')

watch(
  availablePrimaryList,
  (list) => {
    if (list.length > 0 && (!currentCustomPrimaryId.value || !list.some((p) => p.id === currentCustomPrimaryId.value))) {
      currentCustomPrimaryId.value = list[0].id
    }
  },
  { immediate: true }
)

const currentCustomSubList = computed(() => {
  const pri = availablePrimaryList.value.find((p) => p.id === currentCustomPrimaryId.value)
  return pri ? pri.subCategories : []
})

// 已选分类 Map: key = sub.id, value = { id, name, primaryName, labels }
const selectedCategories = ref(new Map())

function isCategorySelected(subId) {
  return selectedCategories.value.has(subId)
}

function toggleCategorySelect(sub) {
  const map = new Map(selectedCategories.value)
  if (map.has(sub.id)) {
    map.delete(sub.id)
  } else {
    const curPri = availablePrimaryList.value.find((p) => p.id === currentCustomPrimaryId.value)
    map.set(sub.id, {
      ...sub,
      categoryId: sub.id,
      categoryName: sub.name,
      primaryId: curPri ? (curPri.dbId || curPri.id) : 1,
      primaryName: curPri ? curPri.name : ''
    })
  }
  selectedCategories.value = map
}

function selectAllCurrentPrimary() {
  const map = new Map(selectedCategories.value)
  const curPri = availablePrimaryList.value.find((p) => p.id === currentCustomPrimaryId.value)
  if (!curPri) return
  curPri.subCategories.forEach((sub) => {
    map.set(sub.id, {
      ...sub,
      categoryId: sub.id,
      categoryName: sub.name,
      primaryId: curPri.dbId || curPri.id || 1,
      primaryName: curPri.name
    })
  })
  selectedCategories.value = map
}

function clearAllSelected() {
  selectedCategories.value = new Map()
}

const selectedCategoryCount = computed(() => selectedCategories.value.size)

// 题型题量与时长步进控制
const customCounts = ref({
  single: 5,
  multi: 3,
  judge: 2,
  brief: 2,
  duration: 45
})

function stepCount(field, delta) {
  const val = (customCounts.value[field] || 0) + delta
  const limits = {
    single: { min: 0, max: 30 },
    multi: { min: 0, max: 20 },
    judge: { min: 0, max: 20 },
    brief: { min: 0, max: 15 },
    duration: { min: 10, max: 180 }
  }
  const lim = limits[field] || { min: 0, max: 100 }
  customCounts.value[field] = Math.max(lim.min, Math.min(lim.max, val))
}

function resetCustomCounts() {
  customCounts.value = {
    single: 5,
    multi: 3,
    judge: 2,
    brief: 2,
    duration: 45
  }
  clearAllSelected()
}

const customTotalQuestions = computed(() => {
  return (
    (customCounts.value.single || 0) +
    (customCounts.value.multi || 0) +
    (customCounts.value.judge || 0) +
    (customCounts.value.brief || 0)
  )
})

const isBuildingExam = ref(false)

/**
 * 专项深度智能组卷引擎 (严格按照一级分类与二级分类从属匹配关系进行精准智能组卷)
 * 核心原则：严格匹配一级和二级分类从属，杜绝任何非目标技术分类题目混入
 */
async function generateSpecializedExam(selectedList, counts, examTitle) {
  // 1. 严格按照选中的一级与二级分类匹配专业考题
  const matchedList = matchCategoryQuestions(selectedList, counts)

  const typeNames = { 1: '单选题', 2: '多选题', 3: '判断题', 4: '简答题' }
  const perScore = matchedList.length > 0 ? Math.round(100 / matchedList.length) : 10

  const formattedQuestions = matchedList.map((item, idx) => {
    let options = []
    if (item.type === 3) {
      options = [
        { optionType: 1, content: '正确 (True)' },
        { optionType: 0, content: '错误 (False)' }
      ]
    } else if (Array.isArray(item.options) && item.options.length > 0) {
      options = item.options.map((opt, oIdx) => ({
        optionType: opt.optionType !== undefined ? opt.optionType : oIdx + 1,
        content: opt.optionContent || opt.content || String(opt)
      }))
    } else if (item.type === 1 || item.type === 2) {
      options = [
        { optionType: 1, content: 'A. 核心架构原理与官方规范推荐实现' },
        { optionType: 2, content: 'B. 常见异常机制与边界并发冲突处理' },
        { optionType: 3, content: 'C. 传统低性能方案及非线程安全模式' },
        { optionType: 4, content: 'D. 系统自动降级与全局兜底策略' }
      ]
    }

    return {
      id: item.id || idx + 1,
      subjectId: item.id || idx + 1,
      type: item.type,
      typeName: typeNames[item.type] || '单选题',
      title: item.title,
      options,
      score: perScore,
      detail: {
        subjectName: item.title,
        subjectAnswer: item.answer || item.parse,
        subjectParse: item.parse || item.answer,
        labelNames: [item.categoryName || '专项模拟']
      }
    }
  })

  // 2. 同步注册考场
  practiceStore.practiceId = Date.now()
  practiceStore.currentSetId = selectedList[0]?.id || selectedList[0]?.categoryId || 1

  // 3. 载入考场并启动
  practiceStore.questions = formattedQuestions
  practiceStore.currentIndex = 0
  practiceStore.userAnswers = {}
  practiceStore.flagged = {}
  practiceStore.timerSeconds = (counts.duration || 45) * 60
  practiceStore.examDuration = (counts.duration || 45) * 60
  practiceStore.examTitle = examTitle
  practiceStore.isExamActive = true
  practiceStore.startTimer()
}

// 自定义组合出卷提交入口
async function handleStartCustomExam() {
  const selectedList = Array.from(selectedCategories.value.values())
  if (selectedList.length === 0) {
    alert('请至少选择一个二级分类')
    return
  }
  if (customTotalQuestions.value <= 0) {
    alert('题目总数不能为0，请至少设置一种题型的题目数量')
    return
  }

  isBuildingExam.value = true
  try {
    const catTitles = selectedList.map((c) => c.name).slice(0, 3).join('、')
    const title = `自定义组合模考 (${catTitles}${selectedList.length > 3 ? '等' : ''})`
    await generateSpecializedExam(selectedList, customCounts.value, title)
  } catch (err) {
    console.error('handleStartCustomExam error:', err)
    alert('组卷服务异常，请重试')
  } finally {
    isBuildingExam.value = false
  }
}

// 一键全真综合自适应随机模考
async function handleStartRandomExam() {
  practiceStore.loadingExam = true
  try {
    // 综合自适应模考从各大核心方向均衡抽题
    const coreCats = [
      { id: 101, categoryId: 101, name: '计算机科学基础', categoryName: '计算机科学基础', primaryId: 1, primaryName: '通用技术' },
      { id: 102, categoryId: 102, name: '算法与数据结构', categoryName: '算法与数据结构', primaryId: 1, primaryName: '通用技术' },
      { id: 103, categoryId: 103, name: 'SQL', categoryName: 'SQL', primaryId: 1, primaryName: '通用技术' },
      { id: 107, categoryId: 107, name: '网络与 HTTP', categoryName: '网络与 HTTP', primaryId: 1, primaryName: '通用技术' },
      { id: 302, categoryId: 302, name: 'Java', categoryName: 'Java', primaryId: 3, primaryName: '后端开发' },
      { id: 503, categoryId: 503, name: 'Redis', categoryName: 'Redis', primaryId: 5, primaryName: '数据库技术' }
    ]
    await generateSpecializedExam(coreCats, {
      single: 10,
      multi: 6,
      judge: 4,
      brief: 0,
      duration: 45
    }, '全真综合自适应随机模考')
  } catch (err) {
    console.error('handleStartRandomExam error:', err)
    alert('组卷异常，请重试')
  } finally {
    practiceStore.loadingExam = false
  }
}

// 单技术方向定向专项随机组卷 (100% 精准匹配技术专项)
async function handleStartCategoryExam(cat) {
  isBuildingExam.value = true
  practiceStore.loadingExam = true
  try {
    const targetCats = [{
      id: cat.categoryId || cat.id,
      categoryId: cat.categoryId || cat.id,
      name: cat.categoryName || cat.name,
      categoryName: cat.categoryName || cat.name,
      primaryId: cat.primaryId,
      primaryName: cat.primaryName,
      labels: cat.labelList || []
    }]
    await generateSpecializedExam(targetCats, {
      single: 5,
      multi: 3,
      judge: 2,
      brief: 2,
      duration: 45
    }, `专项深度模考 · ${cat.categoryName || cat.name}`)
  } catch (err) {
    console.error('handleStartCategoryExam error:', err)
    alert('组卷服务异常，请稍后再试')
  } finally {
    isBuildingExam.value = false
    practiceStore.loadingExam = false
  }
}

// 知识点标签定向专项随机组卷 (100% 精准匹配考点)
async function handleStartLabelExam(cat, lbl) {
  isBuildingExam.value = true
  practiceStore.loadingExam = true
  try {
    const targetCats = [{
      id: cat.categoryId || cat.id,
      categoryId: cat.categoryId || cat.id,
      name: cat.categoryName || cat.name,
      categoryName: cat.categoryName || cat.name,
      primaryId: cat.primaryId,
      primaryName: cat.primaryName,
      targetLabel: lbl.labelName || lbl.name,
      targetLabelId: lbl.id || lbl.labelId
    }]
    await generateSpecializedExam(targetCats, {
      single: 5,
      multi: 3,
      judge: 2,
      brief: 2,
      duration: 45
    }, `考点定向模考 · ${lbl.labelName || lbl.name}`)
  } catch (err) {
    console.error('handleStartLabelExam error:', err)
    alert('组卷服务异常，请稍后再试')
  } finally {
    isBuildingExam.value = false
    practiceStore.loadingExam = false
  }
}

function confirmSubmit() {
  if (practiceStore.answeredCount < practiceStore.totalCount) {
    if (!confirm(`还有 ${practiceStore.totalCount - practiceStore.answeredCount} 道题未作答，确定现在交卷吗？`)) {
      return
    }
  }
  practiceStore.submitExam()
}

async function handleGiveUpPractice() {
  if (confirm('确定要放弃本次练习吗？未提交的答题记录将被清空。')) {
    await practiceStore.abandonCurrentPractice()
  }
}

// ==========================================================================
// 模考历史批量管理与手动删除逻辑
// ==========================================================================
const isBatchMode = ref(false)
const selectedHistoryIds = ref([])
const isAllSelected = computed(() => {
  const list = practiceStore.examHistory || []
  return list.length > 0 && selectedHistoryIds.value.length === list.length
})

function toggleSelectItem(id) {
  const idx = selectedHistoryIds.value.indexOf(id)
  if (idx > -1) {
    selectedHistoryIds.value.splice(idx, 1)
  } else {
    selectedHistoryIds.value.push(id)
  }
}

function toggleSelectAll() {
  const list = practiceStore.examHistory || []
  if (isAllSelected.value) {
    selectedHistoryIds.value = []
  } else {
    selectedHistoryIds.value = list.map((h) => h.id)
  }
}

function exitBatchMode() {
  isBatchMode.value = false
  selectedHistoryIds.value = []
}

// 模考历史删除确认弹窗状态
const deleteModal = ref({
  visible: false,
  type: 'single', // 'single' | 'batch' | 'all'
  title: '',
  description: '',
  targetInfo: null,
  isDanger: true,
  loading: false,
  targetIds: []
})

// 轻量级 Toast 提示
const toastMessage = ref('')
let toastTimer = null

function triggerToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

function openDeleteConfirm(hist) {
  deleteModal.value = {
    visible: true,
    type: 'single',
    title: '删除模考历史记录',
    description: '确定要删除该条模考历史记录吗？',
    targetInfo: {
      title: hist.title,
      date: hist.date,
      score: hist.score
    },
    isDanger: true,
    loading: false,
    targetIds: [hist.id || hist.practiceId]
  }
}

function openBatchDeleteConfirm() {
  if (selectedHistoryIds.value.length === 0) return
  deleteModal.value = {
    visible: true,
    type: 'batch',
    title: '批量删除模考历史记录',
    description: `确定要删除选中的 ${selectedHistoryIds.value.length} 条模考记录吗？`,
    targetInfo: null,
    isDanger: true,
    loading: false,
    targetIds: [...selectedHistoryIds.value]
  }
}

function openClearAllConfirm() {
  const count = practiceStore.examHistory?.length || 0
  deleteModal.value = {
    visible: true,
    type: 'all',
    title: '清空全部模考历史记录',
    description: `确定要清空全部 ${count} 条模考记录吗？`,
    targetInfo: null,
    isDanger: true,
    loading: false,
    targetIds: []
  }
}

function closeDeleteModal() {
  if (deleteModal.value.loading) return
  deleteModal.value.visible = false
}

async function executeDelete() {
  deleteModal.value.loading = true
  try {
    if (deleteModal.value.type === 'single') {
      const id = deleteModal.value.targetIds[0]
      await practiceStore.deleteHistoryItem(id)
      triggerToast('模考历史记录已删除')
    } else if (deleteModal.value.type === 'batch') {
      const count = deleteModal.value.targetIds.length
      await practiceStore.batchDeleteHistory(deleteModal.value.targetIds)
      selectedHistoryIds.value = []
      isBatchMode.value = false
      triggerToast(`已成功删除 ${count} 条模考记录`)
    } else if (deleteModal.value.type === 'all') {
      await practiceStore.clearAllHistory()
      selectedHistoryIds.value = []
      isBatchMode.value = false
      triggerToast('已清空所有模考历史记录')
    }
  } catch (err) {
    console.error('Delete error:', err)
    triggerToast('删除操作失败，请重试')
  } finally {
    deleteModal.value.loading = false
    deleteModal.value.visible = false
  }
}

onMounted(async () => {
  practiceStore.cleanLegacyMockData()
  await practiceStore.loadPreSets()
  await practiceStore.loadRankList()
  await practiceStore.loadSpecialConfig()
  await practiceStore.loadExamHistory()
  await loadCustomFullCategories()
})
</script>

<style scoped>
/* ==========================================================================
   全局容器与基础网格
   ========================================================================== */
.view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.icon-svg {
  width: 14px;
  height: 14px;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

/* ==========================================================================
   模式三：考场准备与组卷配置界面
   ========================================================================== */
.practice-setup-layout {
  display: flex;
  flex-direction: column;
}

.setup-header {
  margin-bottom: 24px;
}

.setup-main-title {
  font-size: 22px;
  font-weight: 600;
  color: #171717;
  letter-spacing: -0.01em;
  margin: 0 0 6px 0;
}

.setup-subtitle {
  font-size: 13.5px;
  color: #737373;
  margin: 0;
  line-height: 1.5;
}

/* 考场分类导航切换 Tab */
.practice-tabs-bar {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.practice-tab-btn {
  padding: 10px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: #737373;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.practice-tab-btn:hover {
  color: #171717;
}

.practice-tab-btn.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
}

.tab-badge {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  background: #f4f4f5;
  color: #525252;
  padding: 1px 6px;
  border-radius: 4px;
}

.section-title-bar {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.section-heading {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.section-sub {
  font-size: 12px;
  color: #737373;
}

/* 考场整体两栏布局 (左侧内容 + 右侧学员模考榜) */
.practice-sets-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.sets-main-col {
  min-width: 0;
}

.sets-side-col {
  position: sticky;
  top: 76px;
}

@media (max-width: 1024px) {
  .practice-sets-layout {
    grid-template-columns: 1fr;
  }

  .sets-side-col {
    position: static;
  }
}

/* 全真随机组卷 Hero 卡片 */
.hero-random-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-bottom: 12px;
}

@media (max-width: 860px) {
  .hero-random-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.hero-random-content {
  flex: 1;
}

.hero-card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px 0;
}

.hero-card-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: #4b5563;
  max-width: 680px;
  margin: 0 0 16px 0;
}

.hero-tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
}

.hero-tag-item strong {
  color: #111827;
  font-family: var(--font-mono, monospace);
}

.hero-tag-dot {
  color: #d1d5db;
}

.hero-random-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.hero-start-btn {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none !important;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.25);
}

.hero-start-btn:hover,
.hero-start-btn:focus,
.hero-start-btn:active {
  border: none !important;
}

.hero-action-hint {
  display: block;
  text-align: center;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

/* 自定义组合出卷独立 TAB 页面布局 (规范：彻底去除所有图标与说明文案) */
.practice-custom-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.custom-layout-main {
  min-width: 0;
}

.custom-layout-side {
  position: sticky;
  top: 84px;
}

.custom-manifest-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.manifest-card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.manifest-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 10px;
}

.manifest-label {
  color: #6b7280;
}

.manifest-val {
  font-weight: 600;
  color: #1f2937;
  font-family: var(--font-mono, monospace);
}

.manifest-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 14px 0;
}

.manifest-skills-section {
  margin-bottom: 18px;
}

.manifest-skills-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 140px;
  overflow-y: auto;
  padding-right: 4px;
}

.manifest-skill-tag {
  font-size: 12px;
  color: #1677ff;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.manifest-empty-tip {
  font-size: 12px;
  color: #9ca3af;
}

.manifest-action-box {
  margin-top: 18px;
}

.manifest-start-btn {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}

@media (max-width: 992px) {
  .practice-custom-layout {
    grid-template-columns: 1fr;
  }
  .custom-layout-side {
    position: static;
  }
}

/* 自定义组合出卷配置面板 (规范：彻底去除所有图标与说明文案) */
.custom-exam-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  margin-top: 0;
  margin-bottom: 24px;
}

.custom-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 18px;
}

.custom-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.custom-head-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.custom-selected-stat {
  font-size: 13px;
  font-weight: 600;
  color: #1677ff;
}

.custom-action-link {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 6px;
  text-decoration: none !important;
  font-weight: 500;
  line-height: 1.4;
  outline: none;
  transition: all 0.15s ease;
}

.custom-action-link:hover {
  color: #1677ff;
  border-color: #93c5fd;
  background: #eff6ff;
  text-decoration: none !important;
}

.custom-action-link:focus,
.custom-action-link:active {
  text-decoration: none !important;
  outline: none;
}

/* 一级分类横向单选栏 (纯文字，无图标) */
.custom-primary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.custom-pri-btn {
  padding: 6px 14px;
  background: #f4f4f5;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: all 0.15s ease;
}

.custom-pri-btn:hover {
  color: #171717;
  background: #e4e4e7;
}

.custom-pri-btn.active {
  background: #eff6ff;
  border-color: #1677ff;
  color: #1677ff;
  font-weight: 600;
}

/* 二级分类多选列表 (纯文字胶囊，无图标) */
.custom-sub-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #f4f4f5;
  border-radius: 8px;
  min-height: 56px;
}

.custom-sub-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;
}

.custom-sub-pill:hover {
  border-color: #cbd5e1;
}

.custom-sub-pill.selected {
  background: #eff6ff;
  border-color: #1677ff;
  color: #1677ff;
  font-weight: 600;
}

.custom-sub-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.sub-check-indicator {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #9ca3af;
}

.custom-sub-pill.selected .sub-check-indicator {
  color: #1677ff;
  font-weight: 700;
}

/* 题量与限时步进配置行 (纯文字与数字输入，无图标) */
.custom-config-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

@media (max-width: 900px) {
  .custom-config-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.config-stepper-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #171717;
}

.stepper-box {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.step-btn {
  width: 34px;
  height: 34px;
  background: #f9fafb;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;
}

.step-btn:hover {
  background: #f3f4f6;
  color: #1677ff;
}

.step-input {
  flex: 1;
  width: 100%;
  height: 34px;
  border: none;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: #171717;
  outline: none;
  -moz-appearance: textfield;
}

.step-input::-webkit-outer-spin-button,
.step-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 底部操作与统计栏 (纯文字，无图标) */
.custom-panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.custom-footer-stats {
  font-size: 13px;
  color: #525252;
}

.custom-footer-stats strong {
  color: #171717;
  font-family: 'JetBrains Mono', monospace;
}

.stat-sep {
  margin: 0 8px;
  color: #d4d4d8;
}

.custom-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-reset-btn {
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 13px;
}

.custom-submit-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  border: none !important;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.2);
}

.custom-submit-btn:hover,
.custom-submit-btn:focus,
.custom-submit-btn:active {
  border: none !important;
}

/* 技术栈定向专项组卷网格 */
.special-section-area {
  margin-bottom: 32px;
}

.tech-category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .tech-category-grid {
    grid-template-columns: 1fr;
  }
}

.tech-cat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160px;
  transition: all 0.15s ease;
}

.tech-cat-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
  transform: translateY(-2px);
}

.cat-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.cat-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-tech-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.cat-info-box {
  display: flex;
  flex-direction: column;
}

.cat-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.cat-group-name {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
}

.cat-labels-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
  min-height: 24px;
}

.cat-label-pill {
  background: #f3f4f6;
  color: #4b5563;
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cat-label-pill:hover {
  background: #e0e7ff;
  color: #1677ff;
}

.cat-card-footer {
  display: flex;
  justify-content: flex-end;
}

.cat-start-btn {
  width: 100%;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  padding: 8px 12px;
}

/* 试卷卡片 3 列网格 */
.setup-modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

@media (max-width: 960px) {
  .setup-modes {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .setup-modes {
    grid-template-columns: 1fr;
  }
}

.mode-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.mode-box:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.mode-box.highlight-box {
  background: #fafafa;
  cursor: pointer;
}

.adaptive-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  color: #1677ff;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.mode-title {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.mode-desc {
  font-size: 13px;
  color: #525252;
  line-height: 1.6;
  margin: 0;
}

.mode-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f4f4f5;
}

.mode-meta {
  font-size: 12px;
  color: #737373;
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
}

.meta-dot {
  color: #d1d5db;
}

.set-card-actions {
  display: flex;
  gap: 8px;
}

.set-card-actions .start-btn {
  flex: 1.2;
}

.set-card-actions .random-btn {
  flex: 1;
  font-size: 12px;
  padding: 6px 10px;
  white-space: nowrap;
}

/* 考场排行榜 */
.rank-board-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.rank-board-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.rank-header-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.rank-header-sub {
  font-size: 11px;
  color: #737373;
}

.rank-board-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #f4f4f5;
}

.rank-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rank-badge {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #f4f4f5;
  color: #737373;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-badge.top-1 {
  background: #fef3c7;
  color: #92400e;
}

.rank-badge.top-2 {
  background: #f1f5f9;
  color: #334155;
}

.rank-badge.top-3 {
  background: #ffedd5;
  color: #9a3412;
}

.rank-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.rank-name {
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-count {
  font-size: 12px;
  color: #737373;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

.exam-records-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
}

.stat-val {
  font-size: 22px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.stat-name {
  font-size: 12px;
  color: #737373;
}

/* ==========================================================================
   TAB 2: 模考历史记录
   ========================================================================== */
.history-list-section {
  padding-top: 4px;
}

.empty-history {
  background: #ffffff;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  padding: 40px 24px;
  text-align: center;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 13px;
  color: #737373;
  margin: 0;
}

.history-cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  transition: border-color 0.15s ease;
  gap: 20px;
}

.history-card-item:hover {
  border-color: #d1d5db;
}

.hist-info-col {
  flex: 1;
}

.hist-title {
  font-size: 14.5px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 6px;
}

.hist-meta-row {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #737373;
}

.hist-score-col {
  display: flex;
  align-items: center;
}

.hist-score-badge {
  padding: 6px 14px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
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
  font-size: 20px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.score-unit {
  font-size: 11px;
  font-weight: 500;
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

.hist-action-btn.delete-btn {
  color: #ef4444;
  border-color: #fee2e2;
  background: #ffffff;
}

.hist-action-btn.delete-btn:hover {
  color: #dc2626;
  background: #fef2f2;
  border-color: #fca5a5;
}

.history-title-bar {
  justify-content: space-between;
  align-items: center;
}

.title-with-desc {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.history-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hist-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hist-header-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.hist-header-btn.clear-btn:hover {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
}

.batch-delete-btn {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
  color: #ffffff !important;
}

.batch-delete-btn:hover:not(:disabled) {
  background: #b91c1c !important;
  border-color: #b91c1c !important;
}

.batch-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-hint {
  font-size: 12px;
  color: #6b7280;
  margin-right: 4px;
}

.batch-check-box {
  display: flex;
  align-items: center;
  padding-right: 8px;
}

.custom-check-input {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #1677ff;
}

.history-card-item.batch-active {
  cursor: pointer;
}

.history-card-item.is-selected {
  border-color: #93c5fd;
  background: #f0f7ff;
}

/* 模考删除确认弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 440px;
  animation: modalScaleIn 0.18s ease-out;
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  margin-bottom: 16px;
}

.confirm-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-icon-wrap.icon-danger {
  background: #fef2f2;
  color: #ef4444;
}

.confirm-icon-wrap.icon-warning {
  background: #fffbeb;
  color: #f59e0b;
}

.confirm-title-area {
  flex: 1;
}

.confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 4px 0;
}

.confirm-desc {
  font-size: 13px;
  color: #525252;
  margin: 0;
  line-height: 1.5;
}

.confirm-close-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  position: absolute;
  right: -4px;
  top: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-close-btn:hover {
  color: #171717;
  background: #f3f4f6;
}

.confirm-item-preview {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #171717;
  margin-bottom: 4px;
}

.preview-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-dot {
  color: #d1d5db;
}

.confirm-warning-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 20px;
  line-height: 1.4;
}

.confirm-warning-tip svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.confirm-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn {
  padding: 8px 16px;
  font-size: 13px;
}

.btn-danger-solid {
  background: #dc2626;
  color: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-danger-solid:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-danger-solid:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast 提示 */
.feedback-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #171717;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  pointer-events: none;
}

.toast-icon {
  width: 14px;
  height: 14px;
  color: #22c55e;
}

.spinner-small {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

/* ==========================================================================
   模式二：考试进行中样式
   ========================================================================== */
.exam-active-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exam-top-bar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exam-top-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exam-active-title {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.exam-status-tag {
  font-size: 11px;
  font-weight: 500;
  color: #1677ff;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.exam-top-timer-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #737373;
}

.timer-label {
  font-size: 12px;
}

.timer-num {
  font-size: 16px;
  font-weight: 600;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-variant-numeric: tabular-nums;
  color: #dc2626;
}

.exam-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}

@media (max-width: 860px) {
  .exam-container {
    grid-template-columns: 1fr;
  }
}

.exam-main-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

.exam-q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.q-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.q-seq-badge {
  font-size: 13px;
  font-weight: 600;
  color: #1677ff;
}

.score-pill {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  background: #f4f4f5;
  color: #737373;
  padding: 2px 6px;
  border-radius: 4px;
}

.flag-btn {
  background: transparent;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #737373;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.flag-btn:hover {
  border-color: #d1d5db;
  color: #171717;
}

.flag-btn.active {
  background: #fffbeb;
  border-color: #fde68a;
  color: #b45309;
}

.exam-q-stem {
  font-size: 15.5px;
  font-weight: 500;
  color: #171717;
  line-height: 1.6;
  margin-bottom: 24px;
}

.exam-options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.option-item:hover {
  background: #fafafa;
  border-color: #d1d5db;
}

.option-item.selected {
  background: #f0f7ff;
  border-color: #1677ff;
  color: #1677ff;
}

.opt-prefix {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #525252;
  font-family: 'JetBrains Mono', monospace;
}

.option-item.selected .opt-prefix {
  background: #eff6ff;
  color: #1677ff;
  border: 1px solid #bfdbfe;
}

.opt-content {
  flex: 1;
  font-size: 14px;
  color: #171717;
}

.opt-check {
  color: #1677ff;
  display: flex;
  align-items: center;
}

.exam-textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.exam-textarea:focus {
  border-color: #1677ff;
}

.exam-bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f4f4f5;
  padding-top: 20px;
  margin-top: auto;
}

.answered-status-text {
  font-size: 13px;
  color: #737373;
}

.highlight-num {
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: #1677ff;
}

.exam-sheet-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
}

.sheet-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 12px 0;
}

.sheet-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #737373;
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
  border-radius: 2px;
}

.legend-dot.done {
  background: #16a34a;
}

.legend-dot.un {
  background: #e5e7eb;
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
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  border-radius: 6px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.sheet-num:hover {
  background: #e5e7eb;
}

.sheet-num.answered {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.sheet-num.flagged {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.sheet-num.current {
  border-color: #1677ff;
  color: #1677ff;
  font-weight: 600;
}

/* ==========================================================================
   模式一：错题复盘与逐题解析模式
   ========================================================================== */
.review-mode-layout {
  display: flex;
  flex-direction: column;
}

.review-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
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
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.review-set-tag {
  background: #f4f4f5;
  color: #525252;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.review-top-right {
  display: flex;
  gap: 8px;
}

.review-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 20px;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.review-summary-chips {
  display: flex;
  gap: 16px;
  align-items: center;
}

.summary-metric {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
}

.metric-label {
  color: #737373;
  font-size: 12px;
}

.metric-val {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 600;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  color: #171717;
}

.metric-unit {
  font-size: 12px;
  color: #737373;
}

.metric-divider {
  width: 1px;
  height: 14px;
  background: #e5e7eb;
}

.text-primary {
  color: #1677ff !important;
}

.text-success {
  color: #16a34a !important;
}

.text-danger {
  color: #dc2626 !important;
}

.text-warning {
  color: #d97706 !important;
}

.review-filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-pill-btn {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #525252;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill-btn:hover {
  border-color: #d1d5db;
  color: #171717;
}

.filter-pill-btn.active {
  background: #171717;
  color: #ffffff;
  border-color: #171717;
}

.filter-pill-btn.wrong.active {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.filter-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.review-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-review {
  background: #ffffff;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
}

.review-question-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px;
  transition: border-color 0.15s ease;
}

.review-question-card.is-wrong-card {
  border-left: 3px solid #dc2626;
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

.q-mono-num {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  font-weight: 600;
  color: #525252;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-chip {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
}

.chip-correct {
  background: #f0fdf4;
  color: #16a34a;
}

.chip-wrong {
  background: #fef2f2;
  color: #dc2626;
}

.q-card-title {
  font-size: 15px;
  font-weight: 500;
  color: #171717;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.q-options-compare {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}

.review-opt-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  font-size: 13.5px;
}

.review-opt-box.opt-correct {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.review-opt-box.opt-wrong-selected {
  background: #fef2f2;
  border-color: #fecaca;
}

.review-opt-box.opt-correct-selected {
  background: #f0fdf4;
  border-color: #86efac;
}

.opt-prefix-badge {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: #f4f4f5;
  color: #525252;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opt-text {
  flex: 1;
  color: #171717;
}

.opt-indicator {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tag-correct-ans {
  font-size: 11px;
  font-weight: 500;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-user-ans {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-user-ans.user-right {
  color: #16a34a;
  background: #dcfce7;
}

.tag-user-ans.user-wrong {
  color: #dc2626;
  background: #fee2e2;
}

.review-subjective-box {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.user-sub-label {
  font-size: 12px;
  font-weight: 500;
  color: #737373;
  margin-bottom: 4px;
}

.user-sub-content {
  font-size: 13.5px;
  color: #171717;
  line-height: 1.6;
  white-space: pre-wrap;
}

.q-parse-container {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-left: 3px solid #66b2ff;
  border-radius: 0 6px 6px 0;
  padding: 14px 16px;
}

.parse-header {
  margin-bottom: 8px;
}

.parse-title {
  font-size: 12.5px;
  font-weight: 600;
  color: #1677ff;
}

.parse-body {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.7;
}

:deep(.parse-body strong) {
  color: #171717;
  font-weight: 600;
}

:deep(.parse-body .md-code) {
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  background: #f3f4f6;
  color: #1f2937;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
}

:deep(.parse-body .md-pre) {
  margin: 10px 0;
  padding: 12px 14px;
  background: #18181b;
  color: #f4f4f5;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.5;
}

:deep(.parse-body .ans-h1),
:deep(.parse-body .ans-h2),
:deep(.parse-body .ans-h3) {
  font-size: 13.5px;
  font-weight: 600;
  color: #171717;
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

:deep(.parse-body .ans-img-wrap) {
  margin: 12px 0;
  text-align: center;
}

:deep(.parse-body .ans-img) {
  max-width: 100%;
  max-height: 440px;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

:deep(.parse-body .ans-img-fallback) {
  display: inline-block;
  padding: 6px 14px;
  background: #f4f4f5;
  color: #737373;
  font-size: 12px;
  border-radius: 4px;
  border: 1px dashed #d1d5db;
}

:deep(.parse-body .ans-link) {
  color: #1677ff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

:deep(.parse-body .ans-link:hover) {
  color: #4096ff;
}

:deep(.parse-body .ans-table-wrap) {
  overflow-x: auto;
  margin: 12px 0;
}

:deep(.parse-body .ans-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

:deep(.parse-body .ans-table th),
:deep(.parse-body .ans-table td) {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  text-align: left;
}

:deep(.parse-body .ans-table th) {
  background: #f9fafb;
  font-weight: 500;
  color: #171717;
}

:deep(.parse-body .ans-quote) {
  border-left: 3px solid #1677ff;
  background: #f9fafb;
  padding: 6px 12px;
  margin: 8px 0;
  color: #525252;
  border-radius: 0 4px 4px 0;
}

/* ==========================================================================
   练习页面统一按钮风格：白底 + 深色文字 + 圆角胶囊 + 悬浮不改变文字颜色
   ========================================================================== */
.view-container .btn {
  background: #ffffff;
  color: #334155;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 24px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.view-container .btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #334155;
}

.view-container .btn:active:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #334155;
}

.view-container .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 覆盖 btn-primary 与 btn-secondary 变体，统一为相同风格 */
.view-container .btn.btn-primary,
.view-container .btn.btn-secondary {
  background: #ffffff;
  color: #334155;
  border-color: #d1d5db;
}

.view-container .btn.btn-primary:hover:not(:disabled),
.view-container .btn.btn-secondary:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #334155;
}

.view-container .btn.btn-primary:active:not(:disabled),
.view-container .btn.btn-secondary:active:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #334155;
}

/* Hero 开始全真模考按钮也统一风格 */
.view-container .hero-start-btn {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #d1d5db !important;
  box-shadow: none;
}

.view-container .hero-start-btn:hover,
.view-container .hero-start-btn:focus,
.view-container .hero-start-btn:active {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
  color: #334155 !important;
  box-shadow: none;
}

/* 危险操作按钮保留红色语义，但悬浮不改变文字颜色 */
.view-container .btn-danger-solid {
  background: #dc2626;
  color: #ffffff;
  border: 1px solid #dc2626;
  border-radius: 9999px;
}

.view-container .btn-danger-solid:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #ffffff;
}
</style>
