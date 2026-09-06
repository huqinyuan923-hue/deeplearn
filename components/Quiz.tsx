'use client'

import { useState } from 'react'
import { postQuizResult } from '@/lib/api'
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react'
import type { QuizQuestion } from '@/lib/content'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function Quiz({ chapterId, questions }: { chapterId: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1))
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState<'pending' | 'ok' | 'fail'>('pending')

  if (!questions.length) return null

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
  const allAnswered = answers.every((a) => a >= 0)

  const submit = async () => {
    setSubmitted(true)
    const ok = await postQuizResult(chapterId, score, questions.length)
    setSaved(ok ? 'ok' : 'fail')
  }

  const reset = () => {
    setAnswers(questions.map(() => -1))
    setSubmitted(false)
    setSaved('pending')
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">✍️</span>
        章节测验（{questions.length} 题）
      </h2>
      <p className="mt-1 text-sm text-slate-500">选好后点击提交，成绩会记录到数据库，帮你追踪掌握情况。</p>

      <ol className="mt-6 space-y-6">
        {questions.map((q, qi) => (
          <li key={qi} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="font-medium text-slate-900">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi
                const correct = q.answer === oi
                let cls = 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                if (submitted) {
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
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)))}
                    className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${cls}`}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-600">
                      {LETTERS[oi]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && correct && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                    {submitted && chosen && !correct && <XCircle className="h-5 w-5 shrink-0 text-rose-500" />}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-3 rounded-lg bg-indigo-50/70 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
                💡 {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={submit}
            disabled={!allAnswered}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {allAnswered ? '提交答案' : '还有题目未作答'}
          </button>
        ) : (
          <>
            <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
              <Trophy className="h-4 w-4" />
              得分：{score} / {questions.length}
              {score === questions.length && ' 🎉 全对！'}
            </span>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              重新作答
            </button>
            <span className="text-xs text-slate-400">
              {saved === 'ok' ? '成绩已同步到数据库 ✓' : saved === 'fail' ? '成绩同步失败（数据库未连接？）' : '成绩同步中…'}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
