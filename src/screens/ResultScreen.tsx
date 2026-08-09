import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
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

import { ChatTurn, continueChatStream, isAuthError, AnalyzeInput } from '../api/client';
import RichText from '../components/RichText';
import ThinkingLoader from '../components/ThinkingLoader';
import { findSubcategory } from '../data/categories';
import { estimateSavings } from '../utils/savings';
import { RADIUS, SPACING } from '../theme';

// Açık tema — rakip "RepairBuddy" sonuç ekranı düzenine göre (piksel örneklemesiyle
// çıkarılan gerçek renkler). Sabit isim CREAM olarak kalıyor ama değerler artık
// krem değil, ekran görüntülerindeki beyaz/nötr-gri paletle birebir.
const CREAM = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  subtle: '#F8F9FB',
  photoBg: '#F3F4F6',
  border: '#ECEDF1',
  text: '#14141F',
  textMuted: '#6E7180',
  primary: '#6366F1',
  success: '#5EC269',
  successDark: '#3D7E44',
  warning: '#E5B04B',
  warnBg: '#FEFDEB',
  warnIcon: '#F3CE49',
  danger: '#E5484D',
  purple: '#4E46DC',
  purpleBadge: '#6366E9',
  costBg: '#EAF5EA',
  costTitle: '#2F5D28',
  costLabel: '#457B3B',
  toolChipBg: '#EFF6FE',
  toolChipText: '#3355B0',
  pillBg: '#EAFBF0',
  pillText: '#2E7D46',
  bulletDot: '#567FDB',
};

interface Props {
  analysis: string;
  language: string;
  modelId: string;
  original: AnalyzeInput;
  onBack: () => void;
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
  if (language === 'it') return 'ferramenta';
  if (language === 'tr') return 'yapı market hırdavat';
  return 'hardware store building materials';
}

/** Kategori + alt kategoriye gore meslek grubu (harita aramasi icin, dile gore). */
function professionForCategory(category: string | undefined, language: string): string {
  const byLang: Record<string, Record<string, string>> = {
    plumbing: { de: 'Klempner Sanitär', fr: 'plombier', it: 'idraulico', tr: 'su tesisatçısı', en: 'plumber' },
    appliances: { de: 'Haushaltsgeräte Reparatur', fr: 'réparation électroménager', it: 'riparazione elettrodomestici', tr: 'beyaz eşya tamircisi', en: 'appliance repair' },
    electronics: { de: 'Elektronik Reparatur', fr: 'réparation électronique', it: 'riparazione elettronica', tr: 'elektronik tamircisi', en: 'electronics repair' },
    car: { de: 'Kfz-Werkstatt', fr: 'garage automobile', it: 'officina auto', tr: 'oto tamirci', en: 'auto repair shop' },
    furniture: { de: 'Möbelreparatur', fr: 'réparation de meubles', it: 'riparazione mobili', tr: 'mobilya tamircisi', en: 'furniture repair' },
  };
  const map = byLang[category ?? ''] ?? {};
  return map[language] ?? (language === 'tr' ? 'tamir ustası' : language === 'de' ? 'Handwerker' : language === 'fr' ? 'artisan' : language === 'it' ? 'artigiano' : 'repair service');
}

/** Kategoriye gore malzeme/tedarikci aramasi (harita, dile gore). */
function suppliesForCategory(category: string | undefined, language: string): string {
  const byLang: Record<string, Record<string, string>> = {
    plumbing: { de: 'Sanitärbedarf', fr: 'magasin plomberie', it: 'negozio idraulica', tr: 'sıhhi tesisat malzemesi', en: 'plumbing supplies' },
    appliances: { de: 'Ersatzteile Haushalt', fr: 'pièces détachées électroménager', it: 'ricambi elettrodomestici', tr: 'beyaz eşya yedek parça', en: 'appliance spare parts' },
    electronics: { de: 'Ersatzteile Elektronik', fr: 'pièces détachées électronique', it: 'ricambi elettronica', tr: 'elektronik yedek parça', en: 'electronics spare parts' },
    car: { de: 'Autoteile Zubehör', fr: 'pièces auto', it: 'ricambi auto', tr: 'oto yedek parça', en: 'auto parts' },
    furniture: { de: 'Baumarkt', fr: 'magasin bricolage', it: 'ferramenta', tr: 'yapı market', en: 'hardware store' },
  };
  const map = byLang[category ?? ''] ?? {};
  return map[language] ?? materialKey(language);
}

