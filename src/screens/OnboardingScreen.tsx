import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../theme';
import Logo from '../components/Logo';

interface Props {
  onDone: () => void;
}

const ACCENT = '#5856D6';
const PILL_INACTIVE = '#D9D9E3';

const PAGES = [
  {
    key: 'plumbing',
    image: require('../../assets/onboarding/plumbing.jpg'),
    title: 'onb1Title',
    desc: 'onb1Desc',
  },
  {
    key: 'painting',
    image: require('../../assets/onboarding/painting.jpg'),
    title: 'onb2Title',
    desc: 'onb2Desc',
  },
  {
    key: 'woodworking',
    image: require('../../assets/onboarding/woodworking.jpg'),
    title: 'onb3Title',
    desc: 'onb3Desc',
  },
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

  const renderPage = ({ item }: { item: (typeof PAGES)[number] }) => (
    <View style={styles.page}>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
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

      <View style={styles.imageWrap}>
        <FlatList
          ref={listRef}
          data={PAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={renderPage}
          onMomentumScrollEnd={onMomentumEnd}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        />
        <View style={styles.indicator}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.pill, i === index && styles.pillActive]} />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t(PAGES[index].title)}</Text>
        <Text style={styles.desc}>{t(PAGES[index].desc)}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={last ? onDone : () => go(index + 1)}>
          <Text style={styles.primaryBtnText}>
            {last ? t('onbStart') : t('onbNext')} →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { color: COLORS.text, fontWeight: '900', fontSize: 20, letterSpacing: 1.5 },
  skip: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },
  imageWrap: {
    height: '50%',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#F0F0F5',
  },
  page: { width, height: '100%' },
  image: { width: '100%', height: '100%' },
  indicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  pill: { width: 8, height: 8, borderRadius: 4, backgroundColor: PILL_INACTIVE },
  pillActive: { width: 28, backgroundColor: ACCENT },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  desc: {
    color: COLORS.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },
  footer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
});
