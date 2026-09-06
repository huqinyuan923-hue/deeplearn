import Link from 'next/link'
import { getAllTracks } from '@/lib/content'
import StatsBar from '@/components/StatsBar'
import { Compass, ClipboardCheck, Layers, MessagesSquare, ArrowRight, Map } from 'lucide-react'

const FEATURES = [
  {
    icon: Map,
    title: '学习路线图',
    desc: 'roadmap.sh 风格的知识节点，学完即打卡，进度同步数据库，换设备也不丢。',
  },
  {
    icon: ClipboardCheck,
    title: '章节测验',
    desc: '每章配 3 道选择题，提交自动判分并附解析，测验成绩全部记录可回看。',
  },
  {
    icon: Layers,
    title: '抽认卡记忆',
    desc: '借鉴 DeepTutor 的 Flashcards 模式：术语卡片翻转记忆，「还不熟」的卡片单独再练。',
  },
  {
    icon: MessagesSquare,
    title: '留言板交流',
    desc: '学习心得、内容建议、问题求助，留言保存在数据库，与所有同学共享。',
  },
]

export default function Home() {
  const tracks = getAllTracks()
  const chapterCount = tracks.reduce((n, t) => n + t.chapters.length, 0)
  const totalMinutes = tracks.reduce((n, t) => n + t.chapters.reduce((m, c) => m + c.minutes, 0), 0)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-700">
            🧪 借鉴 HKUDS / DeepTutor 学习模式 · 静态化开源实现
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            深学{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              DeepLearn
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            像 DeepTutor 一样「用多种模式学透一个主题」：路线图打卡追踪进度、章节测验检验掌握、
            抽认卡对抗遗忘、留言板交流心得。前端纯静态导出，学习数据存入 Neon Postgres。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/roadmap/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Compass className="h-4 w-4" /> 查看学习路线图
            </Link>
            <Link
              href="/courses/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              浏览全部课程 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 flex justify-center">
            <StatsBar chapterCount={chapterCount} trackCount={tracks.length} />
          </div>
          <p className="mt-4 text-xs text-slate-400">全部内容约 {Math.round(totalMinutes / 60)} 小时读完 · 共 {chapterCount} 个章节</p>
        </div>
      </section>

      {/* 学习线 */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">选择一条学习线</h2>
            <p className="mt-1 text-sm text-slate-500">每条线由若干章节组成，按顺序学完即可在路线图打卡。</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {tracks.map((track) => {
            const minutes = track.chapters.reduce((m, c) => m + c.minutes, 0)
            return (
              <Link
                key={track.id}
                href={`/courses/${track.id}/`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${track.gradient} text-2xl shadow-sm`}>
                    {track.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700">{track.title}</h3>
                    <p className="text-xs text-slate-400">
                      {track.chapters.length} 个章节 · 约 {minutes} 分钟
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{track.description}</p>
                <p className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
                  开始学习 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 学习方式（借鉴 DeepTutor） */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900">四种学习方式，一个都不会少</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
            DeepTutor 用 Agent 实现个性化辅导；深学把它最有效的学习模式做成了人人可访问的静态页面。
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
