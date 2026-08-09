import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../theme';

interface Props {
  title: string;
  body: string;
  onBack: () => void;
}

export default function LegalScreen({ title, body, onBack }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.bodyText}>{body}</Text>
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
  headerBtnText: { color: COLORS.textMuted, fontSize: 26, fontWeight: '800', lineHeight: 28 },
  headerTitle: { color: COLORS.text, fontWeight: '900', fontSize: 17 },
  body: { padding: SPACING + 4 },
  bodyText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22 },
});
