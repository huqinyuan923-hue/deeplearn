'use client'

import { useMemo, useState } from 'react'
import { postCardReview } from '@/lib/api'
import { RotateCw, ThumbsUp, ThumbsDown, RefreshCcw } from 'lucide-react'

export interface FlashcardItem {
  id: string
  front: string
  back: string
  chapterTitle: string
}

export interface FlashcardDeck {
  trackId: string
  title: string
  emoji: string
  gradient: string
  cards: FlashcardItem[]
}

export default function FlashcardsView({ decks }: { decks: FlashcardDeck[] }) {
  const [deckIdx, setDeckIdx] = useState(0)
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set())
  const [unknownIds, setUnknownIds] = useState<Set<string>>(new Set())
  const [onlyUnknown, setOnlyUnknown] = useState(false)

  const deck = decks[deckIdx]
  const queue = useMemo(() => {
    if (!deck) return []
    return onlyUnknown ? deck.cards.filter((c) => unknownIds.has(c.id)) : deck.cards
  }, [deck, onlyUnknown, unknownIds])

  if (!deck || deck.cards.length === 0) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">该学习线暂无抽认卡。</p>
  }

  const finished = queue.length > 0 && pos >= queue.length
  const card = queue[Math.min(pos, queue.length - 1)]

  const answer = (known: boolean) => {
    if (!card) return
    postCardReview(card.id, known)
    setKnownIds((s) => {
      const n = new Set(s)
      if (known) n.add(card.id)
      return n
    })
    setUnknownIds((s) => {
      const n = new Set(s)
      if (!known) n.add(card.id)
      else n.delete(card.id)
      return n
    })
    setFlipped(false)
    setPos((p) => p + 1)
  }

  const restart = (filterUnknown = false) => {
    setOnlyUnknown(filterUnknown)
    setPos(0)
    setFlipped(false)
  }

  const switchDeck = (i: number) => {
    setDeckIdx(i)
    restart(false)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {decks.map((d, i) => (
          <button
            key={d.trackId}
            type="button"
            onClick={() => switchDeck(i)}
            className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
              i === deckIdx
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {d.emoji} {d.title}
            <span className="ml-1.5 text-xs text-slate-400">{d.cards.length}</span>
          </button>
        ))}
      </div>

      {finished ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">{unknownIds.size === 0 ? '🎉' : '💪'}</p>
          <h3 className="mt-3 text-lg font-bold text-slate-900">本轮复习完成！</h3>
          <p className="mt-1 text-sm text-slate-500">
            认识 <span className="font-bold text-emerald-600">{knownIds.size}</span> 张 · 不认识{' '}
            <span className="font-bold text-rose-500">{unknownIds.size}</span> 张（复习记录已同步数据库）
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {unknownIds.size > 0 && (
              <button
                type="button"
                onClick={() => restart(true)}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                <RefreshCcw className="h-4 w-4" /> 只复习不认识的（{unknownIds.size} 张）
              </button>
            )}
            <button
              type="button"
              onClick={() => restart(false)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              全部重来
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-center text-xs text-slate-400">
            {pos + 1} / {queue.length} · 点击卡片查看答案 · 出处：{card.chapterTitle}
          </p>
          <div className="flip-scene mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className={`flip-card relative block h-64 w-full text-left ${flipped ? 'flipped' : ''}`}
            >
              <div className="flip-face absolute inset-0 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-500">问题 · 术语</span>
                <span className="m-auto text-center text-xl font-bold leading-relaxed text-slate-900">{card.front}</span>
                <span className="mx-auto flex items-center gap-1 text-xs text-slate-400">
                  <RotateCw className="h-3.5 w-3.5" /> 点击翻转
                </span>
              </div>
              <div className="flip-face flip-face-back absolute inset-0 flex flex-col rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-500">答案 · 解释</span>
                <span className="m-auto overflow-auto text-center text-base leading-relaxed text-slate-800">{card.back}</span>
              </div>
            </button>
          </div>

          <div className="mx-auto mt-5 flex max-w-2xl items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => answer(false)}
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <ThumbsDown className="h-4 w-4" /> 还不熟
            </button>
            <button
              type="button"
              onClick={() => answer(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <ThumbsUp className="h-4 w-4" /> 已掌握
            </button>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            本轮已掌握 {knownIds.size} 张 · 全库不熟 {unknownIds.size} 张
          </p>
        </>
      )}
    </div>
  )
}
