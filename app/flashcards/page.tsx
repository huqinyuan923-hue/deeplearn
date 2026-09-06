import type { Metadata } from 'next'
import { getAllTracks } from '@/lib/content'
import FlashcardsView, { type FlashcardDeck } from '@/components/FlashcardsView'

export const metadata: Metadata = {
  title: '抽认卡',
  description: '术语记忆卡片：翻卡自测，「还不熟」的卡片单独再练，复习记录同步数据库。',
}

export default function FlashcardsPage() {
  const decks: FlashcardDeck[] = getAllTracks().flatMap((t) => {
    const cards = t.chapters.flatMap((c) =>
      c.flashcards.map((f, i) => ({
        id: `${c.itemId}#${i}`,
        front: f.front,
        back: f.back,
        chapterTitle: `${t.title} · ${c.title}`,
      }))
    )
    return cards.length ? [{ trackId: t.id, title: t.title, emoji: t.emoji, gradient: t.gradient, cards }] : []
  })
  const total = decks.reduce((n, d) => n + d.cards.length, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">抽认卡 Flashcards</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
          借鉴 DeepTutor 的 Flashcards 模式：先自己回忆，再翻卡对照。「还不熟」的卡片会在本轮结束后集中回炉，
          每次复习记录都会同步到数据库。
        </p>
        <p className="mt-2 text-xs text-slate-400">共 {total} 张卡片 · {decks.length} 个牌组</p>
      </header>
      <FlashcardsView decks={decks} />
    </div>
  )
}
