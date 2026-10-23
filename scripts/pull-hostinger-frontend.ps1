# Download the exact static frontend currently served at csiallsaintstcr.com
# (read-only snapshot — not editable React source; use for compare / preview).
param(
  [string]$SiteUrl = "https://csiallsaintstcr.com",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$FrontRoot = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) {
  $stamp = Get-Date -Format "yyyy-MM-dd"
  $OutDir = Join-Path $FrontRoot "reference\hostinger-live-$stamp"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Write-Host "Saving live frontend to: $OutDir"

$indexPath = Join-Path $OutDir "index.html"
Invoke-WebRequest -Uri "$SiteUrl/index.html" -OutFile $indexPath -UseBasicParsing
$html = Get-Content $indexPath -Raw

$assetPattern = '(?:\./|\/)assets\/([^\s"''>]+\.(?:js|css|jpeg|jpg|png|gif|webp|svg|mp4|pdf|woff2?))'
$matches = [regex]::Matches($html, $assetPattern)
$names = $matches | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

$assetsDir = Join-Path $OutDir "assets"
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

foreach ($name in $names) {
  $dest = Join-Path $assetsDir $name
  $url = "$SiteUrl/assets/$name"
  Write-Host "  $name"
  Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
}

Copy-Item (Join-Path $FrontRoot "public\.htaccess") (Join-Path $OutDir ".htaccess") -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Preview locally (from ALL-Saint-s folder):"
Write-Host "  npx --yes serve `"$OutDir`" -p 4173"
Write-Host "  Open http://127.0.0.1:4173/#/admin/church-management/members"
Write-Host ""
Write-Host "Note: This is the compiled site (dist), not src/. Your editable code stays in src/."
