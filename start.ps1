$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== 7 WONDERS - AVVIO ===" -ForegroundColor Yellow
Write-Host ""

# Trova pnpm o usa npx pnpm
$pnpm = "npx pnpm"
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpm = "pnpm"
}
Write-Host "Package manager: $pnpm" -ForegroundColor Cyan

# 1. Installa dipendenze
Write-Host ""
Write-Host "[1/3] Installazione dipendenze..." -ForegroundColor Cyan
Set-Location $Root
Invoke-Expression "$pnpm install"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] pnpm install fallito." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dipendenze installate." -ForegroundColor Green

# 2. Build shared
Write-Host ""
Write-Host "[2/3] Build pacchetto shared..." -ForegroundColor Cyan
Set-Location "$Root\packages\shared"
Invoke-Expression "$pnpm run build"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRORE] Build shared fallita." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Shared compilato." -ForegroundColor Green

# 3. Avvia server e client in finestre separate
Write-Host ""
Write-Host "[3/3] Avvio server e client..." -ForegroundColor Cyan
Write-Host "  Server -> http://localhost:2567" -ForegroundColor Magenta
Write-Host "  Client -> http://localhost:5173" -ForegroundColor Magenta
Write-Host ""

$serverDir = "$Root\apps\server"
$clientDir = "$Root\apps\client"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$serverDir'; $pnpm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientDir'; $pnpm run dev"

Write-Host "[OK] Apri il browser su http://localhost:5173" -ForegroundColor Green
