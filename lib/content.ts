import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { TRACKS, type TrackMeta } from './tracks'

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation?: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface Chapter {
  trackId: string
  slug: string
  order: number
  title: string
  summary: string
  minutes: number
  content: string
  quiz: QuizQuestion[]
  flashcards: Flashcard[]
  itemId: string
}

export interface Track extends TrackMeta {
  chapters: Chapter[]
}

const CONTENT_ROOT = path.join(process.cwd(), 'content')

/** 内容文件路径安全构建：resolve 后强制校验根目录边界，越界返回 null */
function safeContentPath(...segments: string[]): string | null {
  const root = path.resolve(CONTENT_ROOT)
  const target = path.resolve(root, ...segments)
  if (target !== root && !target.startsWith(root + path.sep)) return null
  return target
}

export function getTrack(trackId: string): Track | null {
  // trackId 可能来自 URL 参数：先过 TRACKS 白名单，路径只允许用白名单 id
  const meta = TRACKS.find((t) => t.id === trackId)
  if (!meta) return null
  const dir = safeContentPath(meta.id)
  if (!dir) return null
  if (!fs.existsSync(dir)) return { ...meta, chapters: [] }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.includes(path.sep))
    .sort()

  const chapters = files
    .map((file, idx) => {
      const fileAbs = safeContentPath(meta.id, file)
      if (!fileAbs) return null
      const raw = fs.readFileSync(fileAbs, 'utf8')
      const { data, content } = matter(raw)
      const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '')
      return {
        trackId,
        slug,
        order: typeof data.order === 'number' ? data.order : idx + 1,
        title: (data.title as string) ?? slug,
        summary: (data.summary as string) ?? '',
        minutes: (data.minutes as number) ?? 8,
        content,
        quiz: (data.quiz ?? []) as QuizQuestion[],
        flashcards: (data.flashcards ?? []) as Flashcard[],
        itemId: `${trackId}/${slug}`,
      }
    })
    .filter((c): c is Chapter => c !== null)
    .sort((a, b) => a.order - b.order)

  return { ...meta, chapters }
}

export function getAllTracks(): Track[] {
  return TRACKS.map((t) => getTrack(t.id)).filter((t): t is Track => t !== null)
}

export function getChapter(trackId: string, slug: string): { track: Track; chapter: Chapter; prev?: Chapter; next?: Chapter } | null {
  const track = getTrack(trackId)
  if (!track) return null
  const idx = track.chapters.findIndex((c) => c.slug === slug)
  if (idx === -1) return null
  return {
    track,
    chapter: track.chapters[idx],
    prev: idx > 0 ? track.chapters[idx - 1] : undefined,
    next: idx < track.chapters.length - 1 ? track.chapters[idx + 1] : undefined,
  }
}
