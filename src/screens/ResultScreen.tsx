import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { ChatTurn, continueChatStream, isAuthError, AnalyzeInput, resolveMaterialIcons } from '../api/client';
import RichText from '../components/RichText';
import ThinkingLoader from '../components/ThinkingLoader';
import { findSubcategory } from '../data/categories';
import { estimateSavings } from '../utils/savings';
import { parseQuestionBlock } from '../utils/questionBlock';
import { parseProfessionBlock, ProfessionBlock } from '../utils/professionBlock';
import { stripInvisible } from '../utils/invisible';
import { COLORS, RADIUS, SPACING } from '../theme';

// Yeni Nesil Tasarım Renkleri (theme.ts ile uyumlu)
const THEME = {
  bg: COLORS.background,
  card: COLORS.card,
  cardAlt: COLORS.cardAlt,
  border: COLORS.border,
  text: COLORS.text,
  textMuted: COLORS.textMuted,
  primary: COLORS.primary,
  primaryLight: COLORS.primaryLight,
  success: COLORS.success,
  warning: COLORS.warning,
  danger: COLORS.danger,
  neonBlue: COLORS.neonBlue,
  neonPurple: COLORS.neonPurple,
};

interface Props {
  analysis: string;
  language: string;
  modelId: string;
  original: AnalyzeInput;
  onBack: () => void;
  onAnalysisUpdated?: (text: string) => void;
}

function openMaps(q: string, lat?: number, lng?: number, place?: string) {
  // Yer adi varsa sorguya "near <yer>" eklenir; boylece Google Maps, cihazin
  // yanlis konumunu kullansa bile sonuclari dogru bolgeye gore getirir.
  const query = place ? `${q} near ${place}` : q;
  const base = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  const url = lat !== undefined && lng !== undefined ? `${base}/@${lat},${lng},15z` : base;
  Linking.canOpenURL(url)
    .then((ok) => (ok ? Linking.openURL(url) : Linking.openURL(base)))
    .catch(() => Linking.openURL(base));
}
function materialKey(language: string) {
  if (language === 'de') return 'Baumarkt Baustoffe';
  if (language === 'fr') return 'magasin bricolage';
  return 'hardware store building materials';
}

/** Kategori + alt kategoriye gore meslek grubu (harita aramasi icin, dile gore). */
function professionForCategory(category: string | undefined, language: string): string {
  const byLang: Record<string, Record<string, string>> = {
    plumbing: { de: 'Klempner Sanitär', fr: 'plombier', en: 'plumber' },
    appliances: { de: 'Haushaltsgeräte Reparatur', fr: 'réparation électroménager', en: 'appliance repair' },
    electronics: { de: 'Elektronik Reparatur', fr: 'réparation électronique', en: 'electronics repair' },
    car: { de: 'Kfz-Werkstatt', fr: 'garage automobile', en: 'auto repair shop' },
    furniture: { de: 'Möbelreparatur', fr: 'réparation de meubles', en: 'furniture repair' },
  };
  const map = byLang[category ?? ''] ?? {};
  return map[language] ?? (language === 'de' ? 'Handwerker' : language === 'fr' ? 'artisan' : 'repair service');
}

/** Kategoriye gore malzeme/tedarikci aramasi (harita, dile gore). */
function suppliesForCategory(category: string | undefined, language: string): string {
  const byLang: Record<string, Record<string, string>> = {
    plumbing: { de: 'Sanitärbedarf', fr: 'magasin plomberie', en: 'plumbing supplies' },
    appliances: { de: 'Ersatzteile Haushalt', fr: 'pièces détachées électroménager', en: 'appliance spare parts' },
    electronics: { de: 'Ersatzteile Elektronik', fr: 'pièces détachées électronique', en: 'electronics spare parts' },
    car: { de: 'Autoteile Zubehör', fr: 'pièces auto', en: 'auto parts' },
    furniture: { de: 'Baumarkt', fr: 'magasin bricolage', en: 'hardware store' },
  };
  const map = byLang[category ?? ''] ?? {};
  return map[language] ?? materialKey(language);
}

/** Meslek adina "tamiri" gibi bir hizmet kelimesi ekler (sorguyu isletmelere yonlendirir). */
function serviceWord(language: string): string {
  if (language === 'de') return 'Reparatur';
  if (language === 'fr') return 'réparation';
  return 'repair';
}

/** Sonucu WhatsApp/sosyal medyada paylasilabilir düz metne cevirir. */
function buildShareText(
  analysis: string,
  original: AnalyzeInput,
  t: (key: string) => string
): string {
  const { clean: shareClean } = parseProfessionBlock(analysis);
  const saved = estimateSavings(analysis);
  const lines: string[] = [`${t('appName')} · ${t('tagline')}`];
  if (original.description?.trim()) {
    lines.push('', `${t('describeProblem')}: ${original.description.trim()}`);
  }
  if (saved !== null) {
    lines.push(`💰 ${t('saveEstimate')}: ~${Math.round(saved)} €`);
  }
  lines.push('', shareClean.slice(0, 1400));
  return lines.join('\n');
}

/** AI yanitindaki yapilandirilmis soru + secenek blogunu ayiklar. */

/**
 * Markdown basliklarina (## / ###) gore metni bolumlere ayirir. (DEĞİŞMEDİ)
 * Ilk basliktan onceki metin (giris ozeti) ayri bir "bassiz" kart olur.
 */
interface Section {
  heading: string;
  body: string;
}

