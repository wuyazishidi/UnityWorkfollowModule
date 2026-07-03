#!/usr/bin/env bash
# ============================================================
# Unity EditMode 测试脚本(macOS/Linux/Git Bash)
# 用法: tools/run-tests.sh
# Unity 路径优先读环境变量 UNITY_PATH,未设置时用下面的默认值
# ============================================================
set -u

UNITY_PATH="${UNITY_PATH:-D:/Software/Unity/UnityEditor/2022.3.16f1/Editor/Unity.exe}"

if [ ! -f "$UNITY_PATH" ]; then
    echo "[run-tests] 错误: 未找到 Unity 编辑器: $UNITY_PATH"
    echo "[run-tests] 请设置环境变量 UNITY_PATH 指向 Unity 可执行文件,例如:"
    echo "[run-tests]   export UNITY_PATH=/Applications/Unity/Hub/Editor/2022.3.16f1/Unity.app/Contents/MacOS/Unity"
    exit 1
fi

PROJECT_PATH="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$PROJECT_PATH/Temp/UnityLockfile" ]; then
    echo "[run-tests] 错误: 工程正被 Unity 编辑器占用,请先关闭编辑器再运行测试"
    exit 1
fi

mkdir -p "$PROJECT_PATH/TestResults"

echo "[run-tests] 正在以 batchmode 运行 EditMode 测试(首次运行可能需要数分钟)..."
"$UNITY_PATH" -batchmode -projectPath "$PROJECT_PATH" -runTests -testPlatform EditMode \
    -testResults "$PROJECT_PATH/TestResults/results.xml" \
    -logFile "$PROJECT_PATH/TestResults/unity.log"
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[run-tests] √ 全部测试通过,结果见 TestResults/results.xml"
    exit 0
fi

echo "[run-tests] × 测试失败(退出码 $EXIT_CODE),失败用例:"
if [ -f "$PROJECT_PATH/TestResults/results.xml" ]; then
    sed -n 's/.*<test-case[^>]*fullname="\([^"]*\)"[^>]*result="Failed".*/  - \1/p' "$PROJECT_PATH/TestResults/results.xml"
else
    echo "[run-tests] 未生成 results.xml,多半是编译错误,请查看 TestResults/unity.log"
fi
exit $EXIT_CODE
