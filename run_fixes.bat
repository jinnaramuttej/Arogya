@echo off

REM Check if 'python' command works, otherwise use 'py' launcher
set PYTHON_CMD=python
where python >nul 2>nul
if %errorlevel% neq 0 set PYTHON_CMD=py

echo Running User Management Fix...
%PYTHON_CMD% fix_usermgmt.py
echo Running Settings Fix...
%PYTHON_CMD% fix_settings.py
pause