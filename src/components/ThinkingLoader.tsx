import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

/**
 * Rakip RepairBuddy tarzı "AI düşünüyor" animasyonu:
 * robot ikonu etrafında yayılan halkalar + altta zıplayan üç nokta.
 */
export default function ThinkingLoader({ text }: { text: string }) {
  const anims = useRef<{
    ringA: Animated.Value;
    ringB: Animated.Value;
    bubble: Animated.Value;
    dots: Animated.Value[];
  } | null>(null);
  if (!anims.current) {
    anims.current = {
      ringA: new Animated.Value(0),
      ringB: new Animated.Value(0),
      bubble: new Animated.Value(0),
      dots: [0, 1, 2].map(() => new Animated.Value(0)),
    };
  }
  const { ringA, ringB, bubble, dots } = anims.current;

  useEffect(() => {
    const rings = [ringA, ringB].map((v, i) =>
      Animated.loop(
        Animated.timing(v, {
          toValue: 1,
          duration: 1500,
          delay: i * 750,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(bubble, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bubble, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const dotLoops = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(d, {
            toValue: 1,
            duration: 340,
            delay: i * 130,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0,
            duration: 340,
            useNativeDriver: true,
          }),
        ])
      )
    );
    rings.forEach((a) => a.start());
    breathe.start();
    dotLoops.forEach((a) => a.start());
    return () => {
      rings.forEach((a) => a.stop());
      breathe.stop();
      dotLoops.forEach((a) => a.stop());
    };
  }, [ringA, ringB, bubble, dots]);

  const scaleA = ringA.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.1] });
  const opacityA = ringA.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const scaleB = ringB.interpolate({ inputRange: [0, 1], outputRange: [0.7, 2.1] });
  const opacityB = ringB.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const bubbleScale = bubble.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <View style={styles.card}>
      <View style={styles.orbitWrap}>
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: scaleA }], opacity: opacityA },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            { transform: [{ scale: scaleB }], opacity: opacityB },
          ]}
        />
        <Animated.View style={[styles.bubble, { transform: [{ scale: bubbleScale }] }]}>
          <Text style={styles.robot}>🤖</Text>
        </Animated.View>
      </View>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.dotsRow}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: d,
                transform: [
                  {
                    translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  orbitWrap: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99,102,241,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robot: { fontSize: 28 },
  text: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 19,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 12, height: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
