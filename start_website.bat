@echo off
setlocal enabledelayedexpansion
REM This script starts a local web server using Python

set "PYTHON_CMD="

REM 1. Try 'py' launcher
py --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=py"
    goto :Found
)

REM 2. Try 'python' command
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PYTHON_CMD=python"
    goto :Found
)

REM 3. Search in common directories
for %%P in (
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
) do (
    if exist "%%~P" (
        set "PYTHON_CMD=%%~P"
        goto :Found
    )
)

:Found

echo Starting server...
echo Go to http://localhost:8000 in your browser.

start "" "http://localhost:8000"
"!PYTHON_CMD!" -m http.server 8000
pause