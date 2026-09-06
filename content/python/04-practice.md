---
title: 实战：文件、异常与标准库
order: 4
minutes: 10
summary: 用 with 安全读写文件、用 try/except 接住错误，再把 JSON 与 pathlib 组合成一个真实小脚本。
quiz:
  - question: "用 with open(...) as f: 读文件，相比手动 open 后 close，好处是？"
    options:
      - 读取速度一定更快
      - 无论中间是否报错，代码块结束时文件都会被自动关闭
      - 可以同时打开更多文件
      - 不需要指定文件路径
    answer: 1
    explanation: with 是上下文管理器——离开代码块时自动调用 close（哪怕中途抛异常），避免「忘记关文件」导致的资源泄漏。
  - question: 处理「用户输入的可能不是数字」这类可预期错误，正确的姿势是？
    options:
      - 用 if 把所有情况穷举完
      - 用 try/except ValueError 捕获并给出友好提示
      - 忽略它，让程序崩溃
      - 捕获所有异常并静默吞掉（bare except 加 pass）
    answer: 1
    explanation: 对可预见的异常精确捕获（except ValueError），转成用户能理解的提示；静默吞掉所有异常会让真正的 Bug 无迹可寻。
  - question: json.loads 与 json.dumps 的分工是？
    options:
      - loads 读文件，dumps 写文件
      - loads 把 JSON 字符串解析成 Python 对象，dumps 把 Python 对象序列化成 JSON 字符串
      - loads 加载数据库，dumps 导出数据库
      - 两者等价，随意使用
    answer: 1
    explanation: 记忆技巧——s 是 string：loads 从字符串「装进」对象（反序列化），dumps 把对象「倒出」成字符串（序列化）。与文件交互时再配合 open 或 json.load/json.dump。
flashcards:
  - front: with 语句
    back: 上下文管理器语法，离开代码块自动清理资源（关文件、释放锁），等价于 finally 里 close。
  - front: try/except
    back: 捕获并处理异常。精确捕获具体异常类型，except 里给出恢复或提示逻辑。
  - front: finally
    back: 无论是否发生异常都会执行的代码块，常用于兜底清理。
  - front: JSON
    back: 轻量的通用数据交换格式。json.loads 解析成 Python 对象，json.dumps 序列化成字符串。
  - front: pathlib
    back: 面向对象的路径库，Path('data') / 'a.txt' 拼路径跨平台无忧，比拼接字符串安全。
  - front: 虚拟环境
    back: 用 python -m venv .venv 创建的独立依赖空间，每个项目装各自的第三方库，互不污染。
---

## 读写文件：with 是标准姿势

```python
with open('notes.txt', 'w', encoding='utf-8') as f:
    f.write('今天学完了 Python 四章\n')

with open('notes.txt', 'r', encoding='utf-8') as f:
    for line in f:
        print(line.strip())
```

离开 `with` 代码块，文件自动关闭——哪怕中间抛了异常。**永远写 encoding='utf-8'**，Windows 下默认编码是坑。

## 异常处理：优雅地接住错误

```python
def parse_score(text):
    try:
        return int(text)
    except ValueError:
        print(f'「{text}」不是合法分数，按 0 分处理')
        return 0
    finally:
        print('（本次解析结束）')
```

原则：**精确捕获、给出出路**。`except:` 后面裸 `pass` 是大忌——真正的错误会被悄悄吞掉。

## 实战小脚本：统计学习笔记

把本章的知识全部用上——统计 content 目录里每条学习线的章节数，并导出 JSON：

```python
from pathlib import Path
import json

root = Path('content')
result = {}

for track_dir in root.iterdir():
    if track_dir.is_dir():
        md_files = sorted(track_dir.glob('*.md'))
        result[track_dir.name] = len(md_files)

print(json.dumps(result, ensure_ascii=False, indent=2))
# {"ai": 4, "frontend": 4, "python": 4, "cs": 3}

Path('stats.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
)
```

短短十行用到了：`pathlib` 遍历目录、`glob` 匹配文件、`json` 序列化、`dict` 组织数据——这就是 Python 的日常形态。

## 虚拟环境：装库不污染全局

```bash
python -m venv .venv          # 创建
source .venv/bin/activate     # 激活（Windows 用 .venv\Scripts\activate）
pip install requests          # 装在项目自己的环境里
```

> 💡 **练习任务**：把上面的统计脚本扩展成「统计每条线总共多少道测验题」——提示：解析 frontmatter 可以用第三方库 python-frontmatter。
