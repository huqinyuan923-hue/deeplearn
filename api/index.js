'use strict'

// 深学 DeepLearn — Hono Serverless API（Vercel Node Runtime，区域 hkg1）
// 数据库：Neon Postgres（新加坡 aws-ap-southeast-1），连接串经环境变量 DATABASE_URL 注入

const { Hono } = require('hono')
const postgres = require('postgres')

const DATABASE_URL = process.env.DATABASE_URL || ''
const sql = DATABASE_URL
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

app.notFound((c) => c.json({ error: 'not found' }, 404))
app.onError((err, c) => c.json({ error: errText(err) }, 500))

exports.config = { runtime: 'nodejs', maxDuration: 15 }

exports.fetch = (request) => app.fetch(request)
