---
description: 检查暂存区,按 Conventional Commits 规范生成中文提交信息,确认后提交
---

按以下流程提交暂存区内容:

1. 运行 `git status` 和 `git diff --cached` 查看暂存区内容
   - 若暂存区为空,列出工作区改动并询问我要暂存哪些,不要擅自 `git add -A`
2. 按 Conventional Commits 规范生成**中文**提交信息:
   - 格式:`<type>(<scope>): <描述>`,type 取 feat/fix/refactor/test/chore/docs
   - scope 用模块名(core/gameplay/ui/workflow 等)
   - 正文说明动机与影响,不超过 3 行
3. 展示提交信息给我确认,**确认后**再执行 `git commit`
4. 提交后运行 `git log -1 --stat` 展示结果
