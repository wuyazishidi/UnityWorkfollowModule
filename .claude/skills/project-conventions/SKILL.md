---
name: project-conventions
description: 本项目(UnityWorkfollowModule)的架构约定。在本项目中编写、修改或审查任何 C# 代码之前必须先读取本技能;涉及模块划分、事件通信、资源加载、MonoBehaviour 使用时同样触发。
---

# UnityWorkfollowModule 架构约定

## 1. 模块划分与依赖方向

遵循 CLAUDE.md 目录规范,三层结构、单向依赖:

```
UWM.UI  →  UWM.Gameplay  →  UWM.Core
(界面层)      (玩法层)         (框架层)
```

- **Core**(`Assets/Scripts/Core/`):框架设施——入口、事件、资源、工具类。不依赖其他模块,不写具体玩法。
- **Gameplay**(`Assets/Scripts/Gameplay/`):游戏逻辑与数据模型。只引用 Core。
- **UI**(`Assets/Scripts/UI/`):界面展示。可引用 Gameplay 与 Core,通过事件/接口与玩法交互。
- 新增模块时必须创建对应 asmdef,并在本文件登记依赖方向;**任何反向引用都是架构错误**。

## 2. MonoBehaviour 使用边界

- MonoBehaviour 只做两件事:**视图绑定**(拿引用、驱动显示)和**生命周期入口**(Awake/Start/Update 转发)。
- 业务逻辑、状态、算法一律放**纯 C# 类**,由 MonoBehaviour 持有并驱动——这样才能被 EditMode 测试覆盖。
- 参考范式:`GameEntry`(MonoBehaviour,入口)持有并驱动 `GameApp`(纯 C#,可测)。

## 3. 事件通信:UniRx / R3

- 模块间通信使用 UniRx/R3 的响应式流,禁止跨模块直接持有对方引用。
- 状态暴露用 `ReactiveProperty<T>`,事件流用 `Subject<T>`,只读暴露用 `IObservable<T>`/`IReadOnlyReactiveProperty<T>`。
- **订阅必须管理生命周期**:MonoBehaviour 中用 `AddTo(this)`,纯 C# 类实现 `IDisposable` 并用 `CompositeDisposable` 统一释放。
- 跨模块事件通过 Core 层的事件中心(基于 Subject 的轻量总线)转发,UI 不直接订阅 Gameplay 内部对象。
- ⚠️ 该包尚未安装:首次使用前需在 `Packages/manifest.json` 添加(需用户确认)。R3 需要 NuGetForUnity,UniRx 可用 git URL。安装后在用到它的 asmdef 中登记引用。

## 4. 资源加载:YooAsset

- 动态资源一律通过 YooAsset 的 `LoadAssetAsync` 加载,**禁止散落使用 `Resources.Load` 与 `AssetBundle.LoadFromFile`**。
- 资源加载统一封装在 Core 层的 `AssetModule`(YooAsset 的薄封装),Gameplay/UI 只调用封装接口,不直接触碰 YooAsset API——便于早期用 EditorSimulateMode 开发、后期切热更模式。
- Handle 用完必须 Release;界面/关卡卸载时统一释放其加载的资源。
- ⚠️ 该包尚未安装:首次使用前需在 `Packages/manifest.json` 添加 YooAsset git URL(需用户确认)。安装前的临时代码可先走 `AssetModule` 接口 + Resources 兜底实现,接口不变,后续替换实现即可。

## 5. DO NOT 清单(Unity 新项目十大常见错误)

1. **不要**在 `Update`/`FixedUpdate` 里调用 `GetComponent`/`Find`/`Camera.main` —— Awake 缓存到字段。
2. **不要**用 public 字段暴露 Inspector 配置 —— 用 `[SerializeField] private`。
3. **不要**手动创建或修改 `.meta` 文件 —— 让 Unity 编辑器生成;新建文件后提醒用户回编辑器编译。
4. **不要**在热点路径频繁 `Instantiate`/`Destroy` —— 使用对象池。
5. **不要**在 MonoBehaviour 里堆业务逻辑 —— 纯 C# 类 + EditMode 测试。
6. **不要**跨 asmdef 反向引用(Core 引 Gameplay、Gameplay 引 UI)—— 编译会断,架构也错。
7. **不要**订阅了事件/Observable 不退订 —— 场景切换后产生幽灵回调与内存泄漏。
8. **不要**在字符串里硬编码资源路径散落各处 —— 集中到常量类或配置。
9. **不要**依赖 `Start` 执行顺序做跨对象初始化 —— 用显式初始化流程(GameEntry 驱动)。
10. **不要**用协程做可等待的异步逻辑主干 —— 优先 async/await(UniTask 可后续引入),协程只做表现层小动画。
