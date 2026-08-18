import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS, RADIUS, SPACING } from '../theme';

interface LimitAlertProps {
  visible: boolean;
  onClose: () => void;
  onGoPro: () => void;
}

export default function LimitAlert({ visible, onClose, onGoPro }: LimitAlertProps) {
  const { t } = useTranslation();
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const accent = '#F59E0B';

  useEffect(() => {
    if (visible) {
      pulseAnim.current?.stop();
      entrance.setValue(0);
      pulse.setValue(0);

      Animated.spring(entrance, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 90,
      }).start();

      pulseAnim.current = Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );
      pulseAnim.current.start();

      return () => {
        pulseAnim.current?.stop();
      };
    }
    return undefined;
  }, [visible, entrance, pulse]);

  if (!visible) return null;

  const cardScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const cardOpacity = entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const iconScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Modal transparent visible statusBarTranslucent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              borderColor: accent + '66',
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.ring,
                { borderColor: accent, opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.iconCircle,
                { backgroundColor: accent, transform: [{ scale: iconScale }] },
              ]}
            >
              <Text style={styles.iconMark}>!</Text>
            </Animated.View>
          </View>

          <Text style={[styles.title, { color: accent }]}>{t('dailyLimitTitle')}</Text>
          <Text style={styles.message}>{t('dailyLimitDesc')}</Text>

          <Pressable
            style={[styles.button, styles.proButton]}
            onPress={() => {
              onClose();
              onGoPro();
            }}
          >
            <Text style={styles.proButtonText}>{t('goPro')}</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('close')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 8, 10, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING * 2,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS * 1.5,
    borderWidth: 1.5,
    padding: SPACING * 2,
    alignItems: 'center',
  },
  iconWrap: {
    width: 92,
    height: 92,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING,
  },
  ring: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  iconMark: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: SPACING / 2,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING * 1.5,
  },
  button: {
    alignSelf: 'stretch',
    paddingVertical: SPACING * 0.75,
    borderRadius: RADIUS,
    alignItems: 'center',
  },
  proButton: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    paddingVertical: SPACING * 0.5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
