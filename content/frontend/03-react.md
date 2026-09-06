---
title: React 入门：组件化思考
order: 3
minutes: 10
summary: 用函数 + JSX 描述界面，用 props 传递数据，用 state 驱动更新——声明式 UI 的思维方式。
quiz:
  - question: React 组件的本质是什么？
    options:
      - 一种浏览器内置的自定义标签
      - 一个返回 JSX 的 JavaScript 函数
      - 一个 CSS 类名
      - 一个必须用 class 定义的对象
    answer: 1
    explanation: 函数组件就是一个接收 props、返回 JSX 描述的普通函数。React 负责把它渲染成真实 DOM 并在数据变化时更新。
  - question: 调用 useState 的 setter（如 setCount(5)）之后会发生什么？
    options:
      - 直接修改真实 DOM 的文本
      - React 更新状态值并重新执行该组件函数，按需更新页面
      - 刷新整个浏览器页面
      - 什么都不会发生，需要手动刷新
    answer: 1
    explanation: state 变化触发组件函数重新执行（重渲染），React 对比前后差异，只把必要的部分更新到真实 DOM。
  - question: 关于 props，下列说法正确的是？
    options:
      - 子组件内可以直接修改 props 的值
      - props 是父组件传给子组件的只读数据，单向流动
      - props 只能传字符串
      - props 修改后页面会自动刷新
    answer: 1
    explanation: props 只读且单向（父 → 子），子组件想改数据应通过回调通知父组件，或改用自己的 state。
flashcards:
  - front: 组件（Component）
    back: 返回 JSX 的函数，是 React 界面的最小复用单元，可像积木一样组合。
  - front: JSX
    back: 在 JS 里写类 HTML 语法的扩展语法，最终被编译成函数调用，描述「界面长什么样」。
  - front: State（状态）
    back: 组件内部的记忆。state 变化会触发组件重新渲染，由 useState 创建。
  - front: Props（属性）
    back: 父组件传给子组件的只读参数，数据自上而下单向流动。
  - front: useEffect
    back: 处理副作用的钩子，如请求数据、订阅事件，第二个参数是依赖数组。
  - front: 声明式 UI
    back: 只描述「界面应该是什么样」，由框架负责把变化应用到 DOM，而非手动操作节点。
---

## 换一种思维方式：UI = f(state)

传统写法是拿到数据后手动 `document.querySelector` 改 DOM；React 的思路完全不同——**界面是状态的函数**：你只管描述「状态长什么样」，数据一变，React 自动算出哪里要更新。

## 第一个组件

```jsx
function Counter() {
  const [count, setCount] = useState(0)   // 声明状态：默认 0

  return (
    <button onClick={() => setCount(count + 1)}>
      点了 {count} 次
    </button>
  )
}
```

读法：`Counter` 是一个函数，返回一段 JSX（类 HTML 的描述）。点击按钮 → `setCount` 更新状态 → React 重新执行这个函数 → 页面上的数字更新。

## props：从父到子的数据流

```jsx
function ChapterCard({ title, minutes }) {   // 解构 props
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>约 {minutes} 分钟</p>
    </div>
  )
}

// 使用：<ChapterCard title="React 入门" minutes={10} />
```

props 是只读的，数据永远从父组件流向子组件；子组件想「改」，就调用父组件传下来的回调函数。

## useEffect：组件外的世界

请求数据、操作定时器这类「副作用」放进 `useEffect`：

```jsx
useEffect(() => {
  fetch('/api/stats').then((r) => r.json()).then(setStats)
}, [])   // 依赖数组为空 = 只在组件挂载时执行一次
```

## 组件树

整个页面是一棵组件树：`Layout` 包着 `Nav` 和 `Page`，`Page` 里又渲染一列 `ChapterCard`。本站顶部的导航、路线图节点、抽认卡，全是这样一个个函数组件拼出来的。

> 💡 **动手建议**：访问 react.dev 的在线沙箱，把上面的 Counter 抄一遍，亲手点几下感受「状态驱动界面」。
