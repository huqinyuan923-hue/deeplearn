---
title: Python 起步：变量、类型与流程控制
order: 1
minutes: 9
summary: 五分钟写出第一段 Python——动态类型、f-string 格式化，以及用缩进表达逻辑。
quiz:
  - question: Python 用什么来划分代码块（如 if、for 的内部）？
    options:
      - 大括号 {}
      - 分号加换行
      - 统一的缩进（通常 4 个空格）
      - end 关键字
    answer: 2
    explanation: 缩进就是 Python 的语法——同一代码块必须缩进相同宽度，社区约定 4 个空格。少写缩进是新手最常见的报错来源。
  - question: f-string 的作用是？
    options:
      - 把字符串加密
      - 在字符串里直接嵌入变量或表达式，如 f'共 {n} 章'
      - 把字符串变成浮点数
      - 固定字符串长度不可变
    answer: 1
    explanation: f-string 在字符串前加 f，花括号里可以放变量甚至表达式，是 Python 3.6+ 最推荐的字符串格式化方式。
  - question: 以下哪行代码会出错？
    options:
      - age = 18
      - age = '十八'
      - age = 18 + '岁'
      - age = 18.5
    answer: 2
    explanation: Python 是动态类型（变量可以指向任何类型），但数字与字符串相加没有定义——会抛出 TypeError。需要用 str(18) 或 f'{18}岁' 转换。
flashcards:
  - front: 动态类型
    back: 变量声明时不必指定类型，age = 18 之后 age = '十八' 也合法，类型跟着值走。
  - front: f-string
    back: f'共 {count} 章' 这种格式化写法，花括号里可放任意表达式，简洁可读。
  - front: 缩进即语法
    back: Python 用缩进划分代码块，约定 4 空格；混用 Tab 与空格会报错。
  - front: 解释执行
    back: Python 由解释器逐行执行，无需编译，改完代码立刻能跑，适合快速实验。
  - front: REPL
    back: 交互式解释器。终端输入 python 即可逐行输入代码立刻看结果，是试语法的好工具。
  - front: 列表切片
    back: nums[1:4] 取下标 1 到 3 的元素（含头不含尾），是 Python 极常用的语法。
---

## 第一段代码

```python
name = '深学'
chapters = 15
hours = 2.5

print(f'{name} 共 {chapters} 章，约 {hours} 小时读完')
# 输出：深学 共 15 章，约 2.5 小时读完
```

注意三件事：变量**不用声明类型**；字符串可以用**单引号或双引号**；`f'...'` 里花括号能直接嵌变量，这就是 f-string。

## 流程控制：缩进即语法

```python
scores = [80, 92, 75, 60]

for s in scores:
    if s >= 80:
        print(f'{s} 通过 ✅')
    else:
        print(f'{s} 再练练 💪')

print('循环结束')
```

`if`、`for` 后面跟冒号，内部代码统一缩进 4 个空格；缩进结束，代码块就结束。不需要大括号，也不需要 `end`。

## 常用运算与转换

```python
10 / 3      # 3.3333333333333335  （除法永远是浮点）
10 // 3     # 3                   （整除）
10 % 3      # 1                   （取余）
2 ** 10     # 1024                （幂运算）

int('42')       # 字符串 → 整数
str(3.14)       # 数字 → 字符串
type(3.14)      # <class 'float'>
```

## while 与 break

```python
count = 0
while count < 3:
    print('打卡第', count + 1, '天')
    count += 1
```

> 💡 **动手建议**：装好 Python 后在终端输入 `python` 进入 REPL，把本页代码逐行敲一遍——Python 的即时反馈是所有语言里最友好的。
