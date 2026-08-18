@echo off
echo ========================================
echo    FIXORA - Tüm Servisleri Başlat
echo ========================================
echo.

echo [1/2] Backend başlatılıyor...
cd /d "C:\Users\barda\OneDrive\Desktop\FIXORA\backend"
start "FIXORA Backend" cmd /c "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo [2/2] Backend 5 saniye içinde başlayacak...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    Backend: http://localhost:8000
echo    n8n:     http://localhost:5678
echo ========================================
echo.
echo Backend çalışıyor. Bu pencereyi kapatma!
echo Durdurmak için Ctrl+C yap.
echo.
pause