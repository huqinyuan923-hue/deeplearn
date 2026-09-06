import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTrack } from '@/lib/content'
import { TRACKS } from '@/lib/tracks'
import { Clock, ChevronRight, ClipboardCheck, Layers } from 'lucide-react'

export function generateStaticParams() {
  return TRACKS.map((t) => ({ track: t.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }): Promise<Metadata> {
  const { track } = await params
  const t = getTrack(track)
  return { title: t ? `${t.emoji} ${t.title}` : '课程' }
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track: trackId } = await params
  const track = getTrack(trackId)
  if (!track) notFound()

  const minutes = track.chapters.reduce((m, c) => m + c.minutes, 0)
  const quizCount = track.chapters.reduce((m, c) => m + c.quiz.length, 0)
  const cardCount = track.chapters.reduce((m, c) => m + c.flashcards.length, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className={`overflow-hidden rounded-2xl bg-gradient-to-br ${track.gradient} p-8 text-white shadow-sm`}>
        <p className="text-4xl">{track.emoji}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{track.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">{track.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-white/15 px-3 py-1">{track.chapters.length} 个章节</span>
          <span className="rounded-full bg-white/15 px-3 py-1">约 {minutes} 分钟</span>
          <span className="rounded-full bg-white/15 px-3 py-1">{quizCount} 道测验</span>
          <span className="rounded-full bg-white/15 px-3 py-1">{cardCount} 张抽认卡</span>
        </div>
      </header>

      <div className="mt-8 space-y-3">
        {track.chapters.map((c) => (
          <Link
            key={c.itemId}
            href={`/courses/${track.id}/${c.slug}/`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 group-hover:text-indigo-700">
                <span className="mr-2.5 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  {c.order}
                </span>
                {c.title}
              </p>
              <p className="mt-1 pl-8.5 text-sm text-slate-500" style={{ paddingLeft: '2.125rem' }}>
                {c.summary}
              </p>
              <p className="mt-2 flex flex-wrap gap-3 pl-8.5 text-xs text-slate-400" style={{ paddingLeft: '2.125rem' }}>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.minutes} 分钟</span>
                {c.quiz.length > 0 && (
                  <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" /> {c.quiz.length} 题</span>
                )}
                {c.flashcards.length > 0 && (
                  <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {c.flashcards.length} 卡</span>
                )}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </div>
  )
}
