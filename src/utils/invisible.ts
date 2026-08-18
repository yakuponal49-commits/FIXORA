/**
 * Görünmez / sıfır-genişlikteki karakterleri filtreleyen ortak yardımcılar.
 *
 * AI (Gemini) çıktısında satır başlarına/sonlarına veya satır içine serpiştirilmiş
 * zero-width space, ZWJ/ZWNJ, bidi kontrolü, varyasyon seçici vb. karakterler
 * sık görülür. Bunlar görünür hiçbir glif çizmez; RichText bunları "boş satır"
 * gibi tam satır yüksekliğinde çizip kartlarda (özellikle maliyet bölümünde)
 * 100-600px'lik dikey boşluklar oluşturur.
 *
 * Bu regex bilinçli olarak `u` bayrağı kullanmaz (Hermes uyumluluğu) ve astral
 * plan karakterleri (varyasyon seçiciler 17-256, etiket karakterleri) surrogate
 * çiftleri halinde hedeflenir.
 */

// Sıfır genişlikte / görünmez karakterler + C0/C1 kontrol karakterleri:
//   \u0000-\u001F, \u007F-\u009F   -> kontrol karakterleri
//   \u00AD                         -> soft hyphen
//   \u180E                         -> Mongolian vowel separator
//   \u200B-\u200F                  -> ZWSP, ZWNJ, ZWJ, LRM, RLM
//   \u2028\u2029                   -> line / paragraph separator
//   \u202A-\u202E                  -> bidi kontrolleri (LRE, RLE, PDF, LRO, RLO)
//   \u2060-\u206F                  -> word joiner, invisible operators, bidi isolates
//   \uFE00-\uFE0F                  -> varyasyon seçiciler 1-16
//   \uFEFF                         -> BOM / ZWNBSP
//   \uFFF9-\uFFFB                  -> interlinear annotation işaretleri
//   \uDB40[\uDC00-\uDDEF]          -> etiketler (E0000-E007F) + varyasyon seçiciler 17-256 (E0100-E01EF)
export const INVISIBLE_RE =
  /[\u0000-\u001F\u007F-\u009F\u00AD\u180E\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFE00-\uFE0F\uFEFF\uFFF9-\uFFFB]|\uDB40[\uDC00-\uDDEF]/g;

/** Satırdaki tüm görünmez karakterleri siler (normal görünür karakterler aynen kalır). */
export function stripInvisible(line: string): string {
  return line.replace(INVISIBLE_RE, '');
}

/**
 * Satırda görünür bir glif olup olmadığını söyler.
 * Yalnızca görünmez karakterler / boşluklardan oluşan satırlar için false döner;
 * böyle satırlar hiç çizilmemelidir (aksi halde boş satır yüksekliği kadar boşluk oluşur).
 */
export function hasVisibleContent(line: string): boolean {
  return stripInvisible(line).trim().length > 0;
}
