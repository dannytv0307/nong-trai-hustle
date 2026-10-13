@echo off
REM Bam dup de bat game (database + server + client) bang Docker, roi mo trinh duyet.
REM Cong DB tren may doi duoc o web\.env (POSTGRES_PORT, mac dinh 5433) - xem web\.env.example.
cd /d "%~dp0"

echo [Buoc 1/3] Kiem tra Docker, cong may va file cau hinh server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0docker\preflight.ps1"
if errorlevel 1 (
  echo.
  pause
  exit /b 1
)

echo.
echo [Buoc 2/3] Dang bat database + server + client (lan dau co the mat 5-10 phut)...
docker compose up -d --build --wait --wait-timeout 600
if errorlevel 1 (
  echo.
  echo [!] Co loi khi khoi dong. 40 dong log gan nhat cua server va client:
  docker compose logs --tail=40 server client
  echo.
  echo Goi y: doc dong co chu "[config]" hoac "Error" o tren. Chup man hinh nay gui cho doi lam game neu chua ro.
  pause
  exit /b 1
)

echo.
echo [Buoc 3/3] San sang! Dang mo http://localhost:5173
echo  - Kiem tra server: http://localhost:3000/api/health  (thay "db":true la tot)
echo  - Xem log:  mo terminal o thu muc web, chay: npm run logs
echo  - Dung lai: bam dup stop.bat
start "" http://localhost:5173
"%SystemRoot%\System32\timeout.exe" /t 5 >nul
