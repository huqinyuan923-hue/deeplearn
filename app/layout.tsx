import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: {
    default: '深学 DeepLearn — 纯静态学习平台',
    template: '%s · 深学 DeepLearn',
  },
  description:
    '借鉴 HKUDS/DeepTutor 学习模式的纯静态学习网站：AI·LLM·Agent、前端开发、Python、计算机基础，配套学习路线图打卡、章节测验、抽认卡与留言板。部署于 Vercel（函数香港 hkg1 · 数据库 Neon 新加坡）。',
}

const GITHUB_URL = 'https://github.com/huqinyuan923-hue/deeplearn'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-slate-900">深学 DeepLearn</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                一个纯静态的开源学习网站：路线图打卡、章节测验、抽认卡记忆、留言交流。
                前端静态导出，数据库记录你的学习足迹。
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">学习板块</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
                <li><Link className="hover:text-indigo-600" href="/roadmap/">学习路线图</Link></li>
                <li><Link className="hover:text-indigo-600" href="/courses/">全部课程</Link></li>
                <li><Link className="hover:text-indigo-600" href="/flashcards/">抽认卡</Link></li>
                <li><Link className="hover:text-indigo-600" href="/guestbook/">留言板</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">致谢与参考</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
                <li>
                  <a className="hover:text-indigo-600" href="https://github.com/HKUDS/DeepTutor" target="_blank" rel="noreferrer">
                    HKUDS/DeepTutor（学习模式借鉴）
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-600" href="https://github.com/kamranahmedse/developer-roadmap" target="_blank" rel="noreferrer">
                    roadmap.sh（路线图交互参考）
                  </a>
                </li>
                <li>
                  <a className="hover:text-indigo-600" href="https://github.com/javascript-tutorial/en.javascript.info" target="_blank" rel="noreferrer">
                    javascript.info（教程结构参考）
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 py-4">
            <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6">
              © 2026 深学 DeepLearn ·{' '}
              <a className="hover:text-indigo-600" href={GITHUB_URL} target="_blank" rel="noreferrer">
                开源代码
              </a>{' '}
              · 部署于 Vercel（函数 hkg1 香港 · 数据库 Neon 新加坡） · 前端纯静态导出
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
