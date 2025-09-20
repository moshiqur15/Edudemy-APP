@echo off
title Edudemy APP - Startup Script
color 0A

echo ============================================================
echo                 🎓 EDUDEMY APP STARTUP
echo ============================================================
echo.
echo Starting the complete education management system...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+ first.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.
:start
echo Choose startup option:
echo [1] Start everything (Backend + Frontend)
echo [2] Start Backend only
echo [3] Start Frontend only
echo [4] Exit
echo.
set /p choice=Enter your choice (1-4): 

if "%choice%"=="1" (
    echo.
    echo Starting both backend and frontend servers...
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0start_app.ps1" -Mode both
) else if "%choice%"=="2" (
    echo.
    echo Starting backend server only...
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0start_app.ps1" -Mode backend
) else if "%choice%"=="3" (
    echo.
    echo Starting frontend server only...
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0start_app.ps1" -Mode frontend
) else if "%choice%"=="4" (
    echo.
    echo Goodbye!
    exit /b 0
) else (
    echo.
    echo Invalid choice. Please select 1-4.
    echo.
    goto start
)

pause