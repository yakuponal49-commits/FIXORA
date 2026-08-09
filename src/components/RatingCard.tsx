import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS, RADIUS } from '../theme';

const RATED_KEY = 'fixora.rated';
const STORE_URL = 'https://play.google.com/store/apps/details?id=com.fixora.app';

interface Props {
  onDismiss: () => void;
}

/** Bir analiz tamamlandıktan sonra ana ekranda gösterilen uygulama-içi değerlendirme kartı. */
export default function RatingCard({ onDismiss }: Props) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);

  const pick = (n: number) => {
    setRating(n);
    setDone(true);
    AsyncStorage.setItem(RATED_KEY, String(n)).catch(() => {});
  };

  const dismiss = () => {
    AsyncStorage.setItem(RATED_KEY, '0').catch(() => {});
    onDismiss();
  };

  const openStore = () => {
    Linking.canOpenURL(STORE_URL)
      .then((ok) => (ok ? Linking.openURL(STORE_URL) : Linking.openURL('https://play.google.com/store')))
      .catch(() => {});
    onDismiss();
  };

  return (
    <View style={styles.card}>
      {!done ? (
        <>
          <Text style={styles.title}>⭐ {t('rateAsk')}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} hitSlop={6} onPress={() => pick(n)}>
                <Text style={[styles.star, n <= rating && styles.starActive]}>{n <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <Pressable onPress={dismiss} hitSlop={8}>
              <Text style={styles.later}>{t('rateLater')}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>
            {rating >= 4 ? '🎉' : '💬'} {t('rateThanks')}
          </Text>
          {rating >= 4 ? (
            <Pressable style={styles.cta} onPress={openStore}>
              <Text style={styles.ctaText}>★ {t('rateNow')}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.cta} onPress={dismiss}>
              <Text style={styles.ctaText}>{t('close')}</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  title: { color: COLORS.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 8, marginTop: 12 },
  star: { fontSize: 30, color: COLORS.textMuted },
  starActive: { color: COLORS.warning },
  row: { marginTop: 12, alignSelf: 'stretch', alignItems: 'center' },
  later: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  cta: {
    marginTop: 14,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
