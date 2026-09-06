---
title: Agent：会使用工具的 AI
order: 4
minutes: 10
summary: LLM 只会输出文字，Agent 让它学会「思考 → 调用工具 → 观察结果 → 继续」，完成真正的任务。
quiz:
  - question: Agent 与普通 LLM 对话的核心区别是什么？
    options:
      - Agent 的模型参数量一定更大
      - Agent 能调用工具、观察结果并循环迭代，直到完成任务
      - Agent 不需要提示词
      - Agent 的回答永远不会有幻觉
    answer: 1
    explanation: Agent = LLM + 工具 + 循环。模型可以决定调用搜索、代码执行等工具，读回结果后继续推理，多步闭环完成「回答问题」做不到的任务。
  - question: ReAct 模式的三个基本环节是？
    options:
      - 预训练、微调、部署
      - 思考（Reason）、行动（Act）、观察（Observe）
      - 输入、输出、缓存
      - 切块、检索、生成
    answer: 1
    explanation: ReAct 让模型交替进行「思考该做什么 → 执行动作（调用工具）→ 观察结果」，像人一样边想边做，是 Agent 最经典的循环范式。
  - question: 模型「调用工具」时，实际上发生了什么？
    options:
      - 模型直接在服务器上执行了代码
      - 模型输出一段结构化的调用请求（如 JSON），由外部程序执行后把结果回传
      - 模型联网下载了新模型权重
      - 工具结果会被永久写进模型参数
    answer: 1
    explanation: 模型本身只会生成文本——所谓工具调用，是它输出一段约定格式的请求（工具名 + 参数），由外部框架负责真正执行并把结果拼回上下文。
flashcards:
  - front: Agent（智能体）
    back: 以 LLM 为大脑、加上工具与循环控制的系统，能感知结果、迭代行动，自主完成多步任务。
  - front: 工具调用（Tool Calling）
    back: 模型按约定格式（通常是 JSON）输出「工具名 + 参数」，由外部程序执行并把结果回传给模型。
  - front: ReAct
    back: Reason + Act 的循环范式：思考 → 行动 → 观察 → 再思考，直到任务完成。
  - front: 观察（Observation）
    back: 工具执行后返回给模型的结果，会拼进上下文，作为下一步推理的依据。
  - front: 规划（Planning）
    back: Agent 把复杂目标拆解成一系列子步骤的能力，通常也由提示词引导模型自己完成。
  - front: 记忆（Memory）
    back: Agent 存储历史对话、中间结果与用户偏好的机制，分短期（上下文内）与长期（外部存储）。
---

## 模型的手脚被「捆住」了

LLM 再聪明，它本质上只会一件事：输出文字。问它「现在北京几点」，它要么瞎猜，要么承认不知道。它不能搜索、不能算大数、不能操作文件——**除非我们给它工具**。

**Agent（智能体）** = LLM（大脑）+ 工具（手脚）+ 循环（工作流）。

## ReAct：像人一样边想边做

一个经典 ReAct 循环长这样：

```text
任务：查一下 DeepTutor 项目有多少 Star，并换算成 3% 是多少。

Thought（思考）：我需要先查到 Star 数，再算 3%。
Action（行动）：调用工具 web_search("HKUDS DeepTutor github stars")
Observation（观察）：搜索结果约 20k stars。
Thought：拿到 20k，接下来用 calculator 计算 20000 * 0.03。
Action：调用工具 calculator("20000 * 0.03")
Observation：600
Thought：任务完成，输出最终答案。
Final Answer：DeepTutor 约 2 万 Star，其 3% 约为 600。
```

## 工具调用的真相

模型并没有「亲手」执行任何东西。真实流程是：

```text
模型输出 → {"tool": "calculator", "args": {"expr": "20000 * 0.03"}}
   ↓
外部框架解析这段 JSON → 真正执行计算 → 把结果 "600" 拼回上下文
   ↓
模型看到 Observation → 继续下一步思考
```

框架就是在这里实现「安全围栏」：哪些工具可用、参数是否合法、要不要人工确认。

## 从 DeepTutor 看 Agent 的形态

HKUDS 的 DeepTutor 就是一个典型的学习 Agent：它把辅导、测验、深度研究、可视化整合在一个工作区里，背后是统一的 Agent 循环——按需调用知识库检索（RAG）、联网搜索、代码执行等工具，并维护跨会话的学习记忆。本站把这些「学习模式」静态化成了路线图、测验和抽认卡；而 DeepTutor 的动态部分，正是这一章的 Agent 机制。

## 两条安全提醒

1. **最小权限**：给 Agent 的工具只开放必要能力，代码执行要隔离沙箱。
2. **人工确认**：涉及花钱、发消息、删数据的高危动作，必须加一层人工审批。

> 💡 **一句话总结**：Agent 之所以强，不是因为模型变聪明了，而是它第一次拥有了「行动 → 看结果 → 调整」的闭环。
