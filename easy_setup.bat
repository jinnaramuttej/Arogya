@echo off
setlocal enabledelayedexpansion
echo ==========================================
echo      AROGYA WEBSITE SETUP & LAUNCH
echo ==========================================
echo.

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

REM 3. Search in common directories (AppData and C:\)
for %%P in (
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
    "C:\Python310\python.exe"
) do (
    if exist "%%~P" (
        set "PYTHON_CMD=%%~P"
        goto :Found
    )
)

:NotFound
echo [ERROR] Python was not found on your system.
echo.
echo Please install Python from https://www.python.org/downloads/
echo IMPORTANT: Check the box "Add Python to PATH" during installation.
echo.
pause
exit /b

:Found
echo Found Python: !PYTHON_CMD!
echo.

echo [1/3] Fixing User Management Page...
echo. | "!PYTHON_CMD!" fix_usermgmt.py

echo.
echo [2/3] Fixing Settings Page...
echo. | "!PYTHON_CMD!" fix_settings.py

echo.
echo [2.5/3] Creating Smart Pharmacy Page...
echo. | "!PYTHON_CMD!" fix_medicines.py

echo.
echo [2.6/3] Updating Navigation Bars...
echo. | "!PYTHON_CMD!" fix_navbar.py

echo.
echo [3/3] Starting Web Server...
echo The website should open in your browser automatically.
echo DO NOT CLOSE THIS WINDOW.
start "" "http://localhost:8000"
"!PYTHON_CMD!" -m http.server 8000
pause