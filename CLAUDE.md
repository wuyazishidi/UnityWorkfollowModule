# CLAUDE.md — UnityWorkfollowModule 项目宪法

## 工程信息

- **Unity 版本**: 2022.3.16f1 (LTS)
- **渲染管线**: URP 14.0.9
- **目标平台**: 多平台(PC Windows + Android/iOS),编写代码时须同时考虑桌面与移动端约束
- **事件通信**: UniRx / R3(见 project-conventions 技能)
- **资源加载**: YooAsset(见 project-conventions 技能)

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

## 日常命令速查

| 场景 | 用法 |
|------|------|
| 开发新功能 | `/new-feature <功能描述>` |
| 修 bug | `/fix-bug <bug 描述>` |
| 提交前检查 | `/review` → 处理问题 → `/commit` |
| 跑测试 | `tools\run-tests.bat` |
| 每周维护 | `/weekly-review` |
