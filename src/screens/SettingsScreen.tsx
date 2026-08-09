import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, RADIUS, SPACING } from '../theme';
import { APP_STORE_URL } from '../auth/config';
import LegalScreen from './LegalScreen';
import ConsentScreen from './ConsentScreen';

interface Props {
  onClose: () => void;
  onOpenPro: () => void;
}

type Route = 'menu' | 'terms' | 'privacy' | 'consent';

export default function SettingsScreen({ onClose, onOpenPro }: Props) {
  const { t } = useTranslation();
  const [route, setRoute] = useState<Route>('menu');

  if (route === 'terms') {
    return <LegalScreen title={t('termsTitle')} body={t('termsBody')} onBack={() => setRoute('menu')} />;
  }
  if (route === 'privacy') {
    return <LegalScreen title={t('privacyTitle')} body={t('privacyBody')} onBack={() => setRoute('menu')} />;
  }
  if (route === 'consent') {
    return <ConsentScreen onBack={() => setRoute('menu')} />;
  }

  const share = async () => {
    try {
      await Share.share({ message: t('shareMessage').replace('{url}', APP_STORE_URL) });
    } catch {
      Alert.alert(t('settings'), t('shareFailed'));
    }
  };

  const items = [
    { icon: '⭐', title: 'FIXORA Pro', desc: t('proSub'), onPress: onOpenPro },
    { icon: '📤', title: t('settingsShare'), desc: t('settingsShareDesc'), onPress: share },
    { icon: '📄', title: t('settingsTerms'), desc: t('settingsTermsDesc'), onPress: () => setRoute('terms') },
    { icon: '🔒', title: t('settingsPrivacy'), desc: t('settingsPrivacyDesc'), onPress: () => setRoute('privacy') },
    { icon: '🛡️', title: t('settingsConsent'), desc: t('settingsConsentDesc'), onPress: () => setRoute('consent') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={styles.headerBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((it) => (
          <Pressable key={it.title} style={styles.item} onPress={it.onPress}>
            <Text style={styles.itemIcon}>{it.icon}</Text>
            <View style={styles.itemText}>
              <Text style={styles.itemTitle}>{it.title}</Text>
              <Text style={styles.itemDesc}>{it.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
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
  headerBtnText: { color: COLORS.textMuted, fontSize: 18, fontWeight: '800' },
  headerTitle: { color: COLORS.text, fontWeight: '900', fontSize: 18 },
  list: { padding: SPACING, gap: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 16,
  },
  itemIcon: { fontSize: 22, marginRight: 14 },
  itemText: { flex: 1 },
  itemTitle: { color: COLORS.text, fontWeight: '800', fontSize: 16 },
  itemDesc: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  chevron: { color: COLORS.textMuted, fontSize: 24, fontWeight: '700' },
});
