<template>
  <span class="tech-icon-wrapper" :class="{ 'has-icon': !!iconUrl }">
    <img
      v-if="iconUrl"
      :src="iconUrl"
      :alt="name || subId"
      class="tech-icon-img"
      loading="lazy"
    />
    <span v-else class="tech-icon-fallback">⚡</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  subId: {
    type: [String, Number],
    default: ''
  }
})

// Eager load all SVGs from tech directory
const svgModules = import.meta.glob('@/assets/icons/tech/*.svg', {
  eager: true,
  import: 'default'
})

// Exact mapping table for IDs and names
const aliasMap = {
  // 1. 通用技术
  '计算机科学基础': 'cs',
  'cs': 'cs',
  '算法与数据结构': 'algorithm',
  'algorithm': 'algorithm',
  'sql': 'sql',
  'git': 'git',
  '前端核心': 'javascript',
  '后端核心': 'microservice',
  '网络与 http': 'network',
  '网络': 'network',
  'http': 'network',
  'docker': 'docker',
  '安全性': 'security',
  '测试': 'selenium',

  // 2. 前端开发
  'html/css': 'html',
  'html': 'html',
  'css': 'html',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'react': 'react',
  'next.js': 'nextjs',
  'nextjs': 'nextjs',
  'vue.js': 'vue',
  'vue': 'vue',
  'angular': 'angular',

  // 3. 后端开发
  'node.js': 'nodejs',
  'nodejs': 'nodejs',
  'java': 'java',
  'spring boot': 'spring',
  'spring': 'spring',
  'golang': 'go',
  'go': 'go',
  'python': 'python',
  'c#': 'csharp',
  'csharp': 'csharp',
  'php': 'php',
  'kafka': 'kafka',
  'rabbitmq': 'rabbitmq',
  'graphql': 'graphql',
  'ruby on rails': 'ruby',
  'ruby': 'ruby',
  'c++': 'cpp',
  'cpp': 'cpp',

  // 4. 移动端开发
  'react native': 'react',
  'flutter': 'flutter',
  'android 和 kotlin': 'android',
  'android': 'android',
  'kotlin': 'android',

  // 5. 数据库技术
  'postgresql': 'postgresql',
  'mongodb': 'mongodb',
  'redis': 'redis',
  'elasticsearch': 'elasticsearch',
  'es': 'elasticsearch',

  // 6. 云原生与 DevOps
  'linux 与操作系统': 'linux',
  'linux': 'linux',
  'kubernetes': 'kubernetes',
  'k8s': 'kubernetes',
  'ci/cd': 'cicd',
  'cicd': 'cicd',
  'aws 与云': 'aws',
  'aws': 'aws',
  'terraform 与 iac': 'terraform',
  'terraform': 'terraform',

  // 7. 系统架构
  '设计模式': 'architecture',
  '系统设计': 'microservice',
  'architecture': 'architecture',

  // 8. AI 与机器学习
  '人工智能工程': 'ai',
  'ai': 'ai',
  'llm': 'ai',
  '大语言模型': 'ai',
  '机器学习与数据科学': 'pytorch',
  'pytorch': 'pytorch',
  'tensorflow': 'tensorflow',

  // 9. 职业素养
  '面试与行为问题': 'interview',
  '敏捷开发与 scrum': 'scrum',
  'scrum': 'scrum',
  '业务分析师': 'analysis',
  '质量保证与测试': 'selenium',
  'iq 与逻辑思维': 'brain',
  'iq': 'brain',

  // 兼容旧映射
  'java基础': 'java',
  'jvm原理': 'jvm',
  'jvm': 'jvm',
  'spring生态': 'spring',
  'mysql数据库': 'mysql',
  'mysql': 'mysql',
  'redis缓存': 'redis',
  'juc': 'juc',
  '多线程与并发': 'juc',
  'vue.js 生态': 'vue',
  'react.js 生态': 'react',
  'javascript / ts': 'typescript',
  '前端工程化与构建': 'vite',
  '微服务架构': 'microservice',

  // General All
  'all': 'all',
  '全部': 'all',
  '全部通用': 'all',
  '全部前端': 'all',
  '全部后端': 'all',
  '全部移动端': 'all',
  '全部数据库': 'all',
  '全部云原生': 'all',
  '全部系统架构': 'all',
  '全部ai': 'all',
  '全部职业素养': 'all'
}

