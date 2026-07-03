@echo off
setlocal
REM ============================================================
REM Unity EditMode test runner (Windows)
REM Usage: tools\run-tests.bat
REM Unity path: env var UNITY_PATH, falls back to default below.
REM NOTE: keep this file ASCII-only - cmd.exe parses .bat files
REM in the OEM codepage and non-ASCII bytes break parsing.
REM ============================================================

if "%UNITY_PATH%"=="" set "UNITY_PATH=D:\Software\Unity\UnityEditor\2022.3.16f1\Editor\Unity.exe"

if not exist "%UNITY_PATH%" (
    echo [run-tests] ERROR: Unity editor not found: "%UNITY_PATH%"
    echo [run-tests] Set the UNITY_PATH env var to your Unity.exe, e.g.:
    echo [run-tests]   set UNITY_PATH=D:\Software\Unity\UnityEditor\2022.3.16f1\Editor\Unity.exe
    exit /b 1
)

set "PROJECT_PATH=%~dp0.."

if exist "%PROJECT_PATH%\Temp\UnityLockfile" (
    echo [run-tests] ERROR: project is locked by a running Unity editor. Close it first.
    exit /b 1
)

if not exist "%PROJECT_PATH%\TestResults" mkdir "%PROJECT_PATH%\TestResults"

echo [run-tests] Running EditMode tests in batchmode ^(first run may take minutes^)...
"%UNITY_PATH%" -batchmode -projectPath "%PROJECT_PATH%" -runTests -testPlatform EditMode -testResults "%PROJECT_PATH%\TestResults\results.xml" -logFile "%PROJECT_PATH%\TestResults\unity.log"
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE%==0 (
    echo [run-tests] OK: all tests passed. See TestResults\results.xml
    exit /b 0
)

echo [run-tests] FAILED ^(exit code %EXIT_CODE%^). Failing tests:
if exist "%PROJECT_PATH%\TestResults\results.xml" (
    powershell -NoProfile -Command "Select-Xml -Path '%PROJECT_PATH%\TestResults\results.xml' -XPath '//test-case[@result=''Failed'']' | ForEach-Object { '  - ' + $_.Node.fullname }"
) else (
    echo [run-tests] No results.xml generated - likely a compile error. Check TestResults\unity.log
)
exit /b %EXIT_CODE%
