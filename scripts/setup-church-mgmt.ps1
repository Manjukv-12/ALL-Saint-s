$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Backend = Resolve-Path (Join-Path $Root "..\backend-php")

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Church Management - local setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path (Join-Path $Backend "bin\setup-local-church-mgmt.php"))) {
  Write-Host "ERROR: backend-php not found at $Backend" -ForegroundColor Red
  exit 1
}

$php = Get-Command php -ErrorAction SilentlyContinue
if (-not $php -and (Test-Path "C:\xampp\php\php.exe")) {
  $env:Path = "C:\xampp\php;" + $env:Path
}
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: PHP not found. Install XAMPP or add php to PATH." -ForegroundColor Red
  exit 1
}

Set-Location $Backend
Write-Host "Step 1: Database + tables + admin user..." -ForegroundColor Yellow
php bin/setup-local-church-mgmt.php
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $Root
if (-not (Test-Path "node_modules")) {
  Write-Host ""
  Write-Host "Step 2: Installing npm packages..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host ""
  Write-Host "Step 2: npm packages already installed." -ForegroundColor Green
}

if (-not (Test-Path ".env.development")) {
  $envDev = @(
    "# Loaded automatically when you run npm run dev"
    "VITE_API_URL=http://127.0.0.1:8080"
    "VITE_API_LOCAL_PROXY_TARGET=http://127.0.0.1:8080"
  ) -join "`n"
  Set-Content -Path ".env.development" -Value $envDev -Encoding UTF8
  Write-Host "Created .env.development" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Setup done!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Start everything:  npm start" -ForegroundColor Cyan
Write-Host "Login page:        http://127.0.0.1:5173/#/admin/church-management/login" -ForegroundColor Cyan
Write-Host "Default login:     admin@csiallsaints.local / ChangeMe123!" -ForegroundColor Cyan
Write-Host ""
