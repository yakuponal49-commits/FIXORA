import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Easing,
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

import { AnalyzeInput, PendingMedia, analyzeProblemStream, isAuthError, validatePromoCode } from '../api/client';
import { BACKEND_URL_MISSING } from '../auth/config';
import { Language, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { DEMO_IMAGE_BASE64 } from '../data/demo';
import { canAnalyze as canUseFree, getRemainingDaily, isPro, recordAnalysis, setPro } from '../storage/pro';
import { COLORS, RADIUS, SPACING } from '../theme';
import Logo from '../components/Logo';
import ThinkingLoader from '../components/ThinkingLoader';
import RatingCard from '../components/RatingCard';
import RichText from '../components/RichText';
import UpgradeModal from '../components/UpgradeModal';
import LimitAlert from '../components/LimitAlert';
import PromoAlert from '../components/PromoAlert';
import CropScreen from './CropScreen';

interface Props {
  language: Language;
  modelId: string;
  onLanguageChange: (lang: Language) => void;
  onResult: (input: AnalyzeInput, analysis: string) => void;
  onOpenSettings: () => void;
  onOpenPro: () => void;
  showRating: boolean;
  onDismissRating: () => void;
}

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

const LANG_FLAGS: Record<Language, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  fr: '🇫🇷',
};

const API_KEY_MISSING = BACKEND_URL_MISSING;

