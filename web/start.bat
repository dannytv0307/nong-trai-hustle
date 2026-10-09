@echo off
REM Bam dup de bat game (database + server + client) bang Docker, roi mo trinh duyet.
cd /d "%~dp0"

docker info >nul 2>&1
if errorlevel 1 (
  echo [!] Docker Desktop chua chay. Hay mo Docker Desktop, doi bieu tuong ca voi dung yen, roi bam lai file nay.
  pause
  exit /b 1
)

echo Dang bat database + server + client (lan dau co the mat vai phut)...
docker compose up -d --build --wait --wait-timeout 600
if errorlevel 1 (
  echo.
  echo [!] Co loi khi khoi dong. 40 dong log gan nhat:
  docker compose logs --tail=40 server client
  pause
  exit /b 1
)

echo.
echo San sang! Dang mo http://localhost:5173
echo  - Xem log:  mo terminal o thu muc web, chay: npm run logs
echo  - Dung lai: bam dup stop.bat
start "" http://localhost:5173
"%SystemRoot%\System32\timeout.exe" /t 5 >nul
