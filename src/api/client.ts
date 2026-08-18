import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { BACKEND_URL, DEFAULT_MODEL_ID } from '../auth/config';

// Gemini anahtarlari ve kota rotasyonu ARTIK sunucuda yapilir (Desktop\FIXORA\backend).
// Bu istemci yalnizca backend'e baglanir:
//   - /api/chat/stream  (SSE, kelime kelime akmasi)
//   - /api/chat         (tek parca JSON cevap)
// API anahtarlari asla uygulamaya gomulmez.

export interface PendingMedia {
  uri: string;
  name: string;
  type: string;
}

export interface AnalyzeInput {
  language: string;
  description?: string;
  modelId?: string;
  files?: PendingMedia[];
  category?: string;
  subcategory?: string;
}

export interface AnalyzeResponse {
  ok: boolean;
  kind: 'image' | 'video' | 'audio' | 'text';
  language: string;
  timestamp: string;
  analysis: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/3gpp'];

// Backend'e ulasilabilecek adresler, oncelik sirasina gore:
//   1) 127.0.0.1    -> adb reverse (USB baglantisinda telefondaki 8000, PC'deki
//                      backend'e yonlendirilir; WiFi/hucresel ayarindan bagimsiz calisir)
//   2) BACKEND_URL  -> LAN (WiFi) uzerinden PC
// Ilk sağlık kontrolünde hangisi yanit verirse o kullanilir ve oturum boyunca hatirlanir.
const BACKEND_CANDIDATES = ['http://127.0.0.1:8000', BACKEND_URL];

let resolvedBaseUrl: string | null = null;

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, cancel: () => clearTimeout(t) };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Kullanilabilir backend adresini secer ve oturum icin cache'ler. */
async function resolveBackendUrl(): Promise<string> {
  if (resolvedBaseUrl) return resolvedBaseUrl;
  for (const base of BACKEND_CANDIDATES) {
    const ms = base.startsWith('http://127.0.0.1') ? 3000 : 35000;
    // Canli sunucu (Render ucretsiz plani) uyku/bol-yayin sirasinda 503/502
    // donebilir; hata vermeden once birkaç kez bekleyip tekrar deneriz.
    const attempts = base.startsWith('http://127.0.0.1') ? 1 : 3;
    for (let i = 0; i < attempts; i++) {
      try {
        const { signal, cancel } = withTimeout(ms);
        const res = await fetch(`${base}/health`, { signal });
        cancel();
        if (res.ok) {
          resolvedBaseUrl = base;
          return base;
        }
      } catch {
        // sonraki deneme / aday
      }
      if (i < attempts - 1) await sleep(5000 * (i + 1));
    }
  }
  throw new Error('');
}

function invalidateBackendUrl() {
  resolvedBaseUrl = null;
}

