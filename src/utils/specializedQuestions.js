/**
 * 烤面筋 · 全真实数据库智能组卷适配器
 * 遵从 AGENTS.md 核心规范：严格禁止任何 Mock 数据与伪造题目生成器
 * 所有考题抽取统一通过 databaseExamAssembler 直接对接后端数据库接口
 */
export { assembleRealExamQuestions, assembleRealExamQuestions as matchCategoryQuestions } from './databaseExamAssembler'
