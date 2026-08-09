import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * FIXORA marka logosu: koyu lacivert rozet icinde capraz duran
 * bir Inciliz anahtari (gumus) ve bir tornavida (turuncu sap),
 * ortada altin bir vida/pivot. Launcher ikonuyla birebir ayni
 * tasarim — tamamen React Native View'lerle cizilir.
 */
export default function Logo({ size = 128, style }: Props) {
  const s = size;
  const q = (v: number) => Math.round(s * v);

  return (
    <View
      style={[
        styles.frame,
        {
          width: s,
          height: s,
          borderRadius: q(0.28),
        },
        style,
      ]}
    >
      {/* accent ring */}
      <View
        style={[
          styles.ring,
          {
            width: q(0.88),
            height: q(0.88),
            borderRadius: q(0.44),
          },
        ]}
      />

      {/* Wrench: rotate +45deg */}
      <View style={[styles.layer, { transform: [{ rotate: '45deg' }] }]}>
        {/* open jaw: two prongs (left) */}
        <View style={[styles.prong, { left: q(-0.46), top: q(-0.095), width: q(0.09), height: q(0.055) }]} />
        <View style={[styles.prong, { left: q(-0.46), top: q(0.04), width: q(0.09), height: q(0.055) }]} />
        {/* shaft */}
        <View
          style={[
            styles.wrenchShaft,
            {
              width: q(0.72),
              height: q(0.076),
              borderRadius: q(0.038),
            },
          ]}
        />
        {/* ring end (right) */}
        <View
          style={[
            styles.wrenchRing,
            {
              width: q(0.13),
              height: q(0.13),
              borderRadius: q(0.065),
              borderWidth: q(0.026),
              left: q(0.42) - q(0.065),
            },
          ]}
        />
      </View>

      {/* Screwdriver: rotate -45deg */}
      <View style={[styles.layer, { transform: [{ rotate: '-45deg' }] }]}>
        {/* handle (right, orange) */}
        <View
          style={[
            styles.sdHandle,
            {
              width: q(0.22),
              height: q(0.124),
              borderRadius: q(0.05),
              left: q(0.10),
            },
          ]}
        />
        {/* collar */}
        <View
          style={[
            styles.sdCollar,
            {
              width: q(0.03),
              height: q(0.09),
              borderRadius: q(0.008),
              left: q(0.085),
            },
          ]}
        />
        {/* shaft */}
        <View
          style={[
            styles.sdShaft,
            {
              width: q(0.40),
              height: q(0.036),
              borderRadius: q(0.018),
              left: q(-0.34),
            },
          ]}
        />
        {/* tip taper */}
        <View
          style={[
            styles.sdTip,
            {
              width: q(0.08),
              height: q(0.024),
              left: q(-0.48),
              borderTopLeftRadius: q(0.03),
              borderBottomLeftRadius: q(0.03),
            },
          ]}
        />
      </View>

      {/* pivot screw (center) */}
      <View
        style={[
          styles.pivot,
          {
            width: q(0.104),
            height: q(0.104),
            borderRadius: q(0.052),
          },
        ]}
      >
        <View style={[styles.pivotSlot, { width: q(0.056), height: q(0.008), borderRadius: q(0.004) }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#142A4C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,154,77,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  layer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prong: {
    position: 'absolute',
    backgroundColor: '#DCE7F5',
    borderRadius: 4,
  },
  wrenchShaft: {
    position: 'absolute',
    backgroundColor: '#DCE7F5',
  },
  wrenchRing: {
    position: 'absolute',
    borderColor: '#DCE7F5',
    backgroundColor: 'transparent',
  },
  sdHandle: {
    position: 'absolute',
    backgroundColor: '#FF9A4D',
  },
  sdCollar: {
    position: 'absolute',
    backgroundColor: '#A8B8CE',
  },
  sdShaft: {
    position: 'absolute',
    backgroundColor: '#DCE7F5',
  },
  sdTip: {
    position: 'absolute',
    backgroundColor: '#DCE7F5',
  },
  pivot: {
    position: 'absolute',
    backgroundColor: '#F7C24A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120,80,20,0.6)',
  },
  pivotSlot: {
    backgroundColor: 'rgba(90,60,20,0.75)',
    transform: [{ rotate: '45deg' }],
  },
});
