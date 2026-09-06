'use client'

import { useEffect, useState } from 'react'
import { fetchStats, type SiteStats } from '@/lib/api'
import { Users, Flag, ClipboardCheck, MessagesSquare } from 'lucide-react'

export default function StatsBar({ chapterCount, trackCount }: { chapterCount: number; trackCount: number }) {
  const [stats, setStats] = useState<SiteStats | null>(null)

  useEffect(() => {
    fetchStats().then(setStats)
  }, [])

  const items = [
    { icon: Users, label: '一起学习的同学', value: stats ? `${stats.learners}` : '—' },
    { icon: Flag, label: '学习打卡次数', value: stats ? `${stats.completions}` : '—' },
    { icon: ClipboardCheck, label: '测验提交次数', value: stats ? `${stats.quizzes}` : '—' },
    { icon: MessagesSquare, label: '留言交流', value: stats ? `${stats.messages}` : '—' },
  ]

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatChip icon="📚" label="章节" value={String(chapterCount)} />
      <StatChip icon="🧭" label="学习线" value={String(trackCount)} />
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
        >
          <it.icon className="h-5 w-5 shrink-0 text-indigo-500" />
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none text-slate-900">{it.value}</p>
            <p className="mt-1 truncate text-[11px] text-slate-500">{it.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <span className="text-xl leading-none">{icon}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-900">{value}</p>
        <p className="mt-1 truncate text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  )
}
