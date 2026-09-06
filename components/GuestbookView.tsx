'use client'

import { useEffect, useState } from 'react'
import { fetchGuestbook, postGuestbook, type GuestbookMessage } from '@/lib/api'
import { Loader2, MessageCircle, Send } from 'lucide-react'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function GuestbookView() {
  const [messages, setMessages] = useState<GuestbookMessage[] | null>(null)
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const load = () => {
    fetchGuestbook().then((list) => setMessages(list ?? []))
  }

  useEffect(load, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    setNotice(null)
    const res = await postGuestbook(nickname.trim(), text.trim())
    setSending(false)
    if (res.ok) {
      setText('')
      setNotice({ ok: true, text: '留言成功！' })
      load()
    } else {
      setNotice({ ok: false, text: res.error || '留言失败，请稍后再试' })
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={submit} className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <MessageCircle className="h-5 w-5 text-indigo-500" /> 写下你的留言
        </h2>
        <p className="mt-1 text-sm text-slate-500">学习心得、建议、打个招呼都可以（最多 500 字）。</p>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          昵称
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            placeholder="匿名同学"
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          留言内容
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            rows={4}
            required
            placeholder="例如：路线图打卡功能很好用，希望加一门数据库课程！"
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <span className="mt-1 block text-right text-xs text-slate-400">{text.length}/500</span>
        </label>

        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-slate-300"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? '发布中…' : '发布留言'}
        </button>

        {notice && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
            {notice.text}
          </p>
        )}
      </form>

      <div className="space-y-4">
        {messages === null ? (
          <div className="flex h-32 items-center justify-center text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在加载留言…
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            还没有留言，来当第一个留言的同学吧 ✨
          </div>
        ) : (
          messages.map((m) => (
            <article key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-sm font-bold text-white">
                    {(m.nickname || '匿').slice(0, 1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{m.nickname || '匿名同学'}</span>
                </div>
                <time className="text-xs text-slate-400">{formatTime(m.created_at)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{m.message}</p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
