'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Github } from 'lucide-react'

const LINKS = [
  { href: '/', label: '首页' },
  { href: '/roadmap/', label: '学习路线' },
  { href: '/courses/', label: '课程' },
  { href: '/flashcards/', label: '抽认卡' },
  { href: '/ai-quiz/', label: 'AI 出题' },
  { href: '/guestbook/', label: '留言板' },
]

const REPO_URL = 'https://github.com/huqinyuan923-hue/deeplearn'

function isActive(pathname: string, href: string) {
  const p = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
  const h = href === '/' ? '' : href.slice(0, -1)
  return p === h || (h !== '' && p.startsWith(h))
}

export default function Nav() {
  const pathname = usePathname() || '/'
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-900">深学 DeepLearn</span>
            <span className="block text-[11px] text-slate-500">纯静态学习平台 · 借鉴 DeepTutor</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(pathname, l.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="GitHub 仓库"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive(pathname, l.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
