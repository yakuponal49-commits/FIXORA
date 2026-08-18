# FIXORA - Render.com Deployment Rehberi

## 1. Backend Deploy

### GitHub'a Yükleme
```bash
cd C:\Users\barda\OneDrive\Desktop\FIXORA
git init
git add .
git commit -m "FIXORA: n8n automations + Render.com deployment"
git remote add origin https://github.com/BARDAVCI2025/FIXORA.git
git push -u origin main
```

### Render.com'da Backend Oluşturma
1. https://render.com'a git
2. "New +" → "Web Service"
3. GitHub repo'yu seç: `BARDAVCI2025/FIXORA`
4. Ayarlar:
   - **Name:** `fixora-api`
   - **Runtime:** Python
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && gunicorn app.main:app --workers 2 --timeout 120 --bind 0.0.0.0:$PORT`
   - **Plan:** Free

### Environment Variables (Render.com'da ekle)
```
GEMINI_API_KEYS=["key1","key2","key3","key4","key5"]
GEMINI_MODELS=["gemini-3.5-flash","gemini-3.1-flash-lite"]
QUOTA_COOLDOWN_SECONDS=600
DEFAULT_LANGUAGE=de
INPUT_RETENTION_MINUTES=15
N8N_WEBHOOK_URL=https://fixora-n8n.onrender.com/webhook
PYTHON_VERSION=3.11
```

### Backend URL
Deploy sonrası URL: `https://fixora-api-ee1z.onrender.com`

---

## 2. n8n Deploy

### Render.com'da Docker Service Oluşturma
1. https://render.com'a git
2. "New +" → "Web Service"
3. GitHub repo'yu seç
4. Ayarlar:
   - **Name:** `fixora-n8n`
   - **Runtime:** Docker
   - **Dockerfile Path:** `./n8n-deploy/Dockerfile`
   - **Plan:** Free (512MB RAM, sleeps after 15 min inactivity)

### Environment Variables (n8n için)
```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_PASSWORD=fixora2025
N8N_ENCRYPTION_KEY=fixora-secret-key-change-this
WEBHOOK_URL=https://fixora-n8n.onrender.com
GENERIC_TIMEZONE=Europe/Istanbul
```

### n8n URL
Deploy sonrası URL: `https://fixora-n8n.onrender.com`

### n8n'i IMPORT ET
1. n8n URL'ine git
2. Login ol (admin/fixora2025)
3. Settings → Import/Export → Import
4. `n8n-workflows/` klasöründeki JSON dosyalarını yükle
5. Workflow'ları aktif et

---

## 3. Webhook URL'lerini Güncelle

### Backend'de (Render.com Environment Variables)
```
N8N_WEBHOOK_URL=https://fixora-n8n.onrender.com/webhook
```

### n8n'de (Workflow'ları düzenle)
Tüm HTTP Request node'larında URL'leri güncelle:
- Eski: `http://host.docker.internal:8000/health`
- Yeni: `https://fixora-api-ee1z.onrender.com/health`

- Eski: `http://host.docker.internal:8000/api/analytics/daily`
- Yeni: `https://fixora-api-ee1z.onrender.com/api/analytics/daily`

- Eski: `http://host.docker.internal:8000/api/promo/list`
- Yeni: `https://fixora-api-ee1z.onrender.com/api/promo/list`

---

## 4. Test

### Backend Testi
```bash
curl https://fixora-api-ee1z.onrender.com/health
# Beklenen: {"status":"ok"}
```

### n8n Testi
1. n8n'de Health Monitor workflow'unu aç
2. "Execute Workflow" butonuna bas
3. Telegram'a mesaj gelmeli

---

## 5. Sorun Giderme

### n8n Uyuyorsa (Free Plan)
- İlk istekte 30-60 sn gecikme olur
- 15 dk hareket yoksa uyur
- Solution: Health Monitor her 5 dk çalıştığı için uyanık kalır

### Backend Uyuyorsa
- İlk istekte cold start (30-60 sn)
- Sonra hızlı yanıt verir

### Webhook Çalışmıyorsa
1. n8n'de webhook URL'ini kontrol et
2. Backend'de N8N_WEBHOOK_URL environment variable'ını kontrol et
3. Telegram bot token'ını kontrol et
