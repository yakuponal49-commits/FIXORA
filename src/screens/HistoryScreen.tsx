import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HistoryEntry, totalSaved } from '../storage/history';
import { findCategory, findSubcategory } from '../data/categories';
import { COLORS, RADIUS, SPACING } from '../theme';

interface Props {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onStartNew: () => void;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

export default function HistoryScreen({ entries, onOpen, onDelete, onStartNew }: Props) {
  const { t } = useTranslation();
  const saved = totalSaved(entries);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t('historyTitle')}</Text>

      {saved > 0 && (
        <View style={styles.savedBar}>
          <Text style={styles.savedIcon}>💰</Text>
          <Text style={styles.savedText}>
            {t('savedTotal')}: {Math.round(saved)} €
          </Text>
        </View>
      )}

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyTitle}>{t('noRepairsYet')}</Text>
          <Text style={styles.emptyHint}>{t('historyHint')}</Text>
          <Pressable style={styles.startBtn} onPress={onStartNew}>
            <Text style={styles.startBtnText}>{t('startFirstRepair')} →</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {entries.map((e) => {
            const cat = findCategory(e.category);
            const sub = findSubcategory(e.category, e.subcategory);
            return (
              <Pressable key={e.id} style={styles.card} onPress={() => onOpen(e)}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardCat} numberOfLines={1}>
                    {cat ? `${cat.icon} ${t(cat.key)}` : '🛠️'}
                    {sub ? ` → ${t(sub.key)}` : ''}
                  </Text>
                  <Text style={styles.cardDate}>{formatDate(e.date)}</Text>
                </View>
                {e.files && e.files.length > 0 && (
                  <View style={styles.thumbs}>
                    {e.files.slice(0, 3).map((f, i) => (
                      <View key={i} style={styles.thumbWrap}>
                        {f.type?.startsWith('image') ? (
                          <Image source={{ uri: f.uri }} style={styles.thumb} />
                        ) : (
                          <View style={[styles.thumb, styles.thumbVideo]}>
                            <Text style={styles.thumbVideoIcon}>▶</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {e.description || t('describePlaceholder')}
                </Text>
                {typeof e.saved === 'number' && e.saved > 0 && (
                  <Text style={styles.cardSaved}>💰 {t('saveEstimate')}: ~{Math.round(e.saved)} €</Text>
                )}
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert(t('delete'), t('deleteConfirm'), [
                      { text: t('cancel'), style: 'cancel' },
                      { text: t('delete'), style: 'destructive', onPress: () => onDelete(e.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteText}>🗑 {t('delete')}</Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: SPACING },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  list: { paddingTop: 12, paddingBottom: 24, gap: 12 },
  savedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52,208,122,0.14)',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  savedIcon: { fontSize: 18 },
  savedText: { color: COLORS.success, fontSize: 14, fontWeight: '800', flex: 1 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardCat: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '800', flex: 1 },
  cardDate: { color: COLORS.textMuted, fontSize: 11 },
  thumbs: { flexDirection: 'row', gap: 6, marginTop: 10 },
  thumbWrap: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  thumbVideo: { backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  thumbVideoIcon: { color: '#fff', fontSize: 14 },
  cardDesc: { color: COLORS.text, fontSize: 14, lineHeight: 20, marginTop: 8 },
  cardSaved: { color: COLORS.success, fontSize: 12, fontWeight: '800', marginTop: 8 },
  deleteBtn: { marginTop: 12, alignSelf: 'flex-start' },
  deleteText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
});
