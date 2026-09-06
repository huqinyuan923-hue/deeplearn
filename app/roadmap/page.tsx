import type { Metadata } from 'next'
import { getAllTracks } from '@/lib/content'
import RoadmapView, { type RoadmapTrack } from '@/components/RoadmapView'

export const metadata: Metadata = {
  title: '学习路线图',
  description: '按学习线组织的知识节点地图：学完一章点亮一个节点，打卡进度保存在数据库。',
}

export default function RoadmapPage() {
  const tracks: RoadmapTrack[] = getAllTracks().map((t) => ({
    id: t.id,
    title: t.title,
    emoji: t.emoji,
    description: t.description,
    gradient: t.gradient,
    chapters: t.chapters.map((c) => ({
      itemId: c.itemId,
      slug: c.slug,
      order: c.order,
      title: c.title,
      summary: c.summary,
      minutes: c.minutes,
    })),
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">学习路线图</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          点击章节前的圆圈即可「打卡」——进度先存在本机，并自动同步到数据库（浏览器设备 ID 标识，无需注册登录）。
          节点打勾即视为掌握，对应 DeepTutor 的 Mastery Path 掌握度路径。
        </p>
      </header>
      <RoadmapView tracks={tracks} />
    </div>
  )
}
