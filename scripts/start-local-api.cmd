@echo off
setlocal
set "BACKEND=%~dp0..\..\backend-php"
if not exist "%BACKEND%\router.php" (
  echo ERROR: backend-php not found at %BACKEND%
  exit /b 1
)
cd /d "%BACKEND%"

set PHP_EXE=php
where php >nul 2>&1
if errorlevel 1 (
  if exist "C:\xampp\php\php.exe" set PHP_EXE=C:\xampp\php\php.exe
)

echo.
echo === Local API (32M upload + MySQL) ===
"%PHP_EXE%" -d upload_max_filesize=32M -d post_max_size=32M -r "echo 'pdo_mysql=' . (extension_loaded('pdo_mysql') ? 'yes' : 'NO') . PHP_EOL . 'upload_max_filesize=' . ini_get('upload_max_filesize') . PHP_EOL . 'post_max_size=' . ini_get('post_max_size');"
echo API folder: %BACKEND%
echo.

"%PHP_EXE%" -d upload_max_filesize=32M -d post_max_size=32M -S 127.0.0.1:8080 router.php
