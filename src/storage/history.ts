import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyzeInput, PendingMedia } from '../api/client';
import { estimateSavings } from '../utils/savings';

export interface HistoryEntry {
  id: string;
  date: number;
  language: string;
  category?: string;
  subcategory?: string;
  description?: string;
  analysis: string;
  files?: PendingMedia[];
  saved?: number | null;
}

const KEY = 'fixora.history';
const MAX = 30;

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveHistory(list: HistoryEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* yoksay */
  }
}

export function entryFromAnalysis(input: AnalyzeInput, analysis: string): HistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
    language: input.language,
    category: input.category,
    subcategory: input.subcategory,
    description: input.description,
    analysis,
    files: input.files?.length ? input.files : undefined,
    saved: estimateSavings(analysis),
  };
}

export function totalSaved(entries: HistoryEntry[]): number {
  return entries.reduce((sum, e) => sum + (typeof e.saved === 'number' ? e.saved : 0), 0);
}
