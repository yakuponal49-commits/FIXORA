@echo off
REM FIXORA backend'i baslatir. Bilgisayar acilinca Windows goreviyle otomatik calisir.
cd /d "C:\Users\barda\OneDrive\Desktop\FIXORA\backend"
start "" /min ".venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
