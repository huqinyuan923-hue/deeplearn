'use client'

import { useEffect, useState } from 'react'
import { loadProgress, toggleProgress } from '@/lib/api'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

export default function MarkComplete({ itemId }: { itemId: string }) {
  const [done, setDone] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    loadProgress().then((set) => {
      if (alive) setDone(set.has(itemId))
    })
    return () => {
      alive = false
    }
  }, [itemId])

  const onClick = async () => {
    setBusy(true)
    const next = await toggleProgress(itemId)
    setDone(next)
    setBusy(false)
  }

  if (done === null) {
    return (
      <div className="mt-8 flex h-12 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 进度加载中…
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
        done
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      {done ? '已完成 · 点击取消打卡' : '学完了？标记完成并打卡'}
    </button>
  )
}
