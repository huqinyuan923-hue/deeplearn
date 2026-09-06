---
title: 函数与模块：让代码可复用
order: 3
minutes: 9
summary: def 定义函数、参数与返回值、import 使用模块——从「脚本」走向「工程」的门槛。
quiz:
  - question: 函数 return a, b 返回的是什么？
    options:
      - 只返回 a，b 被忽略
      - 一个元组 (a, b)，可以用 x, y = f() 解包
      - 两个独立的返回值需要两次调用
      - 语法错误
    answer: 1
    explanation: Python 的多返回值本质是返回一个元组，调用方用 x, y = f() 解包接收——「返回多个值」是元组的经典应用。
  - question: 以下哪种默认参数写法是有名的「坑」？
    options:
      - def f(x=0)
      - def f(items=[])（默认值是可变对象）
      - def f(name='小明')
      - def f(*args)
    answer: 1
    explanation: 默认值只在函数定义时创建一次——所有调用共享同一个列表，append 会跨调用累积。正确写法是 items=None，函数体内再判断为 None 时赋空列表。
  - question: "if __name__ == '__main__': 这行代码的作用是？"
    options:
      - 定义主线程
      - 只有直接运行本文件时才执行其下的代码，被 import 时不执行
      - 让程序跑得更快
      - 声明 Python 版本
    answer: 1
    explanation: import 时模块的 __name__ 是模块名，直接运行时才是 '__main__'。用它区分「当脚本运行」与「被当作库导入」两种场景。
flashcards:
  - front: def
    back: 定义函数的关键字。函数是带名字的可复用代码块，用 return 返回结果。
  - front: 默认参数
    back: def f(x=0)——不传参时用默认值。默认值避免用可变对象（列表/字典），以防跨调用共享。
  - front: '*args 与 **kwargs'
    back: '*args 收集多余的位置参数成元组，**kwargs 收集多余的关键字参数成字典。'
  - front: 模块（Module）
    back: 一个 .py 文件就是一个模块，import math 后用 math.sqrt(2) 使用其中的功能。
  - front: 包（Package）
    back: 带目录结构的模块集合，目录里通常有 __init__.py，用 from pkg import mod 导入。
  - front: __name__ == '__main__'
    back: 判断文件是被直接运行还是被导入，常用于把「演示代码」放在 main 分支里。
---

## 定义函数：给代码起个名字

```python
def study_minutes(chapters, minutes_each=9):
    """计算一条学习线需要多少分钟。"""     # 文档字符串
    return chapters * minutes_each

print(study_minutes(15))          # 135 —— 不传就用默认值 9
print(study_minutes(15, 5))       # 75
```

三要素：`def` + 参数 + `return`。没有 return 的函数返回 `None`。

## 返回多个值？其实是元组

```python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([3, 1, 4, 1, 5])    # 解包：low=1, high=5
```

## 可变参数：*args 与 **kwargs

```python
def log(level, *tags, **extra):
    print(level, tags, extra)

log('INFO', 'api', 'slow', cost=1.2)
# INFO ('api', 'slow') {'cost': 1.2}
```

## 模块：站在标准库肩膀上

```python
import math
math.sqrt(2)              # 1.4142135623730951

from datetime import date
date.today()              # 今天的日期

import random
random.choice(['复习', '测验', '打卡'])   # 随机挑一个学习任务
```

一个 `.py` 文件就是一个模块；把相关模块放进文件夹就成了包。**不重复造轮子**——先查标准库，再查第三方库。

## 主模块判断

```python
def add(a, b):
    return a + b

if __name__ == '__main__':
    print(add(2, 3))    # 只有直接运行本文件才会执行
```

这样同一份代码既可以当脚本跑，也可以被别人 `import` 而不触发演示输出。

> 💡 **进阶提示**：默认参数陷阱（`def f(items=[])`）是面试高频题——默认值只创建一次，可变默认值会被所有调用共享。
