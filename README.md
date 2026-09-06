# 深学 DeepLearn

> 借鉴 [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) 学习模式的**纯静态学习网站**。
> 前端 Next.js 静态导出 + Hono Serverless API，数据库 Neon Postgres，部署于 Vercel（函数香港 `hkg1` · 数据库新加坡）。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/huqinyuan923-hue/deeplearn)

## 它是什么

一个开源的中文学习平台，把 DeepTutor 最有效的学习模式做成了人人可访问的静态页面：

| 板块 | 借鉴来源 | 说明 |
|------|----------|------|
| 🧭 学习路线图 | DeepTutor 掌握度路径 + [roadmap.sh](https://github.com/kamranahmedse/developer-roadmap) | 知识节点打卡，进度同步数据库（设备 ID 标识，免登录） |
| ✍️ 章节测验 | DeepTutor Quiz 模式 | 每章选择题自动判分，成绩入库 |
| 🃏 抽认卡 | DeepTutor Flashcards | 术语卡片翻转记忆，「还不熟」单独回炉 |
| 💬 留言板 | — | 学习心得交流，存数据库 |

内置四条学习线 **15 章**原创中文内容：AI·LLM·Agent（4 章）、前端开发（4 章）、Python 编程（4 章）、计算机基础（3 章）。

## 技术架构

```text
浏览器 ── 静态页面 ──> Vercel 全球 CDN（out/，纯静态导出）
   │
   └── /api/* ──> Vercel Serverless 函数（Hono，区域 hkg1 香港）
                        │
                        └──> Neon Postgres（新加坡 aws-ap-southeast-1）
```

- **前端**：Next.js 15（`output: 'export'` 静态导出）+ React 19 + Tailwind CSS + react-markdown
- **内容**：`content/` 下的 Markdown（frontmatter 携带测验与抽认卡数据），构建时解析
- **API**：`api/index.js` 单函数 Hono 应用，首次请求自动建表（`CREATE TABLE IF NOT EXISTS`）
- **数据库**：5 张表 `learners / progress / quiz_results / flashcard_reviews / guestbook`

## 本地开发

```bash
pnpm install            # 安装依赖
pnpm dev                # http://localhost:3000（无数据库时页面可看，API 返回 503）
pnpm build              # 静态导出到 out/
```

## 部署到自己的 Vercel

```bash
npm i -g vercel neonctl
vercel login                        # 浏览器授权
neonctl auth                        # 浏览器授权（Neon）
neonctl projects create --name deeplearn --region-id aws-ap-southeast-1
neonctl connection-string <project_id> --pooled   # 复制连接串

vercel link
echo 'DATABASE_URL=postgres://...' | vercel env add DATABASE_URL production
pnpm db:init                        # 可选：手动建表（API 首次请求也会自动建）
vercel --prod
```

## 添加课程内容

在 `content/<学习线>/` 下新建 `NN-slug.md`：

```markdown
---
title: 章节标题
order: 5
minutes: 8
summary: 一句话简介。
quiz:
  - question: 题干
    options: [选项 A, 选项 B, 选项 C, 选项 D]
    answer: 1
    explanation: 解析
flashcards:
  - front: 术语
    back: 解释
---
正文 Markdown……
```

路线图、课程页、抽认卡会自动收录新章节——**纯内容更新，无需改代码**。

## 致谢

- [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) — 学习模式与板块设计的灵感来源
- [roadmap.sh](https://github.com/kamranahmedse/developer-roadmap) — 路线图交互参考
- [javascript.info](https://github.com/javascript-tutorial/en.javascript.info) — 教程组织参考

## License

MIT
