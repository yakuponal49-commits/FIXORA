# FIXORA n8n Otomasyon Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. n8n'i Açın
Tarayıcınızda şu adrese gidin: **http://localhost:5678**

### 2. Workflow'ları İçe Aktarma

Her bir workflow dosyasını n8n'e aktarın:

1. n8n arayüzünde **Workflows** menüsüne gidin
2. **Import from File** seçeneğini tıklayın
3. Sırasıyla şu dosyaları aktarın:
   - `01-health-monitor.json`
   - `03-error-alert.json`
   - `04-daily-report.json`

### 3. Telegram Credential'ı Ayarlama

**Adım 1: Telegram Bot Oluşturma**
1. Telegram'da `@BotFather`'ı bul
2. `/newbot` yaz
3. Bot adı: `FIXORA Alerts`
4. Username: `fixora_alerts_bot`
5. Token'ı kopyala

**Adım 2: Chat ID Bulma**
1. Botuna `/start` gönder
2. Tarayıcıda aç:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
3. `"chat":{"id":XXXXXXX}` adresinden ID'yi al

**Adım 3: n8n'de Credential Oluşturma**
1. Sol menüden **Credentials**'a git
2. **Add Credential** > `Telegram` ara ve seç
3. **Access Token** alanına token'ı yapıştır
4. **Save** (Kaydet) tıkla

**Adım 4: Workflow'larda Credential'ı Seçme**
1. Her workflow'daki Telegram node'una tıkla
2. **Credential** alanında az önce oluşturduğun credential'ı seç
3. **Chat ID** alanına自己的 Chat ID'ni yapıştır
4. Workflow'u **Enable** yap

### 4. Chat ID'yi Environment Variable Olarak Ekleme

n8n'de **Settings** > **Variables** bölümüne git:
- **Name:** `TELEGRAM_CHAT_ID`
- **Value:** Senin Chat ID'n (örn: `123456789`)

## 📋 Workflow Detayları

### 1. Backend Health Monitor
- **Çalışma:** Her 5 dakikada bir backend health check yapar
- **Amaç:** Backend'in çalışıp çalışmadığını kontrol eder
- **Uyarı:** Backend çökerse Telegram'a mesaj gider

### 2. Error Alert System
- **Çalışma:** Webhook ile hata bildirimi alır
- **Amaç:** Kritik hatalarda anlık bildirim gönderir
- **Webhook URL:** `http://localhost:5678/webhook/fixora-error`
- **Kullanım:** Backend'den hata olursa bu webhook'u çağırın

### 3. Daily Report
- **Çalışma:** Her gün saat 09:00'da rapor oluşturur
- **Amaç:** Günlük performans raporu gönderir
- **Not:** Bu workflow için backend'e analytics endpoint'i eklemeniz gerekir

## 🔧 Backend Entegrasyonu

### Hata Bildirimi

Backend'de hata oluştuğunda webhook'u çağırın:

```python
import httpx

async def send_error_alert(error_type: str, message: str, severity: str = "warning"):
    webhook_url = "http://localhost:5678/webhook/fixora-error"
    await httpx.AsyncClient().post(webhook_url, json={
        "errorType": error_type,
        "message": message,
        "severity": severity,
        "timestamp": datetime.now().isoformat()
    })
```

## 🔒 Güvenlik Notları

- Token'ları asla commit etmeyin
- n8n'i VPN arkasında çalıştırın
- Üretim ortamında HTTPS kullanın

## 🛠️ Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Telegram mesaj gelmiyor | Chat ID'nin doğru olduğundan emin olun |
| Workflow çalışmıyor | Credential'ın seçili olduğundan emin olun |
| Health check hata veriyor | Backend'in çalıştığını kontrol edin |