function resolveTechKey(subId, name) {
  const s = String(subId ?? '').toLowerCase().trim()
  const n = String(name ?? '').toLowerCase().trim()

  // 1. Direct hit in aliasMap
  if (aliasMap[s]) return aliasMap[s]
  if (aliasMap[n]) return aliasMap[n]

  // 2. SubId fuzzy matches
  if (s) {
    if (s.startsWith('java') || s === 'java-core') return 'java'
    if (s.includes('jvm')) return 'jvm'
    if (s.includes('spring')) return 'spring'
    if (s.includes('mysql')) return 'mysql'
    if (s.includes('redis')) return 'redis'
    if (s.includes('juc') || s.includes('thread') || s.includes('concurrent')) return 'juc'
    if (s.includes('kafka')) return 'kafka'
    if (s.includes('rocket')) return 'rocketmq'
    if (s.includes('micro') || s.includes('cloud')) return 'microservice'
    if (s === 'all') return 'all'
    if (s.includes('vue')) return 'vue'
    if (s.includes('react')) return 'react'
    if (s.includes('ts') || s.includes('type')) return 'typescript'
    if (s.includes('js') || s.includes('script')) return 'javascript'
    if (s.includes('android')) return 'android'
    if (s.includes('flutter')) return 'flutter'
    if (s.includes('swift') || s.includes('ios')) return 'swift'
    if (s.includes('spark')) return 'spark'
    if (s.includes('hadoop')) return 'hadoop'
    if (s.includes('flink')) return 'spark'
    if (s.includes('docker')) return 'docker'
    if (s.includes('k8s') || s.includes('kube')) return 'kubernetes'
    if (s.includes('linux')) return 'linux'
    if (s.includes('ai') || s.includes('llm')) return 'ai'
    if (s.includes('python')) return 'python'
    if (s.includes('pytorch')) return 'pytorch'
    if (s.includes('test') || s.includes('auto')) return 'selenium'
    if (s.includes('perf')) return 'postman'
  }

  // 3. Name fuzzy matches
  if (n) {
    if (n.startsWith('全部') || n.includes('全部')) return 'all'
    if (n.includes('java') || n.includes('javase')) return 'java'
    if (n.includes('jvm')) return 'jvm'
    if (n.includes('spring') || n.includes('boot') || n.includes('cloud')) return 'spring'
    if (n.includes('mysql') || n.includes('sql')) return 'mysql'
    if (n.includes('redis') || n.includes('缓存')) return 'redis'
    if (n.includes('并发') || n.includes('多线程') || n.includes('juc')) return 'juc'
    if (n.includes('kafka')) return 'kafka'
    if (n.includes('rocketmq') || n.includes('mq')) return 'rocketmq'
    if (n.includes('微服务') || n.includes('分布式')) return 'microservice'
    if (n.includes('vue')) return 'vue'
    if (n.includes('react')) return 'react'
    if (n.includes('typescript') || n.includes('ts')) return 'typescript'
    if (n.includes('javascript') || n.includes('js')) return 'javascript'
    if (n.includes('工程化') || n.includes('vite') || n.includes('webpack')) return 'vite'
    if (n.includes('android')) return 'android'
    if (n.includes('flutter')) return 'flutter'
    if (n.includes('ios') || n.includes('swift')) return 'swift'
    if (n.includes('算法') || n.includes('树') || n.includes('dp') || n.includes('动态规划')) return 'algorithm'
    if (n.includes('高并发') || n.includes('架构')) return 'architecture'
    if (n.includes('spark')) return 'spark'
    if (n.includes('hadoop')) return 'hadoop'
    if (n.includes('flink')) return 'spark'
    if (n.includes('docker') || n.includes('容器')) return 'docker'
    if (n.includes('k8s') || n.includes('kubernetes')) return 'kubernetes'
    if (n.includes('linux')) return 'linux'
    if (n.includes('大模型') || n.includes('llm') || n.includes('ai') || n.includes('transformer')) return 'ai'
    if (n.includes('python')) return 'python'
    if (n.includes('pytorch')) return 'pytorch'
    if (n.includes('测试') || n.includes('selenium')) return 'selenium'
    if (n.includes('网关') || n.includes('mesh')) return 'kubernetes'
  }

  return 'all'
}

const iconUrl = computed(() => {
  const key = resolveTechKey(props.subId, props.name)
  const path = `/src/assets/icons/tech/${key}.svg`
  return svgModules[path] || svgModules['/src/assets/icons/tech/all.svg'] || ''
})
</script>

<style scoped>
.tech-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tech-icon-img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}

.tech-icon-fallback {
  font-size: 14px;
  line-height: 1;
}
</style>
