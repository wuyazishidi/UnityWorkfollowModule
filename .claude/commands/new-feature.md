---
description: 规划并实现一个新功能 — 先出计划待确认,实现后自动跑测试验证
argument-hint: <功能描述>
---

功能需求:$ARGUMENTS

严格按以下流程执行:

1. 先读取 CLAUDE.md 与 project-conventions 技能,分析该功能涉及哪些模块(Core / Gameplay / UI),确认依赖方向合法
2. 给出实现计划:
   - 要新建/修改的文件清单(标注所属模块与 asmdef)
   - 测试用例设计(核心逻辑必须有 EditMode 测试)
3. **展示计划并等我确认,确认前不写任何代码**
4. 确认后实现,业务逻辑放纯 C# 类,MonoBehaviour 只做视图与生命周期入口
5. 实现完运行 `tools/run-tests.bat` 自我验证;失败则读取 `TestResults/results.xml` 分析并修复,直至全绿
6. 若新建了 `.cs` / `.asmdef` 文件,最后提醒我回 Unity 编辑器触发编译并生成 .meta
