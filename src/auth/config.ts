// Yapilandirma: Gemini anahtarlari ve kota rotasyonu ARTIK cihazda DEGIL,
// kendi backend sunucumuzda duruyor (bkz. Desktop\FIXORA\backend). Telefon yalnizca
// backend'e baglanir; API anahtarlari asla APK icine gomulmez.
//
// Uygulamayi sunucuya baglamak icin BACKEND_URL'i doldurun:
//   - Yerel test (telefon ayni WiFi'daysa):  http://<PC-LAN-IP>:8000
//   - Canli (HostBott'ta kurulduktan sonra): https://<domain>
export const BACKEND_URL = 'http://10.40.25.240:8000';

export const BACKEND_URL_MISSING =
  !BACKEND_URL || !/^https?:\/\//.test(BACKEND_URL) || BACKEND_URL.includes('PASTE_YOUR');

// Kullaniciya sunulan AI modelleri (Gemini kimlikleri).
export interface AIModelOption {
  id: string;
  label: string;
  vision: boolean;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash (hizli, gorsel + metin)',
    vision: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite (en hizli, metin)',
    vision: false,
  },
];

// Baslangicta secili olan model (hizli + gorsel destegi).
export const DEFAULT_MODEL_ID = 'gemini-3.5-flash';

// Paylaşım (arkadaşlarınla paylaş) için uygulama mağazası linki.
// Play Store'a yayınlandığında paket kimliği böyle görünür; değiştirilebilir.
export const APP_STORE_URL = 'https://play.google.com/store/apps/details?id=com.fixora.app';