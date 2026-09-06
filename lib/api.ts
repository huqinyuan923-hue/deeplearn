// 客户端 API / 进度同步工具：免登录，浏览器生成设备 ID，本地优先 + 异步同步数据库

const DEVICE_KEY = 'deeplearn_device_id'
const PROGRESS_KEY = 'deeplearn_progress'

export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `dev-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

let progressCache: Set<string> | null = null

function readLocalProgress(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]') as string[])
  } catch {
    return new Set()
  }
}

function persistLocal(set: Set<string>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]))
}

/** 加载进度：localStorage 秒回，同时异步合并数据库记录 */
export async function loadProgress(): Promise<Set<string>> {
  if (progressCache) return progressCache
  const local = readLocalProgress()
  progressCache = local
  const remote = await api<{ ok: boolean; items: string[] }>(`/progress?device_id=${getDeviceId()}`)
  if (remote?.items?.length) {
    remote.items.forEach((i) => local.add(i))
    persistLocal(local)
  }
  return local
}

/** 打卡 / 取消打卡，返回操作后的完成状态 */
export async function toggleProgress(itemId: string): Promise<boolean> {
  const set = await loadProgress()
  const willBeDone = !set.has(itemId)
  if (willBeDone) set.add(itemId)
  else set.delete(itemId)
  persistLocal(set)
  if (willBeDone) {
    void api('/progress', { method: 'POST', body: JSON.stringify({ device_id: getDeviceId(), item_id: itemId }) })
  } else {
    void api(`/progress?device_id=${getDeviceId()}&item_id=${encodeURIComponent(itemId)}`, { method: 'DELETE' })
  }
  return willBeDone
}

export async function postQuizResult(chapterId: string, score: number, total: number): Promise<boolean> {
  const res = await api<{ ok: boolean }>('/quiz', {
    method: 'POST',
    body: JSON.stringify({ device_id: getDeviceId(), chapter_id: chapterId, score, total }),
  })
  return !!res?.ok
}

export async function postCardReview(cardId: string, known: boolean): Promise<void> {
  void api('/flashcards/review', {
    method: 'POST',
    body: JSON.stringify({ device_id: getDeviceId(), card_id: cardId, known }),
  })
}

export interface SiteStats {
  learners: number
  completions: number
  quizzes: number
  messages: number
}

export function fetchStats(): Promise<SiteStats | null> {
  return api<SiteStats>('/stats')
}

export interface GuestbookMessage {
  id: number
  nickname: string
  message: string
  created_at: string
}

export function fetchGuestbook(): Promise<GuestbookMessage[] | null> {
  return api<{ ok: boolean; messages: GuestbookMessage[] }>('/guestbook').then((r) => r?.messages ?? null)
}

export function postGuestbook(nickname: string, message: string): Promise<{ ok: boolean; error?: string }> {
  return api<{ ok: boolean; error?: string }>('/guestbook', {
    method: 'POST',
    body: JSON.stringify({ nickname, message }),
  }).then((r) => r ?? { ok: false, error: '网络异常，请稍后再试' })
}
