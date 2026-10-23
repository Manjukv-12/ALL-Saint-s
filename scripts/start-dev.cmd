@echo off
setlocal
set "ROOT=%~dp0.."
cd /d "%ROOT%"

if not exist "%ROOT%\package.json" (
  echo ERROR: Run this from the ALL-Saint-s project folder.
  exit /b 1
)

if not exist "%ROOT%\node_modules" (
  echo Installing npm packages...
  call npm install
  if errorlevel 1 exit /b 1
)

set PHP_EXE=php
where php >nul 2>&1
if errorlevel 1 (
  if exist "C:\xampp\php\php.exe" (
    set PHP_EXE=C:\xampp\php\php.exe
  ) else (
    echo ERROR: PHP not found. Install XAMPP or add php to PATH.
    echo        Church management needs PHP + MySQL on port 8080.
    exit /b 1
  )
)

echo.
echo ============================================
echo   CSI All Saints - local dev
echo   1^) PHP API  - http://127.0.0.1:8080
echo   2^) Website  - http://127.0.0.1:5173
echo ============================================
echo.

start "" /D "%ROOT%" cmd /c npm run api:php

REM Brief pause for PHP to bind (avoid timeout - breaks under npm on Windows)
ping -n 3 127.0.0.1 >nul

echo Starting Vite frontend...
call npm run dev

endlocal
