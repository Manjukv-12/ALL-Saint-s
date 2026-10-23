# Church management Members page — dev UI + Hostinger data (same as live site).
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm packages..."
  npm install
}

Write-Host ""
Write-Host "Members page (live data from Hostinger):"
Write-Host "  http://127.0.0.1:5174/#/admin/church-management/members"
Write-Host ""
Write-Host "Log in with your church-mgmt password (same as csiallsaintstcr.com)."
Write-Host "Avoid Add/Edit/Delete unless you mean to change LIVE records."
Write-Host ""

npm run dev:live-api
