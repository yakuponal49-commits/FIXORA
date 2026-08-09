import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import i18n from './src/i18n';
import { defaultLanguage } from './src/i18n';
import { Language } from './src/i18n/translations';
import { DEFAULT_MODEL_ID } from './src/auth/config';
import { AnalyzeInput } from './src/api/client';
import { COLORS, RADIUS } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProUpsellScreen from './src/components/ProUpsellScreen';
import { recordAnalysis } from './src/storage/pro';
import {
  HistoryEntry,
  entryFromAnalysis,
  loadHistory,
  saveHistory,
} from './src/storage/history';

const LANG_KEY = 'fixora.lang';

function BottomNav({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const items: { key: Tab; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: t('navHome') },
    { key: 'history', icon: '🗂️', label: t('navHistory') },
  ];
  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {items.map((item) => {
        const active = tab === item.key;
        return (
          <Pressable key={item.key} style={styles.navItem} onPress={() => onSelect(item.key)}>
            <Text style={[styles.navIcon, active && styles.navIconActive]}>{item.icon}</Text>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type Tab = 'home' | 'history';

export default function App() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [original, setOriginal] = useState<AnalyzeInput | null>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [langLoaded, setLangLoaded] = useState(false);
  const [langChosen, setLangChosen] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [ratingPrompt, setRatingPrompt] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored) {
        setLanguage(stored as Language);
        i18n.changeLanguage(stored);
      }
      setLangLoaded(true);
    });
    loadHistory().then(setHistory);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  };

  const chooseLanguage = (lang: Language) => {
    changeLanguage(lang);
    setLangChosen(true);
  };

  const finishOnboarding = () => {
    setOnboardingDone(true);
  };

  const onResult = (input: AnalyzeInput, result: string) => {
    setOriginal(input);
    setAnalysis(result);
    recordAnalysis();
    // Bir kez değerlendirme sorulur: henüz kayıt yoksa ana ekranda kartı göster.
    AsyncStorage.getItem('fixora.rated').then((r) => {
      if (!r) setRatingPrompt(true);
    });
    setHistory((prev) => {
      const next = [entryFromAnalysis(input, result), ...prev];
      saveHistory(next);
      return next;
    });
  };

  const onDelete = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  };

  const onOpenEntry = (entry: HistoryEntry) => {
    setOriginal({
      language: entry.language as Language,
      description: entry.description,
      category: entry.category,
      subcategory: entry.subcategory,
    });
    setAnalysis(entry.analysis);
  };

  if (!langLoaded) {
    // Kayıtlı dil okunana kadar boş ekran.
    return (
      <SafeAreaProvider>
        <View style={[styles.overlay, styles.boot]} />
      </SafeAreaProvider>
    );
  }

  if (!langChosen) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <LanguageSelectScreen selected={language} onSelect={chooseLanguage} />
      </SafeAreaProvider>
    );
  }

  if (!onboardingDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onDone={finishOnboarding} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {tab === 'home' ? (
          <HomeScreen
            language={language}
            modelId={modelId}
            onModelChange={setModelId}
            onLanguageChange={changeLanguage}
            onResult={onResult}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenPro={() => setProOpen(true)}
            showRating={ratingPrompt}
            onDismissRating={() => setRatingPrompt(false)}
          />
        ) : (
          <HistoryScreen
            entries={history}
            onOpen={onOpenEntry}
            onDelete={onDelete}
            onStartNew={() => setTab('home')}
          />
        )}
      </SafeAreaView>
      <BottomNav tab={tab} onSelect={setTab} />
      {analysis !== null && original !== null && (
        <View style={styles.overlay}>
          <ResultScreen
            analysis={analysis}
            language={language}
            modelId={modelId}
            original={original}
            onBack={() => setAnalysis(null)}
          />
        </View>
      )}
      {settingsOpen && (
        <View style={styles.overlay}>
          <SettingsScreen onClose={() => setSettingsOpen(false)} onOpenPro={() => setProOpen(true)} />
        </View>
      )}
      {proOpen && (
        <View style={styles.overlay}>
          <ProUpsellScreen onClose={() => setProOpen(false)} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
  },
  boot: { flex: 1 },
  nav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 20, opacity: 0.55 },
  navIconActive: { opacity: 1 },
  navLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: COLORS.primaryLight, fontWeight: '800' },
});
