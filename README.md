# FIXORA — Direct-to-Gemini (no backend, no API key)

Ev içi ve ev aletleri arıza/hasar analizi yapan yapay zeka destekli mobil uygulama.

## Nasıl çalışır

- Kullanıcı **"Continue with Google"** ile kendi Gmail hesabıyla giriş yapar.
- Uygulama, kullanıcının kendi Google **Access Token**'ı ile doğrudan **Gemini API**'ye bağlanır.
- **Backend yoktur. API anahtarı yoktur. Geliştirici hesabı yoktur.**
- Foto / video / ses / metin analizi, kullanıcının kendi hesabı üzerinden işlenir.
- Oturum token'i güvenli biçimde `expo-secure-store` içinde saklanır ve süresi dolunca
  refresh token ile **arka planda otomatik yenilenir** (tekrar giriş istemez).

> Not: Gemini OAuth, istekleri mesuliyeti uygulamanın bağlı olduğu Google Cloud
> projesinin ücretsiz OAuth kotası (OAuth ile ~1000 istek/gün) üzerinden sayar.
> "Her kullanıcı kendi kişisel kotası" Google tarafından API'den kaldırıldı; buradaki
> asıl kazanım, tek bir geliştirici API anahtarına / ücretli hesaba gerek kalmamasıdır.

## Kurulum — tek seferlik Google Cloud adımı

Uygulamanın çalışması için bir **Google Cloud OAuth istemcisine** ihtiyacın var.
Client ID herkese açıktır (gizli değildir), sadece uygulamayı tanımlar.

1. **Google Cloud Console** → https://console.cloud.google.com → yeni/kendi projen.
2. **Google Auth Platform** → **Overview** → OAuth consent screen'i kur:
   - User type: **External**, Audience'ta kendini ve test edecek hesapları **test users** ekle.
   - Scopes'a ekle: `https://www.googleapis.com/auth/generative-language`
     (Gemini API erişimi — hassas kapsam, test modunda "unverified app" uyarısı çıkar, ilerlet).
3. **Credentials** → **Create credentials** → **OAuth client ID**:
   - **Android**: SHA-1 dahil (projedeki `android/app/build.gradle` debug.keystore SHA-1'i).
     Package adı: `com.fixora.app`
   - **iOS**: bundle id `com.fixora.app`
   - **Web**: istemci türü "Web app"
4. Aldığın 3 Client ID'yi `src/auth/config.ts` içindeki sabitlere yaz.
   - `GOOGLE_ANDROID_CLIENT_ID`
   - `GOOGLE_IOS_CLIENT_ID`
   - `GOOGLE_WEB_CLIENT_ID`
5. **Dev build** oluştur (Expo Go'da Google OAuth çalışmaz):
   ```
   npx expo run:android
   ```

App herkese açıldığında, test modunun 7 günlük refresh-token sınırını kaldırmak için
consent screen'i **"In production"** yap ve OAuth doğrulamasına gönder.

## Çalıştırma

```powershell
cd "C:\Users\barda\OneDrive\Desktop\FIXORA"
npm install
npx expo run:android
```

Telefon ile bilgisayar aynı ağda olmalı. Giriş sonrası sorunun fotoğraf/video/sesini
çek veya metin yaz → analiz sonuç ekranında adım adım tamirat rehberi ve risk seviyesi.