/** Meslek adina "tamiri" gibi bir hizmet kelimesi ekler (sorguyu isletmelere yonlendirir). */
function serviceWord(language: string): string {
  if (language === 'de') return 'Reparatur';
  if (language === 'fr') return 'réparation';
  if (language === 'it') return 'riparazione';
  if (language === 'tr') return 'tamiri';
  return 'repair';
}

/** Sonucu WhatsApp/sosyal medyada paylasilabilir düz metne cevirir. */
function buildShareText(
  analysis: string,
  original: AnalyzeInput,
  t: (key: string) => string
): string {
  const saved = estimateSavings(analysis);
  const lines: string[] = [`${t('appName')} · ${t('tagline')}`];
  if (original.description?.trim()) {
    lines.push('', `${t('describeProblem')}: ${original.description.trim()}`);
  }
  if (saved !== null) {
    lines.push(`💰 ${t('saveEstimate')}: ~${Math.round(saved)} €`);
  }
  lines.push('', analysis.slice(0, 1400));
  return lines.join('\n');
}

/** AI yanitindaki yapilandirilmis soru + secenek blogunu ayiklar. (DEĞİŞMEDİ) */
function parseQuestionBlock(text: string): {
  clean: string;
  question: string | null;
  options: string[];
} {
  const START = 'QUESTION_BLOCK_START';
  const END = 'QUESTION_BLOCK_END';
  const OPS = 'OPTIONS_START';
  const OPE = 'OPTIONS_END';
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  if (s === -1 || e === -1 || e < s) return { clean: text, question: null, options: [] };
  const block = text.slice(s, e + END.length);
  const clean = (text.slice(0, s) + text.slice(e + END.length)).replace(/\n{3,}/g, '\n\n').trim();
  const oStart = block.indexOf(OPS);
  const oEnd = block.indexOf(OPE);
  const question =
    block
      .slice(START.length, oStart !== -1 ? oStart : block.length)
      .trim()
      .replace(/^OPTIONS_END?\s*/, '')
      .replace(/\s+/g, ' ') || null;
  let options: string[] = [];
  if (oStart !== -1 && oEnd !== -1) {
    options = block
      .slice(oStart + OPS.length, oEnd)
      .split('\n')
      .map((x) => x.replace(/^[-•\d.\s]+/, '').trim())
      .filter(Boolean);
  }
  return { clean, question, options };
}

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
    const line = raw.trim();
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
  for (const line of body.split('\n').map((l) => l.trim()).filter(Boolean)) {
    if (/^[-•*\s]*DIY:/i.test(line)) diy = line.replace(/^[-•*\s]*DIY:\s*/i, '').trim();
    else if (/^[-•*\s]*Pro:/i.test(line)) pro = line.replace(/^[-•*\s]*Pro:\s*/i, '').trim();
    else if (/^[-•*\s]*Save:/i.test(line)) save = line.replace(/^[-•*\s]*Save:\s*/i, '').trim();
    else rest.push(line);
  }
  return { diy, pro, save, rest };
}

