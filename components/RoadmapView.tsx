'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadProgress, toggleProgress } from '@/lib/api'
import { CheckCircle2, Circle, Clock, ChevronRight, Loader2 } from 'lucide-react'

export interface RoadmapChapter {
  itemId: string
  slug: string
  order: number
  title: string
  summary: string
  minutes: number
}

export interface RoadmapTrack {
  id: string
  title: string
  emoji: string
  description: string
  gradient: string
  chapters: RoadmapChapter[]
}

export default function RoadmapView({ tracks }: { tracks: RoadmapTrack[] }) {
  const [progress, setProgress] = useState<Set<string> | null>(null)

  useEffect(() => {
    loadProgress().then(setProgress)
  }, [])

  const total = tracks.reduce((n, t) => n + t.chapters.length, 0)
  const doneCount = progress ? tracks.reduce((n, t) => n + t.chapters.filter((c) => progress.has(c.itemId)).length, 0) : 0

  const toggle = async (itemId: string) => {
    const next = await toggleProgress(itemId)
    setProgress((prev) => {
      const s = new Set(prev ?? [])
      if (next) s.add(itemId)
      else s.delete(itemId)
      return s
    })
  }

  if (!progress) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在加载你的学习进度…
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm text-slate-600">
          总进度：已完成 <span className="text-lg font-bold text-indigo-600">{doneCount}</span>
          <span className="text-slate-400"> / {total}</span> 个章节
        </p>
        <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 sm:w-64">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
            style={{ width: `${total ? Math.round((doneCount / total) * 100) : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-10">
        {tracks.map((track) => {
          const done = track.chapters.filter((c) => progress.has(c.itemId)).length
          return (
            <section key={track.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${track.gradient} text-xl shadow-sm`}>
                    {track.emoji}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{track.title}</h2>
                    <p className="text-xs text-slate-500">{track.description}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {done} / {track.chapters.length} 完成
                </span>
              </div>

              <ol className="relative mt-6 space-y-1 pl-1">
                {track.chapters.map((c, idx) => {
                  const isDone = progress.has(c.itemId)
                  const isLast = idx === track.chapters.length - 1
                  return (
                    <li key={c.itemId} className="relative flex gap-3 pb-1">
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => toggle(c.itemId)}
                          aria-label={isDone ? '取消打卡' : '标记完成'}
                          className={`z-10 mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            isDone
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white text-slate-300 hover:border-indigo-400 hover:text-indigo-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                        </button>
                        {!isLast && <span className="absolute top-11 h-full w-0.5 rounded bg-slate-200" />}
                      </div>
                      <Link
                        href={`/courses/${track.id}/${c.slug}/`}
                        className="group mb-2 flex flex-1 items-center justify-between gap-3 rounded-xl border border-transparent px-3.5 py-3 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                      >
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {c.order}. {c.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{c.summary}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                            <Clock className="h-3.5 w-3.5" /> {c.minutes} 分钟
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </div>
  )
}
