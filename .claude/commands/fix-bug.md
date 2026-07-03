---
description: 测试驱动修 bug — 先写失败测试复现,再修复,最后回归全部测试
argument-hint: <bug 描述>
---

Bug 描述:$ARGUMENTS

严格按 TDD 流程执行:

1. 分析 bug 可能所在的模块与代码路径,说明你的判断依据
2. **先写一个能复现该 bug 的 EditMode 失败测试**(放在 Assets/Tests/EditMode/)
3. 运行 `tools/run-tests.bat`,确认新测试确实失败(证明成功复现)
4. 修复 bug,修改最小必要范围,遵循 project-conventions 架构约定
5. 再次运行 `tools/run-tests.bat`,确认:新测试通过 + 其他所有测试无回归
6. 总结:bug 根因、修复方式、复现测试的名字
