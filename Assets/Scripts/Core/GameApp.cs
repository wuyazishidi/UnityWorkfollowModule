namespace UWM.Core
{
    /// <summary>
    /// 游戏应用主体(纯 C#)。承载初始化/关停流程与全局状态,
    /// 由 GameEntry 在运行时驱动,可被 EditMode 测试直接实例化。
    /// </summary>
    public sealed class GameApp
    {
        public enum AppState
        {
            Created,
            Initialized,
            Shutdown
        }

        public AppState State { get; private set; } = AppState.Created;

        /// <summary>初始化应用。仅允许从 Created 状态调用一次,重复调用返回 false。</summary>
        public bool Initialize()
        {
            if (State != AppState.Created)
            {
                return false;
            }

            State = AppState.Initialized;
            return true;
        }

        /// <summary>关停应用,释放全局资源。仅在 Initialized 状态下生效。</summary>
        public void Shutdown()
        {
            if (State == AppState.Initialized)
            {
                State = AppState.Shutdown;
            }
        }
    }
}
