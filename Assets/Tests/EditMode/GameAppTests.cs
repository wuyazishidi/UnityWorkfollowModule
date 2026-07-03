using NUnit.Framework;
using UWM.Core;

namespace UWM.Tests.EditMode
{
    /// <summary>GameApp 生命周期测试 — 同时验证测试链路(asmdef 引用 + batchmode 运行)通畅。</summary>
    public class GameAppTests
    {
        [Test]
        public void Initialize_FromCreated_ReturnsTrueAndEntersInitialized()
        {
            var app = new GameApp();

            var result = app.Initialize();

            Assert.IsTrue(result);
            Assert.AreEqual(GameApp.AppState.Initialized, app.State);
        }

        [Test]
        public void Initialize_CalledTwice_SecondCallReturnsFalse()
        {
            var app = new GameApp();
            app.Initialize();

            var result = app.Initialize();

            Assert.IsFalse(result);
            Assert.AreEqual(GameApp.AppState.Initialized, app.State);
        }

        [Test]
        public void Shutdown_AfterInitialize_EntersShutdown()
        {
            var app = new GameApp();
            app.Initialize();

            app.Shutdown();

            Assert.AreEqual(GameApp.AppState.Shutdown, app.State);
        }

        [Test]
        public void Shutdown_WithoutInitialize_StaysCreated()
        {
            var app = new GameApp();

            app.Shutdown();

            Assert.AreEqual(GameApp.AppState.Created, app.State);
        }
    }
}
