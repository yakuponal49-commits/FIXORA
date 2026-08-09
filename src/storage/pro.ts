import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_KEY = 'fixora.pro';
const USAGE_KEY = 'fixora.usage';

/** Ücretsiz kullanıcı için aylık analiz limiti (Pro MVP kapsamı). */
export const FREE_LIMIT = 4;

export async function isPro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PRO_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setPro(on: boolean): Promise<void> {
  try {
    if (on) await AsyncStorage.setItem(PRO_KEY, '1');
    else await AsyncStorage.removeItem(PRO_KEY);
  } catch {
    /* yoksay */
  }
}

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface Usage {
  month: string;
  count: number;
}

async function readUsage(): Promise<Usage> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    const u = raw ? (JSON.parse(raw) as Usage) : null;
    if (u && u.month === monthKey() && typeof u.count === 'number') return u;
    return { month: monthKey(), count: 0 };
  } catch {
    return { month: monthKey(), count: 0 };
  }
}

async function writeUsage(u: Usage): Promise<void> {
  try {
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(u));
  } catch {
    /* yoksay */
  }
}

/** Analiz yapılabilir mi? (Pro her zaman evet, ücretsizde aylık limit.) */
export async function canAnalyze(): Promise<{ allowed: boolean; remaining: number }> {
  const pro = await isPro();
  if (pro) return { allowed: true, remaining: Infinity };
  const u = await readUsage();
  return { allowed: u.count < FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - u.count) };
}

/** Başarılı bir analizden sonra kullanımı artırır. */
export async function recordAnalysis(): Promise<void> {
  const pro = await isPro();
  if (pro) return;
  const u = await readUsage();
  u.count += 1;
  await writeUsage(u);
}

export async function resetUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USAGE_KEY);
  } catch {
    /* yoksay */
  }
}
