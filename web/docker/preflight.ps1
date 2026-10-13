# Kiem tra truoc khi bat stack Docker dev (start.bat va `npm run up` goi file nay).
#   1) Docker Desktop dang chay.
#   2) Cong tren may (DB = POSTGRES_PORT trong web/.env, mac dinh 5433; server 3000; client 5173)
#      khong bi chuong trinh KHAC chiem. Cong dang do chinh stack bph giu thi bo qua.
#   3) Chua co web/server/.env -> tao tu web/server/.env.example voi SESSION_SECRET ngau nhien.
#      KHONG bao gio in gia tri bi mat ra man hinh.
# Thoat ma 0 = OK; khac 0 = co van de (da in huong dan), khong bat gi ca.
# Chi dung cho kiem thu: BPH_SERVER_ENV_FILE = duong dan file .env server thay cho web/server/.env.
# File nay de ASCII (khong dau) de Windows PowerShell 5.1 doc dung o moi bang ma.

$ErrorActionPreference = 'Continue'
$webDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $webDir

function Say([string]$msg) { Write-Host $msg }
function Fail([string]$msg) { Write-Host ''; Write-Host $msg -ForegroundColor Yellow; exit 1 }

# --- 1) Docker ---------------------------------------------------------------
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Fail '[!] Docker Desktop chua chay. Hay mo Docker Desktop, doi bieu tuong ca voi dung yen, roi thu lai.'
}

# --- Doc cau hinh compose da giai bien (doc ca web/.env va bien moi truong) ----
$cfgText = (docker compose config --format json 2> $null) -join "`n"
if ($LASTEXITCODE -ne 0 -or -not $cfgText) {
  Fail ('[!] docker-compose.yml hoac web/.env co loi (vd. POSTGRES_PORT khong phai so). ' +
        'Chay "docker compose config" trong thu muc web de xem chi tiet.')
}
$cfg = $cfgText | ConvertFrom-Json

function Get-PublishedPort($svc, [int]$fallback) {
  try {
    $p = $cfg.services.$svc.ports | Select-Object -First 1
    if ($p -and $p.published) { return [int]$p.published }
  } catch { }
  return $fallback
}
$dbPort = Get-PublishedPort 'db' 5433
$checks = @(
  @{ Port = $dbPort; What = 'database (Postgres)'; DbPort = $true },
  @{ Port = (Get-PublishedPort 'server' 3000); What = 'server'; DbPort = $false },
  @{ Port = (Get-PublishedPort 'client' 5173); What = 'client (game)'; DbPort = $false }
)

# --- 2) Cong ---------------------------------------------------------------
$oursLines = @(docker ps --filter 'label=com.docker.compose.project=bph' --format '{{.Ports}}' 2> $null)
$allLines = @(docker ps --format '{{.Names}}|{{.Ports}}' 2> $null)

function Find-PortOwner([int]$port) {
  $pat = ':' + $port + '->'
  foreach ($l in $oursLines) { if ($l -and $l.Contains($pat)) { return $null } }   # cua chinh bph -> OK
  foreach ($l in $allLines) {
    if ($l -and $l.Contains($pat)) { return ('container Docker "' + $l.Split('|')[0] + '"') }
  }
  $pids = @()
  try {
    $pids = @(Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction Stop |
      Select-Object -ExpandProperty OwningProcess -Unique)
  } catch {
    # Khong co Get-NetTCPConnection hoac khong ai nghe -> thu netstat
    $pids = @(netstat -ano -p tcp 2> $null | Where-Object { $_ -match ('^\s*TCP\s+\S+:' + $port + '\s+\S+\s+LISTENING\s+(\d+)') } |
      ForEach-Object { [int]$Matches[1] } | Select-Object -Unique)
  }
  if ($pids.Count -eq 0) { return $null }
  $names = @()
  foreach ($procId in $pids) {
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($p) { $names += ($p.ProcessName + '.exe (PID ' + $procId + ')') } else { $names += ('PID ' + $procId) }
  }
  return ('chuong trinh ' + ($names -join ', '))
}

$problems = @()
foreach ($c in $checks) {
  $owner = Find-PortOwner $c.Port
  if ($owner) {
    $msg = "[!] Cong $($c.Port) cho $($c.What) dang bi chiem boi: $owner."
    if ($c.DbPort) {
      $msg += "`n    Cach sua: tat chuong trinh/container do, HOAC doi cong DB: sao chep web\.env.example thanh web\.env" +
              "`n    (neu chua co) roi sua dong POSTGRES_PORT=$($c.Port) thanh cong khac, vd POSTGRES_PORT=$($c.Port + 1)."
    } else {
      $msg += "`n    Cach sua: tat chuong trinh do (vd. cua so 'npm run dev' chay ngoai Docker, hoac container cua du an khac)."
    }
    $problems += $msg
  }
}
if ($problems.Count -gt 0) {
  Fail (($problems -join "`n") + "`n`nChua bat gi ca. Sua xong thi chay lai.")
}
Say "  - Cong may: database $dbPort, server 3000, client 5173 -> trong (hoac dang do chinh game nay dung)."

# --- 3) web/server/.env ------------------------------------------------------
$envFile = $env:BPH_SERVER_ENV_FILE
if (-not $envFile) { $envFile = Join-Path $webDir 'server\.env' }
if (Test-Path -LiteralPath $envFile) {
  Say '  - File cau hinh server (server\.env): da co.'
} else {
  $example = Join-Path $webDir 'server\.env.example'
  if (-not (Test-Path -LiteralPath $example)) { Fail "[!] Khong thay $example de tao server\.env." }
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $text = [System.IO.File]::ReadAllText($example, $utf8)

  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  $secret = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

  if ($text -match '(?m)^SESSION_SECRET=.*$') {
    $text = [regex]::Replace($text, '(?m)^SESSION_SECRET=[^\r\n]*', { param($m) 'SESSION_SECRET=' + $secret })
  } else {
    $text = $text.TrimEnd() + "`nSESSION_SECRET=$secret`n"
  }

  # DATABASE_URL cho luc chay server/test NGOAI Docker: khop cong + tai khoan DB cua compose.
  $dbEnv = $cfg.services.db.environment
  $u = 'bph'; $pw = 'bph_dev_only'; $dbn = 'bph'
  if ($dbEnv) {
    if ($dbEnv.POSTGRES_USER) { $u = $dbEnv.POSTGRES_USER }
    if ($dbEnv.POSTGRES_PASSWORD) { $pw = $dbEnv.POSTGRES_PASSWORD }
    if ($dbEnv.POSTGRES_DB) { $dbn = $dbEnv.POSTGRES_DB }
  }
  $dbUrl = 'postgresql://' + [uri]::EscapeDataString($u) + ':' + [uri]::EscapeDataString($pw) +
           '@localhost:' + $dbPort + '/' + $dbn + '?schema=public'
  $text = [regex]::Replace($text, '(?m)^DATABASE_URL=[^\r\n]*', { param($m) 'DATABASE_URL=' + $dbUrl })

  $dir = Split-Path -Parent $envFile
  if ($dir -and -not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($envFile, $text, $utf8)
  $secret = $null
  Say '  - Da tao file cau hinh server lan dau (server\.env) voi SESSION_SECRET ngau nhien.'
}

exit 0
