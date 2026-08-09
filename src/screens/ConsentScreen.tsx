import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, RADIUS, SPACING } from '../theme';

interface Props {
  onBack: () => void;
}

interface ConsentPrefs {
  analytics: boolean;
  personalization: boolean;
}

const CONSENT_KEY = 'fixora.consent';
const DEFAULTS: ConsentPrefs = { analytics: true, personalization: true };

export default function ConsentScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<ConsentPrefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONSENT_KEY).then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {
          // bozuk veri: varsayılanlar geçerli
        }
      }
    });
  }, []);

  const update = (patch: Partial<ConsentPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaved(true);
    AsyncStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  };

  const rows: { key: keyof ConsentPrefs; icon: string; title: string; desc: string }[] = [
    {
      key: 'analytics',
      icon: '📊',
      title: t('consentAnalytics'),
      desc: t('consentAnalyticsDesc'),
    },
    {
      key: 'personalization',
      icon: '✨',
      title: t('consentPersonalization'),
      desc: t('consentPersonalizationDesc'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('consentTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.explain}>{t('consentExplain')}</Text>

        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text style={styles.rowIcon}>{row.icon}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowDesc}>{row.desc}</Text>
            </View>
            <Switch
              value={prefs[row.key]}
              onValueChange={(v) => update({ [row.key]: v })}
              trackColor={{ true: COLORS.primary, false: COLORS.border }}
              thumbColor="#fff"
            />
          </View>
        ))}

        {saved && <Text style={styles.saved}>{t('consentSaved')}</Text>}

        <Pressable style={styles.resetBtn} onPress={() => update(DEFAULTS)}>
          <Text style={styles.resetBtnText}>{t('consentReset')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerBtnText: { color: COLORS.textMuted, fontSize: 26, fontWeight: '800', lineHeight: 28 },
  headerTitle: { color: COLORS.text, fontWeight: '900', fontSize: 17 },
  body: { padding: SPACING + 4 },
  explain: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 10,
  },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  rowDesc: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  saved: { color: COLORS.success, fontWeight: '700', fontSize: 13, marginTop: 6, marginBottom: 14 },
  resetBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  resetBtnText: { color: COLORS.textMuted, fontWeight: '800', fontSize: 14 },
});