export default function HomeScreen({
  language,
  modelId,
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
  const [openPicker, setOpenPicker] = useState<'lang' | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [sourceSheet, setSourceSheet] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [limitAlertVisible, setLimitAlertVisible] = useState(false);
  const [proStatus, setProStatus] = useState(false);
  const [remaining, setRemaining] = useState<number | typeof Infinity>(Infinity);
  const [promoAlert, setPromoAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  const [pendingCropUri, setPendingCropUri] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const streamTextRef = useRef<string | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Pro status kontrolü
  useEffect(() => {
    const checkPro = async () => {
      const pro = await isPro();
      setProStatus(pro);
      const rem = await getRemainingDaily();
      setRemaining(rem);
    };
    checkPro();
  }, []);

  // Animated PRO button wobble effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

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
      if (a.mimeType?.startsWith('video')) {
        setMedia((prev) => [
          ...prev,
          {
            uri: a.uri,
            name: a.fileName ?? `camera-${Date.now()}.${a.mimeType?.split('/')[1] ?? 'mp4'}`,
            type: a.mimeType ?? 'video/mp4',
          },
        ]);
      } else {
        setPendingCropUri(a.uri);
      }
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
      const images = result.assets.filter((a) => a.mimeType?.startsWith('image'));
      const videos = result.assets.filter((a) => a.mimeType?.startsWith('video'));

      const videoItems = videos.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `picked-${Date.now()}-${a.uri.split('/').pop()}.${a.mimeType?.split('/')[1] ?? 'mp4'}`,
        type: a.mimeType ?? 'video/mp4',
      }));
      if (videoItems.length > 0) {
        setMedia((prev) => [...prev, ...videoItems]);
      }

      if (images.length === 1) {
        setPendingCropUri(images[0].uri);
      } else if (images.length > 1) {
        const added = images.map((a) => ({
          uri: a.uri,
          name: a.fileName ?? `picked-${Date.now()}-${a.uri.split('/').pop()}.${a.mimeType?.split('/')[1] ?? 'jpg'}`,
          type: a.mimeType ?? guessMime(a.uri),
        }));
        setMedia((prev) => [...prev, ...added]);
      }
    }
  };

  const handleCropped = (croppedUri: string) => {
    setMedia((prev) => [
      ...prev,
      {
        uri: croppedUri,
        name: `cropped-${Date.now()}.jpg`,
        type: 'image/jpeg',
      },
    ]);
    setPendingCropUri(null);
  };

  const runAnalysis = async (override?: {
    description?: string;
    files?: PendingMedia[];
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
      setLimitAlertVisible(true);
      return;
    }
    setLoading(true);
    setStreamText('');
    try {
      // Kategori, kullanıcıya sorulmaz; AI kullanıcının verdiği veriden kendisi karar verir.
      const input: AnalyzeInput = {
        language,
        description: desc,
        modelId,
        files,
      };
      const fullText = await analyzeProblemStream(input, (text) => setStreamText(text));
      streamTextRef.current = null;
      setStreamText(null);
      if (!fullText || !fullText.trim()) throw new Error(t('errorEmptyResult'));
      await recordAnalysis();
      const newRemaining = await getRemainingDaily();
      setRemaining(newRemaining);
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

  /** Örnek demoyu başlatır: hazır görsel + açıklama ile. */
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
      setMedia(demoFiles);
      setDescription(demoDesc);
      runAnalysis({ files: demoFiles, description: demoDesc });
    } catch {
      Alert.alert(t('errorTitle'), t('errorCheckNetwork'));
    }
  };

  const canAnalyze = media.length > 0 && description.trim().length > 0;

  /** Promo kodu doğrula ve Pro aktif et */
  const handlePromoCodeSubmit = async (code: string): Promise<boolean> => {
    const result = await validatePromoCode(code);
    if (result.valid) {
      // Pro 30 gün geçerli
      await setPro(true, 30);
      setProStatus(true);
      setPromoAlert({ type: 'success', title: t('successTitle'), message: t('promoSuccess') });
      return true;
    }
    if (result.kind === 'network') {
      setPromoAlert({ type: 'error', title: t('errorTitle'), message: t('promoNetworkError') });
    } else if (result.kind === 'limit') {
      setPromoAlert({ type: 'error', title: t('errorTitle'), message: t('promoLimitReached') });
    } else {
      setPromoAlert({ type: 'error', title: t('errorTitle'), message: t('promoInvalidCode') });
    }
    return false;
  };

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
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoGlow, {
              transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
            }]} />
            <View style={styles.logoStatic}>
              <Logo size={90} />
            </View>
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

        {/* Canli akan cevap */}
        {streamText !== null && (
          <View style={styles.streamBox}>
            <RichText content={streamText} />
            <Text style={styles.cursor}>{'\u258B'}</Text>
          </View>
        )}

        {/* Gunluk kalan analiz hakki */}
        {!proStatus && remaining !== Infinity && (
          <View style={styles.remainingBox}>
            <Text style={styles.remainingText}>
              {remaining > 0
                ? `${t('dailyRemaining')}: ${remaining}/${1}`
                : t('dailyLimitReached')}
            </Text>
          </View>
        )}

        {/* Analiz sonrasi degerlendirme karti */}
        {showRating && <RatingCard onDismiss={onDismissRating} />}
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Ust bar: PRO button + dil bayragi + ayarlar */}
      <View style={styles.topBar}>
        {proStatus ? (
          <Pressable
            style={[styles.proBtn, styles.proBtnActive]}
            onPress={() => setUpgradeVisible(true)}
            hitSlop={12}
          >
            <Text style={[styles.proBtnText, styles.proBtnTextActive]}>
              {'\u2705 PRO'}
            </Text>
          </Pressable>
        ) : (
          <Animated.View
            style={{
              transform: [
                {
                  scale: bounceAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.9, 1.15, 1],
                  }),
                },
              ],
            }}
          >
            <Pressable
              style={styles.proBtn}
              onPress={() => setUpgradeVisible(true)}
              hitSlop={12}
            >
              <Text style={styles.proBtnText}>{'\u2B50 PRO'}</Text>
            </Pressable>
          </Animated.View>
        )}

        <Pressable
          style={[styles.iconBtn, openPicker === 'lang' && styles.iconBtnActive]}
          onPress={() => setOpenPicker(openPicker === 'lang' ? null : 'lang')}
          hitSlop={8}
        >
          <Text style={styles.iconBtnText}>{LANG_FLAGS[language]}</Text>
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

      {/* Medya kaynağı seçimi */}
      <Modal
        transparent
        visible={sourceSheet}
        animationType="slide"
        onRequestClose={() => setSourceSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setSourceSheet(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetIconCircle}>
                <Text style={styles.sheetIconUpload}>⬆</Text>
              </View>
              <Pressable style={styles.sheetCloseBtn} onPress={() => setSourceSheet(false)} hitSlop={8}>
                <Text style={styles.sheetCloseText}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.sheetTitle}>{t('addPhotoTitle')}</Text>
            <Text style={styles.sheetDesc}>{t('addPhotoDesc')}</Text>
            <View style={styles.sheetCards}>
              <Pressable
                style={styles.sheetCard}
                onPress={(e) => {
                  e.stopPropagation();
                  setSourceSheet(false);
                  pickFromCamera();
                }}
              >
                <View style={styles.sheetCardIconWrap}>
                  <Text style={styles.sheetCardIcon}>📷</Text>
                </View>
                <Text style={styles.sheetCardLabel}>{t('addPhotoCamera')}</Text>
              </Pressable>
              <Pressable
                style={styles.sheetCard}
                onPress={(e) => {
                  e.stopPropagation();
                  setSourceSheet(false);
                  pickFromLibrary();
                }}
              >
                <View style={styles.sheetCardIconWrap}>
                  <Text style={styles.sheetCardIcon}>🖼️</Text>
                </View>
                <Text style={styles.sheetCardLabel}>{t('addPhotoGallery')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={upgradeVisible}
        onClose={() => setUpgradeVisible(false)}
        onPromoCodeSubmit={handlePromoCodeSubmit}
        onUpgradeClick={onOpenPro}
        language={language}
      />

      {/* Promo Sonucu Alert */}
      <PromoAlert
        visible={!!promoAlert}
        type={promoAlert?.type ?? 'success'}
        title={promoAlert?.title ?? ''}
        message={promoAlert?.message ?? ''}
        onClose={() => setPromoAlert(null)}
      />

      {/* Gunluk limit dolmus uyari alerti */}
      <LimitAlert
        visible={limitAlertVisible}
        onClose={() => setLimitAlertVisible(false)}
        onGoPro={() => setUpgradeVisible(true)}
      />

      {/* Crop Screen Overlay */}
      {pendingCropUri && (
        <View style={{ ...StyleSheet.absoluteFill, backgroundColor: COLORS.background, zIndex: 50 }}>
          <CropScreen
            uri={pendingCropUri}
            onBack={() => setPendingCropUri(null)}
            onCropped={handleCropped}
          />
        </View>
      )}

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
  proBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  proBtnActive: {
    backgroundColor: COLORS.primary + '33',
    borderColor: COLORS.primary,
  },
  proBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  proBtnTextActive: {
    color: COLORS.primary,
  },
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
  hero: { alignItems: 'center', marginTop: 2, marginBottom: 0 },
  logoContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoStatic: {
    transform: [{ scale: 1.1 }],
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.4,
    zIndex: 1,
  },
  brand: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  tagline: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginTop: 1, textAlign: 'center' },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 18, textAlign: 'center' },
  configWarning: {
    marginTop: 6,
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  uploadCard: {
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  uploadIcon: { fontSize: 24 },
  uploadTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  uploadDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center', lineHeight: 15 },
  howCard: {
    marginTop: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 10,
  },
  howTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginBottom: 6 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  howCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNum: { color: '#fff', fontSize: 10, fontWeight: '900' },
  howIcon: { fontSize: 14 },
  howLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600', flex: 1 },
  demoCard: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary + '29',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS,
    padding: 10,
  },
  demoEmoji: { fontSize: 22 },
  demoTextWrap: { flex: 1 },
  demoTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  demoCta: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '800', marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
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
  dropItemActive: { backgroundColor: COLORS.primary + '29' },
  dropItemText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  dropItemTextActive: { color: COLORS.primary, fontWeight: '800' },
  dropCheck: { color: COLORS.primary, fontSize: 15, fontWeight: '900' },
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
  tileImage: { width: '100%', height: '100%', resizeMode: 'contain' as const },
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
    padding: 10,
    minHeight: 70,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  analyzeBtn: {
    marginTop: 14,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS,
    padding: 15,
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
    marginTop: 6,
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
  remainingBox: {
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: 'center',
  },
  remainingText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(12,16,28,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconUpload: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '800',
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  sheetDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  sheetCards: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 10,
  },
  sheetCardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCardIcon: {
    fontSize: 24,
  },
  sheetCardLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
