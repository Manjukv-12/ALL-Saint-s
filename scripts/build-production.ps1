# Build production frontend + package PHP backend for Hostinger deploy.
# Usage (from ALL-Saint-s):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-production.ps1

param(
  [string]$ReleaseRoot = ""
)

$ErrorActionPreference = "Stop"
$FrontRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Join-Path (Split-Path -Parent $FrontRoot) "backend-php"

if (-not $ReleaseRoot) {
  $ReleaseRoot = Join-Path (Split-Path -Parent $FrontRoot) "release"
}

Write-Host "=== Production build ==="
Write-Host "Frontend: $FrontRoot"
Write-Host "Backend:  $BackendRoot"
Write-Host "Release:  $ReleaseRoot"
Write-Host ""

if (-not (Test-Path (Join-Path $FrontRoot "package.json"))) {
  throw "Frontend package.json not found at $FrontRoot"
}
if (-not (Test-Path $BackendRoot)) {
  throw "backend-php not found at $BackendRoot"
}

# --- Frontend ---
Write-Host "1/3 Building frontend (vite --mode production)..."
Push-Location $FrontRoot
try {
  npm run build:prod
  if ($LASTEXITCODE -ne 0) { throw "Frontend build failed (exit $LASTEXITCODE)" }
} finally {
  Pop-Location
}

$frontOut = Join-Path $ReleaseRoot "frontend"
if (Test-Path $frontOut) { Remove-Item -Recurse -Force $frontOut }
New-Item -ItemType Directory -Path $frontOut -Force | Out-Null
Copy-Item -Path (Join-Path $FrontRoot "dist\*") -Destination $frontOut -Recurse -Force
Write-Host "   Frontend copied to $frontOut"
Write-Host ""

# --- Backend ---
Write-Host "2/3 Packaging backend-php..."
$backendOut = Join-Path $ReleaseRoot "backend-php"
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $BackendRoot "bin\package-production.ps1") -OutDir $backendOut
if ($LASTEXITCODE -ne 0) { throw "Backend package failed" }
Write-Host ""

# --- Checklist ---
Write-Host "3/3 Release checklist"
$envProd = Join-Path $FrontRoot ".env.production"
if (Test-Path $envProd) {
  Write-Host "   .env.production:"
  Get-Content $envProd | Where-Object { $_ -match '^\s*VITE_' } | ForEach-Object { Write-Host "     $_" }
}

Write-Host ""
Write-Host "=== Done ==="
Write-Host "Upload:"
Write-Host "  Frontend → public_html/          (contents of $frontOut)"
Write-Host "  Backend  → public_html/backend-php/ (contents of $backendOut)"
Write-Host "Do not overwrite server config.php with a local config.local.php."
Write-Host "After upload, open:"
Write-Host "  https://csiallsaintstcr.com/"
Write-Host "  https://csiallsaintstcr.com/backend-php/api/health"
