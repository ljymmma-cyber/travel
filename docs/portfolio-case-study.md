# AI Travel Planner Portfolio Case Study

## Executive Summary

AI Travel Planner 是一个面向第一次自由行用户的 AI Native 旅行规划产品。项目从竞品分析、用户研究、PRD、UX、AI Workflow、技术架构，到 MVP 开发与产品验证，完整模拟了一个 AI 产品从 0 到 1 的真实过程。

一句话总结：

> AI Travel Planner 不是让 AI 生成攻略，而是让 AI 帮用户完成旅行决策，并把结果变成可执行、可修改、可保存的行程资产。

## 1. 为什么想到做这个产品？

旅行规划是一个典型的“信息很多，但决策很难”的问题。

用户并不缺旅游内容。Google Maps、TripAdvisor、小红书、YouTube、OTA 平台和 ChatGPT 都能提供大量建议。但第一次去陌生城市的自由行用户仍然会遇到几个问题：

- 收藏了很多地点，却不知道每天怎么排。
- 攻略内容互相冲突，难以判断哪个适合自己。
- 地图、预算、天气、营业时间、交通方式分散在不同工具中。
- ChatGPT 能给出初稿，但结果常常不能直接执行。
- 修改计划时，用户不得不重新问一遍或手动修补。

这个项目的出发点是：如果 AI 产品真的要解决旅行规划，就不能只是聊天或生成内容，而要帮用户完成从需求输入、计划生成、计划表达、局部修改、保存复用的完整闭环。

## 2. 为什么选择这个用户？

核心用户是 22-35 岁、第一次去陌生城市或国家、喜欢自由行、愿意使用数字产品但不想花大量时间查攻略的人。

选择他们的原因：

| Reason | Explanation |
| --- | --- |
| 痛点强 | 第一次去陌生城市时，不确定性最高。 |
| AI 接受度高 | 年轻用户更愿意尝试 AI 工具。 |
| 需求明确 | 他们需要具体行程，而不是泛泛推荐。 |
| 决策链路长 | 目的地、预算、路线、餐饮、交通、住宿都需要权衡。 |
| 面试展示价值高 | 该场景能体现 AI PM 对用户、AI、UX 和系统设计的综合理解。 |

为什么不是所有旅行用户？

- 商务旅行用户更关注效率和固定日程，不是自由探索。
- 深度旅行达人已有成熟方法，AI 的边际价值较低。
- 跟团用户不负责行程规划，需求不匹配。
- 只订机酒的用户更适合 OTA，不一定需要 AI 行程规划。

## 3. 做了哪些用户研究？

用户研究围绕“旅行规划为什么耗时”展开，而不是只问用户想要什么功能。

### Research Scope

| Area | Research Question |
| --- | --- |
| Planning Behavior | 用户从哪里开始规划？如何收集信息？ |
| Decision Pain | 哪些决策最难？路线、预算、交通、兴趣如何取舍？ |
| Tool Switching | 用户为什么在 ChatGPT、地图、攻略、表格之间切换？ |
| Trust | 用户怎样判断 AI 生成的计划是否靠谱？ |
| Modification | 用户什么时候会修改计划？希望 AI 怎么改？ |

### Key Findings

| Finding | Product Implication |
| --- | --- |
| 用户不会写高质量 prompt | 需要结构化输入，而不是空白聊天框。 |
| 用户想要的是“能不能照着走” | 输出必须是 Timeline，而不是长文本攻略。 |
| 用户不信任黑盒 AI | 需要解释、来源、预算、路线和可修改能力。 |
| 修改比首次生成更真实 | Partial Replanning 是 AI Native 体验核心。 |
| 保存和继续编辑很重要 | Workspace 是产品闭环，而不是附加功能。 |

## 4. 为什么这样设计？

产品设计遵循一个原则：Less Chat, More Action。

### Design Decisions

| Decision | Why |
| --- | --- |
| 用结构化 Planner，而不是聊天框 | 新手用户不知道如何表达完整旅行需求。结构化输入能提高生成质量。 |
| 用 Timeline，而不是 Markdown 行程 | Timeline 更接近真实执行场景，可展示时间、地点、预算、交通、解释。 |
| 用 AI Tips，而不是事后纠错 | 在生成前发现预算过低、天数过短、兴趣冲突，可以提高首次输出质量。 |
| 用 Partial Replanning，而不是重新生成 | 真实用户通常只想改一部分，重生成会破坏已满意内容。 |
| 用 Workspace 和版本历史 | 用户需要保存、找回、比较、恢复计划，AI 修改必须可逆。 |

