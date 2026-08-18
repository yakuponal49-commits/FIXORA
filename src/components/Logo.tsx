import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * FIXORA marka logosu: yeni resmi logo (fixora_shield_logo_1)
 * lacivert rozet cercevesi icinde gosterilir. Launcher ikonuyla
 * ayni goruntuyu kullanir (assets/logo.png).
 */
export default function Logo({ size = 128, style }: Props) {
  const s = size;

  return (
    <View
      style={[
        styles.frame,
        {
          width: s,
          height: s,
          borderRadius: Math.round(s * 0.28),
        },
        style,
      ]}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.image}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#3A3836',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 163, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
