import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, RADIUS } from '../theme';
import { Language, SUPPORTED_LANGUAGES } from '../i18n/translations';
import Logo from '../components/Logo';

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

const LANG_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
};

export default function LanguageSelectScreen({ selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Logo size={140} />
        <Text style={styles.brandName}>{t('appName')}</Text>
        <Text style={styles.title}>{t('langSelectTitle')}</Text>
        <Text style={styles.subtitle}>{t('langSelectSubtitle')}</Text>

        <View style={styles.list}>
          {SUPPORTED_LANGUAGES.map((code) => {
            const active = code === selected;
            return (
              <Pressable
                key={code}
                style={[styles.item, active && styles.itemActive]}
                onPress={() => onSelect(code)}
              >
                <Text style={styles.flag}>{LANG_FLAGS[code]}</Text>
                <Text style={[styles.itemText, active && styles.itemTextActive]}>
                  {LANG_LABELS[code]}
                </Text>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const ACCENT = '#5856D6';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  brandName: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 26,
    letterSpacing: 2,
    marginTop: 14,
  },
  title: { color: COLORS.text, fontWeight: '800', fontSize: 22, marginTop: 28, textAlign: 'center' },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  list: { width: '100%', marginTop: 32, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  itemActive: {
    borderColor: ACCENT,
    backgroundColor: 'rgba(88, 86, 214, 0.08)',
  },
  flag: { fontSize: 22, marginRight: 14 },
  itemText: { color: COLORS.text, fontWeight: '700', fontSize: 17, flex: 1 },
  itemTextActive: { color: ACCENT },
  check: { color: ACCENT, fontWeight: '900', fontSize: 18 },
});