## 5. AI 为什么这样介入？

AI 不应该负责所有事情。这个项目把 AI 和传统程序的职责拆开。

| Layer | AI Responsibility | Program Responsibility |
| --- | --- | --- |
| Requirement Understanding | 理解目的地、兴趣、约束、隐性偏好 | 表单校验、字段标准化 |
| Planning | 生成符合兴趣和约束的行程结构 | Schema 校验、预算计算、状态管理 |
| Explanation | 解释为什么推荐某个地点或安排 | 展示、折叠、埋点 |
| Modification | 根据用户意图生成局部 JSON Patch | 校验 patch scope、锁定项、undo/redo |
| Trust | 给出理由、替代方案、不确定性 | 版本历史、diff、错误恢复 |

核心判断：

- LLM 擅长理解开放需求、生成候选方案、解释权衡。
- 程序擅长校验、约束、状态、持久化、权限和可重复执行。
- AI Native 产品的关键不是“调用模型”，而是设计 AI 与软件系统之间的边界。

## 6. 遇到了哪些问题？

| Problem | What It Revealed | Product Response |
| --- | --- | --- |
| 表单字段很多，可能显得重 | 个性化和低门槛之间有张力 | 用默认值、模板、Smart Suggestion 降低负担 |
| AI 输出可能不稳定 | 旅行计划需要结构化和可执行 | 设计 JSON Schema、Validator、Repair Strategy |
| 用户害怕 AI 乱改 | AI 修改会破坏信任 | 用 JSON Patch、Diff、Lock、Undo/Redo 控制范围 |
| Timeline 信息密度高 | 旅行计划天然复杂 | 用 Day Card、Activity Card、Budget Card 分层表达 |
| 保存闭环容易被忽略 | 没有 Workspace 就不是长期工具 | Sprint 5 加入持久化和版本历史 |

## 7. 如何验证产品？

产品验证不是只看 DAU，而是看用户是否把 AI 输出当成真实计划。

### Core Validation Questions

| Question | Metric |
| --- | --- |
| 用户能否快速生成计划？ | Time to First Plan, Planner Completion Rate |
| 用户是否认可 AI 输出？ | Accepted Plan Rate, Retry Rate |
| 用户是否认真查看？ | Timeline Interaction Depth |
| 用户是否需要修改？ | Partial Replanning Rate |
| 修改是否可信？ | Diff Accepted Rate, Undo Rate |
| 用户是否保存继续使用？ | Save Rate, D7 Trip Reopen Rate |

### Product Validation Assets

- 50+ event tracking plan.
- PM dashboard design.
- AI evaluation metrics.
- User interview script.
- Usability test tasks.
- A/B testing plan.
- Risk matrix and roadmap.

## 8. 学到了什么？

### Product Learnings

- AI 产品不是把聊天框放进传统产品，而是重新设计用户如何表达需求、如何接收结果、如何修改结果。
- 对普通用户来说，结构化输入往往比自由 prompt 更友好。
- AI 的价值不只在首次生成，更在后续修改、解释和持续协作。
- Trust UX 是 AI 产品的核心，不是锦上添花。
- 一个能打动用户的 AI 产品，需要闭环：输入、生成、执行、修改、保存、复用。

### PM Learnings

- 面试中最重要的不是“我做了哪些功能”，而是能说明每个设计选择背后的用户问题、AI 边界和验证方式。
- 对 AI 产品经理来说，懂 Prompt 不够，还要懂结构化输出、失败策略、评估指标和 Human-in-the-loop。
- 好的 portfolio 项目应该展示从问题定义到产品验证的全过程。

## 9. 下一步怎么迭代？

| Stage | Focus | Why |
| --- | --- | --- |
| V1 | 接入真实地图、路线、天气、营业时间 | 提高计划可执行性和信任 |
| V2 | 分享、协作、多人偏好投票 | 旅行计划通常不是一个人的决策 |
| V3 | Booking handoff、Calendar、MCP、实时 Agent | 从规划工具升级为旅行执行助手 |

## 10. Interview Positioning

这个项目在面试中应被定位为：

> 一个完整的 AI Native 产品案例，展示我如何从用户痛点出发，设计 AI 介入点，定义产品范围，拆解 AI 与系统职责，并用 MVP 和产品验证方法证明价值。

面试官应该看到的能力：

- 用户研究能力。
- 竞品和市场判断。
- AI 产品设计能力。
- PRD 和 UX 表达能力。
- 技术架构理解。
- 端到端项目推进。
- 指标和增长验证意识。