// Gemini'in gorsel sinirlarini asmamak icin gorseller 1024px'e kucultulur
// ve JPEG olarak base64'e cevrilir. HEIC/HEIF bu sayede de desteklenir.
async function imageToBase64(uri: string): Promise<string> {
  try {
    const res = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    if (res.base64) return res.base64;
  } catch {
    // Manipulator basarisiz olursa ham base64'e geri don.
  }
  const f = new File(uri);
  return await f.base64();
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

/**
 * OpenAI-uyumlu content array: metin + (varsa) goruntuler. Video/ses desteklenmez;
 * video icin ilk kare cikarilir, ses dosyasi metin olarak eklenir.
 */
function languageName(code: string): string {
  if (code === 'de') return 'German';
  if (code === 'fr') return 'French';
  return 'English';
}

function userPrefix(code: string): string {
  if (code === 'de') return 'Benutzer:';
  if (code === 'fr') return 'Utilisateur :';
  return 'User:';
}

async function buildContentParts(
  input: AnalyzeInput
): Promise<Array<{ type: string; text?: string; image_url?: { url: string } }>> {
  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  const files = input.files ?? [];
  for (const file of files) {
    if (IMAGE_TYPES.includes(file.type)) {
      const base64 = await imageToBase64(file.uri);
      console.log('[FIXORA] file part', file.type, base64.length, 'bytes');
      parts.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${base64}` },
      });
    } else if (VIDEO_TYPES.includes(file.type)) {
      // Videodan ilk kareyi cikar ve goruntu olarak analize gonder.
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
          time: 500,
          quality: 0.7,
        });
        const base64 = await imageToBase64(uri);
        console.log('[FIXORA] video frame part', file.type, base64.length, 'bytes');
        parts.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}` },
        });
        parts.push({
          type: 'text',
          text: `[Video angehängt: ${file.name} – erstes Standbild wurde als Referenz hinzugefügt.]`,
        });
      } catch (err) {
        console.log('[FIXORA] video thumbnail failed', err);
        parts.push({
          type: 'text',
          text: `[Video angehängt: ${file.name} – konnte nicht analysiert werden. Beschreibe kurz, was im Video zu sehen ist.]`,
        });
      }
    } else {
      // Ses gibi diger dosyalar analiz icin metin olarak iletilir.
      parts.push({
        type: 'text',
        text: `[Datei angehängt: ${file.name} (${file.type}) – kann vom aktuellen Modell nicht direkt analysiert werden. Nutze die textuelle Beschreibung.]`,
      });
    }
  }

  if (input.description?.trim()) {
    parts.push({ type: 'text', text: `${userPrefix(input.language)} ${input.description.trim()}` });
  }

  if (parts.length === 0) {
    throw new Error('EMPTY');
  }

  // Dil kuralini kullanici mesajina acikca ekle: gorselde baska bir dil olsa bile
  // yanit her zaman uygulama dilinde doner.
  if (input.language) {
    const lang = languageName(input.language);
    parts.unshift({
      type: 'text',
      text: `The user's language is ${lang} (${input.language}). Your ENTIRE reply must be written in ${lang}. Never reply in another language, even if the image or text above is in another language.`,
    });
  }

  return parts;
}

/** Backend'in /api/chat ucuyla ayni body yapisi: dil + model + mesajlar (system'i backend ekler). */
function buildBackendBody(
  language: string,
  modelId: string,
  messages: ChatMessage[]
): Record<string, unknown> {
  return { language, modelId, messages };
}

/** Backend hata govdesinden (HTTPException detail) anlamli bir ModelError uretir. */
function parseBackendError(status: number, raw: string): ModelError {
  let detail = raw.trim().slice(0, 400);
  try {
    const json = JSON.parse(raw);
    if (json?.detail) detail = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
  } catch {
    // ham metni kullan
  }
  if (status === 401) return new ModelError(401, 'NO_API_KEY');
  if (status === 429) return new ModelError(429, 'QUOTA');
  if (status === 404 || /MODEL_NOT_SUPPORTED/i.test(detail)) return new ModelError(404, 'MODELS_NOT_SUPPORTED');
  if (status >= 400 && status < 500 && detail) return new ModelError(status, detail);
  return new ModelError(status, detail || `Server error (HTTP ${status}).`);
}

/** Backend /api/chat: tek parca JSON cevap. */
async function backendJson(body: Record<string, unknown>): Promise<string> {
  let res: Response;
  try {
    const base = await resolveBackendUrl();
    res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    invalidateBackendUrl();
    throw e;
  }

  if (!res.ok) {
    const raw = await res.text();
    console.log('[FIXORA] /api/chat HTTP', res.status, 'raw=', raw.slice(0, 800));
    throw parseBackendError(res.status, raw);
  }

  const json = await res.json().catch(() => null);
  const text = json?.analysis;
  if (typeof text === 'string' && text.trim()) return text;
  throw new Error('EMPTY');
}

/**
 * Hermes'in TextDecoder akis modu bazi cihazlarda satir satir gelen cok baytli
 * UTF-8 karakterleri bozar (ornegin "çözüm" -> "??öz??üm"). Bunun yerine
 * baytlari biriktirip YALNIZCA tamamlanan karakterleri cozen el ile bir
 * artimli UTF-8 cozucusu kullanilir.
 */
class Utf8IncrementalDecoder {
  private pending: number[] = [];

