import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { COLORS, RADIUS, SPACING } from '../theme';
import { APP_STORE_URL } from '../auth/config';
import Logo from '../components/Logo';
import LegalScreen from './LegalScreen';
import ConsentScreen from './ConsentScreen';

interface Props {
  onClose: () => void;
  onOpenPro: () => void;
}

type Route = 'menu' | 'terms' | 'privacy' | 'consent';

function NeuralNodes() {
  const nodes = [
    { x: 10, y: 18, r: 3 },
    { x: 28, y: 8, r: 2.5 },
    { x: 28, y: 28, r: 2.5 },
    { x: 46, y: 14, r: 2 },
    { x: 46, y: 24, r: 2 },
    { x: 18, y: 36, r: 2 },
  ];
  const lines: [number, number, number, number][] = [
    [10, 18, 28, 8],
    [10, 18, 28, 28],
    [28, 8, 46, 14],
    [28, 28, 46, 24],
    [28, 8, 46, 24],
    [28, 28, 46, 14],
    [10, 18, 18, 36],
  ];

  return (
    <View style={neuralStyles.container}>
      {lines.map(([x1, y1, x2, y2], i) => (
        <View
          key={`l${i}`}
          style={[
            neuralStyles.line,
            {
              left: x1,
              top: y1,
              width: Math.hypot(x2 - x1, y2 - y1),
              transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }],
            },
          ]}
        />
      ))}
      {nodes.map((n, i) => (
        <View
          key={`n${i}`}
          style={[
            neuralStyles.node,
            {
              left: n.x - n.r,
              top: n.y - n.r,
              width: n.r * 2,
              height: n.r * 2,
              borderRadius: n.r,
              opacity: 0.3 + (i % 3) * 0.15,
            },
          ]}
        />
      ))}
    </View>
  );
}

const neuralStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 56,
    height: 44,
  },
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0,163,255,0.25)',
  },
  node: {
    position: 'absolute',
    backgroundColor: 'rgba(0,163,255,0.5)',
  },
});

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
    { icon: '👥', title: t('settingsShare'), desc: t('settingsShareDesc'), onPress: share },
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

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {/* Promo Banner */}
        <Pressable style={styles.banner} onPress={onOpenPro}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>{t('settingsBannerTitle')}</Text>
            <Text style={styles.bannerDesc}>{t('settingsBannerDesc')}</Text>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>{t('settingsBannerBtn')}</Text>
              <Text style={styles.bannerBtnArrow}> →</Text>
            </View>
          </View>
          <View style={styles.bannerRight}>
            <NeuralNodes />
            <Logo size={56} style={styles.bannerLogo} />
          </View>
        </Pressable>

        {/* Menu Items */}
        {items.map((it) => (
          <Pressable key={it.title} style={styles.item} onPress={it.onPress}>
            <View style={styles.itemIconWrap}>
              <Text style={styles.itemIcon}>{it.icon}</Text>
            </View>
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

  /* Banner */
  banner: {
    flexDirection: 'row',
    borderRadius: RADIUS,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(0,163,255,0.25)',
  },
  bannerLeft: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
    marginBottom: 6,
  },
  bannerDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bannerBtnArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  bannerRight: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLogo: {
    zIndex: 2,
  },

  /* Menu items */
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 14,
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIcon: { fontSize: 20 },
  itemText: { flex: 1 },
  itemTitle: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  itemDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: COLORS.textMuted, fontSize: 24, fontWeight: '700' },
});
