// 手动初始化数据表（通常无需运行：API 首次请求会自动建表）
// 用法：pnpm db:init （读取 .env.local 或环境变量中的 DATABASE_URL）
import postgres from 'postgres'
import fs from 'node:fs'

const envFile = fs.existsSync(new URL('../.env.local', import.meta.url))
  ? fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  : ''
const envVars = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const url = process.env.DATABASE_URL || envVars.DATABASE_URL
if (!url) {
  console.error('❌ 缺少 DATABASE_URL（请配置 .env.local 或环境变量）')
  process.exit(1)
}

const sql = postgres(url, { ssl: 'require', prepare: false, max: 1 })

await sql`CREATE TABLE IF NOT EXISTS learners (
  device_id TEXT PRIMARY KEY, nickname TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
await sql`CREATE TABLE IF NOT EXISTS progress (
  device_id TEXT NOT NULL, item_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'done',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (device_id, item_id))`
await sql`CREATE TABLE IF NOT EXISTS quiz_results (
  id BIGSERIAL PRIMARY KEY, device_id TEXT NOT NULL, chapter_id TEXT NOT NULL,
  score INT NOT NULL, total INT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
await sql`CREATE TABLE IF NOT EXISTS flashcard_reviews (
  device_id TEXT NOT NULL, card_id TEXT NOT NULL, known BOOLEAN NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (device_id, card_id))`
await sql`CREATE TABLE IF NOT EXISTS guestbook (
  id BIGSERIAL PRIMARY KEY, nickname TEXT NOT NULL, message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now())`

console.log('✅ 数据表已就绪：learners / progress / quiz_results / flashcard_reviews / guestbook')
await sql.end()
