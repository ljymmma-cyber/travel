# AI Travel Planner Interview FAQ and STAR Answers

## Part 1: Interview FAQ

### 1. 为什么不用 ChatGPT？

ChatGPT 适合开放问答，但旅行规划需要结构化输入、可执行输出、地图/预算/时间约束、局部修改、保存和版本管理。AI Travel Planner 把 LLM 放进完整产品工作流，而不是让用户自己复制粘贴和修补结果。

### 2. 为什么不是聊天产品？

目标用户不会写高质量 prompt。聊天框把表达成本交给用户，结构化 Planner 则把高质量输入内置到产品里。这个场景更适合 guided workflow，而不是 open-ended chat。

### 3. 为什么不用 Dify？

Dify 适合快速搭建 AI workflow 原型，但这个项目重点是展示 AI PM 对产品体验、结构化输出、局部重规划、状态管理、版本历史和前端表达的完整设计能力。为了长期可扩展，我选择自建 AI layer。

### 4. 为什么不用现成 Workflow 工具？

旅行规划需要深度融入产品状态，例如锁定地点、局部 patch、undo/redo、版本历史、预算和 Timeline 渲染。通用 workflow 工具难以表达这些细粒度交互。

### 5. 为什么不用 Agent 一次做完？

让一个 Agent 全部完成会降低可控性和可评估性。我把需求理解、规划、预算、修改、解释等能力拆开，方便测试、记录、回退和未来替换模型。

### 6. 为什么现在不用 MCP？

MCP 更适合连接外部工具和数据源，例如地图、日历、酒店、航班。MVP 阶段先验证核心规划体验和用户价值，V3 再加入 MCP 扩展执行能力。

### 7. 为什么不用 RAG？

MVP 的核心问题不是知识检索，而是计划生成和决策组织。RAG 在后续接入地点库、攻略内容、营业时间和用户历史偏好时会有价值，但不是第一优先级。

### 8. 为什么要做 Partial Replanning？

真实用户通常不是对整份行程不满意，而是只想改某一天或某个活动。全量重生成会破坏已满意部分，降低信任。局部重规划更符合真实编辑行为。

### 9. 为什么输出 JSON，而不是 Markdown？

Markdown 适合阅读，不适合产品化渲染和修改。JSON 可以被验证、渲染、局部 patch、版本对比和埋点分析，是 AI 产品工程化的基础。

### 10. 如何防止 AI 幻觉？

短期用 schema validation、字段约束、用户反馈和风险提示；V1 接入地点验证、地图服务、营业时间和来源；长期用 automated evaluation 和人工反馈闭环。

### 11. AI 失败怎么办？

失败分为网络失败、模型失败、JSON 失败、约束失败和安全失败。对应策略包括 retry、repair、fallback、保留用户输入、显示可恢复错误、记录失败类型。

### 12. 为什么需要 Explain？

旅行计划涉及时间和金钱成本，用户需要知道为什么某个地点被推荐、为什么这样排序、为什么预算这样分配。Explain 是信任机制，不是装饰功能。

### 13. 为什么需要 Lock？

用户一定要去的地点不应该被 AI 修改。Lock 把用户意图转成硬约束，是 Human-in-the-loop 的核心控制点。

### 14. 为什么需要 Undo/Redo？

AI 修改具有不确定性。Undo/Redo 让用户敢于尝试，也让 AI 交互从“不可逆黑盒”变成“可探索工具”。

### 15. 为什么需要 Workspace？

旅行计划不是一次性内容。用户会隔几天回来修改、和朋友讨论、出发前再调整。Workspace 让产品从生成器变成长期工作台。

### 16. 北极星指标为什么不是生成次数？

生成次数可能只是好奇心。Executable Trip Plan Rate 更接近真实价值，因为它结合了生成、保存、导出、重新打开等信号。

### 17. 如何判断 AI 规划得好？

看路线合理性、预算准确性、兴趣匹配、节奏适配、约束满足、重复率、修改接受率、用户保存率和重新打开率。

### 18. 为什么选择 22-35 岁年轻自由行用户？

他们旅行自主性强、AI 接受度高、规划痛点明显、愿意尝试新工具，也适合作为 MVP 的早期用户。

### 19. 为什么不是面向所有旅行用户？

所有人都做会导致产品定位模糊。商务旅行、跟团旅行、深度玩家和家庭复杂旅行的需求差异很大，MVP 应先聚焦痛点强的人群。

