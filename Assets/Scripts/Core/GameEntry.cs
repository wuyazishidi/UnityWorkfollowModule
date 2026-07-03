using UnityEngine;

namespace UWM.Core
{
    /// <summary>
    /// 游戏入口。场景中唯一,只负责生命周期转发:创建并驱动 GameApp,业务逻辑一律不写在这里。
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class GameEntry : MonoBehaviour
    {
        public static GameApp App { get; private set; }

        private void Awake()
        {
            if (App != null)
            {
                Destroy(gameObject);
                return;
            }

            App = new GameApp();
            App.Initialize();
            DontDestroyOnLoad(gameObject);
        }

        private void OnApplicationQuit()
        {
            App?.Shutdown();
            App = null;
        }
    }
}
