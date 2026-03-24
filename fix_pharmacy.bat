@echo off
set PYTHON_CMD=python
where python >nul 2>nul
if %errorlevel% neq 0 set PYTHON_CMD=py

echo Using Python command: %PYTHON_CMD%
%PYTHON_CMD% fix_medicines.py
if %errorlevel% neq 0 (
    echo Failed with %PYTHON_CMD%
    echo Trying direct 'py' command...
    py fix_medicines.py
)
