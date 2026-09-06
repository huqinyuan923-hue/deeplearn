import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTracks } from '@/lib/content'
import { Clock, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '全部课程',
  description: 'AI·LLM·Agent、前端开发、Python、计算机基础——四条学习线的全部章节。',
}

export default function CoursesPage() {
  const tracks = getAllTracks()
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">全部课程</h1>
        <p className="mt-2 text-sm text-slate-600">
          共 {tracks.reduce((n, t) => n + t.chapters.length, 0)} 个章节，每章都配有测验与抽认卡。
        </p>
      </header>

      <div className="space-y-10">
        {tracks.map((track) => (
          <section key={track.id}>
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${track.gradient} text-xl`}>
                {track.emoji}
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{track.title}</h2>
                <p className="text-xs text-slate-500">{track.description}</p>
              </div>
            </div>
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {track.chapters.map((c) => (
                <Link
                  key={c.itemId}
                  href={`/courses/${track.id}/${c.slug}/`}
                  className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-indigo-50/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-500">
                        {c.order}
                      </span>
                      {c.title}
                    </p>
                    <p className="mt-0.5 truncate pl-7 text-xs text-slate-500">{c.summary}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                      <Clock className="h-3.5 w-3.5" /> {c.minutes} 分钟
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