function RiskPill({ level }: { level: string }) {
  const color = level === 'HIGH' ? CREAM.danger : level === 'MEDIUM' ? CREAM.warning : CREAM.success;
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
    HIGH: { label: t('confidenceHigh'), bg: CREAM.pillBg, color: CREAM.pillText },
    MEDIUM: { label: t('confidenceMedium'), bg: '#FDF3DC', color: '#8A6A00' },
    LOW: { label: t('confidenceLow'), bg: '#FDE2E3', color: CREAM.danger },
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
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      <View style={styles.accuracyRow}>
        {confidence && (
          <View style={styles.accuracyPillCol}>
            <ConfidencePill level={confidence} />
          </View>
        )}
        <View style={styles.accuracyTextCol}>
          <RichText content={body} />
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
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      {risk && <RiskPill level={risk} />}
      <RichText content={body} />
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
        <Text key={i} style={styles.inlineBold}>
          {bold[1]}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

/** YENİ: Bir adımın "Etiket: değer" satırı (Neden / Beklenen Sonuç / Beklenen Değilse / Güvenlik). */
function StepField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.stepFieldRow}>
      <Text style={styles.stepFieldLabel}>{label}</Text>
      <Text style={styles.stepFieldValue}>{inlineParts(value)}</Text>
    </View>
  );
}

