@echo off
setlocal
REM ============================================================
REM Unity EditMode 测试脚本(Windows)
REM 用法: tools\run-tests.bat
REM Unity 路径优先读环境变量 UNITY_PATH,未设置时用下面的默认值
REM ============================================================

if "%UNITY_PATH%"=="" set "UNITY_PATH=D:\Software\Unity\UnityEditor\2022.3.16f1\Editor\Unity.exe"

if not exist "%UNITY_PATH%" (
    echo [run-tests] 错误: 未找到 Unity 编辑器: "%UNITY_PATH%"
    echo [run-tests] 请设置环境变量 UNITY_PATH 指向 Unity.exe,例如:
    echo [run-tests]   set UNITY_PATH=D:\Software\Unity\UnityEditor\2022.3.16f1\Editor\Unity.exe
    exit /b 1
)

set "PROJECT_PATH=%~dp0.."

if exist "%PROJECT_PATH%\Temp\UnityLockfile" (
    echo [run-tests] 错误: 工程正被 Unity 编辑器占用,请先关闭编辑器再运行测试
    exit /b 1
)

if not exist "%PROJECT_PATH%\TestResults" mkdir "%PROJECT_PATH%\TestResults"

echo [run-tests] 正在以 batchmode 运行 EditMode 测试(首次运行可能需要数分钟)...
"%UNITY_PATH%" -batchmode -projectPath "%PROJECT_PATH%" -runTests -testPlatform EditMode -testResults "%PROJECT_PATH%\TestResults\results.xml" -logFile "%PROJECT_PATH%\TestResults\unity.log"
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE%==0 (
    echo [run-tests] √ 全部测试通过,结果见 TestResults\results.xml
    exit /b 0
)

echo [run-tests] × 测试失败(退出码 %EXIT_CODE%^),失败用例:
if exist "%PROJECT_PATH%\TestResults\results.xml" (
    powershell -NoProfile -Command "Select-Xml -Path '%PROJECT_PATH%\TestResults\results.xml' -XPath '//test-case[@result=''Failed'']' | ForEach-Object { '  - ' + $_.Node.fullname }"
) else (
    echo [run-tests] 未生成 results.xml,多半是编译错误,请查看 TestResults\unity.log
)
exit /b %EXIT_CODE%
