import type { Metadata } from 'next'
import GuestbookView from '@/components/GuestbookView'

export const metadata: Metadata = {
  title: '留言板',
  description: '学习心得、建议与交流，留言保存在数据库。',
}

export default function GuestbookPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">留言板</h1>
        <p className="mt-2 text-sm text-slate-600">
          学习心得、内容建议、问题求助都可以留在这里。留言按时间倒序展示，最多保留 50 条。
        </p>
      </header>
      <GuestbookView />
    </div>
  )
}
