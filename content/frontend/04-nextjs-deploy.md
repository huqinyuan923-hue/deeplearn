---
title: Next.js 与部署：从代码到上线
order: 4
minutes: 9
summary: SSG、SSR、静态导出的区别，App Router 的约定，以及本站如何在 Vercel 上线。
quiz:
  - question: 静态站点生成（SSG）最适合下列哪种场景？
    options:
      - 内容每次访问都要实时变化的股票行情页
      - 教程、博客这类内容在构建时就确定的页面
      - 需要每个用户独立登录态的后台系统
      - 需要读写数据库的高频交易系统
    answer: 1
    explanation: SSG 在构建时把页面生成为 HTML 文件，访问时直接返回，快且稳。教程、文档、博客等内容固定的站点是最典型的适用场景（本站就是）。
  - question: 在 Next.js App Router 中，路由主要由什么决定？
    options:
      - 手写的路由配置文件
      - app 目录下的文件与文件夹结构
      - 数据库中的路由表
      - package.json 里的 scripts
    answer: 1
    explanation: App Router 是文件约定路由——app/roadmap/page.tsx 就是 /roadmap 页面，app/courses/[track]/page.tsx 是动态路由，目录即路由。
  - question: 本站「前端纯静态 + 少量 API」的架构中，数据库操作发生在哪里？
    options:
      - 在浏览器里直接连数据库
      - 在构建时把数据写死进 HTML
      - 在 Vercel 的 Serverless 函数（Hono API）里执行
      - 在用户本地运行一个小型数据库程序
    answer: 2
    explanation: 浏览器只负责渲染静态页面；打卡、测验、留言等写操作通过 /api 请求打到 Vercel Serverless 函数（香港 hkg1），由函数连接新加坡的 Neon Postgres。
flashcards:
  - front: Next.js
    back: 基于 React 的全栈框架，提供路由、渲染策略与构建优化，本站前端由它构建。
  - front: SSG（静态站点生成）
    back: 构建时生成全部 HTML，访问零计算，速度极快，适合内容型网站。
  - front: SSR（服务端渲染）
    back: 每次请求时在服务器实时生成 HTML，适合内容个性化、实时性强的页面。
  - front: 静态导出（output export）
    back: Next 配置项，把整个应用构建成纯静态 HTML/CSS/JS，可托管在任何静态服务器上。
  - front: Vercel
    back: Next.js 母公司的部署平台，静态文件走全球 CDN，Serverless 函数可选区域（本站选香港 hkg1）。
  - front: 环境变量
    back: 存放数据库连接串、密钥等配置的变量，部署平台里设置，绝不写进代码仓库。
---

## 渲染策略：三种上菜方式

同样是 React，Next.js 提供三种「上菜」时机：

| 策略 | 什么时候生成 HTML | 适合 |
|------|------------------|------|
| SSG 静态生成 | 构建时（deploy 前） | 教程、博客、文档 |
| SSR 服务端渲染 | 每次请求时 | 个性化、实时内容 |
| CSR 客户端渲染 | 浏览器里现算 | 强交互的后台面板 |

本站选 SSG：内容在构建时就变成了 `out/` 目录下的一堆 HTML，访问时 CDN 直接递文件。

## App Router：目录即路由

```text
app/
├── page.tsx                    →  /            首页
├── roadmap/page.tsx            →  /roadmap     学习路线
└── courses/[track]/page.tsx    →  /courses/ai  动态路由（方括号是参数）
```

不需要手写路由表，文件夹结构就是网址。配一条 `output: 'export'`，`next build` 就会把整站导出为纯静态文件。

## 上线：静态 + 一个 Serverless 函数

本站的完整架构：

```text
浏览器 ──静态页面──> Vercel 全球 CDN（out/ 里的 HTML）
   │
   └──/api 请求──> Vercel 函数（香港 hkg1，Hono）
                        │
                        └──> Neon Postgres（新加坡）
```

部署只有三步：`vercel login` 登录 → `vercel link` 关联项目 → `vercel --prod` 构建并上线。环境变量（数据库连接串）在平台里配置，永不进代码库。

> 💡 **你正在看的就是证据**：这个学习网站本身就是「Next.js 静态导出 + Serverless API」这套方案的完整示例。