function StepsCard({ section }: { section: Section }) {
  const { t } = useTranslation();
  const { summary, steps, rest } = parseSteps(section.body);
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      {summary && (
        <View style={styles.stepsSummaryBox}>
          <Text style={styles.stepsSummaryLabel}>Problem</Text>
          <Text style={styles.stepsSummary}>{inlineParts(summary)}</Text>
        </View>
      )}
      {rest.length > 0 && <RichText content={rest.join('\n')} />}
      {steps.map((s, idx) => (
        <View key={s.n} style={[styles.stepBlock, idx < steps.length - 1 && styles.stepBlockDivider]}>
          <View style={styles.stepRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>{s.n}</Text>
            </View>
            <Text style={styles.stepText}>{inlineParts(s.title)}</Text>
          </View>

          {s.desc.length > 0 && (
            <View style={styles.stepDescWrap}>
              <RichText content={s.desc.join('\n')} />
            </View>
          )}

          <StepField label={t('stepWhyLabel')} value={s.why} />

          {s.tools && s.tools.length > 0 && (
            <View style={styles.stepFieldRow}>
              <Text style={styles.stepFieldLabel}>{t('stepToolsLabel')}</Text>
              <View style={styles.toolChipRow}>
                {s.tools.map((tool, i) => (
                  <View key={i} style={styles.toolChip}>
                    <Text style={styles.toolChipText}>{tool}</Text>
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
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{t('stepDifficultyLabel')}: {s.difficulty}</Text>
                </View>
              )}
              {s.duration && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{t('stepDurationLabel')}: {s.duration}</Text>
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
      <Text style={styles.costTitle}>{section.heading}</Text>
      {rest.length > 0 && <RichText content={rest.join('\n')} />}
      {(diy || pro) && (
        <View>
          {pro && (
            <View style={styles.costRow}>
              <Text style={styles.costRowLabel}>{t('costPro')}</Text>
              <Text style={styles.costRowValue}>{pro}</Text>
            </View>
          )}
          {diy && (
            <View style={styles.costRow}>
              <Text style={styles.costRowLabel}>{t('costDiy')}</Text>
              <Text style={styles.costRowValue}>{diy}</Text>
            </View>
          )}
        </View>
      )}
      {save && (
        <View style={[styles.costRow, styles.costRowSave]}>
          <Text style={styles.costSaveLabel}>{t('costSave')}</Text>
          <Text style={styles.costSaveValue}>{save}</Text>
        </View>
      )}
      <View style={styles.costEco}>
        <Text style={styles.costEcoIcon}>🌳</Text>
        <Text style={styles.costEcoText}>{t('costEco')}</Text>
      </View>
      {rest.length === 0 && <Text style={styles.costNote}>{t('costNote')}</Text>}
    </View>
  );
}

/** Genel liste karti: Önleyici İpuçları / Güvenlik Uyarıları / Ne Zaman Profesyonel /
 *  Onarım Sonrası Kontrol — rakip ekranında ikon rozeti yok, sadece kalın başlık + metin. */
function BaseCard({ section }: { section: Section }) {
  return (
    <View style={[styles.sectionCard, styles.plainCard]}>
      {section.heading ? <Text style={styles.sectionHeading}>{section.heading}</Text> : null}
      <RichText content={section.body} />
    </View>
  );
}

function SectionCard({ section }: { section: Section }) {
  if (isAccuracyHeading(section.heading)) return <AccuracyCard section={section} />;
  const kind = sectionKind(section.heading);
  if (kind === 'safety') return <SafetyCard section={section} />;
  if (kind === 'steps') return <StepsCard section={section} />;
  if (kind === 'cost') return <CostCard section={section} />;
  return <BaseCard section={section} />;
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
  return (
    <View style={styles.safetyFirstCard}>
      <View style={styles.safetyFirstIcon}>
        <Text style={styles.safetyFirstIconText}>!</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.safetyFirstTitle}>{t('safetyFirstLabel')}</Text>
        <Text style={styles.safetyFirstText}>{text}</Text>
      </View>
    </View>
  );
}

/** "Bu tamiri kendin yapabilir misin?" karti. Her AI cevabinin altinda birer tane olur. (DEĞİŞMEDİ) */
function CanFixCard({ language, original }: { language: string; original: AnalyzeInput }) {
  const { t } = useTranslation();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [locating, setLocating] = useState(false);

  const category = original.category;
  const sub = findSubcategory(category, original.subcategory);
  const subLabel = sub ? t(sub.key) : '';
  const targeted = (base: string) => [base, subLabel, serviceWord(language)].filter(Boolean).join(' ');

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
          <View style={styles.yesNoRow}>
            <Pressable style={[styles.yesNoBtn, styles.yesBtn]} onPress={() => setChoice(true)}>
              <Text style={styles.yesNoText}>{t('yesIcan')}</Text>
              <Text style={styles.yesNoHint}>({t('yesIcanHint')})</Text>
            </Pressable>
            <Pressable style={[styles.yesNoBtn, styles.noBtn]} onPress={() => setChoice(false)}>
              <Text style={styles.yesNoText}>{t('noIcant')}</Text>
              <Text style={styles.yesNoHint}>({t('noIcantHint')})</Text>
            </Pressable>
          </View>
        </View>
      )}
      {choice === true && (
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>{t('diyPath')}</Text>
          <Pressable
            style={styles.mapBtn}
            onPress={() => openLocal(targeted(suppliesForCategory(category, language)))}
            disabled={locating}
          >
            <Text style={styles.mapBtnText}>{locating ? t('analyzing') : t('canRepair')}</Text>
          </Pressable>
        </View>
      )}
      {choice === false && (
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>{t('proPath')}</Text>
          <Pressable
            style={styles.mapBtn}
            onPress={() => openLocal(targeted(professionForCategory(category, language)))}
            disabled={locating}
          >
            <Text style={styles.mapBtnText}>{locating ? t('analyzing') : t('findPro')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function ResultScreen({ analysis, language, modelId, original, onBack }: Props) {
  const { t } = useTranslation();
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState<string | null>(null);
  const [retry, setRetry] = useState<{ next: ChatTurn[] } | null>(null);
  const [markedDone, setMarkedDone] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
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

  const share = () => {
    Share.share({ message: buildShareText(analysis, original, t) }).catch(() => {});
  };

  /** Bir AI metnini soru blogu + bolum kartlari halinde cizer. Sorular modal olarak gelir. */
  const renderContent = (raw: string) => {
    const { clean } = parseQuestionBlock(raw);
    const sections = parseSections(clean);
    const safetyFirst = firstSafetyLine(sections);
    return (
      <>
        {safetyFirst && <SafetyFirstCallout text={safetyFirst} />}
        {sections.map((s, i) => (
          <SectionCard key={i} section={s} />
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
                <Text style={styles.summaryText}>{original.description.trim()}</Text>
              ) : null}
              {turns
                .filter((u) => u.role === 'user')
                .map((u, i) => (
                  <View key={i} style={styles.summaryAnswerRow}>
                    <Text style={styles.summaryAnswerBullet}>✓</Text>
                    <Text style={styles.summaryAnswer}>{u.text}</Text>
                  </View>
                ))}
            </View>
          )}

          {renderContent(analysis)}

          {turns.map((turn, i) =>
            turn.role === 'user' ? (
              <View key={i} style={[styles.messageBubble, styles.userBubble]}>
                <Text style={styles.userText}>{turn.text}</Text>
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

          {showCanFix && <CanFixCard language={language} original={original} />}

          {markedDone && (
            <View style={styles.doneTag}>
              <Text style={styles.doneTagText}>✓ {t('completed')}</Text>
            </View>
          )}
          <View style={styles.footerBtns}>
            <Pressable style={[styles.footerBtn, styles.footerBtnNew]} onPress={onBack}>
              <Text style={styles.footerBtnIcon}>＋</Text>
              <Text style={styles.footerBtnNewText}>{t('newAnalysis')}</Text>
            </Pressable>
            <Pressable
              style={[styles.footerBtn, styles.footerBtnDone, markedDone && styles.footerBtnDoneInactive]}
              onPress={() => setMarkedDone(true)}
              disabled={markedDone}
            >
              <Text style={styles.footerBtnIcon}>✓</Text>
              <Text style={styles.footerBtnDoneText}>{t('markComplete')}</Text>
            </Pressable>
          </View>

          {streamText !== null && streamText.trim() !== '' && (
            <View style={styles.messageBubble}>
              <RichText content={streamText} />
              <Text style={styles.cursor}>▋</Text>
            </View>
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
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder={t('describePlaceholder')}
            placeholderTextColor={CREAM.textMuted}
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
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>❓</Text>
            </View>
            <View style={styles.modalNotice}>
              <Text style={styles.modalNoticeText}>{t('answerQuestions')}</Text>
            </View>
            <Text style={styles.modalQuestion}>{pendingQ ?? ''}</Text>
            {(lastParsed.options ?? []).map((opt, idx) => (
              <Pressable
                key={idx}
                style={styles.modalOption}
                onPress={() => send(opt)}
                disabled={loading}
              >
                <Text style={styles.modalOptionText}>{opt}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.modalOwn}
              onPress={() => {
                if (pendingQ) dismissQ.current = pendingQ;
              }}
            >
              <Text style={styles.modalOwnText}>{t('orTypeOwn')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: CREAM.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: CREAM.card,
    borderBottomWidth: 1,
    borderBottomColor: CREAM.border,
  },
  backBtn: { paddingRight: 12 },
  backBtnText: { color: CREAM.primary, fontWeight: '700', fontSize: 15 },
  title: { fontSize: 18, fontWeight: '800', color: CREAM.text, flex: 1 },
  container: { padding: SPACING, paddingBottom: 24 },

  // "Analiz tamamlandı" bandı — koyu yeşil dolu banner (rb 123525)
  doneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: CREAM.successDark,
    borderRadius: RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  doneIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CREAM.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIcon: { color: '#fff', fontSize: 18, fontWeight: '900' },
  doneTextWrap: { flex: 1 },
  doneTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  doneSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 3, lineHeight: 17 },

  // Tasarruf bandı + paylaş
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CREAM.costBg,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  savingsText: { color: CREAM.costTitle, fontSize: 15, fontWeight: '900' },
  shareBtn: {
    backgroundColor: CREAM.subtle,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareBtnText: { color: CREAM.primary, fontSize: 14, fontWeight: '800' },

  // Retry bandı
  retryBox: {
    backgroundColor: '#FDF3DC',
    borderWidth: 1,
    borderColor: CREAM.warning,
    borderRadius: RADIUS,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  retryText: { color: CREAM.warning, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  retryBtn: {
    marginTop: 10,
    backgroundColor: CREAM.warning,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryBtnText: { color: '#1A1A2E', fontWeight: '900', fontSize: 13 },

  // Fotoğrafınız
  photoHeading: { fontSize: 17, fontWeight: '800', color: CREAM.text, marginBottom: 10 },
  photoCard: {
    backgroundColor: CREAM.photoBg,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 12,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  photoWrap: { width: 100, height: 100, borderRadius: 14, overflow: 'hidden' },
  photoWrapSingle: { width: '92%', height: 260 },
  photoImg: { width: '100%', height: '100%' },
  photoVideo: { backgroundColor: CREAM.card, alignItems: 'center', justifyContent: 'center' },
  photoVideoIcon: { color: CREAM.text, fontSize: 22 },

  // Sorun Özeti (mor banner, ikon rozetli)
  summaryBox: {
    backgroundColor: CREAM.purple,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  summaryIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CREAM.purpleBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: { fontSize: 18 },
  summaryMainTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  summarySubTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  summaryText: { color: '#fff', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  summaryAnswerRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  summaryAnswerBullet: { color: '#C9C7FF', fontSize: 13, fontWeight: '900' },
  summaryAnswer: { color: '#fff', fontSize: 14, lineHeight: 20, flex: 1 },

  messageBubble: {
    backgroundColor: CREAM.card,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: CREAM.border,
    padding: 16,
    marginBottom: 10,
  },

  // Genel bölüm kartı — rakip ekranında iç kenarlık yok, sadece nötr gri dolgu (rb 123546)
  sectionCard: {
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
  },
  plainCard: { backgroundColor: CREAM.subtle },
  sectionHeading: { color: CREAM.text, fontSize: 17, fontWeight: '800', marginBottom: 8 },

  // Güvenlik "önce" uyarı kartı — sarı, ekranın en üstünde bir kez gösterilir (rb 123525)
  safetyFirstCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: CREAM.warnBg,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
  },
  safetyFirstIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CREAM.warnIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyFirstIconText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  safetyFirstTitle: { color: CREAM.text, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  safetyFirstText: { color: CREAM.text, fontSize: 14, lineHeight: 20 },

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
    backgroundColor: CREAM.card,
    borderWidth: 1,
    borderColor: CREAM.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  stepsSummaryLabel: {
    color: CREAM.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  stepsSummary: { color: CREAM.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },

  stepBlock: { paddingBottom: 16, marginBottom: 4 },
  stepBlockDivider: { borderBottomWidth: 1, borderBottomColor: CREAM.border },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, paddingRight: 6 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CREAM.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  stepCircleText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, color: CREAM.text, fontSize: 16, lineHeight: 22, fontWeight: '800' },
  stepDescWrap: { marginBottom: 8 },

  stepFieldRow: { marginBottom: 10 },
  stepFieldLabel: {
    color: CREAM.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  stepFieldValue: { color: CREAM.text, fontSize: 15, lineHeight: 21 },

  toolChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  toolChip: {
    backgroundColor: CREAM.toolChipBg,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  toolChipText: { color: CREAM.toolChipText, fontSize: 13, fontWeight: '700' },

  stepMetaRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaPill: {
    backgroundColor: CREAM.pillBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  metaPillText: { color: CREAM.pillText, fontSize: 12, fontWeight: '800' },

  inlineBold: { fontWeight: '900', color: CREAM.primary },

  // Alt butonlar: yeni onarım (indigo) + tamamlandı (yeşil) — ikon solda, metin sağda
  footerBtns: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 12 },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: RADIUS,
  },
  footerBtnIcon: { color: '#fff', fontSize: 18, fontWeight: '900' },
  footerBtnNew: { backgroundColor: CREAM.primary },
  footerBtnNewText: { color: '#fff', fontWeight: '800', fontSize: 14, flexShrink: 1 },
  footerBtnDone: { backgroundColor: CREAM.success },
  footerBtnDoneText: { color: '#fff', fontWeight: '800', fontSize: 14, flexShrink: 1 },
  footerBtnDoneInactive: { opacity: 0.55 },
  doneTag: {
    alignSelf: 'center',
    backgroundColor: CREAM.pillBg,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  doneTagText: { color: CREAM.pillText, fontSize: 13, fontWeight: '900' },

  // Maliyet kartı
  costCard: { backgroundColor: CREAM.costBg },
  costTitle: { color: CREAM.costTitle, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  costRowLabel: { color: CREAM.costLabel, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  costRowValue: { color: CREAM.costTitle, fontSize: 15, fontWeight: '800' },
  costRowSave: { marginTop: 6, paddingTop: 12, paddingBottom: 12 },
  costSaveLabel: { color: CREAM.costLabel, fontSize: 15, fontWeight: '700' },
  costSaveValue: { color: CREAM.costTitle, fontSize: 19, fontWeight: '900' },
  costEco: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  costEcoIcon: { fontSize: 15 },
  costEcoText: { color: CREAM.costLabel, fontSize: 13, lineHeight: 18, flex: 1 },
  costNote: { color: CREAM.costLabel, fontSize: 12, marginTop: 8, fontStyle: 'italic' },

  userBubble: { backgroundColor: '#EEEDFC', borderColor: CREAM.primary },
  userText: { color: '#3730A3', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  questionBox: {
    marginTop: 6,
    backgroundColor: CREAM.subtle,
    borderRadius: RADIUS,
    padding: 16,
  },
  cardWrap: { marginBottom: 8 },
  questionTitle: { color: CREAM.text, fontSize: 16, fontWeight: '800' },
  questionHint: { color: CREAM.textMuted, fontSize: 13, marginTop: 4, lineHeight: 19 },
  yesNoRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  yesNoBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS, alignItems: 'center' },
  yesBtn: { backgroundColor: CREAM.success },
  noBtn: { backgroundColor: CREAM.danger },
  yesNoText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  yesNoHint: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  answerBox: {
    marginTop: 6,
    backgroundColor: CREAM.subtle,
    borderRadius: RADIUS,
    padding: 16,
  },
  answerText: { color: CREAM.text, fontSize: 15, lineHeight: 22 },
  mapBtn: {
    marginTop: 16,
    backgroundColor: CREAM.primary,
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
    borderTopColor: CREAM.border,
    backgroundColor: CREAM.card,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: CREAM.subtle,
    borderRadius: RADIUS,
    paddingHorizontal: 14,
    minHeight: 44,
    color: CREAM.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS,
    backgroundColor: CREAM.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  optionBox: {
    backgroundColor: CREAM.subtle,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 10,
  },
  questionNotice: {
    backgroundColor: '#FDF3DC',
    borderWidth: 1,
    borderColor: CREAM.warning,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  questionNoticeText: { color: CREAM.warning, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  optionQuestion: { color: CREAM.text, fontSize: 15, fontWeight: '800', marginBottom: 10, lineHeight: 21 },
  optionBtn: {
    backgroundColor: CREAM.card,
    borderWidth: 1,
    borderColor: CREAM.primary,
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  optionBtnText: { color: CREAM.primary, fontWeight: '700', fontSize: 14, lineHeight: 20 },
  optionFreeHint: { color: CREAM.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
  cursor: { color: CREAM.primary, fontWeight: '700', marginTop: 4 },

  // Soru modali (uyari ekrani)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,20,30,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: CREAM.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'stretch',
  },
  modalIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FBEEC9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalIcon: { fontSize: 24 },
  modalNotice: {
    backgroundColor: '#FDF3DC',
    borderWidth: 1,
    borderColor: CREAM.warning,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  modalNoticeText: { color: CREAM.warning, fontSize: 12, fontWeight: '800', textAlign: 'center' },
  modalQuestion: { color: CREAM.text, fontSize: 15, fontWeight: '800', marginBottom: 14, lineHeight: 22 },
  modalOption: {
    backgroundColor: CREAM.subtle,
    borderWidth: 1,
    borderColor: CREAM.primary,
    borderRadius: RADIUS,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalOptionText: { color: CREAM.primary, fontWeight: '700', fontSize: 14, lineHeight: 20 },
  modalOwn: { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  modalOwnText: { color: CREAM.textMuted, fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
});