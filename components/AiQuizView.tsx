'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw, Trophy, Sparkles, BookOpenCheck, Trash2, AlertCircle } from 'lucide-react'
import {
  generateAiQuiz,
  answerAiQuiz,
  fetchWrongBook,
  clearWrongBook,
  type AiQuestion,
  type AiWrongItem,
} from '@/lib/api'
import { TRACKS } from '@/lib/tracks'

const LETTERS = ['A', 'B', 'C', 'D']

interface ChapterMeta {
  trackId: string
  slug: string
  title: string
  summary: string
}

interface SessionQuestion extends AiQuestion {
  chapterId: string
}

export default function AiQuizView({ chapters }: { chapters: ChapterMeta[] }) {
  const [tab, setTab] = useState<'practice' | 'wrong'>('practice')
  const [chapterId, setChapterId] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [questions, setQuestions] = useState<SessionQuestion[]>([])
  const [picked, setPicked] = useState<number[]>([])
  const [graded, setGraded] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [wrongItems, setWrongItems] = useState<AiWrongItem[] | null>(null)

  useEffect(() => {
    fetchWrongBook().then((items) => setWrongItems(items ?? []))
  }, [])

  const generate = async () => {
    if (!chapterId || loading) return
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const res = await generateAiQuiz(chapterId, count)
      if (res.error || !res.questions?.length) {
        setError(res.error || '生成失败，请重试')
      } else {
        setQuestions(res.questions.map((q) => ({ ...q, chapterId })))
        setPicked(res.questions.map(() => -1))
        setGraded(false)
        setResults([])
        if (res.cached) setNotice('本轮题目来自缓存题库（不消耗生成次数）')
      }
    } catch {
      setError('网络异常，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (submitting || graded) return
    setSubmitting(true)
    const verdicts = await Promise.allSettled(
      questions.map((q, i) =>
        answerAiQuiz({
          chapterId: q.chapterId,
          qHash: q.id,
          picked: picked[i],
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        }).then((r) => Boolean(r.correct)),
      ),
    )
    setResults(verdicts.map((v) => (v.status === 'fulfilled' ? v.value : false)))
    setGraded(true)
    setSubmitting(false)
    fetchWrongBook().then((items) => setWrongItems(items ?? []))
  }

  const score = results.filter(Boolean).length

  const redoWrong = () => {
    if (!wrongItems?.length) return
    setQuestions(
      wrongItems.map((w) => ({
        id: w.q_hash,
        chapterId: w.chapter_id,
        question: w.payload.question,
        options: w.payload.options,
        answer: w.payload.answer,
        explanation: w.payload.explanation || '',
      })),
    )
    setPicked(wrongItems.map(() => -1))
    setResults([])
    setGraded(false)
    setError(null)
    setNotice('错题重做模式：答对的题会自动移出错题本')
    setTab('practice')
  }

  const clearAll = async () => {
    if (!confirm('确定清空整个错题本？')) return
    if (await clearWrongBook()) {
      setWrongItems([])
      toast('错题本已清空')
    }
  }

  function toast(msg: string) {
    setNotice(msg)
    setTimeout(() => setNotice(null), 2600)
  }

  const grouped = TRACKS.map((t) => ({
    ...t,
    chapters: chapters.filter((c) => c.trackId === t.id),
  }))

  return (
    <div className="space-y-8">
      {/* Tab 切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('practice')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'practice' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="mr-1.5 inline h-4 w-4" />
          AI 出题
        </button>
        <button
          onClick={() => setTab('wrong')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'wrong' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpenCheck className="mr-1.5 inline h-4 w-4" />
          错题本{wrongItems?.length ? `（${wrongItems.length}）` : ''}
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{notice}</div>
      )}

      {tab === 'practice' ? (
        <>
          {/* 生成面板 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">🤖</span>
              让 AI 为你定制一组测验
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              选择任意章节，AI 会阅读该章内容现场出题。答错的题自动进入错题本，答对后自动移出。
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400"
              >
                <option value="">选择章节…</option>
                {grouped.map(
                  (t) =>
                    t.chapters.length > 0 && (
                      <optgroup key={t.id} label={`${t.emoji} ${t.title}`}>
                        {t.chapters.map((c) => (
                          <option key={c.trackId + '/' + c.slug} value={c.trackId + '/' + c.slug}>
                            {c.title}
                          </option>
                        ))}
                      </optgroup>
                    ),
                )}
              </select>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400"
              >
                {[3, 5, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} 题
                  </option>
                ))}
              </select>
              <button
                onClick={generate}
                disabled={!chapterId || loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'AI 正在出题…' : '生成测验'}
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-400">每人每天可生成 15 组；相同章节会复用已生成的题库，不重复消耗次数。</p>
            {loading && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                AI 正在阅读章节内容并出题，约需 10~30 秒…
              </div>
            )}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </section>

          {/* 答题区 */}
          {questions.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">AI 出的题（{questions.length} 题）</h2>
              <ol className="mt-6 space-y-6">
                {questions.map((q, qi) => (
                  <li key={q.id + qi} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <p className="font-medium text-slate-900">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt, oi) => {
                        const chosen = picked[qi] === oi
                        const correct = q.answer === oi
                        let cls = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                        if (graded) {
                          if (correct) cls = 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          else if (chosen) cls = 'border-rose-300 bg-rose-50 text-rose-900'
                          else cls = 'border-slate-100 bg-white text-slate-400'
                        } else if (chosen) {
                          cls = 'border-indigo-400 bg-indigo-50 text-indigo-900'
                        }
                        return (
                          <button
                            key={oi}
                            type="button"
                            disabled={graded}
                            onClick={() => setPicked((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                            className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${cls}`}
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                              {LETTERS[oi]}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {graded && correct && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                            {graded && chosen && !correct && <XCircle className="h-5 w-5 shrink-0 text-rose-500" />}
                          </button>
                        )
                      })}
                    </div>
                    {graded && q.explanation && (
                      <p className="mt-3 rounded-lg bg-indigo-50/70 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
                        💡 {q.explanation}
                      </p>
                    )}
                  </li>
                ))}
              </ol>

              {!graded ? (
                <button
                  onClick={submit}
                  disabled={submitting || picked.some((p) => p < 0)}
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? '判分中…' : picked.some((p) => p < 0) ? '还有题目未作答' : '提交判分'}
                </button>
              ) : (
                <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
                  <p className="flex items-center justify-center gap-2 text-lg font-bold text-slate-900">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    得分 {score} / {questions.length}
                  </p>
                  <button
                    onClick={generate}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    再来一组
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        /* 错题本 */
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">📕</span>
              我的错题本（{wrongItems?.length ?? 0} 题）
            </h2>
            {wrongItems && wrongItems.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={redoWrong}
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  重做错题
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:border-rose-300 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  清空
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">答错的题会自动收进来；在重做中答对后自动移出。</p>

          <div className="mt-5 space-y-4">
            {wrongItems === null && <p className="text-sm text-slate-400">加载中…</p>}
            {wrongItems?.length === 0 && (
              <div className="rounded-xl bg-emerald-50 px-4 py-8 text-center text-sm text-emerald-700">
                🎉 错题本是空的，继续保持！
              </div>
            )}
            {wrongItems?.map((w) => (
              <div key={w.q_hash} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs text-slate-400">
                  {chapters.find((c) => c.trackId + '/' + c.slug === w.chapter_id)?.title || w.chapter_id}
                </p>
                <p className="mt-1 font-medium text-slate-900">{w.payload.question}</p>
                <p className="mt-2 text-sm text-rose-600">
                  你的答案：{LETTERS[w.payload.picked ?? -1] || '—'}
                  {w.payload.picked != null && ` · ${w.payload.options[w.payload.picked] || ''}`}
                </p>
                <p className="text-sm text-emerald-700">
                  正确答案：{LETTERS[w.payload.answer]} · {w.payload.options[w.payload.answer]}
                </p>
                {w.payload.explanation && (
                  <p className="mt-2 rounded-lg bg-indigo-50/70 px-3 py-2 text-sm text-slate-700">💡 {w.payload.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
