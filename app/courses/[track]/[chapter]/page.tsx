import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getChapter, getAllTracks } from '@/lib/content'
import Markdown from '@/components/Markdown'
import Quiz from '@/components/Quiz'
import MarkComplete from '@/components/MarkComplete'
import ReadingProgress from '@/components/ReadingProgress'
import { Clock, ChevronLeft, ChevronRight, Layers } from 'lucide-react'

export function generateStaticParams() {
  return getAllTracks().flatMap((t) => t.chapters.map((c) => ({ track: t.id, chapter: c.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; chapter: string }>
}): Promise<Metadata> {
  const { track, chapter } = await params
  const found = getChapter(track, chapter)
  if (!found) return { title: '章节' }
  return { title: `${found.chapter.title}`, description: found.chapter.summary }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ track: string; chapter: string }>
}) {
  const { track: trackId, chapter: chapterSlug } = await params
  const found = getChapter(trackId, chapterSlug)
  if (!found) notFound()
  const { track, chapter, prev, next } = found

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <ReadingProgress />

      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/courses/" className="hover:text-indigo-600">课程</Link>
        <span>/</span>
        <Link href={`/courses/${track.id}/`} className="hover:text-indigo-600">
          {track.emoji} {track.title}
        </Link>
        <span>/</span>
        <span className="text-slate-600">{chapter.title}</span>
      </nav>

      <header className="mt-5">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">
          {chapter.order}. {chapter.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{chapter.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" /> 约 {chapter.minutes} 分钟
          </span>
          {chapter.quiz.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-600">{chapter.quiz.length} 道测验</span>
          )}
          {chapter.flashcards.length > 0 && (
            <Link
              href="/flashcards/"
              className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2.5 py-1 text-fuchsia-600 hover:bg-fuchsia-100"
            >
              <Layers className="h-3.5 w-3.5" /> {chapter.flashcards.length} 张抽认卡
            </Link>
          )}
        </div>
      </header>

      <article className="mt-8">
        <Markdown>{chapter.content}</Markdown>
      </article>

      <Quiz chapterId={chapter.itemId} questions={chapter.quiz} />

      <MarkComplete itemId={chapter.itemId} />

      <nav className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/courses/${track.id}/${prev.slug}/`}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200"
          >
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <ChevronLeft className="h-3.5 w-3.5" /> 上一章
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/courses/${track.id}/${next.slug}/`}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm transition hover:border-indigo-200"
          >
            <p className="text-xs text-slate-400">
              下一章 <ChevronRight className="inline h-3.5 w-3.5" />
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">{next.title}</p>
          </Link>
        ) : (
          <Link
            href={`/courses/${track.id}/`}
            className="group rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-right transition hover:bg-emerald-100"
          >
            <p className="text-xs text-emerald-600">🎉 已是本线最后一章</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">回到 {track.title} 课程页</p>
          </Link>
        )}
      </nav>
    </div>
  )
}
