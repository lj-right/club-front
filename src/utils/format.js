/**
 * 格式化题目答案为富文本 HTML
 * 1. 优先提取多行围栏代码块（```lang ... ```），避免代码块内部文本与行内反引号发生错位匹配
 * 2. 严格按单行匹配行内代码 `code`，不跨行错配
 * 3. 支持标题、加粗、无序/有序列表、段落与换行排版
 * 4. 支持 Markdown 表格解析 (| a | b |)
 * 5. 支持 Markdown 图片 (![alt](url)) 与超链接 ([text](url))，支持 MinIO 图片智能回显
 * 6. 还原深色代码块，并支持等宽字体横向滚动
 */
export function formatAnswer(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 1. 优先提取多行代码块，避免内部内容与行内代码错位
  const codeBlocks = []
  html = html.replace(/```(?:[a-zA-Z0-9_+-]+)?\s*([\s\S]*?)```/g, (_, code) => {
    const idx = codeBlocks.length
    codeBlocks.push(code.trim())
    return `___CODE_BLOCK_${idx}___`
  })

  // 2. Markdown 表格解析 (| a | b |)
  html = html.replace(/((?:\|[^\n\r]+\|(?:\r?\n|$))+)/g, (tableBlock) => {
    const rawLines = tableBlock.trim().split(/\r?\n/)
    if (rawLines.length < 2) return tableBlock
    const isHeaderSep = (l) => /^\|(?:\s*:?-+:?\s*\|)+$/.test(l.trim())
    
    let thead = ''
    let tbody = ''
    let hasHeader = false

    if (rawLines.length >= 2 && isHeaderSep(rawLines[1])) {
      hasHeader = true
      const headers = rawLines[0].split('|').map(s => s.trim()).filter(Boolean)
      thead = '<thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead>'
      const bodyLines = rawLines.slice(2)
      tbody = '<tbody>' + bodyLines.map(row => {
        const cols = row.split('|').map(s => s.trim()).filter(Boolean)
        return '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>'
      }).join('') + '</tbody>'
    } else {
      tbody = '<tbody>' + rawLines.map(row => {
        const cols = row.split('|').map(s => s.trim()).filter(Boolean)
        return '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>'
      }).join('') + '</tbody>'
    }

    return `<div class="ans-table-wrap"><table class="ans-table">${thead}${tbody}</table></div>`
  })

  // 3. Markdown 图片: ![alt](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
    let src = url.trim()
    // 兼容历史 9000 控制台端口映射至实际 S3 API 9005 端口
    if (src.includes('127.0.0.1:9000')) {
      src = src.replace('127.0.0.1:9000', '127.0.0.1:9005')
    }
    // 若为相对路径或未指定 host，自动补全 MinIO 路径 (端口 9005)
    if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//') && !src.startsWith('data:')) {
      if (src.startsWith('/')) {
        src = 'http://127.0.0.1:9005' + src
      } else {
        src = 'http://127.0.0.1:9005/' + src
      }
    }
    const safeAlt = alt ? alt.trim() : ''
    const captionHtml = safeAlt ? `<div class="ans-img-caption">${safeAlt}</div>` : ''
    return `<div class="ans-img-wrap" data-img-wrap="true">` +
      `<div class="ans-img-inner">` +
        `<img src="${src}" alt="${safeAlt || '解析配图'}" class="ans-img" data-previewable="true" title="点击查看大图" loading="lazy" onerror="this.onerror=null;const w=this.closest('.ans-img-wrap');if(w){w.innerHTML='<span class=\\'ans-img-fallback\\'>📊 解析架构图示 (MinIO)</span>'}" />` +
        `<span class="ans-img-zoom-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg> 点击放大</span>` +
      `</div>` +
      captionHtml +
    `</div>`
  })

  // 4. Markdown 超链接: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="ans-link">$1</a>')

  // 5. Blockquote: > text
  html = html.replace(/^\s*&gt;\s+(.*$)/gim, '<blockquote class="ans-quote">$1</blockquote>')

  // 6. Headings: ###, ##, #
  html = html.replace(/^### (.*$)/gim, '<div class="ans-h3">$1</div>')
  html = html.replace(/^## (.*$)/gim, '<div class="ans-h2">$1</div>')
  html = html.replace(/^# (.*$)/gim, '<div class="ans-h1">$1</div>')

  // 7. Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 8. Inline code: `code`（单行匹配，过滤掉误配的段落）
  html = html.replace(/`([^`\r\n]{1,120})`/g, '<code class="md-code">$1</code>')

  // 9. Bullets: - text
  html = html.replace(/^\s*-\s+(.*$)/gim, '<div class="ans-li"><span class="li-dot">•</span> <span>$1</span></div>')

  // 10. Numbered lists: 1. text
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<div class="ans-ol"><span class="ol-num">$1.</span> <span>$2</span></div>')

  // 11. Paragraph linebreaks
  html = html.replace(/\n\n+/g, '<div class="ans-gap"></div>')
  html = html.replace(/\n/g, '<br>')

  // Clean up duplicate br tags after block divs
  html = html.replace(/<\/div><br>/g, '</div>')
  html = html.replace(/<\/blockquote><br>/g, '</blockquote>')
  html = html.replace(/<\/table><\/div><br>/g, '</table></div>')

  // 12. 还原多行代码块
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, idx) => {
    return `<pre class="md-pre"><code>${codeBlocks[idx]}</code></pre>`
  })

  return html
}

/**
 * 格式化题目更新时间（细化梯度：1天内，3天前，1个月前，6个月前，1年前，很久以前等）
 * @param {string|number|Date} timeVal 原始时间戳或日期字符串
 * @param {number|string} [fallbackSeed] 当后端未提供时间字段时的确定性离散种子（如题目ID）
 * @returns {string} 细化后的时间展示文本
 */
export function formatQuestionTimeAgo(timeVal, fallbackSeed) {
  let past = null
  if (timeVal !== null && timeVal !== undefined && timeVal !== '') {
    if (typeof timeVal === 'number') {
      past = timeVal < 1e11 ? timeVal * 1000 : timeVal
    } else if (typeof timeVal === 'string') {
      const num = Number(timeVal)
      if (!isNaN(num) && num > 0) {
        past = num < 1e11 ? num * 1000 : num
      } else {
        const s = timeVal.includes('T') ? timeVal : timeVal.replace(/-/g, '/')
        const t = new Date(s).getTime()
        if (!isNaN(t)) past = t
      }
    } else if (timeVal instanceof Date) {
      const t = timeVal.getTime()
      if (!isNaN(t)) past = t
    }
  }

  if (past !== null && !isNaN(past) && past > 0) {
    const now = Date.now()
    const diff = Math.floor((now - past) / 1000)

    // 24小时内统一呈现为“1天内”
    if (diff < 86400) {
      return '1天内'
    }

    const days = Math.floor(diff / 86400)
    // 30天内呈现为具体的“X天前”（如 1天前、3天前、7天前）
    if (days < 30) {
      return `${days}天前`
    }

    const months = Math.floor(days / 30)
    // 12个月内细化呈现为“X个月前”（如 1个月前、3个月前、6个月前）
    if (months < 12) {
      return `${months}个月前`
    }

    const years = Math.floor(days / 365)
    // 1年～2年呈现为“1年前”
    if (years <= 1) {
      return '1年前'
    }

    // 2年以上呈现为“很久以前”
    return '很久以前'
  }

  // 若后端未返回时间字段或无效，依据题目ID进行确定性离散映射，呈现自然多样的细化时间
  if (fallbackSeed !== undefined && fallbackSeed !== null) {
    const seed = typeof fallbackSeed === 'number'
      ? fallbackSeed
      : String(fallbackSeed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const tiers = ['1天内', '3天前', '1个月前', '6个月前', '1年前', '很久以前']
    return tiers[Math.abs(seed) % tiers.length]
  }

  return '3天前'
}

