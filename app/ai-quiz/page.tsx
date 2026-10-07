import { getTrack } from '@/lib/content'
import { TRACKS } from '@/lib/tracks'
import AiQuizView from '@/components/AiQuizView'

export const metadata = {
  title: 'AI 出题官 · 深学 DeepLearn',
  description: '选择任意章节，AI 阅读章节内容现场出题；答错自动进入错题本，答对自动移出。',
}

export default function AiQuizPage() {
  const chapters = TRACKS.flatMap((track) => {
    const t = getTrack(track.id)
    return (t?.chapters || []).map((ch) => ({
      trackId: track.id,
      slug: ch.slug,
      title: ch.title,
      summary: ch.summary,
    }))
  })

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">🤖 AI 出题官</h1>
        <p className="mt-2 text-slate-600">
          AI 会阅读你选的章节，现场出一组专属测验。答错的题自动进入错题本，重做答对后自动移出——把每一章真正学透。
        </p>
      </header>
      <AiQuizView chapters={chapters} />
    </main>
  )
}
