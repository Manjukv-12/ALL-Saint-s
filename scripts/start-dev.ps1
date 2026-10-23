$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

Set-Location $Root

if (-not (Test-Path "package.json")) {
  Write-Host "ERROR: Run from the ALL-Saint-s project folder." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm packages..."
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$php = Get-Command php -ErrorAction SilentlyContinue
if (-not $php -and (Test-Path "C:\xampp\php\php.exe")) {
  $env:Path = "C:\xampp\php;" + $env:Path
}
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: PHP not found. Install XAMPP or add php to PATH." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "============================================"
Write-Host "  CSI All Saints - local dev"
Write-Host "  1) PHP API  - http://127.0.0.1:8080"
Write-Host "  2) Website  - http://127.0.0.1:5173 (or next free port)"
Write-Host "============================================"
Write-Host ""

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$Root'; npm run api:php"
)

Start-Sleep -Seconds 2

Write-Host "Starting Vite frontend..."
npm run dev