function parseSections(text: string): Section[] {
  const lines = text.split('\n');
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const h = line.trim().match(/^(#{2,3})\s+(.*)$/);
    if (h) {
      current = { heading: h[2].trim(), body: '' };
      sections.push(current);
    } else if (current) {
      current.body += line + '\n';
    } else if (line.trim()) {
      current = { heading: '', body: line + '\n' };
      sections.push(current);
    }
  }

  return sections
    .map((s) => ({ heading: s.heading, body: s.body.trim() }))
    .filter((s) => s.body.length > 0);
}

type SectionKind = 'safety' | 'steps' | 'pro' | 'check' | 'prevent' | 'cost' | 'default';

/** Basligi kart tipine cevirir (5 dil, kelime taramasi). (DEĞİŞMEDİ) */
function sectionKind(heading: string): SectionKind {
  const h = heading.toLowerCase();
  if (/(safety|sicherheit|sécurité|sicurezza|güvenlik)/.test(h)) return 'safety';
  if (/(step|schritt|étape|passo|adım|etap)/.test(h)) return 'steps';
  if (/(profi|profession|profesyonel|when|wann|quand|quando|ne zaman|call|rufen|appeler|chiamare|çağırmal|hire)/.test(h))
    return 'pro';
  if (/(check|kontrol|prüf|vérif|verific|control|après|dopo|sonra|nach)/.test(h)) return 'check';
  if (/(prevent|vorbeug|prévent|preventiv|önleyici|tip|tipp|conseil|consigli|ipuc)/.test(h)) return 'prevent';
  if (/(cost|kosten|coût|costo|maliyet|price|budget|aperçu|panoramica|übersicht)/.test(h)) return 'cost';
  return 'default';
}

/** YENİ: "Doğruluk / Accuracy / Genauigkeit ..." basligini tanir. sectionKind'e dokunmaz,
 *  sadece ek bir render karari verir (default kind uzerine ekstra kart secimi). */
function isAccuracyHeading(heading: string): boolean {
  return /(doğruluk|accuracy|genauigkeit|précision|precisione|confidence)/i.test(heading);
}

function parseRisk(body: string): 'HIGH' | 'MEDIUM' | 'LOW' | null {
  const m = body.match(/RISK:\s*\*?\*?\s*(HIGH|MEDIUM|LOW)/i);
  if (m) return m[1].toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';
  return null;
}

/** YENİ: Doğruluk kartı için güven seviyesi. Backend "CONFIDENCE: HIGH" gibi bir
 *  etiket eklerse renkli rozet gösterilir; etiket yoksa kart sade metin olarak kalır. */
function parseConfidence(body: string): 'HIGH' | 'MEDIUM' | 'LOW' | null {
  const m = body.match(/CONFIDENCE:\s*\*?\*?\s*(HIGH|MEDIUM|LOW)/i);
  if (m) return m[1].toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW';
  return null;
}

interface StepItem {
  n: number;
  title: string;
  desc: string[];
  why?: string;
  tools?: string[];
  expected?: string;
  ifNot?: string;
  safety?: string;
  difficulty?: string;
  duration?: string;
}

type StepField = 'why' | 'tools' | 'expected' | 'ifNot' | 'safety' | 'difficulty' | 'duration';

// Adım alt-alanlarını 5 dilde tanıyan etiket kalıpları (rakip ekranındaki
// "Neden / Gereken Aletler / Beklenen Sonuç / Beklenen Değilse / Güvenlik /
// Zorluk / Süre" alanlarının dil-bağımsız karşılığı).
const STEP_FIELD_RE: [StepField, RegExp][] = [
  ['why', /^[-•*\s]*(neden|why|warum|pourquoi|perch[éeè])\s*:\s*(.*)$/i],
  ['tools', /^[-•*\s]*(gereken aletler|araçlar|tools?( needed)?|required tools?|benötigte werkzeuge|outils?\s*n[ée]cessaires?|strumenti necessari)\s*:\s*(.*)$/i],
  ['expected', /^[-•*\s]*(beklenen sonuç|expected (result|outcome)|erwartetes ergebnis|résultat attendu|risultato atteso)\s*:\s*(.*)$/i],
  ['ifNot', /^[-•*\s]*(beklenen değilse|if not( as expected)?|falls nicht(?: wie erwartet)?|si (ce n'est pas le cas|non)|se non)\s*:\s*(.*)$/i],
  ['safety', /^[-•*\s]*(güvenlik|safety|sicherheit|sécurité|sicurezza)\s*:\s*(.*)$/i],
  ['difficulty', /^[-•*\s]*(zorluk|difficulty|schwierigkeit|difficulté|difficoltà)\s*:\s*(.*)$/i],
  ['duration', /^[-•*\s]*(süre(\s*\(dk\)|\s*\(min\))?|duration|dauer|durée|durata)\s*:\s*(.*)$/i],
];

/**
 * "Adım Adım" bolumunden: Problem ozeti + numarali adimlar (her adimin Neden /
 * Gereken Aletler / Beklenen Sonuç / Beklenen Değilse / Güvenlik / Zorluk / Süre
 * alt alanlariyla) + geri kalan serbest metin.
 * Bu etiketler mevcut degilse (backend bunlari uretmiyorsa) adim sadece
 * numara + baslik olarak eskisi gibi calisir — hicbir sey kirilmiyor.
 */
function parseSteps(body: string): { summary: string | null; steps: StepItem[]; rest: string[] } {
  let summary: string | null = null;
  const rest: string[] = [];
  const steps: StepItem[] = [];
  let current: StepItem | null = null;
  let pendingField: StepField | null = null;

  for (const raw of body.split('\n')) {
    const line = stripInvisible(raw).trim();
    if (!line) continue;

    const stepM = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (stepM) {
      current = { n: parseInt(stepM[1], 10), title: stepM[2], desc: [] };
      steps.push(current);
      pendingField = null;
      continue;
    }

    if (!current) {
      if (/^[-•*\s]*\*?\*?Problem:?\*?\*?\s*/i.test(line)) {
        summary = line.replace(/^[-•*\s]*\*?\*?Problem:?\*?\*?\s*/i, '').trim();
      } else {
        rest.push(line);
      }
      continue;
    }

    let matched = false;
    for (const [field, re] of STEP_FIELD_RE) {
      const m = line.match(re);
      if (m) {
        const value = (m[m.length - 1] || '').trim();
        if (field === 'tools') {
          current.tools = value
            ? value.split(/,|;/).map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
            : [];
        } else {
          (current as any)[field] = value;
        }
        pendingField = field;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    if (pendingField === 'tools' && /^[-•*]/.test(line)) {
      current.tools = [...(current.tools ?? []), line.replace(/^[-•*]\s*/, '').trim()];
    } else if (pendingField && pendingField !== 'tools') {
      (current as any)[pendingField] = `${(current as any)[pendingField] ?? ''} ${line}`.trim();
    } else {
      current.desc.push(line);
    }
  }
  return { summary, steps, rest };
}

/** Maliyet bolumunden DIY / Pro / Save satirlarini ayiklar. (DEĞİŞMEDİ) */
function parseCost(body: string): { diy?: string; pro?: string; save?: string; rest: string[] } {
  let diy: string | undefined;
  let pro: string | undefined;
  let save: string | undefined;
  const rest: string[] = [];
  const clean = (l: string) => stripInvisible(l).trim();

  // Split by newline and filter out empty or whitespace-only lines
  const lines = body.split('\n').map(clean).filter(Boolean);

  for (const line of lines) {
    if (/^[-•*\s]*DIY:/i.test(line)) {
      diy = line.replace(/^[-•*\s]*DIY:\s*/i, '').trim();
    } else if (/^[-•*\s]*Pro:/i.test(line)) {
      pro = line.replace(/^[-•*\s]*Pro:\s*/i, '').trim();
    } else if (/^[-•*\s]*Save:/i.test(line)) {
      save = line.replace(/^[-•*\s]*Save:\s*/i, '').trim();
    } else {
      rest.push(line);
    }
  }
  return { diy, pro, save, rest };
}

/** Kartların yumuşakça ekrana girmesini sağlayan animasyon bileşeni. */
function FadeInView({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [25, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

function RiskPill({ level }: { level: string }) {
  const color = level === 'HIGH' ? THEME.danger : level === 'MEDIUM' ? THEME.warning : THEME.success;
  const labelMap: Record<string, string> = { HIGH: '⛔ HIGH', MEDIUM: '⚠ MEDIUM', LOW: '✓ LOW' };
  return (
    <View style={[styles.riskPill, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.riskPillText, { color }]}>{labelMap[level]}</Text>
    </View>
  );
}

/** YENİ: "Doğruluk" (confidence) kartı — rakip ekranındaki gri kart + yeşil "High" rozeti. */
function ConfidencePill({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const { t } = useTranslation();
  const map = {
    HIGH: { label: t('confidenceHigh'), bg: '#EAFBF0', color: '#2E7D46' },
    MEDIUM: { label: t('confidenceMedium'), bg: '#FDF3DC', color: '#8A6A00' },
    LOW: { label: t('confidenceLow'), bg: '#FDE2E3', color: THEME.danger },
  } as const;
  const conf = map[level];
  return (
    <View style={[styles.confidencePill, { backgroundColor: conf.bg }]}>
      <Text style={[styles.confidencePillText, { color: conf.color }]}>{conf.label}</Text>
    </View>
  );
}

function AccuracyCard({ section }: { section: Section }) {
  const confidence = parseConfidence(section.body);
  const body = confidence
    ? section.body.replace(/^[-•*\s]*CONFIDENCE:\s*\*?\*?\s*(HIGH|MEDIUM|LOW)\s*\*?\*?.*$/im, '').trim()
    : section.body;
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      <Text selectable style={styles.sectionHeading}>{section.heading}</Text>
      <View style={styles.accuracyRow}>
        {confidence && (
          <View style={styles.accuracyPillCol}>
            <ConfidencePill level={confidence} />
          </View>
        )}
        <View style={styles.accuracyTextCol}>
          <RichText content={body} color={THEME.text} />
        </View>
      </View>
    </View>
  );
}

function SafetyCard({ section }: { section: Section }) {
  const risk = parseRisk(section.body);
  const body = risk
    ? section.body.replace(/^[-•*\s]*RISK:\s*\*?\*?\s*(HIGH|MEDIUM|LOW)\s*\*?\*?.*$/im, '').trim()
    : section.body;
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      <Text selectable style={styles.sectionHeading}>{section.heading}</Text>
      {risk && <RiskPill level={risk} />}
      <RichText content={body} color={THEME.text} />
    </View>
  );
}

/** **kalın** satir ici isleyen kucuk yardimci. (DEĞİŞMEDİ) */
function inlineParts(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <Text key={i} selectable style={styles.inlineBold}>
          {bold[1]}
        </Text>
      );
    }
    return (
      <Text key={i} selectable>
        {part}
      </Text>
    );
  });
}

/** YENİ: Bir adımın "Etiket: değer" satırı (Neden / Beklenen Sonuç / Beklenen Değilse / Güvenlik). */
function StepField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.stepFieldRow}>
      <Text selectable style={styles.stepFieldLabel}>{label}</Text>
      <Text selectable style={styles.stepFieldValue}>{inlineParts(value)}</Text>
    </View>
  );
}

function StepsCard({ section }: { section: Section }) {
  const { t } = useTranslation();
  const { summary, steps, rest } = parseSteps(section.body);
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      <Text selectable style={styles.sectionHeading}>{section.heading}</Text>
      {summary && (
        <View style={styles.stepsSummaryBox}>
          <Text selectable style={styles.stepsSummaryLabel}>Problem</Text>
          <Text selectable style={styles.stepsSummary}>{inlineParts(summary)}</Text>
        </View>
      )}
      {rest.length > 0 && <RichText content={rest.join('\n')} color={THEME.text} />}
      {steps.map((s, idx) => (
        <View key={s.n} style={[styles.stepBlock, idx < steps.length - 1 && styles.stepBlockDivider]}>
          <View style={styles.stepRow}>
            <View style={[styles.stepCircle, { backgroundColor: THEME.neonBlue }]}>
              <Text selectable style={styles.stepCircleText}>{s.n}</Text>
            </View>
            <Text selectable style={styles.stepText}>{inlineParts(s.title)}</Text>
          </View>

          {s.desc.length > 0 && (
            <View style={styles.stepDescWrap}>
              <RichText content={s.desc.join('\n')} color={THEME.text} />
            </View>
          )}

          <StepField label={t('stepWhyLabel')} value={s.why} />

          {s.tools && s.tools.length > 0 && (
            <View style={styles.stepFieldRow}>
              <Text selectable style={styles.stepFieldLabel}>{t('stepToolsLabel')}</Text>
              <View style={styles.toolChipRow}>
                {s.tools.map((tool, i) => (
                  <View key={i} style={[styles.toolChip, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                    <Text style={[styles.toolChipText, { color: THEME.neonBlue }]}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <StepField label={t('stepExpectedLabel')} value={s.expected} />
          <StepField label={t('stepIfNotLabel')} value={s.ifNot} />
          <StepField label={t('stepSafetyLabel')} value={s.safety} />

          {(s.difficulty || s.duration) && (
            <View style={styles.stepMetaRow}>
              {s.difficulty && (
                <View style={[styles.metaPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.metaPillText, { color: THEME.success }]}>{t('stepDifficultyLabel')}: {s.difficulty}</Text>
                </View>
              )}
              {s.duration && (
                <View style={[styles.metaPill, { backgroundColor: 'rgba(192, 132, 252, 0.15)' }]}>
                  <Text style={[styles.metaPillText, { color: THEME.neonPurple }]}>{t('stepDurationLabel')}: {s.duration}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function CostCard({ section }: { section: Section }) {
  const { t } = useTranslation();
  const { diy, pro, save, rest } = parseCost(section.body);
  return (
    <View style={[styles.sectionCard, styles.costCard]}>
      <Text selectable style={styles.costTitle}>{section.heading}</Text>
      {rest.length > 0 && <RichText content={rest.join('\n')} color={THEME.text} />}
      {(diy || pro) && (
        <View>
          {pro && (
            <View style={styles.costRow}>
              <Text selectable style={styles.costRowLabel}>{t('costPro')}</Text>
              <Text selectable style={styles.costRowValue}>{pro}</Text>
            </View>
          )}
          {diy && (
            <View style={styles.costRow}>
              <Text selectable style={styles.costRowLabel}>{t('costDiy')}</Text>
              <Text selectable style={styles.costRowValue}>{diy}</Text>
            </View>
          )}
        </View>
      )}
      {save && (
        <View style={[styles.costRow, styles.costRowSave]}>
          <Text selectable style={styles.costSaveLabel}>{t('costSave')}</Text>
          <Text selectable style={styles.costSaveValue}>{save}</Text>
        </View>
      )}
      <View style={styles.costEco}>
        <Text selectable style={styles.costEcoIcon}>🌳</Text>
        <Text selectable style={styles.costEcoText}>{t('costEco')}</Text>
      </View>
      {rest.length === 0 && <Text selectable style={styles.costNote}>{t('costNote')}</Text>}
    </View>
  );
}

/** Genel liste karti: Önleyici İpuçları / Güvenlik Uyarıları / Ne Zaman Profesyonel /
 *  Onarım Sonrası Kontrol — rakip ekranında ikon rozeti yok, sadece kalın başlık + metin. */
function BaseCard({ section }: { section: Section }) {
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      {section.heading ? <Text selectable style={styles.sectionHeading}>{section.heading}</Text> : null}
      <RichText content={section.body} color={THEME.text} />
    </View>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  const content = (() => {
    if (isAccuracyHeading(section.heading)) return <AccuracyCard section={section} />;
    const kind = sectionKind(section.heading);
    if (kind === 'safety') return <SafetyCard section={section} />;
    if (kind === 'steps') return <StepsCard section={section} />;
    if (kind === 'cost') return <CostCard section={section} />;
    return <BaseCard section={section} />;
  })();

  return <FadeInView delay={index * 150}>{content}</FadeInView>;
}

/** YENİ: "Önce güvenlik" — rakip ekranındaki sarı uyarı kartı. Ayrı bir backend
 *  etiketi gerektirmez: mevcut "safety" bölümünün ilk satırından türetilir.
 *  Böyle bir bölüm yoksa hiçbir şey render edilmez (uydurma metin yok). */
function firstSafetyLine(sections: Section[]): string | null {
  const safetySection = sections.find((s) => sectionKind(s.heading) === 'safety');
  if (!safetySection) return null;
  const body = safetySection.body.replace(/^[-•*\s]*RISK:\s*\*?\*?\s*(HIGH|MEDIUM|LOW)\s*\*?\*?.*$/im, '').trim();
  const firstLine = body
    .split('\n')
    .map((l) => l.replace(/^[-•*\s]+/, '').trim())
    .find(Boolean);
  return firstLine ?? null;
}

function SafetyFirstCallout({ text }: { text: string }) {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, [pulse]);

  const borderColor = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.8)'],
  });

  return (
    <Animated.View style={[styles.safetyFirstCard, { borderColor, borderWidth: 2 }]}>
      <View style={[styles.safetyFirstIcon, { backgroundColor: THEME.warning }]}>
        <Text style={styles.safetyFirstIconText}>!</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text selectable style={styles.safetyFirstTitle}>{t('safetyFirstLabel')}</Text>
        <Text selectable style={styles.safetyFirstText}>{text}</Text>
      </View>
    </Animated.View>
  );
}

/** "Bu tamiri kendin yapabilir misin?" karti. Her AI cevabinin altinda birer tane olur. (DEĞİŞMEDİ) */
function CanFixCard({
  language,
  original,
  prof,
}: {
  language: string;
  original: AnalyzeInput;
  prof?: ProfessionBlock | null;
}) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [locating, setLocating] = useState(false);
  const [icons, setIcons] = useState<string[]>([]);

  const category = original.category;
  const sub = findSubcategory(category, original.subcategory);
  const subLabel = sub ? t(sub.key) : '';
  const targeted = (base: string) => [base, subLabel, serviceWord(language)].filter(Boolean).join(' ');

  const supplyList =
    prof?.materials?.length && prof.materials.length > 0
      ? prof.materials
      : [suppliesForCategory(category, language)];

  useEffect(() => {
    if (choice !== true) {
      setIcons([]);
      return;
    }
    let alive = true;
    resolveMaterialIcons(supplyList, language).then((list) => {
      if (alive) setIcons(list);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [choice]);

  /** AI'nin tespit ettigi uzmanlik varsa onu, yoksa kategoriden turetilen sorguyu kullanir. */
  const proQuery = prof?.profession
    ? [prof.profession, ...(prof.services ?? [])].filter(Boolean).join(' ')
    : targeted(professionForCategory(category, language));
  const supplyQuery = prof?.materials?.length
    ? prof.materials.join(' ')
    : targeted(suppliesForCategory(category, language));

  const openLocal = async (query: string) => {
    if (locating) return;
    setLocating(true);
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.granted) {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        });
        const geo = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const place = [geo[0]?.city, geo[0]?.region, geo[0]?.country]
          .filter(Boolean)
          .join(', ');
        Alert.alert(t('locTitle'), t('locVerify', { place: place || '…' }), [
          {
            text: t('locCorrect'),
            onPress: () => openMaps(query, pos.coords.latitude, pos.coords.longitude, place),
          },
          { text: t('locWrong'), onPress: () => openMaps(query) },
          { text: t('cancel'), style: 'cancel' },
        ]);
        return;
      }
      Alert.alert(t('locTitle'), t('locAsk'), [
        {
          text: t('locShare'),
          onPress: async () => {
            const again = await Location.requestForegroundPermissionsAsync();
            if (again.granted) {
              const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
                mayShowUserSettingsDialog: true,
              });
              const geo = await Location.reverseGeocodeAsync({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              const place = [geo[0]?.city, geo[0]?.region, geo[0]?.country].filter(Boolean).join(', ');
              openMaps(query, pos.coords.latitude, pos.coords.longitude, place);
            } else {
              openMaps(query);
            }
          },
        },
        { text: t('locGeneral'), onPress: () => openMaps(query) },
        { text: t('cancel'), style: 'cancel' },
      ]);
    } catch {
      Alert.alert(t('locTitle'), t('locAsk'), [
        { text: t('locGeneral'), onPress: () => openMaps(query) },
        { text: t('cancel'), style: 'cancel' },
      ]);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.cardWrap}>
      {choice === null && (
        <View style={styles.questionBox}>
          <Text style={styles.questionTitle}>{t('selfRepair')}</Text>
          <Text style={styles.questionHint}>{t('selfRepairHint')}</Text>
          <View style={styles.yesNoWrap}>
            <View style={styles.yesNoRow}>
              <Pressable style={[styles.yesNoBtn, styles.yesBtn]} onPress={() => setChoice(true)}>
                <Text style={styles.yesNoText}>{t('yesIcan')}</Text>
              </Pressable>
              <Pressable style={[styles.yesNoBtn, styles.noBtn]} onPress={() => setChoice(false)}>
                <Text style={styles.yesNoText}>{t('noIcant')}</Text>
              </Pressable>
            </View>
            <View style={styles.yesNoHintRow}>
              <Text style={styles.yesNoHint}>({t('yesIcanHint')})</Text>
              <Text style={styles.yesNoHint}>({t('noIcantHint')})</Text>
            </View>
          </View>
        </View>
      )}

      <Modal
        transparent
        visible={choice !== null}
        animationType="fade"
        onRequestClose={() => setChoice(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>{choice ? '🛠️' : '👷'}</Text>
            </View>
            <Text style={styles.diyModalTitle}>{choice ? t('diyPath') : t('proPath')}</Text>

            {choice ? (
              <>
                <Text style={styles.diyModalLabel}>{t('materialsListTitle')}</Text>
                <View style={styles.materialsBox}>
                  {supplyList.map((item, idx) => (
                    <View key={idx} style={styles.materialRow}>
                      <View style={styles.materialIconBadge}>
                        <Text style={styles.materialIcon}>{icons[idx] ?? '🧰'}</Text>
                      </View>
                      <Text style={styles.materialText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.diyModalAsk}>{t('diyFindAsk')}</Text>
              </>
            ) : (
              <Text style={styles.diyModalAsk}>{t('proFindAsk')}</Text>
            )}

            <Pressable
              style={styles.mapBtn}
              onPress={() => openLocal(choice ? supplyQuery : proQuery)}
              disabled={locating}
            >
              <Text style={styles.mapBtnText}>
                {locating ? t('analyzing') : choice ? t('canRepair') : t('findPro')}
              </Text>
            </Pressable>
            <Pressable style={styles.diyModalBackBtn} onPress={() => setChoice(null)}>
              <Text style={styles.diyModalBackBtnText}>{t('back')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** "Yardımcı olabildim mi? Değilse AI ile soru-cevap yapabilirsiniz." — en altta,
 *  yerinde yavaşça sallanan (wobble) dinamik buton. Tıklanınca sohbet girişine
 *  odaklanır ve kullanıcı AI ile soru-cevap sohbetine devam eder. */
function QnaButton({ label, onPress }: { label: string; onPress: () => void }) {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wobble, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wobble]);

  const rotate = wobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Pressable style={styles.qnaBtn} onPress={onPress}>
        <Text style={styles.qnaBtnIcon}>🤖</Text>
        <Text style={styles.qnaBtnText}>{label}</Text>
        <Text style={styles.qnaBtnArrow}>💬</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ResultScreen({ analysis, language, modelId, original, onBack, onAnalysisUpdated }: Props) {
  const { t } = useTranslation();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState('');
  const [modalText, setModalText] = useState('');
  const [kbHeight, setKbHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ next: ChatTurn[] } | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const didInit = useRef(false);
  const scrolledTurns = useRef(0);
  const streamTextRef = useRef<string | null>(null);
  const dismissQ = useRef<string | null>(null);

  useEffect(() => {
    if (streamText !== null) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    }
  }, [streamText]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKbHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!didInit.current) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      didInit.current = true;
      return;
    }
    if (loading) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [turns.length, loading]);

  const runStream = async (next: ChatTurn[]) => {
    setLoading(true);
    setStreamText('');
    setRetry(null);
    try {
      const reply = await continueChatStream(
        { language, modelId, original, analysis, turns: next },
        (full) => {
          streamTextRef.current = full;
          setStreamText(full);
        }
      );
      streamTextRef.current = null;
      setTurns([...next, { role: 'assistant', text: reply }]);
      setStreamText(null);
      onAnalysisUpdated?.(reply);
    } catch (e) {
      const partial = streamTextRef.current;
      streamTextRef.current = null;
      setStreamText(null);
      if (partial) {
        setRetry({ next });
        return;
      }
      const msg = e instanceof Error ? e.message : '';
      let errText = t('errorCheckNetwork');
      if (isAuthError(e) || msg === 'NO_API_KEY') errText = t('errorNoApiKey');
      else if (msg === 'QUOTA') errText = t('errorQuota');
      setTurns([...next, { role: 'assistant', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  const send = async (override?: string) => {
    const text = (override ?? message).trim();
    if (!text || loading) return;
    setMessage('');
    setModalText('');
    dismissQ.current = null;
    const next: ChatTurn[] = [...turns, { role: 'user', text }];
    setTurns(next);
    await runStream(next);
  };

  const retrySend = () => {
    if (!retry || loading) return;
    const note = '\n\n[DEVAM: önceki cevap kesildi, buradan devam et]';
    const next: ChatTurn[] = retry.next.map((turn, i) =>
      i === retry.next.length - 1 && turn.role === 'user'
        ? { ...turn, text: turn.text + note }
        : turn
    );
    runStream(next);
  };

  /** En alttaki "AI soru-cevap" butonu: sohbete odaklanır ve klavyeyi açar. */
  const startQna = () => {
    if (loading) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const share = () => {
    Share.share({ message: buildShareText(analysis, original, t) }).catch(() => {});
  };

  /** Bir AI metnini soru blogu + bolum kartlari halinde cizer. Sorular modal olarak gelir. */
  const renderContent = (raw: string) => {
    const { clean: qClean } = parseQuestionBlock(raw);
    const { clean } = parseProfessionBlock(qClean);
    const sections = parseSections(clean);
    const safetyFirst = firstSafetyLine(sections);
    return (
      <>
        {safetyFirst && <SafetyFirstCallout text={safetyFirst} />}
        {sections.map((s, i) => (
          <SectionCard key={i} section={s} index={i} />
        ))}
      </>
    );
  };

  const initialParsed = parseQuestionBlock(analysis);
  const initialQuestionVisible = initialParsed.question !== null;
  const files = original.files ?? [];
  const saved = estimateSavings(analysis);

  const lastAssistantText = turns.length
    ? [...turns].reverse().find((t) => t.role === 'assistant')?.text ?? analysis
    : analysis;
  const lastParsed = parseQuestionBlock(lastAssistantText);
  const pendingQ = lastParsed.question ?? null;
  const lastIsAssistant = turns.length === 0 || turns[turns.length - 1].role === 'assistant';
  const showModal = !loading && pendingQ !== null && lastIsAssistant && dismissQ.current !== pendingQ;
  const showCanFix = !loading && pendingQ === null;
  const prof = parseProfessionBlock(lastAssistantText);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t('back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('resultTitle')}</Text>
      </View>

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
        >
          {/* Yeşil, tam-genişlik "analiz tamamlandı" bandı — rakip ekranındaki koyu yeşil dolgu */}
          <View style={styles.doneBanner}>
            <View style={styles.doneIconBadge}>
              <Text style={styles.doneIcon}>{initialQuestionVisible ? '❓' : '✓'}</Text>
            </View>
            <View style={styles.doneTextWrap}>
              <Text style={styles.doneTitle}>{t('analysisCompleteTitle')}</Text>
              <Text style={styles.doneSub}>
                {initialQuestionVisible ? t('answerQuestions') : t('analysisCompleteSub')}
              </Text>
            </View>
          </View>

          {/* Tasarruf tahmini + paylaşım */}
          {saved !== null && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsText}>💰 {t('saveEstimate')}: ~{Math.round(saved)} €</Text>
            </View>
          )}
          <Pressable style={styles.shareBtn} onPress={share}>
            <Text style={styles.shareBtnText}>📤 {t('shareResult')}</Text>
          </Pressable>

          {/* Fotoğrafınız */}
          {files.length > 0 && (
            <>
              <Text style={styles.photoHeading}>📷 {t('yourPhoto')}</Text>
              <View style={styles.photoCard}>
                <View style={styles.photoGrid}>
                  {files.map((f, i) => (
                    <View key={i} style={[styles.photoWrap, files.length === 1 && styles.photoWrapSingle]}>
                      {f.type?.startsWith('image') ? (
                        <Image source={{ uri: f.uri }} style={styles.photoImg} />
                      ) : (
                        <View style={[styles.photoImg, styles.photoVideo]}>
                          <Text style={styles.photoVideoIcon}>▶</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Sorun Özeti — mor banner, rakip ekranındaki ikon rozetli iki satırlı başlık */}
          {(original.description?.trim() || turns.some((u) => u.role === 'user')) && (
            <View style={styles.summaryBox}>
              <View style={styles.summaryHead}>
                <View style={styles.summaryIconBadge}>
                  <Text style={styles.summaryIconText}>🤖</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryMainTitle}>{t('analysisCompleteTitle')}</Text>
                  <Text style={styles.summarySubTitle}>{t('problemSummary')}</Text>
                </View>
              </View>
              {original.description?.trim() ? (
                <Text selectable style={styles.summaryText}>{original.description.trim()}</Text>
              ) : null}
              {turns
                .filter((u) => u.role === 'user')
                .map((u, i) => (
                  <View key={i} style={styles.summaryAnswerRow}>
                    <Text selectable style={styles.summaryAnswerBullet}>✓</Text>
                    <Text selectable style={styles.summaryAnswer}>{u.text}</Text>
                  </View>
                ))}
            </View>
          )}

          {renderContent(analysis)}

          {turns.map((turn, i) =>
            turn.role === 'user' ? (
              <View key={i} style={[styles.messageBubble, styles.userBubble]}>
                <Text selectable style={styles.userText}>{turn.text}</Text>
              </View>
            ) : (
              <View
                key={i}
                onLayout={(e) => {
                  if (i === turns.length - 1 && !loading && turns.length > scrolledTurns.current) {
                    scrolledTurns.current = turns.length;
                    const y = Math.max(0, e.nativeEvent.layout.y - 8);
                    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: true }));
                  }
                }}
              >
                {renderContent(turn.text)}
              </View>
            )
          )}

          {showCanFix && <CanFixCard language={language} original={original} prof={prof} />}

          {streamText !== null && streamText.trim() !== '' && (
            <FadeInView>
              <View style={styles.messageBubble}>
                <RichText content={streamText} color={THEME.text} />
                <Text style={styles.cursor}>▋</Text>
              </View>
            </FadeInView>
          )}

          {loading && (streamText === null || streamText.trim() === '') && (
            <ThinkingLoader text={t('analyzing')} />
          )}

          {retry && !loading && (
            <View style={styles.retryBox}>
              <Text style={styles.retryText}>⚠️ {t('retryDesc')}</Text>
              <Pressable style={styles.retryBtn} onPress={retrySend}>
                <Text style={styles.retryBtnText}>↻ {t('retry')}</Text>
              </Pressable>
            </View>
          )}

          {/* En altta: "yardımcı olabildim mi?" titreyen AI soru-cevap butonu */}
          <QnaButton label={t('qnaCta')} onPress={startQna} />
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={t('describePlaceholder')}
            placeholderTextColor={THEME.textMuted}
            editable={!loading}
          />
          <Pressable style={[styles.sendBtn, loading && styles.disabled]} onPress={() => send()} disabled={loading}>
            <Text style={styles.sendBtnText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* AI ek bilgi istediginde uyari/modal ekrani */}
      <Modal
        transparent
        visible={showModal}
        animationType="fade"
        onRequestClose={() => {
          if (pendingQ) dismissQ.current = pendingQ;
        }}
      >
        <View
          style={[
            styles.modalBackdrop,
            kbHeight > 0 && {
              justifyContent: 'flex-end',
              paddingBottom: kbHeight + 12,
            },
          ]}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>❓</Text>
            </View>
            <View style={styles.modalNotice}>
              <Text selectable style={styles.modalNoticeText}>{t('answerQuestions')}</Text>
            </View>
            <Text selectable style={styles.modalQuestion}>{pendingQ ?? ''}</Text>
            {(lastParsed.options ?? []).map((opt, idx) => (
              <Pressable
                key={idx}
                style={styles.modalOption}
                onPress={() => send(opt)}
                disabled={loading}
              >
                <Text selectable style={styles.modalOptionText}>{opt}</Text>
              </Pressable>
            ))}
            <View style={styles.modalOwnInputWrap}>
              <Text style={styles.modalOwnLabel}>{t('orTypeOwn')}</Text>
              <View style={styles.modalInputRow}>
                <TextInput
                  style={styles.modalInput}
                  value={modalText}
                  onChangeText={setModalText}
                  placeholder={t('describePlaceholder')}
                  placeholderTextColor={THEME.textMuted}
                  multiline
                  editable={!loading}
                  onSubmitEditing={() => {
                    const text = modalText.trim();
                    if (text) send(text);
                  }}
                />
                <Pressable
                  style={[styles.modalSendBtn, (!modalText.trim() || loading) && styles.modalSendBtnDisabled]}
                  onPress={() => {
                    const text = modalText.trim();
                    if (text && !loading) send(text);
                  }}
                  disabled={loading || !modalText.trim()}
                >
                  <Text style={styles.modalSendBtnText}>➤</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: { paddingRight: 12 },
  backBtnText: { color: THEME.neonBlue, fontWeight: '700', fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: THEME.text, flex: 1 },
  container: { padding: SPACING, paddingBottom: 40 },

  // "Analiz tamamlandı" bandı — siber yeşil dolgu
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  doneIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIcon: { color: '#fff', fontSize: 18, fontWeight: '900' },
  doneTextWrap: { flex: 1 },
  doneTitle: { color: THEME.success, fontSize: 16, fontWeight: '800' },
  doneSub: { color: THEME.textMuted, fontSize: 12, marginTop: 3, lineHeight: 17 },

  // Tasarruf bandı + paylaş
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  savingsText: { color: THEME.success, fontSize: 15, fontWeight: '900' },
  shareBtn: {
    backgroundColor: THEME.cardAlt,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  shareBtnText: { color: THEME.neonBlue, fontSize: 14, fontWeight: '800' },

  // Retry bandı
  retryBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: THEME.warning,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryText: { color: THEME.warning, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  retryBtn: {
    marginTop: 10,
    backgroundColor: THEME.warning,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryBtnText: { color: '#1A1A2E', fontWeight: '900', fontSize: 13 },

  // En alttaki "AI soru-cevap" titreyen buton
  qnaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: THEME.primary,
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  qnaBtnIcon: { fontSize: 20 },
  qnaBtnArrow: { fontSize: 16 },
  qnaBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
    flexShrink: 1,
  },

  // Fotoğrafınız
  photoHeading: { fontSize: 17, fontWeight: '800', color: THEME.text, marginBottom: 10 },
  photoCard: {
    backgroundColor: THEME.card,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  photoWrap: { width: 100, height: 100, borderRadius: 14, overflow: 'hidden' },
  photoWrapSingle: { width: '92%', height: 260 },
  photoImg: { width: '100%', height: '100%' },
  photoVideo: { backgroundColor: THEME.cardAlt, alignItems: 'center', justifyContent: 'center' },
  photoVideoIcon: { color: THEME.text, fontSize: 22 },

  // Sorun Özeti (mor banner, ikon rozetli)
  summaryBox: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.4)',
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  summaryIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: { fontSize: 18 },
  summaryMainTitle: { color: THEME.primaryLight, fontSize: 16, fontWeight: '800' },
  summarySubTitle: { color: THEME.textMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  summaryText: { color: THEME.text, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  summaryAnswerRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  summaryAnswerBullet: { color: THEME.neonPurple, fontSize: 13, fontWeight: '900' },
  summaryAnswer: { color: THEME.text, fontSize: 14, lineHeight: 20, flex: 1 },

  messageBubble: {
    backgroundColor: THEME.card,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    marginBottom: 10,
  },

  // Genel bölüm kartı — Glassmorphism etkisi
  sectionCard: {
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: THEME.border,
  },
  plainCard: { backgroundColor: THEME.card },
  sectionHeading: { color: THEME.neonBlue, fontSize: 17, fontWeight: '800', marginBottom: 12 },

  // Güvenlik "önce" uyarı kartı — pulse animasyonlu
  safetyFirstCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 16,
  },
  safetyFirstIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyFirstIconText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  safetyFirstTitle: { color: THEME.warning, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  safetyFirstText: { color: THEME.text, fontSize: 14, lineHeight: 20 },

  riskPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
  },
  riskPillText: { fontWeight: '900', fontSize: 13 },

  // Doğruluk (confidence) kartı
  accuracyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  accuracyPillCol: { width: 64 },
  accuracyTextCol: { flex: 1 },
  confidencePill: {
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  confidencePillText: { fontSize: 13, fontWeight: '800' },

  // Adım adım çözüm
  stepsSummaryBox: {
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  stepsSummaryLabel: {
    color: THEME.neonBlue,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  stepsSummary: { color: THEME.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },

  stepBlock: { paddingBottom: 16, marginBottom: 4 },
  stepBlockDivider: { borderBottomWidth: 1, borderBottomColor: THEME.border },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingRight: 6 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepCircleText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, color: THEME.text, fontSize: 16, lineHeight: 22, fontWeight: '800' },
  stepDescWrap: { marginBottom: 8 },

  stepFieldRow: { marginBottom: 10 },
  stepFieldLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  stepFieldValue: { color: THEME.text, fontSize: 15, lineHeight: 21 },

  toolChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  toolChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  toolChipText: { fontSize: 13, fontWeight: '700' },

  stepMetaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaPill: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  metaPillText: { fontSize: 12, fontWeight: '800' },

  inlineBold: { fontWeight: '900', color: THEME.neonBlue },

  // Maliyet kartı
  costCard: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16 },
  costTitle: { color: THEME.success, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  costRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  costRowLabel: { color: THEME.textMuted, fontSize: 15, fontWeight: '600', flex: 1.2 },
  costRowValue: { color: THEME.text, fontSize: 15, fontWeight: '800', flex: 1, textAlign: 'right' },
  costRowSave: { marginTop: 4, paddingTop: 10, paddingBottom: 6 },
  costSaveLabel: { color: THEME.success, fontSize: 16, fontWeight: '800', flex: 1 },
  costSaveValue: { color: THEME.success, fontSize: 18, fontWeight: '900', flex: 1, textAlign: 'right' },
  costEco: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  costEcoIcon: { fontSize: 15 },
  costEcoText: { color: THEME.textMuted, fontSize: 13, lineHeight: 18, flex: 1 },
  costNote: { color: THEME.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' },

  userBubble: { backgroundColor: 'rgba(79, 70, 229, 0.15)', borderColor: THEME.primary },
  userText: { color: THEME.text, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  questionBox: {
    marginTop: 6,
    backgroundColor: THEME.card,
    borderRadius: RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cardWrap: { marginBottom: 8 },
  questionTitle: { color: THEME.text, fontSize: 16, fontWeight: '800' },
  questionHint: { color: THEME.textMuted, fontSize: 13, marginTop: 4, lineHeight: 19 },
  yesNoWrap: { marginTop: 14 },
  yesNoRow: { flexDirection: 'row', gap: 10 },
  yesNoBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS, alignItems: 'center' },
  yesBtn: { backgroundColor: THEME.success },
  noBtn: { backgroundColor: THEME.danger },
  yesNoText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  yesNoHintRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  yesNoHint: { flex: 1, textAlign: 'center', color: THEME.textMuted, fontSize: 11, fontStyle: 'italic' },
  mapBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    borderRadius: RADIUS,
    padding: 16,
    alignItems: 'center',
  },
  mapBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    backgroundColor: THEME.card,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.cardAlt,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    minHeight: 44,
    color: THEME.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  optionBox: {
    backgroundColor: THEME.card,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 10,
  },
  questionNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: THEME.warning,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  questionNoticeText: { color: THEME.warning, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  optionQuestion: { color: THEME.text, fontSize: 15, fontWeight: '800', marginBottom: 10, lineHeight: 21 },
  optionBtn: {
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionBtnText: { color: THEME.primaryLight, fontWeight: '700', fontSize: 14, lineHeight: 20 },
  optionFreeHint: { color: THEME.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
  cursor: { color: THEME.neonBlue, fontWeight: '700', marginTop: 4 },

  // Soru modali (uyari ekrani)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'stretch',
    borderWidth: 1.5,
    borderColor: THEME.border,
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalIcon: { fontSize: 24 },
  modalNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: THEME.warning,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  modalNoticeText: { color: THEME.warning, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  modalQuestion: { color: THEME.text, fontSize: 16, fontWeight: '800', marginBottom: 16, lineHeight: 22 },
  modalOption: {
    backgroundColor: THEME.cardAlt,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modalOptionText: { color: THEME.primaryLight, fontWeight: '700', fontSize: 14, lineHeight: 20 },

  // Modal içinde serbest metin girişi (örnek cevapların altında)
  modalOwnInputWrap: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    paddingTop: 16,
  },
  modalOwnLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  modalInput: {
    flex: 1,
    backgroundColor: THEME.cardAlt,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
    color: THEME.text,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  modalSendBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSendBtnDisabled: { opacity: 0.5 },
  modalSendBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  // CanFix seçim modali
  diyModalTitle: { color: THEME.text, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16, lineHeight: 24 },
  diyModalLabel: { color: THEME.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  materialsBox: {
    backgroundColor: THEME.cardAlt,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    maxHeight: 190,
  },
  materialRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  materialIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  materialIcon: { fontSize: 18 },
  materialText: { color: THEME.text, fontSize: 14, lineHeight: 22, flex: 1 },
  diyModalAsk: { color: THEME.textMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 16 },
  diyModalBackBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: RADIUS,
    borderWidth: 1.5,
    borderColor: THEME.border,
    alignItems: 'center',
  },
  diyModalBackBtnText: { color: THEME.textMuted, fontWeight: '700', fontSize: 14 },
});