### 20. 这个产品如何商业化？

短期可以验证导出、保存、更多生成次数等付费意愿；中期可以做 Pro templates、协作和高级路线校验；长期可与 booking handoff、酒店/体验推荐结合。

### 21. 和 Google Travel 有什么区别？

Google Travel 更偏信息整合和预订生态。AI Travel Planner 更关注从用户偏好到可执行行程的生成、解释和修改。

### 22. 和 TripAdvisor 有什么区别？

TripAdvisor 强在点评和目的地内容，但不直接解决“每天怎么排”。AI Travel Planner 把推荐组织成计划。

### 23. 和 Notion/表格有什么区别？

Notion 和表格是记录工具，需要用户自己做决策。AI Travel Planner 主动生成结构化计划，并支持局部修改。

### 24. 如何处理预算不准确？

MVP 阶段预算是估算和分类展示；V1 接入真实价格数据后提高准确度。产品上需要展示估算性质和不确定性，避免过度承诺。

### 25. 如何处理多人旅行冲突？

V2 可以做分享、评论、投票和偏好合并。MVP 先支持 companion 和 travel style，验证核心规划价值。

### 26. 如何做国际化？

数据结构中保留 locale、currency、language 字段，Prompt Template 支持 locale。前端和 AI 输出都可以逐步国际化。

### 27. 如何降低 AI 成本？

通过 prompt compression、model routing、缓存常见目的地模板、减少不必要重生成、局部 patch 替代全量生成。

### 28. 如何保护用户隐私？

只保存必要旅行偏好，敏感信息不进入 prompt 或做最小化处理；Supabase RLS 控制权限；日志脱敏。

### 29. 这个项目最能体现 AI PM 能力的地方是什么？

不是页面，而是 AI Workflow、结构化输出、Partial Replanning、Trust UX 和产品验证体系。这些体现了从用户问题到 AI 系统边界的完整判断。

### 30. 如果没有 OpenAI API 怎么办？

架构上 AI Client 是抽象层，可以替换为其他模型服务。核心资产不是某个模型，而是输入结构、Prompt Template、Schema、Validator、Repair 和 Evaluation。

### 31. 为什么不一开始就接真实地图和预订？

MVP 先验证用户是否需要 AI 规划和局部修改。如果这个核心价值不成立，接地图和预订只会增加复杂度。V1 再补充真实执行数据。

### 32. 如何证明它不是 Demo？

项目包含完整 PRD、UX、AI Workflow、技术架构、MVP、Persistence、Product Validation、测试和 roadmap，不只是静态页面。

## Part 2: STAR Interview Answers

### 1. 产品思维

**Situation:** 我想做一个能体现 AI PM 能力的作品集项目，而不是普通 CRUD 应用。

**Task:** 找到一个 AI 有明显价值、用户痛点真实、又能展示完整产品能力的场景。

**Action:** 我选择旅行规划，因为它有信息过载、决策复杂、工具割裂和强个性化问题。我把产品定位从“生成攻略”改为“帮助用户完成旅行决策”，并设计了 Planner、Timeline、Partial Replanning 和 Workspace 的闭环。

**Result:** 最终项目能展示从用户研究到 AI Workflow、MVP 开发和产品验证的完整链路。

### 2. 需求分析

**Situation:** 旅行用户很多，如果面向所有人，需求会非常发散。

**Task:** 定义 MVP 的核心用户和范围。

**Action:** 我把目标用户聚焦在 22-35 岁、第一次去陌生城市、喜欢自由行但不想花大量时间查攻略的人。排除了商务旅行、跟团用户和深度玩家。

**Result:** 产品范围更清晰，核心体验聚焦在快速生成可执行行程和局部修改。

### 3. AI 理解

**Situation:** 很多 AI 产品只是接入一个聊天框，无法稳定产出可用结果。

**Task:** 设计一个可扩展的 AI Planning Engine。

**Action:** 我拆分 Requirement Parser、Prompt Builder、Context Builder、OpenAI Client、Structured Output、Zod Validator、Repair Strategy 和 Formatter，并用 JSON Schema 约束输出。

**Result:** AI 输出可以被前端渲染、校验、修改和版本化，产品体验更稳定。

### 4. 用户研究

**Situation:** 如果只凭想象做旅行产品，容易堆功能。

**Task:** 找到真实规划痛点。

