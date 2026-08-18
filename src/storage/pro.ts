import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_KEY = 'fixora.pro';
const PRO_EXPIRY_KEY = 'fixora.pro.expiry'; // Pro sona erme tarihi (timestamp)
const DAILY_USAGE_KEY = 'fixora.daily.usage';

/** Ücretsiz kullanıcı için günlük analiz limiti. */
export const FREE_DAILY_LIMIT = 1;

export async function isPro(): Promise<boolean> {
  try {
    const proStatus = (await AsyncStorage.getItem(PRO_KEY)) === '1';
    if (!proStatus) return false;

    // Pro süresi dolmuş mı kontrol et
    const expiryStr = await AsyncStorage.getItem(PRO_EXPIRY_KEY);
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        // Pro süresi doldu, resetle
        await setPro(false);
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export async function setPro(on: boolean, durationDays?: number): Promise<void> {
  try {
    if (on) {
      await AsyncStorage.setItem(PRO_KEY, '1');
      if (durationDays) {
        const expiry = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        await AsyncStorage.setItem(PRO_EXPIRY_KEY, expiry.toString());
      }
    } else {
      await AsyncStorage.removeItem(PRO_KEY);
      await AsyncStorage.removeItem(PRO_EXPIRY_KEY);
    }
  } catch {
    /* yoksay */
  }
}

function dayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface DailyUsage {
  day: string;
  count: number;
}

async function readDailyUsage(): Promise<DailyUsage> {
  try {
    const raw = await AsyncStorage.getItem(DAILY_USAGE_KEY);
    const u = raw ? (JSON.parse(raw) as DailyUsage) : null;
    if (u && u.day === dayKey() && typeof u.count === 'number') return u;
    return { day: dayKey(), count: 0 };
  } catch {
    return { day: dayKey(), count: 0 };
  }
}

async function writeDailyUsage(u: DailyUsage): Promise<void> {
  try {
    await AsyncStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(u));
  } catch {
    /* yoksay */
  }
}

/** Analiz yapılabilir mi? (Pro her zaman evet, ücretsizde günlük limit.) */
export async function canAnalyze(): Promise<{ allowed: boolean; remaining: number }> {
  const pro = await isPro();
  if (pro) return { allowed: true, remaining: Infinity };
  const u = await readDailyUsage();
  return { allowed: u.count < FREE_DAILY_LIMIT, remaining: Math.max(0, FREE_DAILY_LIMIT - u.count) };
}

/** Başarılı bir analizden sonra kullanımı artırır. */
export async function recordAnalysis(): Promise<void> {
  const pro = await isPro();
  if (pro) return;
  const u = await readDailyUsage();
  u.count += 1;
  await writeDailyUsage(u);
}

export async function resetUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DAILY_USAGE_KEY);
  } catch {
    /* yoksay */
  }
}
