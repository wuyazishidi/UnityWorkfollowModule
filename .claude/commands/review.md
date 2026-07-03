---
description: 检查当前未提交改动是否违反 CLAUDE.md 与 project-conventions 规范
---

对当前未提交的改动做规范审查:

1. 运行 `git status` 和 `git diff HEAD` 查看全部未提交改动(含未跟踪的新文件)
2. 逐条对照 CLAUDE.md 与 project-conventions 技能检查,重点:
   - asmdef 依赖方向(UI → Gameplay → Core,禁止反向)
   - 命名规范(_camelCase / PascalCase / UPPER_CASE)、禁止 public 字段
   - Update/FixedUpdate 中的 GetComponent/Find/Camera.main
   - MonoBehaviour 是否混入业务逻辑、核心逻辑是否有 EditMode 测试
   - 事件订阅是否管理生命周期(AddTo/CompositeDisposable)
   - 是否手动创建/修改了 .meta 文件、是否动了 ProjectSettings/
3. 按严重程度输出问题清单:
   - 🔴 阻断(必须修复才能提交)
   - 🟡 建议(应当修复)
   - 🟢 提示(可选优化)
4. 只报告问题,不要直接改代码;等我决定处理哪些
