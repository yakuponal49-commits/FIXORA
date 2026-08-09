import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SPACING } from '../theme';
import Logo from '../components/Logo';
import BackgroundVideo from '../components/BackgroundVideo';

interface Props {
  onDone: () => void;
}

const PAGES = [
  { emoji: '🛠️', tint: 'rgba(99,102,241,0.18)', a: 'onb1A', b: 'onb1B', desc: 'onb1Desc' },
  { emoji: '💰', tint: 'rgba(52,208,122,0.16)', a: 'onb2A', b: 'onb2B', desc: 'onb2Desc' },
  { emoji: '🚗', tint: 'rgba(247,192,74,0.16)', a: 'onb3A', b: 'onb3B', desc: 'onb3Desc' },
  { emoji: '🔧', tint: 'rgba(245,86,79,0.16)', a: 'onb4A', b: 'onb4B', desc: 'onb4Desc' },
];

const VIDEOS = [
  require('../../assets/videos/v1.mp4'),
  require('../../assets/videos/v2.mp4'),
  require('../../assets/videos/v3.mp4'),
  require('../../assets/videos/v4.mp4'),
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onDone }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const last = index === PAGES.length - 1;

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(PAGES.length - 1, next));
    setIndex(clamped);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(PAGES.length - 1, i)));
  };

  const renderPage = ({ item, index }: { item: (typeof PAGES)[number]; index: number }) => (
    <View style={styles.page}>
      <BackgroundVideo source={VIDEOS[index % VIDEOS.length]} />
      <View style={styles.scrim} />
      <View style={styles.pageBody}>
        <View style={[styles.art, { backgroundColor: item.tint }]}>
          <Text style={styles.artEmoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.title}>
          <Text style={styles.titleA}>{t(item.a)} </Text>
          <Text style={styles.titleB}>{t(item.b)}</Text>
        </Text>
        <Text style={styles.desc}>{t(item.desc)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Logo size={40} />
          <Text style={styles.brandName}>{t('appName')}</Text>
        </View>
        {!last && (
          <Pressable onPress={onDone} hitSlop={10}>
            <Text style={styles.skip}>{t('onbSkip')}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderPage}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      />

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        {last ? (
          <Pressable style={styles.primaryBtn} onPress={onDone}>
            <Text style={styles.primaryBtnText}>{t('onbStart')} →</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={() => go(index + 1)}>
            <Text style={styles.primaryBtnText}>{t('onbNext')} →</Text>
          </Pressable>
        )}
      </View>
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
    paddingTop: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: COLORS.text, fontWeight: '900', fontSize: 20, letterSpacing: 1.5 },
  skip: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
  page: { width, alignItems: 'center', justifyContent: 'center', paddingBottom: 12 },
  pageBody: { alignItems: 'center', paddingHorizontal: 28 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,10,18,0.62)' },
  art: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  artEmoji: { fontSize: 96 },
  title: { fontSize: 30, fontWeight: '900', textAlign: 'center', lineHeight: 38, letterSpacing: -0.3 },
  titleA: { color: COLORS.text },
  titleB: { color: COLORS.primary },
  desc: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 320,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primary, width: 26 },
  footer: { padding: SPACING, paddingTop: 18 },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    padding: 17,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 0.3 },
});
