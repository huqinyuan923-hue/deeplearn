---
title: 网络基础与 Git：协作的基石
order: 3
minutes: 9
summary: 浏览器输入网址后发生了什么——HTTP 请求、状态码、DNS，以及版本控制工具 Git 的日常三连。
quiz:
  - question: 浏览器访问网页返回 404，含义是？
    options:
      - 服务器内部代码崩溃了
      - 请求的资源在服务器上不存在
      - 网络断开了
      - 浏览器版本太旧
    answer: 1
    explanation: 404 Not Found 表示服务器收到了请求但没有找到对应资源（路径写错或页面被删）。500 才是服务器内部错误。
  - question: GET 和 POST 最常见的分工是？
    options:
      - GET 用于获取数据（参数在 URL 里），POST 用于提交数据（参数在请求体里）
      - GET 更安全所以用于密码提交
      - POST 的速度一定比 GET 快
      - 两者没有区别
    answer: 0
    explanation: GET 语义是「读取」，参数暴露在 URL；POST 语义是「提交/创建」，数据在请求体中。密码等敏感信息永远不该用 GET 传输。
  - question: git add 与 git commit 的关系是？
    options:
      - 二者完全等价
      - add 把改动放入暂存区，commit 把暂存区内容生成一个本地提交快照
      - add 会把代码上传到 GitHub，commit 只在本地
      - commit 之前不需要 add
    answer: 1
    explanation: 工作区 →（add）→ 暂存区 →（commit）→ 本地仓库 →（push）→ 远程仓库。add 选择「这次提交想包含哪些改动」，commit 才真正形成历史记录。
flashcards:
  - front: HTTP
    back: 浏览器与服务器之间的通信协议——「请求—响应」一来一回，是无状态的。
  - front: URL
    back: 统一资源定位符，由协议 + 域名 + 路径 + 查询参数组成，如 https://a.com/c/1?id=9。
  - front: DNS
    back: 域名解析系统，把 deeplearn.example.com 这样的域名翻译成服务器的 IP 地址。
  - front: 状态码
    back: 200 成功，301/302 重定向，404 资源不存在，500 服务器内部错误。
  - front: Git
    back: 分布式版本控制系统，记录每次提交的快照，可回退、可分支、可协作。
  - front: commit 与 push
    back: commit 在本地生成一次快照；push 把本地提交同步到远程仓库（如 GitHub）。
---

## 输入网址后的 0.1 秒

```text
1. DNS 解析    deeplearn.example.com  →  76.76.21.21（服务器的 IP）
2. 建立连接    浏览器与服务器完成 TLS 握手（HTTPS 加密）
3. 发送请求    GET /roadmap/ HTTP/1.1
               Host: deeplearn.example.com
4. 返回响应    200 OK + HTML 文档
5. 渲染页面    浏览器解析 HTML/CSS/JS，随后可能再发请求拿数据
```

这套「请求—响应」模型就是 **HTTP**。它有一个重要特征：**无状态**——服务器默认不记得上一次请求是谁发的，所以需要 Cookie、Token 等机制来维持登录态。

## 状态码：服务器的「表情」

| 状态码 | 含义 | 常见场景 |
|--------|------|----------|
| 200 | OK 成功 | 正常返回页面/接口数据 |
| 301/302 | 重定向 | 旧网址跳到新网址 |
| 404 | Not Found | 路径写错、页面已删除 |
| 500 | 服务器错误 | 服务端代码崩溃 |

本站 API 调试时看到 `400 invalid payload`，就是参数没通过校验——根据状态码定位问题，是前后端联调的基本功。

## Git：给代码装上「时间机器」

```bash
git init                    # 初始化仓库
git add .                   # 改动放进暂存区
git commit -m '完成 AI 学习线内容'   # 生成一次快照
git log --oneline           # 查看历史
git push origin main        # 推送到远程仓库（GitHub）
```

三个区域的关系：

```text
工作区（你在改） → add → 暂存区（这次要提交的） → commit → 仓库（历史快照）
```

commit 是一次「存档」：任何时候都能查看、回退、对比。分支让你可以并行实验而不弄坏主线，push/pull 让多人协作成为可能——**没有 Git，就没有现代开源世界**。

> 💡 **练习任务**：本站代码就托管在 GitHub 上——clone 下来，改一句文案，走完 add → commit → push 全流程，网络与版本控制两章就都复习了。
