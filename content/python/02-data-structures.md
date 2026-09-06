---
title: 列表、字典与集合：组织你的数据
order: 2
minutes: 9
summary: 四大内置容器——list、tuple、dict、set——各自的性格与最常用的操作。
quiz:
  - question: 需要按「键名」快速查找值（如用学号查姓名），应选用哪个容器？
    options:
      - list 列表
      - dict 字典
      - tuple 元组
      - str 字符串
    answer: 1
    explanation: 字典按哈希表实现，按键查找平均是 O(1)——无论存多少条数据，names['S001'] 都是瞬间完成。列表查找需要遍历，是 O(n)。
  - question: tuple 和 list 最关键的区别是？
    options:
      - tuple 只能存数字
      - tuple 创建后不可修改，list 可以增删改
      - tuple 的速度比 list 慢得多
      - 没有区别，写法不同而已
    answer: 1
    explanation: 元组是不可变列表——创建后不能增删改，适合表达「固定的一组值」（如坐标）；也因为不可变，可以作为字典的键。
  - question: "['a', 'b', 'a', 'c'] 想快速去掉重复项，最简洁的做法是？"
    options:
      - list.sort()
      - set(['a', 'b', 'a', 'c']) 或 set(lst)
      - lst.remove('a')
      - 用 sum() 统计
    answer: 1
    explanation: 集合 set 天然不含重复元素，set(lst) 一行完成去重（顺序不保证保留）。
flashcards:
  - front: list 列表
    back: 有序可变容器，append 添加、pop 弹出、lst[0] 取值，最常用的容器。
  - front: dict 字典
    back: 键值对容器，按键查找平均 O(1)；keys()、values()、items() 三个视图方法高频使用。
  - front: tuple 元组
    back: 不可变列表，写法 (1, 2)。适合固定的成组数据，可作为字典的键。
  - front: set 集合
    back: 无序、不重复的容器，支持交并差运算，set(lst) 是最快的去重方式。
  - front: 切片
    back: lst[1:4] 含头不含尾；lst[::-1] 反转序列；切片对字符串和列表都有效。
  - front: 推导式
    back: "[x * 2 for x in nums if x > 0]——一行完成「筛选 + 变换」，Pythonic 的标志。"
---

## 四大容器，四种性格

```python
languages = ['Python', 'JavaScript', 'Go']     # list：有序、可变
point = (31.23, 121.47)                        # tuple：有序、不可变
user = {'name': '小明', 'level': 3}             # dict：键值对
tags = {'python', ' beginner', 'python'}       # set：不重复
```

## list：最常用的容器

```python
todo = ['学 Python', '写笔记']
todo.append('部署网站')          # 尾部添加
todo.pop()                       # 尾部取出
todo[0]                          # '学 Python'（下标从 0 开始）
todo[::-1]                       # 反转切片
len(todo)                        # 长度
```

## dict：按键取值，快到 O(1)

```python
scores = {'语文': 92, '数学': 88}
scores['英语'] = 95                # 新增
scores['数学']                     # 88 —— 无论字典多大，查找都是瞬间
scores.get('物理', 0)              # 安全取值，不存在返回默认值 0

for subject, score in scores.items():
    print(f'{subject}: {score}')
```

需要「按编号查名字」「按 ID 查配置」这类映射关系时，第一反应就该是 dict。

## set：去重与集合运算

```python
learned = {'python', 'html'}
roadmap = {'python', 'html', 'react', 'rust'}

learned & roadmap   # 交集 {'python', 'html'}：已学且在路线内
roadmap - learned   # 差集 {'react', 'rust'}：还没学的
```

## 推导式：Pythonic 的一行流

```python
nums = [1, 2, 3, 4, 5]
squares = [n * n for n in nums if n % 2 == 1]   # [1, 9, 25]
id2name = {i: f'同学{i}' for i in range(3)}
```

> 💡 **选型口诀**：有序可变用 list，固定不变用 tuple，按键查找用 dict，天然去重用 set。
