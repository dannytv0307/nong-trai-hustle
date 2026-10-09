@echo off
REM Bam dup de dung game (database + server + client). Du lieu database van duoc giu lai.
cd /d "%~dp0"
docker compose down
echo Da dung. Du lieu van con; bam start.bat de bat lai.
"%SystemRoot%\System32\timeout.exe" /t 5 >nul