  decode(bytes: Uint8Array, final: boolean): string {
    const all = this.pending.concat(Array.from(bytes));
    this.pending = [];
    let out = '';
    let i = 0;
    while (i < all.length) {
      const b = all[i];
      let len = 0;
      let cp = 0;
      if (b < 0x80) {
        len = 1;
        cp = b;
      } else if ((b & 0xe0) === 0xc0) {
        len = 2;
        cp = b & 0x1f;
      } else if ((b & 0xf0) === 0xe0) {
        len = 3;
        cp = b & 0x0f;
      } else if ((b & 0xf8) === 0xf0) {
        len = 4;
        cp = b & 0x07;
      } else {
        // Hatalı başlangıç baytı: atla
        i += 1;
        continue;
      }
      if (i + len > all.length) {
        // Karakter yarım kaldı: sonraki chunk'ta tamamlansin diye sakla.
        this.pending = all.slice(i);
        break;
      }
      let valid = true;
      for (let k = 1; k < len; k++) {
        const cb = all[i + k];
        if ((cb & 0xc0) !== 0x80) {
          valid = false;
          break;
        }
        cp = (cp << 6) | (cb & 0x3f);
      }
      if (!valid) {
        // Geçersiz sekans: ilk baytı atla, geri kalanını tekrar dene
        i += 1;
        continue;
      }
      try {
        out += String.fromCodePoint(cp);
      } catch {
        out += '\ufffd';
      }
      i += len;
    }
    if (final && this.pending.length) {
      out += '\ufffd';
      this.pending = [];
    }
    return out;
  }
}

/**
 * Backend /api/chat/stream: SSE ile parça parça akar.
 * Her olay `data: {"text": "<o ana kadar biriken TAM metin>"}` bicimindedir;
 * onDelta'ya tam metin iletilir, fonksiyon nihayetinde tam metni döndürür.
 */
