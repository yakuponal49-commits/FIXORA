import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Directory, File, Paths } from 'expo-file-system';

import { AnalyzeInput, PendingMedia, analyzeProblemStream, isAuthError } from '../api/client';
import { AI_MODEL_OPTIONS, BACKEND_URL_MISSING } from '../auth/config';
import { Language, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { CATEGORIES, findCategory, findSubcategory, suggestCategory } from '../data/categories';
import { DEMO_IMAGE_BASE64 } from '../data/demo';
import { canAnalyze as canUseFree } from '../storage/pro';
import { COLORS, RADIUS, SPACING } from '../theme';
import Logo from '../components/Logo';
import ThinkingLoader from '../components/ThinkingLoader';
import RatingCard from '../components/RatingCard';
import RichText from '../components/RichText';

interface Props {
  language: Language;
  modelId: string;
  onModelChange: (id: string) => void;
  onLanguageChange: (lang: Language) => void;
  onResult: (input: AnalyzeInput, analysis: string) => void;
  onOpenSettings: () => void;
  onOpenPro: () => void;
  showRating: boolean;
  onDismissRating: () => void;
}

const LANG_LABELS: Record<Language, string> = {
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  en: 'English',
  tr: 'Türkçe',
};

const LANG_FLAGS: Record<Language, string> = {
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  en: '🇬🇧',
  tr: '🇹🇷',
};

const API_KEY_MISSING = BACKEND_URL_MISSING;

export default function HomeScreen({
  language,
  modelId,
  onModelChange,
  onLanguageChange,
  onResult,
  onOpenSettings,
  onOpenPro,
  showRating,
  onDismissRating,
}: Props) {
  const { t } = useTranslation();
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState<'lang' | 'model' | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [sourceSheet, setSourceSheet] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const streamTextRef = useRef<string | null>(null);

  const suggestion = useMemo(() => {
    const d = description.trim();
    if (d.length < 6 || categoryId) return null;
    return suggestCategory(d);
  }, [description, categoryId]);

  useEffect(() => {
    if (streamText !== null) {
      // Cevap canlı akarken görünen kısmı altta tut.
      streamTextRef.current = streamText;
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    }
  }, [streamText]);

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permissionCamera'), t('permissionDesc'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (!result.canceled) {
      const a = result.assets[0];
      setMedia((prev) => [
        ...prev,
        {
          uri: a.uri,
          name: a.fileName ?? `camera-${Date.now()}.${a.mimeType?.split('/')[1] ?? 'jpg'}`,
          type: a.mimeType ?? guessMime(a.uri),
        },
      ]);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permissionMedia'), t('permissionDesc'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      const added = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `picked-${Date.now()}-${a.uri.split('/').pop()}.${a.mimeType?.split('/')[1] ?? 'jpg'}`,
        type: a.mimeType ?? guessMime(a.uri),
      }));
      setMedia((prev) => [...prev, ...added]);
    }
  };

  const runAnalysis = async (override?: {
    description?: string;
    files?: PendingMedia[];
    category?: string;
    subcategory?: string;
  }) => {
    if (loading) return;
    const files = override?.files ?? media;
    const desc = (override?.description ?? description).trim();
    if (files.length === 0 || !desc) {
      Alert.alert(t('errorTitle'), t('mediaRequired'));
      return;
    }
    const proCheck = await canUseFree();
    if (!proCheck.allowed) {
      onOpenPro();
      return;
    }
    setLoading(true);
    setStreamText('');
    try {
      // Kategori + alt kategori AI'ya bağlam olarak verilir.
      const catId = override?.category ?? categoryId ?? undefined;
      const subId = override?.subcategory ?? subcategoryId ?? undefined;
      const category = findCategory(catId);
      const subcategory = findSubcategory(catId, subId);
      const context: string[] = [];
      if (category) context.push(t(category.key));
      if (subcategory) context.push(t(subcategory.key));
      const contextPrefix = context.length ? `[${context.join(' → ')}] ` : '';
      const input: AnalyzeInput = {
        language,
        description: `${contextPrefix}${desc}`.trim(),
        modelId,
        files,
        category: category?.id,
        subcategory: subcategory?.id,
      };
      const fullText = await analyzeProblemStream(input, (text) => setStreamText(text));
      streamTextRef.current = null;
      setStreamText(null);
      onResult(input, fullText);
    } catch (e) {
      const partial = streamTextRef.current;
      streamTextRef.current = null;
      setStreamText(null);
      const msg = e instanceof Error ? e.message : '';
      if (partial) {
        // Akış ortasında bağlantı koptu: yarım cevap üzerinden devam etmeyi öner.
        const suffix = `\n\n[DEVAM: önceki cevap kesildi. ${partial.slice(-500)}]`;
        Alert.alert(t('errorTitle'), t('retryDesc'), [
          {
            text: t('retry'),
            onPress: () => runAnalysis({ description: desc + suffix }),
          },
          { text: t('cancel'), style: 'cancel' },
        ]);
        return;
      }
      if (isAuthError(e) || msg === 'NO_API_KEY') {
        Alert.alert(t('errorTitle'), t('errorNoApiKey'));
      } else if (msg === 'QUOTA' || msg === 'NO_AUTH') {
        Alert.alert(t('errorTitle'), msg === 'QUOTA' ? t('errorQuota') : t('errorNoApiKey'));
      } else {
        Alert.alert(
          t('errorTitle'),
          msg === 'NO_AUTH' ? t('errorNoApiKey') : msg || t('errorCheckNetwork')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /** Örnek demoyu başlatır: hazır görsel + açıklama + önerilen kategori ile. */
  const runDemo = async () => {
    if (loading) return;
    try {
      const dir = new Directory(Paths.cache, 'fixora-demo');
      if (!dir.exists) dir.create({ intermediates: true });
      const file = new File(dir, 'demo.jpg');
      if (!file.exists) {
        const bytes = Uint8Array.from(atob(DEMO_IMAGE_BASE64), (c) => c.charCodeAt(0));
        file.create({ overwrite: true });
        file.write(bytes);
      }
      const demoFiles: PendingMedia[] = [{ uri: file.uri, name: 'demo.jpg', type: 'image/jpeg' }];
      const demoDesc = t('demoDesc');
      const sug = suggestCategory(demoDesc) ?? { category: 'plumbing', subcategory: 'faucet' };
      setMedia(demoFiles);
      setDescription(demoDesc);
      setCategoryId(sug.category);
      setSubcategoryId(sug.subcategory ?? null);
      runAnalysis({ files: demoFiles, description: demoDesc, category: sug.category, subcategory: sug.subcategory });
    } catch {
      Alert.alert(t('errorTitle'), t('errorCheckNetwork'));
    }
  };

  const activeModel = AI_MODEL_OPTIONS.find((m) => m.id === modelId);

  const canAnalyze = media.length > 0 && description.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        onScrollBeginDrag={() => setOpenPicker(null)}
      >
        {/* Marka */}
        <View style={styles.hero}>
          <View style={styles.logoGlow}>
            <Logo size={110} />
          </View>
          <Text style={styles.brand}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        {API_KEY_MISSING ? <Text style={styles.configWarning}>{t('noApiKeyWarning')}</Text> : null}

        {/* İlk açılış: nasıl çalışır + örnekle dene */}
        {media.length === 0 && !description.trim() && (
          <>
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>✨ {t('howItWorks')}</Text>
              {[
                { icon: '📷', label: t('how1') },
                { icon: '✏️', label: t('how2') },
                { icon: '🧭', label: t('how3') },
              ].map((s, i) => (
                <View key={i} style={styles.howRow}>
                  <View style={styles.howCircle}>
                    <Text style={styles.howNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.howIcon}>{s.icon}</Text>
                  <Text style={styles.howLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.demoCard} onPress={runDemo}>
              <Text style={styles.demoEmoji}>🧪</Text>
              <View style={styles.demoTextWrap}>
                <Text style={styles.demoTitle}>{t('demoTitle')}</Text>
                <Text style={styles.demoCta}>▶ {t('tryDemo')}</Text>
              </View>
            </Pressable>
          </>
        )}

        {/* Medya ekleme — büyük upload kartı */}
        {media.length === 0 ? (
          <Pressable style={styles.uploadCard} onPress={() => setSourceSheet(true)}>
            <View style={styles.uploadIconCircle}>
              <Text style={styles.uploadIcon}>📷</Text>
            </View>
            <Text style={styles.uploadTitle}>{t('uploadTitle')}</Text>
            <Text style={styles.uploadDesc}>{t('uploadDesc')}</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.sectionLabel}>{t('selectedMedia')}</Text>
            <View style={styles.mediaGrid}>
              {media.map((item, idx) => (
                <View key={idx} style={styles.mediaTile}>
                  {item.type.startsWith('image') ? (
                    <Image source={{ uri: item.uri }} style={styles.tileImage} />
                  ) : (
                    <View style={styles.tileVideo}>
                      <Text style={styles.tileVideoIcon}>▶</Text>
                      <Image source={{ uri: item.uri }} style={styles.tileImage} />
                    </View>
                  )}
                  <Pressable
                    style={styles.tileRemove}
                    onPress={() => setMedia((prev) => prev.filter((_, i) => i !== idx))}
                    hitSlop={8}
                  >
                    <Text style={styles.tileRemoveText}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addTile} onPress={() => setSourceSheet(true)}>
                <Text style={styles.addTileIcon}>＋</Text>
                <Text style={styles.addTileText}>{t('addMore')}</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Açıklama */}
        <Text style={styles.sectionLabel}>{t('describeProblem')}</Text>
        <TextInput
          style={styles.input}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder={t('describePlaceholder')}
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Kategori önerisi (AI çağrısı yok, yerel kelime eşleştirme) */}
        {suggestion && (
          <Pressable
            style={styles.suggestChip}
            onPress={() => {
              setCategoryId(suggestion.category);
              setSubcategoryId(suggestion.subcategory ?? null);
            }}
          >
            <Text style={styles.suggestText}>
              {(() => {
                const cat = findCategory(suggestion.category);
                const sub = findSubcategory(suggestion.category, suggestion.subcategory);
                return `${t('suggestCategory')}: ${cat ? `${cat.icon} ${t(cat.key)}` : ''}${
                  sub ? ` → ${sub.icon} ${t(sub.key)}` : ''
                } · ${t('useSuggestion')}`;
              })()}
            </Text>
          </Pressable>
        )}

        {/* Kategori seçimi (opsiyonel) */}
        <Text style={styles.sectionLabel}>{t('chooseCategory')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
          contentContainerStyle={styles.catRowContent}
        >
          {CATEGORIES.map((cat) => {
            const active = categoryId === cat.id;
            return (
              <Pressable
                key={cat.id}
                style={[styles.catCard, active && styles.catCardActive]}
                onPress={() => {
                  setCategoryId(active ? null : cat.id);
                  setSubcategoryId(null);
                }}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={1}>
                  {t(cat.key)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {categoryId && (
          <>
            <Text style={styles.sectionLabel}>{t('chooseSubcategory')}</Text>
            <View style={styles.subGrid}>
              {(findCategory(categoryId)?.subcategories ?? []).map((sub) => {
                const active = subcategoryId === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    style={[styles.subChip, active && styles.subChipActive]}
                    onPress={() => setSubcategoryId(active ? null : sub.id)}
                  >
                    <Text style={styles.subIcon}>{sub.icon}</Text>
                    <Text style={[styles.subLabel, active && styles.subLabelActive]} numberOfLines={2}>
                      {t(sub.key)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Analiz */}
        {loading ? (
          <ThinkingLoader text={t('analyzing')} />
        ) : (
          <Pressable
            style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
            onPress={() => runAnalysis()}
            disabled={!canAnalyze}
          >
            <Text style={styles.analyzeBtnText}>{t('analyze')}</Text>
          </Pressable>
        )}
        {!canAnalyze && !loading && (
          <Text style={styles.requiredHint}>
            {media.length === 0 && !description.trim()
              ? `${t('mediaRequired')} · ${t('descriptionRequired')}`
              : media.length === 0
              ? t('mediaRequired')
              : t('descriptionRequired')}
          </Text>
        )}

        {/* Canlı akan cevap */}
        {streamText !== null && (
          <View style={styles.streamBox}>
            <RichText content={streamText} />
            <Text style={styles.cursor}>▋</Text>
          </View>
        )}

        {/* Analiz sonrası değerlendirme kartı */}
        {showRating && <RatingCard onDismiss={onDismissRating} />}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Üst bar: dil bayrağı + AI model + ayarlar */}
      <View style={styles.topBar}>
        <Pressable
          style={[styles.iconBtn, openPicker === 'lang' && styles.iconBtnActive]}
          onPress={() => setOpenPicker(openPicker === 'lang' ? null : 'lang')}
          hitSlop={8}
        >
          <Text style={styles.iconBtnText}>{LANG_FLAGS[language]}</Text>
        </Pressable>
        <Pressable
          style={[styles.iconBtn, openPicker === 'model' && styles.iconBtnActive]}
          onPress={() => setOpenPicker(openPicker === 'model' ? null : 'model')}
          hitSlop={8}
        >
          <Text style={styles.iconBtnText}>🤖</Text>
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onOpenSettings} hitSlop={8}>
          <Text style={styles.iconBtnText}>⚙️</Text>
        </Pressable>
      </View>

      {openPicker === 'lang' && (
        <View style={[styles.dropPanel, styles.dropPanelTop]}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = language === lang;
            return (
              <Pressable
                key={lang}
                style={[styles.dropItem, active && styles.dropItemActive]}
                onPress={() => {
                  onLanguageChange(lang);
                  setOpenPicker(null);
                }}
              >
                <Text style={[styles.dropItemText, active && styles.dropItemTextActive]}>
                  {LANG_FLAGS[lang]} {LANG_LABELS[lang]}
                </Text>
                {active && <Text style={styles.dropCheck}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      )}

      {openPicker === 'model' && (
        <View style={[styles.dropPanel, styles.dropPanelTop]}>
          {AI_MODEL_OPTIONS.map((m) => {
            const active = modelId === m.id;
            return (
              <Pressable
                key={m.id}
                style={[styles.dropItem, active && styles.dropItemActive]}
                onPress={() => {
                  onModelChange(m.id);
                  setOpenPicker(null);
                }}
              >
                <Text style={[styles.dropItemText, active && styles.dropItemTextActive]}>
                  {m.label}
                </Text>
                {active && <Text style={styles.dropCheck}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Medya kaynağı seçimi */}
      <Modal
        transparent
        visible={sourceSheet}
        animationType="fade"
        onRequestClose={() => setSourceSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSourceSheet(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{t('photoSourceTitle')}</Text>
            <Pressable
              style={styles.sheetItem}
              onPress={(e) => {
                e.stopPropagation();
                setSourceSheet(false);
                pickFromCamera();
              }}
            >
              <Text style={styles.sheetItemIcon}>📷</Text>
              <Text style={styles.sheetItemText}>{t('takePhotoVideo')}</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={(e) => {
                e.stopPropagation();
                setSourceSheet(false);
                pickFromLibrary();
              }}
            >
              <Text style={styles.sheetItemIcon}>🖼️</Text>
              <Text style={styles.sheetItemText}>{t('pickMedia')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function guessMime(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    heic: 'image/heic',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4a: 'audio/mp4',
    webm: 'video/webm',
    wav: 'audio/wav',
  };
  return map[ext] ?? 'application/octet-stream';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    position: 'absolute',
    top: 8,
    right: 14,
    zIndex: 40,
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.cardAlt },
  iconBtnText: { fontSize: 18 },
  dropPanelTop: {
    position: 'absolute',
    top: 54,
    right: 14,
    width: 240,
    zIndex: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  container: { padding: SPACING, paddingBottom: 40 },
  hero: { alignItems: 'center', marginTop: 6, marginBottom: 4 },
  logoGlow: {
    borderRadius: 999,
    padding: 8,
    backgroundColor: 'rgba(99,102,241,0.14)',
    marginBottom: 10,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  tagline: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginTop: 2, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 20, textAlign: 'center' },
  configWarning: {
    marginTop: 12,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  uploadCard: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS,
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99,102,241,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIcon: { fontSize: 30 },
  uploadTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  uploadDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center', lineHeight: 17 },
  howCard: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 16,
  },
  howTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginBottom: 12 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  howCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNum: { color: '#fff', fontSize: 12, fontWeight: '900' },
  howIcon: { fontSize: 16 },
  howLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  demoCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(99,102,241,0.16)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS,
    padding: 16,
  },
  demoEmoji: { fontSize: 28 },
  demoTextWrap: { flex: 1 },
  demoTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  demoCta: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '800', marginTop: 4 },
  suggestChip: {
    marginTop: 10,
    backgroundColor: 'rgba(52,208,122,0.12)',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestText: { color: COLORS.success, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 10,
  },
  // Açılır seçiciler
  pickerRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  pickerBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.cardAlt },
  pickerBtnLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  pickerBtnValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 3,
    flexDirection: 'row',
  },
  pickerCaret: { position: 'absolute', right: 12, top: 12, color: COLORS.textMuted, fontSize: 10 },
  dropPanel: {
    marginTop: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    overflow: 'hidden',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropItemActive: { backgroundColor: 'rgba(99,102,241,0.16)' },
  dropItemText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  dropItemTextActive: { color: COLORS.primary, fontWeight: '800' },
  dropCheck: { color: COLORS.primary, fontSize: 15, fontWeight: '900' },
  // Kategori seçimi
  catRow: { flexGrow: 0 },
  catRowContent: { gap: 10, paddingRight: 4 },
  catCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    width: 104,
  },
  catCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  catIcon: { fontSize: 22, marginBottom: 6 },
  catLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  catLabelActive: { color: COLORS.primaryLight, fontWeight: '800' },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '48%',
  },
  subChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  subIcon: { fontSize: 15 },
  subLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  subLabelActive: { color: COLORS.primaryLight, fontWeight: '800' },
  // Aksiyon kartları
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  actionCardRecording: { borderColor: COLORS.danger, backgroundColor: 'rgba(239,68,68,0.10)' },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBlue: { backgroundColor: 'rgba(59,130,246,0.18)' },
  iconGreen: { backgroundColor: 'rgba(34,197,94,0.16)' },
  iconOrange: { backgroundColor: 'rgba(255,138,61,0.16)' },
  iconRed: { backgroundColor: 'rgba(239,68,68,0.18)' },
  actionIconText: { fontSize: 20 },
  actionTitle: { color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  hint: { color: COLORS.warning, fontSize: 13, marginTop: 8, textAlign: 'center' },
  mediaBox: {
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addTile: {
    width: 96,
    height: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addTileIcon: { color: COLORS.textMuted, fontSize: 24, fontWeight: '700' },
  addTileText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  mediaTile: {
    width: 96,
    height: 96,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tileImage: { width: '100%', height: '100%' },
  tileVideo: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tileVideoIcon: {
    position: 'absolute',
    zIndex: 2,
    color: '#fff',
    fontSize: 26,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 4,
  },
  tileAudio: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
  },
  tileRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileRemoveText: { color: '#fff', fontSize: 13, fontWeight: '800', lineHeight: 16 },
  mediaLabel: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  noMedia: { color: COLORS.textMuted, fontSize: 14 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 12,
    minHeight: 90,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  analyzeBtn: {
    marginTop: 24,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  analyzeBtnDisabled: { opacity: 0.6 },
  analyzeBtnText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.3 },
  requiredHint: {
    marginTop: 10,
    color: COLORS.warning,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  streamBox: {
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 16,
  },
  cursor: { color: COLORS.primary, fontWeight: '700', marginTop: 4 },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12,16,28,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.cardAlt,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetItemIcon: { fontSize: 20 },
  sheetItemText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
});
