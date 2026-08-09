# HostBott'a Dağıtım (FIXORA Backend)

Backend'i HostBott Python Hosting'e (hostbott.ch/python-hosting-schweiz) kurma
adımları. HostBott webhosting paketlerinin her birinde Python 3.13 runtime
dahildir; FastAPI/ASGI uygulamaları **gunicorn + uvicorn worker** ile, bağımlılıklar
**requirements.txt**'ten otomatik virtualenv'e yüklenerek çalışır.

---

## 1) Yüklenecek dosyalar

`Desktop\FIXORA\backend` klasörünün içeriğini sitenin kök dizinine yükle (FTP / paneldeki
Dosya Yöneticisi):

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py            <- FastAPI uygulaması (app değişkeni)
│   ├── config.py          <- .env'i BASE_DIR'den okur (CWD'den bağımsız)
│   ├── routers/
│   │   ├── __init__.py
│   │   └── analyze.py     <- /api/chat, /api/chat/stream, /api/analyze
│   └── services/
│       ├── __init__.py
│       └── gemini.py      <- anahtar + model rotasyonu, SSE akışı
├── requirements.txt
└── .env                   <- GERÇEK anahtarlar (aşağıya bak)
```

`.venv`, `__pycache__`, `.git` YÜKLENMEZ — sunucu kendi virtualenv'ini kurar.

## 2) .env dosyasını oluştur

Sitenin kök dizininde `.env` (üstteki ile aynı yer). Gerçek anahtarları gir;
bu dosya asla paylaşılmaz / commit edilmez:

```
GEMINI_API_KEYS=["AQ.gercek_anahtar1","AQ.gercek_anahtar2","AQ.gercek_anahtar3","AQ.gercek_anahtar4","AQ.gercek_anahtar5"]
GEMINI_MODELS=["gemini-3.5-flash","gemini-3.1-flash-lite"]
QUOTA_COOLDOWN_SECONDS=600
DEFAULT_LANGUAGE=de
INPUT_RETENTION_MINUTES=15
```

`GEMINI_API_KEYS`, pydantic tarafından JSON listesi olarak okunur. Boş ya da
`PASTE_YOUR` ile başlayanlar yok sayılır.

## 3) Panelde Python uygulamasını tanımla

HostBott panelinde (panel.hostbott.ch) site için:

1. Siteyi **Python 3.13 runtime** ile aç / uygulamaya çevir.
2. **App-Modul** alanına şunu yaz (format: `paket.modul:callable`):

   ```
   app.main:app
   ```

3. Deployment'ı tetikle: platform `requirements.txt`'i okur, her paketi ayrı
   virtualenv'e pip ile kurar ve gunicorn'u uvicorn worker'larıyla başlatır.
4. Site hemen `<name>.hostbott.site` adresinden kullanılabilir. Kendi domainini
   bağlarsan Let's Encrypt HTTPS otomatik verilir.

## 4) Doğrulama

Kurulumdan sonra tarayıcıda:

- `GET https://<name>.hostbott.site/health` → `{"status":"ok"}` gelmeli.
- `POST https://<name>.hostbott.site/api/chat/stream` ile SSE akışı test edilebilir:

  ```bash
  curl -N -X POST https://<name>.hostbott.site/api/chat/stream \
    -H "Content-Type: application/json" \
    -d '{"language":"de","modelId":"gemini-3.5-flash","messages":[{"role":"user","content":[{"type":"text","text":"Sag Hallo."}]}]}'
  ```

  Çıktı `data: {"text": ...}` olayları + sonunda `data: [DONE]` olmalı.

## 5) Mobil uygulamayı sunucuya bağla

`Desktop\FIXORA\src\auth\config.ts` içinde:

```ts
export const BACKEND_URL = 'https://<name>.hostbott.site';
```

Sonra APK'yı yeniden derle (android klasöründe):

```
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
.\gradlew.bat assembleRelease
```

API anahtarları artık uygulamada YOK — yalnızca sunucuda duruyor.

## Notlar

- **SSE / nginx buffering:** `/api/chat/stream` yanıtında `X-Accel-Buffering: no`
  başlığı var; bu, önündeki nginx'in akışı tamponlamasını engeller.
- **ffmpeg:** `/api/analyze` uç noktasındaki video kare çıkarma ffmpeg gerektirir;
  paylaşımlı hosting'de bulunmayabilir. Mobil uygulama videodan kareyi kendi
  (expo-video-thumbnails) çıkardığı için bu uç noktayı kullanmaz — etkilenmez.
- **Güncelleme:** yeni kod yükleyip deployment'ı tekrar tetiklemek yeterlidir;
  pip-cache yeniden kurulumları hızlandırır.
- **Kota:** rotasyon `QUOTA_COOLDOWN_SECONDS` kadar (varsayılan 600 sn) kotalı
  (anahtar, model) kombinasyonunu dinlendirir; 5 anahtar x 2 model havuzu kullanılır.
