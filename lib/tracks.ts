export interface TrackMeta {
  id: string
  title: string
  emoji: string
  description: string
  gradient: string
}

export const TRACKS: TrackMeta[] = [
  {
    id: 'ai',
    title: 'AI · LLM · Agent',
    emoji: '🤖',
    description: '从大模型原理到提示词工程、RAG 与 Agent 实践，理解 AI 应用的底层逻辑。',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 'frontend',
    title: '前端开发',
    emoji: '⚡',
    description: 'HTML / CSS / JavaScript / React / Next.js，从零到独立部署一个网站。',
    gradient: 'from-sky-500 to-cyan-400',
  },
  {
    id: 'python',
    title: 'Python 编程',
    emoji: '🐍',
    description: '语法、数据结构、函数与标准库，写出真正能用的脚本与工具。',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'cs',
    title: '计算机基础',
    emoji: '🧠',
    description: '数据表示、算法复杂度、网络与 Git——所有编程方向的公共地基。',
    gradient: 'from-amber-500 to-orange-400',
  },
]