async function backendStream(
  body: Record<string, unknown>,
  onDelta: (fullText: string) => void,
  signal: AbortSignal | undefined
): Promise<string> {
  console.log('[FIXORA] /api/chat/stream bytes:', JSON.stringify(body).length);
  let res: Response;
  try {
    const base = await resolveBackendUrl();
    res = await fetch(`${base}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    invalidateBackendUrl();
    throw e;
  }

  if (!res.ok) {
    const raw = await res.text();
    console.log('[FIXORA] /api/chat/stream HTTP', res.status, 'raw=', raw.slice(0, 800));
    throw parseBackendError(res.status, raw);
  }

  if (!res.body) throw new Error('EMPTY');

  const reader = res.body.getReader();
  const utf8 = new Utf8IncrementalDecoder();
  let buffer = '';
  let fullText = '';
  let doneEvent = false;

  const processLine = (line: string) => {
    const t = line.trim();
    if (!t.startsWith('data:')) return;
    const data = t.slice(5).trim();
    if (!data) return;
    if (data === '[DONE]') {
      doneEvent = true;
      return;
    }
    const json = JSON.parse(data);
    if (json?.error) {
      throw new ModelError(json.error ?? 502, json.message || 'Provider stream error');
    }
    const text = json?.text;
    if (typeof text === 'string') {
      fullText = text;
      onDelta(fullText);
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += utf8.decode(value, false);
    let idx: number;
    while ((idx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      processLine(line);
    }
  }
  buffer += utf8.decode(new Uint8Array(0), true);
  if (buffer) processLine(buffer);

  if (doneEvent && !fullText) throw new Error('EMPTY');
  return fullText;
}

export async function analyzeProblemStream(
  input: AnalyzeInput,
  onDelta: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const modelId = input.modelId && input.modelId.trim() ? input.modelId.trim() : DEFAULT_MODEL_ID;
  const contentParts = await buildContentParts(input);
  const body = buildBackendBody(input.language, modelId, [{ role: 'user', content: contentParts }]);
  return await backendStream(body, onDelta, signal);
}

export async function analyzeProblem(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const kind = detectKind(input.files?.[0]?.type);
  const modelId = input.modelId && input.modelId.trim() ? input.modelId.trim() : DEFAULT_MODEL_ID;
  const contentParts = await buildContentParts(input);
  const body = buildBackendBody(input.language, modelId, [{ role: 'user', content: contentParts }]);
  const text = await backendJson(body);
  return { ok: true, kind, language: input.language, timestamp: new Date().toISOString(), analysis: text };
}

/**
 * Sohbet devamı: kullanıcının yeni bir sorusu/mesajı. İlk analiz + kullanıcı mesajı
 * history'sini olduğu gibi korur, yeni soruyu ekler ve güncellenmiş/yanıtlı metni döndürür.
 */
export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

function buildChatMessages(
  original: AnalyzeInput,
  analysis: string,
  turns: ChatTurn[]
): Promise<ChatMessage[]> {
  return buildContentParts(original).then((originalParts) => {
    const messages: ChatMessage[] = [
      { role: 'user', content: originalParts },
      { role: 'assistant', content: analysis },
    ];
    for (const turn of turns) {
      messages.push({ role: turn.role, content: turn.text });
    }
    return messages;
  });
}

export async function continueChatStream(
  input: {
    language: string;
    modelId: string;
    original: AnalyzeInput;
    analysis: string;
    turns: ChatTurn[];
  },
  onDelta: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const modelId = input.modelId && input.modelId.trim() ? input.modelId.trim() : DEFAULT_MODEL_ID;
  const messages = await buildChatMessages(input.original, input.analysis, input.turns);
  const body = buildBackendBody(input.language, modelId, messages);
  return await backendStream(body, onDelta, signal);
}

export async function continueChat(input: {
  language: string;
  modelId: string;
  original: AnalyzeInput;
  analysis: string;
  turns: ChatTurn[];
}): Promise<string> {
  const modelId = input.modelId && input.modelId.trim() ? input.modelId.trim() : DEFAULT_MODEL_ID;
  const messages = await buildChatMessages(input.original, input.analysis, input.turns);
  const body = buildBackendBody(input.language, modelId, messages);
  return await backendJson(body);
}

function detectKind(mime?: string): AnalyzeResponse['kind'] {
  if (!mime) return 'text';
  if (IMAGE_TYPES.includes(mime)) return 'image';
  if (mime.startsWith('audio')) return 'audio';
  return 'video';
}

export class ModelError extends Error {
  status: number;
  kind: string;
  constructor(status: number, kind: string) {
    super(kind);
    this.name = 'ModelError';
    this.status = status;
    this.kind = kind;
  }
}

export function isAuthError(e: unknown): boolean {
  return e instanceof ModelError && (e.status === 401 || e.kind === 'NO_API_KEY');
}

export type PromoResultKind = 'success' | 'invalid' | 'limit' | 'network';

export interface PromoResult {
  valid: boolean;
  kind: PromoResultKind;
}

/** Promo kodunu backend'te doğrula. Mesajlar çeviri dosyasından alınır (kind bazlı). */
export async function validatePromoCode(code: string): Promise<PromoResult> {
  try {
    const base = await resolveBackendUrl();
    const res = await fetch(`${base}/api/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    });

    const json = await res.json().catch(() => null);
    const valid = json?.valid === true;
    if (valid) return { valid: true, kind: 'success' };
    return { valid: false, kind: json?.reason === 'limit' ? 'limit' : 'invalid' };
  } catch (e) {
    invalidateBackendUrl();
    return { valid: false, kind: 'network' };
  }
}

const DEFAULT_MATERIAL_ICON = '🧰';

/**
 * Malzeme/ekipman adlarinin her biri icin temsil ikonunu backend'in kutuphanesinden
 * (/api/materials/icons) getirir. Ikonlar AI tarafindan URETILMEZ; backend'deki
 * cok dilli anahtar kelime eslemesiyle secilir. Gelen dizi istenen sirayla aynidir.
 * Backend ulasilamazsa bos dizi doner (cagiran taraf varsayilan ikonu kullanir).
 */
export async function resolveMaterialIcons(items: string[], language: string): Promise<string[]> {
  if (!items.length) return [];
  try {
    const base = await resolveBackendUrl();
    const res = await fetch(`${base}/api/materials/icons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, language }),
    });
    if (!res.ok) return [];
    const json = await res.json().catch(() => null);
    const arr = json?.items;
    if (!Array.isArray(arr)) return [];
    return items.map((item, i) => arr[i]?.icon || DEFAULT_MATERIAL_ICON);
  } catch (e) {
    invalidateBackendUrl();
    return [];
  }
}
