@echo off
setlocal enableextensions
title Basket Stats Keeper - Dev

rem Vai nella cartella dello script (funziona anche con doppio clic)
cd /d "%~dp0"

rem Porta di partenza: cambiala se preferisci.
set "PORT=9002"

echo ============================================
echo    Basket Stats Keeper - Avvio ambiente dev
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRORE] Node.js non trovato. Installa Node.js 18+ da https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRORE] npm non trovato nel PATH.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installazione delle dipendenze in corso ^(solo la prima volta, puo richiedere qualche minuto^)...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERRORE] Installazione delle dipendenze fallita.
    pause
    exit /b 1
  )
  echo.
)

rem Cerca una porta libera partendo da %PORT%
:findport
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>nul
if not errorlevel 1 (
  set /a PORT=PORT+1
  goto findport
)

echo Avvio del server di sviluppo sulla porta %PORT% ...
echo L'app verra aperta automaticamente nel browser.
echo File JSON di test: cartella "Json".
echo Per fermare l'app: chiudi questa finestra o premi CTRL+C.
echo.

start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 10; Start-Process 'http://localhost:%PORT%/'"

call npx next dev --turbopack -p %PORT%

echo.
echo Il server e stato arrestato.
pause
endlocal
