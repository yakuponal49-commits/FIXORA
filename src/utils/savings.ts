// Maliyet bölümünden sayısal tasarruf tahmini çıkarır. AI metni kararsız
// olabildiği için "iyi niyetli" bir ayrıştırıcı kullanırız: önce Save: satırı,
// yoksa Pro - DIY farkı.

const CURRENCY = /([\d.,]+)\s*(€|eur|euro|usd|\$|chf|tl|₺)/i;

export function parseMoney(s: string | undefined | null): number | null {
  if (!s) return null;
  const m = s.match(CURRENCY);
  if (!m) return null;
  let raw = m[1].replace(/,/g, '');
  if (raw.includes('.')) {
    const parts = raw.split('.');
    const dec = parts.pop() ?? '';
    raw = parts.join('') + '.' + dec;
  }
  const n = parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** AI cevabından tahmini tasarruf (para birimi cinsinden sayı) döndürür. */
export function estimateSavings(analysis: string): number | null {
  const lines = analysis.split('\n').map((l) => l.trim()).filter(Boolean);
  let diy: number | null = null;
  let pro: number | null = null;
  for (const line of lines) {
    if (/^[-•*\s]*Save:/i.test(line)) {
      const v = parseMoney(line.replace(/^[-•*\s]*Save:\s*/i, ''));
      if (v !== null) return v;
    } else if (/^[-•*\s]*DIY:/i.test(line)) {
      diy = parseMoney(line.replace(/^[-•*\s]*DIY:\s*/i, ''));
    } else if (/^[-•*\s]*Pro:/i.test(line)) {
      pro = parseMoney(line.replace(/^[-•*\s]*Pro:\s*/i, ''));
    }
  }
  if (diy !== null && pro !== null && pro > diy) return Math.round(pro - diy);
  return null;
}

export function formatMoney(n: number): string {
  const r = Math.round(n);
  const isEuro = n > 0; // basit gösterim; para birimi etiketi metinle gelir
  return isEuro ? `${r} €` : `${r}`;
}
