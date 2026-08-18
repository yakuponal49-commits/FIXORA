@echo off
setlocal EnableExtensions

set "PROJECT=%~dp0"
set "ANDROID_DIR=%PROJECT%android"
set "ADB=C:\Users\barda\AppData\Local\Android\Sdk\platform-tools\adb.exe"
set "APK_OUT=%PROJECT%android\app\build\outputs\apk\release\app-release.apk"

echo [1/4] Release APK derleniyor (JS bundle APK icine gomulur, Metro/WiFi gereksiz)...
cd /d "%ANDROID_DIR%"
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo.
    echo DERLEME HATASI - Android Studio loglarini kontrol edin.
    pause
    exit /b 1
)

echo.
echo [2/4] Telefon baglantisi kontrol ediliyor...
"%ADB%" devices

echo.
echo [3/4] Backend yonlendirmesi kuruluyor (USB uzerinden 8000)...
"%ADB%" reverse tcp:8000 tcp:8000

echo.
echo [4/4] Uygulama telefona kuruluyor...
"%ADB%" install -r "%APK_OUT%"
if errorlevel 1 (
    echo.
    echo KURULUM HATASI - Telefonu kontrol edin.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  Basarili! FIXORA artik Metro ve WiFi gerektirmez.
echo  Telefonu USB ile takin, uygulama sorunsuz acilir.
echo  Not: expo start / debug surum kullanmayin, bu hata geri doner.
echo ============================================================
pause
