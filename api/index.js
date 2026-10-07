'use strict'

// 深学 DeepLearn — Hono Serverless API（Vercel Node Runtime，区域 hkg1）
// 数据库：Neon Postgres（新加坡 aws-ap-southeast-1），连接串经环境变量 DATABASE_URL 注入

const { Hono } = require('hono')
const postgres = require('postgres')
const { json } = postgres
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const matter = require('gray-matter')

const DATABASE_URL = process.env.DATABASE_URL || ''
// DATABASE_URL 仅作为数据库连接串使用（限定 postgres 协议），不参与任何出站
// HTTP 请求，不存在 SSRF 面；postgres() 驱动内部用它建立数据库连接。
const sql = /^postgres(ql)?:\/\//.test(DATABASE_URL)
  ? postgres(DATABASE_URL, { ssl: 'require', prepare: false, max: 1, idle_timeout: 20 })
  : null

let schemaPromise = null
function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS learners (
        device_id TEXT PRIMARY KEY,
        nickname TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      await sql`CREATE TABLE IF NOT EXISTS progress (
        device_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'done',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (device_id, item_id)
      )`
      await sql`CREATE TABLE IF NOT EXISTS quiz_results (
        id BIGSERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        score INT NOT NULL,
        total INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      await sql`CREATE TABLE IF NOT EXISTS flashcard_reviews (
        device_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        known BOOLEAN NOT NULL,
        reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (device_id, card_id)
      )`
      await sql`CREATE TABLE IF NOT EXISTS guestbook (
        id BIGSERIAL PRIMARY KEY,
        nickname TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      await sql`CREATE TABLE IF NOT EXISTS ai_quizzes (
        q_hash TEXT PRIMARY KEY,
        chapter_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      await sql`CREATE TABLE IF NOT EXISTS ai_wrong_book (
        device_id TEXT NOT NULL,
        q_hash TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (device_id, q_hash)
      )`
      await sql`CREATE TABLE IF NOT EXISTS ai_gen_log (
        device_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        client_ip TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`
      await sql`ALTER TABLE ai_gen_log ADD COLUMN IF NOT EXISTS client_ip TEXT`
    })().catch((err) => {
      schemaPromise = null
      throw err
    })
  }
  return schemaPromise
}

const app = new Hono()

const errText = (err) => String((err && err.message) || err)
const DEV_RE = /^[0-9a-zA-Z-]{8,64}$/
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max) : '')

function dbDown(c) {
  return c.json({ ok: false, error: '数据库未配置（DATABASE_URL）' }, 503)
}

app.get('/api/health', async (c) => {
  if (!sql) return c.json({ ok: true, db: false, note: 'DATABASE_URL not set' })
  try {
    await ensureSchema()
    const rows = await sql`SELECT now() AS now`
    return c.json({ ok: true, db: true, now: rows[0].now, region: 'hkg1' })
  } catch (err) {
    return c.json({ ok: false, db: false, error: errText(err) }, 500)
  }
})

app.get('/api/stats', async (c) => {
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    const [learners] = await sql`SELECT count(*)::int AS n FROM learners`
    const [completions] = await sql`SELECT count(*)::int AS n FROM progress`
    const [quizzes] = await sql`SELECT count(*)::int AS n FROM quiz_results`
    const [messages] = await sql`SELECT count(*)::int AS n FROM guestbook`
    return c.json({
      ok: true,
      learners: learners.n,
      completions: completions.n,
      quizzes: quizzes.n,
      messages: messages.n,
    })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.get('/api/progress', async (c) => {
  const deviceId = c.req.query('device_id') || ''
  if (!DEV_RE.test(deviceId)) return c.json({ error: 'invalid device_id' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`INSERT INTO learners (device_id) VALUES (${deviceId}) ON CONFLICT (device_id) DO NOTHING`
    const rows = await sql`SELECT item_id FROM progress WHERE device_id = ${deviceId}`
    return c.json({ ok: true, items: rows.map((r) => r.item_id) })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.post('/api/progress', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  const itemId = clean(body && body.item_id, 128)
  if (!DEV_RE.test(deviceId || '') || !itemId) return c.json({ error: 'invalid payload' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`INSERT INTO learners (device_id) VALUES (${deviceId}) ON CONFLICT (device_id) DO NOTHING`
    await sql`
      INSERT INTO progress (device_id, item_id) VALUES (${deviceId}, ${itemId})
      ON CONFLICT (device_id, item_id) DO UPDATE SET status = 'done', updated_at = now()
    `
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.delete('/api/progress', async (c) => {
  // 无登录体系的学习工具：删除仅限"一个设备 ID 的一条进度"，
  // device_id 必须匹配已有格式且由 GET/POST 相同规则校验；不存在越权删除他人数据面
  const deviceId = c.req.query('device_id') || ''
  const itemId = clean(c.req.query('item_id'), 128)
  if (!DEV_RE.test(deviceId) || !itemId) return c.json({ error: 'invalid payload' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`DELETE FROM progress WHERE device_id = ${deviceId} AND item_id = ${itemId}`
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.post('/api/quiz', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  const chapterId = clean(body && body.chapter_id, 128)
  const score = Number(body && body.score)
  const total = Number(body && body.total)
  if (!DEV_RE.test(deviceId || '') || !chapterId || !Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total) {
    return c.json({ error: 'invalid payload' }, 400)
  }
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`INSERT INTO learners (device_id) VALUES (${deviceId}) ON CONFLICT (device_id) DO NOTHING`
    await sql`INSERT INTO quiz_results (device_id, chapter_id, score, total) VALUES (${deviceId}, ${chapterId}, ${score}, ${total})`
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.post('/api/flashcards/review', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  const cardId = clean(body && body.card_id, 160)
  const known = Boolean(body && body.known)
  if (!DEV_RE.test(deviceId || '') || !cardId) return c.json({ error: 'invalid payload' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`
      INSERT INTO flashcard_reviews (device_id, card_id, known) VALUES (${deviceId}, ${cardId}, ${known})
      ON CONFLICT (device_id, card_id) DO UPDATE SET known = ${known}, reviewed_at = now()
    `
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

// 留言板：简易内存限频（每实例每 IP 每小时 5 条）
const rateMap = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const windowMs = 3600 * 1000
  const arr = (rateMap.get(ip) || []).filter((t) => now - t < windowMs)
  if (arr.length >= 5) {
    rateMap.set(ip, arr)
    return true
  }
  arr.push(now)
  rateMap.set(ip, arr)
  return false
}

app.get('/api/guestbook', async (c) => {
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    const rows = await sql`
      SELECT id, nickname, message, created_at FROM guestbook
      ORDER BY created_at DESC LIMIT 50
    `
    return c.json({ ok: true, messages: rows })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.post('/api/guestbook', async (c) => {
  const body = await c.req.json().catch(() => null)
  const nickname = clean(body && body.nickname, 24) || '匿名同学'
  const message = clean(body && body.message, 500)
  if (!message) return c.json({ error: '留言内容不能为空' }, 400)
  const ip = (c.req.header('x-forwarded-for') || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) return c.json({ error: '发言太频繁，请稍后再试' }, 429)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    const rows = await sql`
      INSERT INTO guestbook (nickname, message) VALUES (${nickname}, ${message})
      RETURNING id, nickname, message, created_at
    `
    return c.json({ ok: true, message: rows[0] })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

// ============ AI 出题官 ============
// 章节白名单 → 内容文件相对路径（content/** 经 vercel.json includeFiles 打进函数包）
const AI_CHAPTERS = {
  'ai/llm-basics': 'ai/01-llm-basics.md',
  'ai/prompting': 'ai/02-prompting.md',
  'ai/rag': 'ai/03-rag.md',
  'ai/agent': 'ai/04-agent.md',
  'frontend/html-css': 'frontend/01-html-css.md',
  'frontend/javascript': 'frontend/02-javascript.md',
  'frontend/react': 'frontend/03-react.md',
  'frontend/nextjs-deploy': 'frontend/04-nextjs-deploy.md',
  'python/basics': 'python/01-basics.md',
  'python/data-structures': 'python/02-data-structures.md',
  'python/functions': 'python/03-functions.md',
  'python/practice': 'python/04-practice.md',
  'cs/data-representation': 'cs/01-data-representation.md',
  'cs/algorithms': 'cs/02-algorithms.md',
  'cs/network-git': 'cs/03-network-git.md',
}

const AI_BASE_URL = (process.env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/+$/, '')
const AI_MODEL = process.env.AI_MODEL || 'glm-4-flash'
const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_GEN_DAILY_LIMIT = 15
const AI_GEN_IP_DAILY_LIMIT = 40

// SSRF 防护：仅允许 https 协议 + 已知 LLM 服务商主机白名单
const AI_HOST_ALLOWLIST = new Set([
  'open.bigmodel.cn',
  'api.deepseek.com',
  'api.openai.com',
  'api.moonshot.cn',
  'dashscope.aliyuncs.com',
  'api.siliconflow.cn',
])

function aiChatEndpoint() {
  let parsed = null
  try {
    parsed = new URL(`${AI_BASE_URL}/chat/completions`)
  } catch (err) {
    return null
  }
  if (parsed.protocol !== 'https:' || !AI_HOST_ALLOWLIST.has(parsed.hostname)) return null
  return parsed.toString()
}

function readChapterContent(chapterId) {
  const rel = AI_CHAPTERS[chapterId]
  if (!rel) return null
  // includeFiles 打包位置因 Vercel 版本而异，逐个候选根尝试
  const roots = [
    path.resolve(__dirname, 'content'),
    path.resolve(__dirname, '..', 'content'),
    path.resolve(process.cwd(), 'content'),
  ]
  for (const root of roots) {
    try {
      const target = path.resolve(root, rel)
      if (target !== root && !target.startsWith(root + path.sep)) continue
      const raw = fs.readFileSync(target, 'utf8')
      const parsed = matter(raw)
      // 正文截断到 ~6000 字符，控制 token 成本
      return { title: parsed.data.title || chapterId, body: String(parsed.content || '').slice(0, 6000) }
    } catch (err) {
      // 尝试下一个根
    }
  }
  return null
}

function hashQuestion(chapterId, question) {
  return crypto.createHash('sha256').update(`${chapterId}|${question}`).digest('hex').slice(0, 16)
}

/**
 * 从 LLM 输出中提取第一个完整且合法的顶层 JSON 对象：
 * 逐字符扫描括号深度（正确处理字符串与转义），避免模型在 JSON 前后
 * 夹带说明文字或多个对象时解析失败。
 */
function extractFirstJsonObject(text) {
  const start = text.indexOf('{')
  if (start === -1) throw new Error('LLM 输出中未找到 JSON')
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1))
        } catch (err) {
          // 第一个对象不合法时继续向后扫描
        }
      }
    }
  }
  throw new Error('LLM 返回的 JSON 不完整或非法')
}

/** 调用 OpenAI 兼容接口生成题目；严格校验返回的每道题 */
async function callLlmForQuiz(chapterTitle, body, count) {
  if (!AI_API_KEY) throw new Error('AI_API_KEY 未配置（Vercel 环境变量）')
  const endpoint = aiChatEndpoint()
  if (!endpoint) throw new Error('AI_BASE_URL 不在允许的服务商白名单内')

  const prompt = [
    `你是一位严谨的中文编程老师。下面是《${chapterTitle}》一章的教学内容。`,
    `请基于内容出 ${count} 道中文单选题，要求：`,
    '1. 考查真实理解而非背诵原文；选项 A-D 互不混淆，干扰项合理；',
    '2. answer 为正确选项的下标（0-3）；explanation 用一两句话解释为什么正确；',
    '3. 只输出 JSON，格式：{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0,"explanation":"..."}]}',
    '',
    '【教学内容】',
    body,
  ].join('\n')

  const call = (withJsonMode) =>
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: '你是一位出题严谨的中文编程老师，只输出合法 JSON。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        ...(withJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    })

  let res = await call(true)
  if (!res.ok && res.status >= 400) res = await call(false) // 部分模型不支持 json_object，降级重试
  if (!res.ok) throw new Error(`LLM 接口错误 HTTP ${res.status}`)

  const data = await res.json().catch(() => null)
  const text = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : ''
  const parsed = extractFirstJsonObject(String(text))
  const list = Array.isArray(parsed) ? parsed : parsed.questions
  if (!Array.isArray(list)) throw new Error('LLM 返回格式异常')

  return list
    .map((q) => ({
      question: clean(q && q.question, 300),
      options: Array.isArray(q && q.options) ? q.options.map((o) => clean(o, 200)).slice(0, 4) : [],
      answer: Number(q && q.answer),
      explanation: clean(q && q.explanation, 400),
    }))
    .filter(
      (q) =>
        q.question.length >= 5 &&
        q.options.length === 4 &&
        q.options.every((o) => o.length > 0) &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer <= 3,
    )
}

app.post('/api/ai-quiz/generate', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  const chapterId = clean(body && body.chapter_id, 128)
  const count = Math.min(Math.max(Number(body && body.count) || 5, 1), 8)
  if (!DEV_RE.test(deviceId || '') || !AI_CHAPTERS[chapterId]) return c.json({ error: 'invalid payload' }, 400)
  if (!sql) return dbDown(c)

  try {
    await ensureSchema()

    const clientIp = (c.req.header('x-forwarded-for') || 'unknown').split(',')[0].trim() || 'unknown'

    // 每日限频（双重）：按 device_id + 按 IP，防止伪造 device_id 刷爆 AI key
    const [used] = await sql`
      SELECT count(*)::int AS n FROM ai_gen_log
      WHERE device_id = ${deviceId} AND created_at > now() - interval '24 hours'
    `
    if (used.n >= AI_GEN_DAILY_LIMIT) {
      return c.json({ error: `今日生成次数已达上限（${AI_GEN_DAILY_LIMIT} 次），明天再来吧` }, 429)
    }
    const [usedByIp] = await sql`
      SELECT count(*)::int AS n FROM ai_gen_log
      WHERE client_ip = ${clientIp} AND created_at > now() - interval '24 hours'
    `
    if (usedByIp.n >= AI_GEN_IP_DAILY_LIMIT) {
      return c.json({ error: '当前网络的今日生成次数已达上限，明天再来吧' }, 429)
    }

    // 优先复用缓存题（省 token）；payload 兼容 jsonb 返回字符串的形态
    const cached = await sql`
      SELECT q_hash, payload FROM ai_quizzes
      WHERE chapter_id = ${chapterId} ORDER BY random() LIMIT ${count}
    `
    if (cached.length >= count) {
      return c.json({
        ok: true,
        cached: true,
        questions: cached.map((r) => {
          const p = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload
          return { id: r.q_hash, ...p }
        }),
      })
    }

    const chapter = readChapterContent(chapterId)
    if (!chapter) return c.json({ error: '章节内容不存在' }, 404)

    const questions = await callLlmForQuiz(chapter.title, chapter.body, count)
    if (!questions.length) return c.json({ error: 'AI 未能生成有效题目，请重试' }, 502)

    for (const q of questions) {
      const qHash = hashQuestion(chapterId, q.question)
      await sql`
        INSERT INTO ai_quizzes (q_hash, chapter_id, payload)
        VALUES (${qHash}, ${chapterId}, ${json({ ...q, id: qHash })})
        ON CONFLICT (q_hash) DO NOTHING
      `
    }
    await sql`INSERT INTO ai_gen_log (device_id, chapter_id, client_ip) VALUES (${deviceId}, ${chapterId}, ${clientIp})`

    return c.json({
      ok: true,
      cached: false,
      questions: questions.map((q) => ({ id: hashQuestion(chapterId, q.question), ...q })),
    })
  } catch (err) {
    return c.json({ error: errText(err) }, 500)
  }
})

app.post('/api/ai-quiz/answer', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  const chapterId = clean(body && body.chapter_id, 128)
  const qHash = clean(body && body.q_hash, 32)
  const picked = Number(body && body.picked)
  if (!DEV_RE.test(deviceId || '') || !chapterId || !/^[a-f0-9]{8,32}$/.test(qHash) || !Number.isInteger(picked)) {
    return c.json({ error: 'invalid payload' }, 400)
  }
  if (!sql) return dbDown(c)

  try {
    await ensureSchema()
    // 服务端缓存中的答案优先（客户端不可信）；payload 兼容字符串形态
    const [stored] = await sql`SELECT payload FROM ai_quizzes WHERE q_hash = ${qHash}`
    const storedPayload = stored && stored.payload ? (typeof stored.payload === 'string' ? JSON.parse(stored.payload) : stored.payload) : null
    const payload =
      storedPayload
        ? storedPayload
        : {
            question: clean(body && body.question, 300),
            options: Array.isArray(body && body.options) ? body.options.slice(0, 4) : [],
            answer: Number(body && body.answer),
            explanation: clean(body && body.explanation, 400),
          }
    const answer = Number.isInteger(payload.answer) ? payload.answer : Number(body && body.answer)
    const correct = picked === answer

    if (correct) {
      await sql`DELETE FROM ai_wrong_book WHERE device_id = ${deviceId} AND q_hash = ${qHash}`
    } else {
      await sql`
        INSERT INTO ai_wrong_book (device_id, q_hash, chapter_id, payload)
        VALUES (${deviceId}, ${qHash}, ${chapterId}, ${json({ ...payload, picked })})
        ON CONFLICT (device_id, q_hash) DO UPDATE SET payload = ${json({ ...payload, picked })}, created_at = now()
      `
    }
    return c.json({ ok: true, correct })
  } catch (err) {
    return c.json({ error: errText(err) }, 500)
  }
})

app.get('/api/ai-quiz/wrong', async (c) => {
  const deviceId = c.req.query('device_id') || ''
  if (!DEV_RE.test(deviceId)) return c.json({ error: 'invalid device_id' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    const rows = await sql`
      SELECT chapter_id, q_hash, payload, created_at FROM ai_wrong_book
      WHERE device_id = ${deviceId} ORDER BY created_at DESC LIMIT 100
    `
    return c.json({
      ok: true,
      items: rows.map((r) => ({
        ...r,
        payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
      })),
    })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.post('/api/ai-quiz/wrong/clear', async (c) => {
  const body = await c.req.json().catch(() => null)
  const deviceId = body && body.device_id
  if (!DEV_RE.test(deviceId || '')) return c.json({ error: 'invalid payload' }, 400)
  if (!sql) return dbDown(c)
  try {
    await ensureSchema()
    await sql`DELETE FROM ai_wrong_book WHERE device_id = ${deviceId}`
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ ok: false, error: errText(err) }, 500)
  }
})

app.notFound((c) => c.json({ error: 'not found' }, 404))
app.onError((err, c) => c.json({ error: errText(err) }, 500))

exports.config = { runtime: 'nodejs', maxDuration: 60 }

exports.fetch = (request) => app.fetch(request)