**Action:** 我用 Persona、Journey Map、JTBD、Kano Model 和痛点分析拆解用户从搜索攻略到保存计划的行为，识别出路线安排、信息冲突、预算不确定、工具切换和修改困难等关键问题。

**Result:** 每个核心功能都能对应到明确用户痛点。

### 5. UX 设计

**Situation:** 目标用户不会写高质量 prompt。

**Task:** 设计低门槛但高质量的 AI 输入体验。

**Action:** 我放弃空白聊天框，设计结构化 Planner、Smart Suggestions 和 AI Tips，让用户通过选择和少量输入表达需求。

**Result:** 输入更可控，AI 生成质量更容易稳定，也更适合主流用户。

### 6. 跨团队协作

**Situation:** AI Travel Planner 需要产品、设计、前端、后端、AI 工程多方协作。

**Task:** 让设计师和工程师都能清楚理解需求。

**Action:** 我输出了 PRD、Information Architecture、AI UX、AI Workflow、Technical Architecture 和 Sprint Backlog，每个模块都说明为什么做、AI 做什么、程序做什么、验收标准是什么。

**Result:** 文档可以直接支持设计和开发阶段，减少沟通歧义。

### 7. 项目推进

**Situation:** 项目范围大，容易一次性做散。

**Task:** 按阶段推进 MVP。

**Action:** 我按 Sprint 拆分：Foundation、Planner、AI Engine、Timeline、Partial Replanning、Workspace、Validation。每个 Sprint 都有明确目标和完成标准。

**Result:** 项目从策略文档推进到真实可运行 MVP，并保持模块化和可维护性。

### 8. 失败复盘

**Situation:** 初始想法容易变成“AI 生成旅行攻略”。

**Task:** 避免产品变成泛泛的内容生成器。

**Action:** 我不断回到用户任务：用户需要做决策、执行计划、修改计划、保存计划。因此加入 Timeline、Diff、Lock、Version History 等机制。

**Result:** 产品从内容生成器升级为旅行规划工作台。

### 9. 技术理解

**Situation:** AI PM 需要理解技术边界，否则 PRD 难以落地。

**Task:** 设计能指导开发的技术架构。

**Action:** 我选择 Next.js、TypeScript、Supabase、OpenAI SDK、Zod、React Query 和 Zustand，并明确前端状态、服务端状态、AI 输出、数据库和安全策略。

**Result:** 技术方案支持 AI First、Server First、Type Safe 和 Production Ready。

### 10. 数据和增长

**Situation:** MVP 完成后，需要验证是否真的解决问题。

**Task:** 设计 Product Validation。

**Action:** 我定义 North Star 为 Executable Trip Plan Rate，并设计 50+ 埋点、PM Dashboard、AI Evaluation、用户访谈、可用性测试、A/B Test 和风险矩阵。

**Result:** 项目不仅有功能，还具备持续验证和迭代的产品闭环。

## Part 3: Resume Highlights

- 从 0 到 1 完成 AI Native 旅行规划产品：覆盖竞品分析、用户研究、PRD、UX、AI Workflow、技术架构、MVP 和验证方案。
- 设计结构化 AI Planning Engine，基于 Prompt Template、JSON Schema、Validator 和 Repair Strategy 提升 AI 输出稳定性。
- 设计 Partial Replanning，使用 JSON Patch、Diff、Lock、Undo/Redo 实现最小影响的 AI 局部重规划。
- 将 AI 输出转化为可执行 Trip Timeline，支持预算、交通、推荐解释和用户控制。
- 设计 Product Validation 体系，包括 North Star、50+ 埋点、AI Evaluation、访谈、可用性测试和 A/B 实验。

## Part 4: Project Retrospective

### 最大的成功

项目没有停留在“AI 生成攻略”，而是形成了从需求输入、结构化生成、Timeline 表达、局部修改、保存复用到产品验证的完整闭环。

### 最大的失败或不足

MVP 阶段还没有接入真实地图、天气、营业时间和地点来源，因此计划的可执行性验证仍然有限。这个限制会影响用户对 AI 的最终信任。

### 最大的产品启发

AI 产品的价值不是让模型多说，而是让用户少做。越复杂的任务，越需要把 AI 输出变成可编辑、可验证、可恢复的产品对象。

### 未来演进方向

- V1: 接入地图、天气、营业时间、来源和 PDF 导出。
- V2: 增加分享、协作、评论、偏好投票。
- V3: 引入 MCP、Tool Calling、Calendar、Booking handoff 和实时旅行 Agent。
