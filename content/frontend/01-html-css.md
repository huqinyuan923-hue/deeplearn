---
title: HTML 与 CSS：网页的骨架与皮肤
order: 1
minutes: 9
summary: 语义化标签搭出文档结构，盒模型与 Flexbox 控制布局，看懂一个网页的基本构成。
quiz:
  - question: 使用语义化标签（如 header、nav、article）的主要好处是什么？
    options:
      - 浏览器渲染速度一定提升十倍
      - 结构更清晰，利于无障碍访问与搜索引擎理解
      - 可以不写 CSS 也有好看样式
      - 文件体积一定更小
    answer: 1
    explanation: 语义化让标签本身表达含义——屏幕阅读器能识别导航区，搜索引擎能理解页面结构，代码可维护性也更高。它不直接决定渲染速度或体积。
  - question: CSS 盒模型中，margin 和 padding 的区别是？
    options:
      - 没有区别，可以互换
      - padding 在边框内侧撑开内容与边框的距离，margin 在边框外侧推开与相邻元素的距离
      - margin 控制宽度，padding 控制高度
      - padding 只能用于图片
    answer: 1
    explanation: 盒模型从内到外是内容、padding（内边距）、border（边框）、margin（外边距）。padding 向内留白，margin 向外留空。
  - question: Flexbox 布局中，justify-content 和 align-items 分别控制什么方向？
    options:
      - 前者控制交叉轴，后者控制主轴
      - 前者控制主轴方向的对齐，后者控制交叉轴方向的对齐
      - 两者都只控制水平方向
      - 前者控制字号，后者控制行高
    answer: 1
    explanation: Flex 有主轴与交叉轴之分。默认主轴是水平方向，justify-content 管主轴对齐（如居中、两端对齐），align-items 管交叉轴对齐。
flashcards:
  - front: HTML
    back: 超文本标记语言，用标签描述网页的结构与内容，是页面的「骨架」。
  - front: 语义化标签
    back: header、nav、main、article、footer 等自带含义的标签，利于无障碍与 SEO。
  - front: 盒模型
    back: 每个元素都是内容 + padding 内边距 + border 边框 + margin 外边距组成的盒子。
  - front: Flexbox
    back: 一维弹性布局方案，用 display flex 让子元素沿主轴排列，轻松实现居中与自适应。
  - front: CSS 选择器
    back: 选中元素并应用样式的方法，如 .class、#id、tag、后代选择器 div p。
  - front: 响应式设计
    back: 用媒体查询（@media）与弹性单位让同一页面适配手机、平板与桌面。
---

## 一个网页的最小结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>我的第一个网页</title>
  </head>
  <body>
    <header><h1>深学 DeepLearn</h1></header>
    <main>
      <article>
        <h2>今天学到了什么</h2>
        <p>HTML 描述结构，CSS 负责外观。</p>
      </article>
    </main>
    <footer>© 2026 深学</footer>
  </body>
</html>
```

HTML 是**骨架**：`header`、`main`、`footer` 这些语义化标签告诉浏览器和搜索引擎「这是一篇文章的头部/主体/页脚」，而不是一堆积木式的 div。

## CSS：给骨架穿上皮肤

CSS 通过**选择器**选中元素并应用样式：

```css
h1 {
  color: #4f46e5;      /* 字色 */
  font-size: 32px;     /* 字号 */
}

.card {                /* 选中 class 为 card 的元素 */
  padding: 16px;       /* 内边距 */
  border-radius: 12px; /* 圆角 */
}
```

理解一切布局的钥匙是**盒模型**：每个元素都是一个盒子，从内到外依次是 `内容 → padding（内边距）→ border（边框）→ margin（外边距）`。

## Flexbox：现代布局的标配

居中这个经典难题，用 Flex 三行解决：

```css
.container {
  display: flex;                 /* 启用弹性布局 */
  justify-content: center;       /* 主轴（水平）居中 */
  align-items: center;           /* 交叉轴（垂直）居中 */
}
```

再加一条媒体查询，就能做响应式：

```css
@media (max-width: 640px) {
  .sidebar { display: none; }    /* 手机上隐藏侧栏 */
}
```

> 💡 **动手建议**：在浏览器任意页面按 F12，用 Elements 面板查看盒模型与样式，是最快的学习方式。
