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
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 20,
    alignItems: 'center',
    marginTop: 18,
  },
  title: { color: COLORS.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 10, marginTop: 14 },
  star: { fontSize: 32, color: 'rgba(148, 163, 184, 0.3)' },
  starActive: { color: COLORS.warning },
  row: { marginTop: 14, alignSelf: 'stretch', alignItems: 'center' },
  later: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  cta: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 15 },
});
