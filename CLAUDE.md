# CLAUDE.md — UnityWorkfollowModule 项目宪法

## 工程信息

- **Unity 版本**: 2022.3.16f1 (LTS)
- **渲染管线**: URP 14.0.9
- **目标平台**: 多平台(PC Windows + Android/iOS),编写代码时须同时考虑桌面与移动端约束
- **事件通信**: R3 1.3.1(核心库经 NuGetForUnity 恢复,见 project-conventions 技能)
- **异步方案**: UniTask 2.5.11(async/await 主干,协程只做表现层)
- **资源加载**: YooAsset 2.3.19(OpenUPM 源,见 project-conventions 技能)

## 目录规范

- `Assets/Scripts/` 按功能模块分目录,每个模块有自己的 asmdef:
  - `Scripts/Core/` — 框架层(UWM.Core),不依赖任何其他模块
  - `Scripts/Gameplay/` — 玩法层(UWM.Gameplay),只依赖 Core
  - `Scripts/UI/` — 界面层(UWM.UI),可依赖 Gameplay 和 Core
  - 依赖方向:**UI → Gameplay → Core**,禁止反向引用
- `Assets/Tests/EditMode/`、`Assets/Tests/PlayMode/` — 测试代码
- `Assets/Plugins/` — 第三方插件统一存放
- `Assets/TutorialInfo/` — Unity 模板遗留文件,可忽略

## C# 编码规范

- 私有字段 `_camelCase`,公共属性 `PascalCase`,常量 `UPPER_CASE`
- 序列化字段使用 `[SerializeField] private`,**禁止 public 字段**
- 禁止在 `Update`/`FixedUpdate` 中调用 `GetComponent`、`Find`、`Camera.main`(缓存到字段)
- 优先使用对象池而不是频繁 `Instantiate`/`Destroy`
- MonoBehaviour 只做视图和生命周期入口,业务逻辑放纯 C# 类(便于 EditMode 测试)

## 工作流约定

- 多文件改动必须先出计划(plan mode),用户确认后再执行
- 核心逻辑必须有 EditMode 单元测试
- 新建 `.cs` / `.asmdef` 文件后,提醒用户回 Unity 编辑器触发编译,并把报错贴回来
- **不要手动创建或修改 `.meta` 文件**,由 Unity 编辑器生成
- **完成代码修改后运行 `tools/run-tests.bat` 自我验证,全绿才算完成;
  失败则读取 `TestResults/results.xml` 分析原因并修复**
- Unity 编辑器路径:`D:\Software\Unity\UnityEditor\2022.3.16f1\Editor\Unity.exe`
  (测试脚本通过 `UNITY_PATH` 环境变量读取,未设置时脚本内置此默认值)
- 注意:Unity 编辑器打开工程时 batchmode 测试会因工程锁定而失败,需先关闭编辑器再跑脚本

## 禁区

- 不要修改 `ProjectSettings/` 下的文件,除非用户明确要求
- 不要修改 `Packages/manifest.json`(装卸 UPM 包),除非用户明确要求
- 不要读取 `.env`、`*.keystore`、密钥/凭据类文件
- 不要执行递归删除

## YIUIMCP(编辑器开着时的 CLI 通道)

工程内嵌 `Packages/cn.etetet.yiuimcp`(YIUI-UnityMCP):Unity 编辑器侧起本地 HTTP 服务,
配合 UTO(Node)编排层,让 AI 在**编辑器开着的情况下**直接驱动 Unity。使用规则见
yiuimcp 技能(.claude/skills/yiuimcp/)。要点:

- 优先用高聚合 CLI flow(项目根目录执行,bool 参数传 1/0):
  - 触发编译并取结果:`powershell -ExecutionPolicy Bypass -Command "& '.\Packages\cn.etetet.yiuimcp\Config\compile-unity-flow.ps1' -Force 0 -NoWait 1"`
  - 读 Console 日志:`get_console_log.ps1`;编译结果摘要:`get_console_error.ps1`;通用工具调用:`invoke-uto-tool.ps1`
- 前提:Unity 编辑器已打开、`UTO/.port` 存在、UTO 已执行过 `npm install` 和 `npm run build`(在 UTO 目录下执行)
- 与 batchmode 测试互补:**编辑器开着**用 YIUIMCP 编译/看日志;**编辑器关着**用 `tools\run-tests.bat` 跑测试

## 日常命令速查

| 场景 | 用法 |
|------|------|
| 开发新功能 | `/new-feature <功能描述>` |
| 修 bug | `/fix-bug <bug 描述>` |
| 提交前检查 | `/review` → 处理问题 → `/commit` |
| 跑测试 | `tools\run-tests.bat` |
| 每周维护 | `/weekly-review` |
