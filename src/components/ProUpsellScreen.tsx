import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, RADIUS, SPACING } from '../theme';
import { isPro, setPro } from '../storage/pro';
import Logo from './Logo';

const NOTIFY_KEY = 'fixora.pro.notify';

interface Props {
  onClose: () => void;
}

/** FIXORA Pro yükseltme ekranı. Ödeme henüz entegre değil: "test" etkinleştirme + haber listesi. */
export default function ProUpsellScreen({ onClose }: Props) {
  const { t } = useTranslation();
  const [pro, setProState] = useState(false);

  useEffect(() => {
    isPro().then(setProState);
  }, []);

  const enable = async () => {
    await setPro(true);
    setProState(true);
  };

  const notify = async () => {
    await AsyncStorage.setItem(NOTIFY_KEY, '1').catch(() => {});
    Alert.alert(t('proTitle'), t('proThanks'));
  };

  const features = [
    { icon: '♾️', label: t('proFeature1') },
    { icon: '🎬', label: t('proFeature2') },
    { icon: '⚡', label: t('proFeature3') },
    { icon: '📦', label: t('proFeature4') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={10} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>⭐ {t('proTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.badge}>
          <Logo size={72} />
        </View>
        <Text style={styles.sub}>{t('proSub')}</Text>

        {features.map((f) => (
          <View key={f.label} style={styles.feature}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.label}</Text>
          </View>
        ))}

        {pro ? (
          <View style={styles.activeBox}>
            <Text style={styles.activeText}>{t('proActive')}</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.enableBtn} onPress={enable}>
              <Text style={styles.enableText}>⭐ {t('proEnable')}</Text>
            </Pressable>
            <Pressable style={styles.notifyBtn} onPress={notify}>
              <Text style={styles.notifyText}>{t('proNotify')}</Text>
            </Pressable>
          </>
        )}

        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.notNow}>{t('proNotNow')}</Text>
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
  headerBtnText: { color: COLORS.textMuted, fontSize: 18, fontWeight: '800' },
  headerTitle: { color: COLORS.text, fontWeight: '900', fontSize: 18 },
  body: { padding: SPACING, paddingBottom: 32, alignItems: 'center' },
  badge: {
    marginTop: 20,
    borderRadius: 999,
    padding: 14,
    backgroundColor: 'rgba(99,102,241,0.16)',
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 18,
    marginBottom: 6,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 16,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  featureIcon: { fontSize: 22, marginRight: 14 },
  featureText: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1 },
  activeBox: {
    marginTop: 22,
    backgroundColor: 'rgba(52,208,122,0.16)',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  activeText: { color: COLORS.success, fontWeight: '900', fontSize: 15 },
  enableBtn: {
    marginTop: 26,
    alignSelf: 'stretch',
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    padding: 16,
    alignItems: 'center',
  },
  enableText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  notifyBtn: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: 'center',
  },
  notifyText: { color: COLORS.primaryLight, fontWeight: '700', fontSize: 14 },
  notNow: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginTop: 24 },
});
