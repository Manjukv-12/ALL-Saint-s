# Build production frontend and package dist/ for Hostinger upload.
# Usage (from ALL-Saint-s):
#   npm run build:upload
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-frontend-upload.ps1

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$FrontRoot = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $FrontRoot "dist"
$ReleaseRoot = Join-Path (Split-Path -Parent $FrontRoot) "release"
$FrontOut = Join-Path $ReleaseRoot "frontend"
$ZipPath = Join-Path $ReleaseRoot "frontend-upload.zip"

Write-Host "=== Frontend upload package ==="
Write-Host "Project:  $FrontRoot"
Write-Host "Release:  $ReleaseRoot"
Write-Host ""

if (-not $SkipBuild) {
  Write-Host "1/3 Building (vite --mode production)..."
  Push-Location $FrontRoot
  try {
    npm run build:prod
    if ($LASTEXITCODE -ne 0) { throw "Build failed (exit $LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "1/3 Skipping build (-SkipBuild)"
}

if (-not (Test-Path $DistDir)) {
  throw "dist/ not found. Run npm run build:prod first."
}

Write-Host "2/3 Copying dist to release/frontend..."
if (Test-Path $FrontOut) { Remove-Item -Recurse -Force $FrontOut }
New-Item -ItemType Directory -Path $FrontOut -Force | Out-Null
Copy-Item -Path (Join-Path $DistDir "*") -Destination $FrontOut -Recurse -Force

$readme = @"
All Saints CSI — frontend upload package
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")

UPLOAD TO HOSTINGER (public_html)
---------------------------------
1. Open hPanel File Manager (or FTP) -> public_html
2. Upload ALL files inside the frontend/ folder (or unzip frontend-upload.zip there)
3. Do NOT delete or overwrite these if they already exist on the server:
   - backend-php/   (PHP API)
   - config.php     (if at root)
4. Merge upload: index.html, assets/, .htaccess, favicon, etc. go into public_html root

API URL (built into this bundle)
--------------------------------
See .env.production in the repo. Current production target:
"@

$envProd = Join-Path $FrontRoot ".env.production"
if (Test-Path $envProd) {
  $viteLines = Get-Content $envProd | Where-Object { $_ -match '^\s*VITE_' -and $_ -notmatch '^\s*#' }
  foreach ($line in $viteLines) { $readme += "`n  $line" }
} else {
  $readme += "`n  (set VITE_API_URL in .env.production before building)"
}

$readme += @"

VERIFY AFTER UPLOAD
-------------------
- https://csiallsaintstcr.com/
- https://csiallsaintstcr.com/backend-php/api/health
- Church admin: https://csiallsaintstcr.com/admin/church-management/

For full deploy (frontend + backend), run:
  npm run build:release
"@

Set-Content -Path (Join-Path $FrontOut "UPLOAD-README.txt") -Value $readme -Encoding UTF8

Write-Host "3/3 Creating zip..."
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Compress-Archive -Path (Join-Path $FrontOut "*") -DestinationPath $ZipPath -Force

$fileCount = (Get-ChildItem -Recurse -File $FrontOut | Measure-Object).Count
$zipSizeMb = [math]::Round((Get-Item $ZipPath).Length / 1MB, 1)

Write-Host ""
Write-Host "=== Ready for upload ==="
Write-Host "  Folder: $FrontOut  ($fileCount files)"
Write-Host "  Zip:    $ZipPath  (${zipSizeMb} MB)"
Write-Host ""
Write-Host "Upload the folder contents (or zip) into public_html on Hostinger."
