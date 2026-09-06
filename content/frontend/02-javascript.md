---
title: JavaScript 核心三件套：变量、函数与异步
order: 2
minutes: 10
summary: const 与 let、箭头函数、数组方法，以及理解 JS 灵魂的异步编程。
quiz:
  - question: 用 const 声明的对象 obj，下面哪种操作会报错？
    options:
      - obj.name = '新值'（修改属性）
      - obj = {}（重新赋值整个变量）
      - obj.list.push(1)（往属性数组里添加元素）
      - 读取 obj.name
    answer: 1
    explanation: const 锁定的是「变量绑定」——不能重新赋值，但对象内部的内容依然可以修改。想让对象完全不可变需要 Object.freeze。
  - question: "[1, 2, 3].map(x => x * 2) 的返回值是？"
    options:
      - undefined，map 没有返回值
      - 修改了原数组，返回 [1, 2, 3]
      - 一个新数组 [2, 4, 6]，原数组不变
      - 数字 12
    answer: 2
    explanation: map 对每个元素执行函数并收集结果，返回一个新数组，不会修改原数组。类似地 filter 返回过滤后的新数组。
  - question: await 关键字的作用是？
    options:
      - 让整个程序暂停阻塞，CPU 停止工作
      - 等待一个 Promise 完成，拿到结果后继续执行后面的代码
      - 把函数变成同步函数，不再返回 Promise
      - 立即抛出异常
    answer: 1
    explanation: await 暂停当前 async 函数的执行，等 Promise 完成后恢复，期间不会阻塞主线程——其他代码（如页面渲染）照常运行。
flashcards:
  - front: let 与 const
    back: 声明变量的两种方式。const 不可重新赋值（对象内容仍可改），let 可以，两者都有块级作用域。
  - front: 箭头函数
    back: (x) => x * 2 的简写函数语法，并且不绑定自己的 this，常用于回调。
  - front: 高阶函数
    back: 接收函数作为参数或返回函数的函数，如 map、filter、reduce。
  - front: Promise
    back: 代表「未来才会有结果」的对象，有 pending、fulfilled、rejected 三种状态。
  - front: async/await
    back: 用同步的写法处理异步：async 函数内可以用 await 等待 Promise 的结果。
  - front: 事件循环（Event Loop）
    back: JS 单线程调度机制——主线程执行同步代码，异步任务完成后其回调排队等待执行。
---

## 三件套之一：变量

```javascript
const name = '深学'      // 不可重新赋值
let count = 0            // 可以重新赋值
count = count + 1
```

优先用 `const`，只有确实需要重新赋值时才用 `let`——这是现代 JS 的默认习惯。

## 三件套之二：函数与数组方法

```javascript
// 箭头函数
const double = (x) => x * 2

// map：一一变换，返回新数组
const scores = [80, 92, 75]
const doubled = scores.map((s) => s * 2)      // [160, 184, 150]

// filter：按条件筛选
const passed = scores.filter((s) => s >= 80)  // [80, 92]

// reduce：汇总成一个值
const total = scores.reduce((sum, s) => sum + s, 0)  // 247
```

`map`、`filter`、`reduce` 是函数式编程三件宝，React 里天天见。

## 三件套之三：异步

网页最常见异步操作是网络请求：

```javascript
async function loadStats() {
  try {
    const res = await fetch('/api/stats')   // 等待响应
    const data = await res.json()           // 等待解析 JSON
    console.log('学习人数：', data.learners)
  } catch (err) {
    console.error('请求失败：', err)
  }
}
```

`await` 只在 `async` 函数里可用。它「等待」时并不卡死页面——底层是事件循环在调度：主线程继续干别的，结果到了再回来执行后续代码。

## 为什么异步如此重要

JS 是单线程语言，同一时刻只能做一件事。如果 `fetch` 像 C 语言一样死等，页面就会冻结。**事件循环 + Promise** 让单线程也能高效处理成百上千个并发请求，这是理解 Node.js 与浏览器行为的地基。

> 💡 **动手建议**：打开浏览器控制台（F12），直接输入 `await fetch('https://api.github.com/zen')` 体验异步。
