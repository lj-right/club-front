/**
 * 格式化题目答案为富文本 HTML
 * 1. 优先提取多行围栏代码块（```lang ... ```），避免代码块内部文本与行内反引号发生错位匹配
 * 2. 严格按单行匹配行内代码 `code`，不跨行错配
 * 3. 支持标题、加粗、无序/有序列表、段落与换行排版
 * 4. 还原深色代码块，并支持等宽字体横向滚动
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

  // Headings: ###, ##, #
  html = html.replace(/^### (.*$)/gim, '<div class="ans-h3">$1</div>')
  html = html.replace(/^## (.*$)/gim, '<div class="ans-h2">$1</div>')
  html = html.replace(/^# (.*$)/gim, '<div class="ans-h1">$1</div>')

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Inline code: `code`（仅匹配单行内部反引号，不跨行）
  html = html.replace(/`([^`\r\n]+)`/g, '<code class="md-code">$1</code>')

  // Bullets: - text
  html = html.replace(/^\s*-\s+(.*$)/gim, '<div class="ans-li"><span class="li-dot">•</span> <span>$1</span></div>')

  // Numbered lists: 1. text
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<div class="ans-ol"><span class="ol-num">$1.</span> <span>$2</span></div>')

  // Paragraph linebreaks
  html = html.replace(/\n\n+/g, '<div class="ans-gap"></div>')
  html = html.replace(/\n/g, '<br>')

  // Clean up duplicate br tags after block divs
  html = html.replace(/<\/div><br>/g, '</div>')

  // 2. 还原多行代码块
  html = html.replace(/___CODE_BLOCK_(\d+)___/g, (_, idx) => {
    return `<pre class="md-pre"><code>${codeBlocks[idx]}</code></pre>`
  })

  return html
}
