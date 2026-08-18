import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../theme';
import { hasVisibleContent, stripInvisible } from '../utils/invisible';

interface Props {
  content: string;
  color?: string;
}

/**
 * Markdown-benzeri meta-mini bir renderer:
 * - "## " / "### " -> başlıklar (belirgin, renkli)
 * - "RISK... LOW/MEDIUM/HIGH" veya "RISIKO: HOCH" -> renkli risk rozeti
 * - "- " / "• " -> madde işareti
 * - "1. " -> numaralı liste
 * - "**kalın**" -> kalın (iç satırda)
 * - boş satır -> paragraf boşluğu
 * - yalnızca görünmez karakterlerden oluşan satır -> HİÇ çizilmez (tam satır
 *   yüksekliğinde boş paragraf oluşturup kartlarda 100-600px boşluk yaratır)
 */

// Sıfır genişlikte / görünmez karakterlerle ilgili detaylar utils/invisible.ts içindedir.

export default function RichText({ content, color }: Props) {
  const lines = content.split('\n');

  const blocks: React.ReactNode[] = [];
  let pendingBodyLines: string[] = [];

  const flushBody = (key: number) => {
    if (pendingBodyLines.length > 0) {
      blocks.push(
        <Text key={`body-${key}`} selectable style={[styles.body, color && { color }]}>
          {renderInline(pendingBodyLines.join('\n'), color)}
        </Text>
      );
      pendingBodyLines = [];
    }
  };

  lines.forEach((line, idx) => {
    const stripped = stripInvisible(line);
    const trimmed = stripped.trim();

    if (!hasVisibleContent(line)) {
      flushBody(idx);
      return;
    }

    const risk = matchRisk(trimmed);
    if (risk) {
      flushBody(idx);
      blocks.push(<RiskBadge key={idx} risk={risk} />);
      return;
    }

    const heading = matchHeading(trimmed);
    if (heading) {
      flushBody(idx);
      blocks.push(<Text key={idx} selectable style={styles.heading}>{heading}</Text>);
      return;
    }

    const bullet = trimmed.match(/^[-•*]\s+(.*)$/);
    if (bullet) {
      flushBody(idx);
      blocks.push(
        <View key={idx} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, color && { color }]}>{color ? '›' : '•'}</Text>
          <Text selectable style={[styles.body, color && { color }]}>{renderInline(bullet[1], color)}</Text>
        </View>
      );
      return;
    }

    const num = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (num) {
      flushBody(idx);
      blocks.push(
        <View key={idx} style={styles.numRow}>
          <Text style={[styles.numDot, color && { color }]}>{trimmed.match(/^\d+/)?.[0]}.</Text>
          <Text selectable style={[styles.body, color && { color }]}>{renderInline(num[1], color)}</Text>
        </View>
      );
      return;
    }

    // Normal paragraf.
    pendingBodyLines.push(trimmed);
  });

  flushBody(lines.length);

  return <View>{blocks}</View>;
}

function matchHeading(trimmed: string): string | null {
  const m = trimmed.match(/^(#{2,3})\s+(.*)$/);
  return m ? m[2] : null;
}

function matchRisk(trimmed: string): string | null {
  const m = trimmed.match(/risk(?:o|:|-|iço|ique|e)?\s*[:\-]?\s*(highhoch|mediummittel|low|niedrig|alto|élevé|medio|middle|basso)/i);
  if (!m) {
    const wantCap = trimmed.match(/\b(HIGH|MEDIUM|LOW)\b/i);
    if (wantCap) return wantCap[1].toUpperCase();
    return null;
  }
  const word = m[1].toLowerCase();
  if (/high|hoch|alt|élev/.test(word)) return 'HIGH';
  if (/medium|mittel|medio|middle/.test(word)) return 'MEDIUM';
  return 'LOW';
}

function renderInline(text: string, color?: string): React.ReactNode {
  // Regex to match **bold** or *italic* or _italic_
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g).filter((p) => p.length > 0);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <Text key={i} selectable style={[styles.bold, color && { color }]}>
          {bold[1]}
        </Text>
      );
    }
    const italic = part.match(/^[*_]([^*_]+)[*_]$/);
    if (italic) {
      return (
        <Text key={i} selectable style={[styles.italic, color && { color }]}>
          {italic[1]}
        </Text>
      );
    }
    return (
      <Text key={i} selectable style={color && { color }}>
        {part}
      </Text>
    );
  });
}

function RiskBadge({ risk }: { risk: string }) {
  const color = risk === 'HIGH' ? COLORS.danger : risk === 'MEDIUM' ? COLORS.warning : COLORS.success;
  const labelMap: Record<string, string> = { HIGH: '⛔ Hoch', MEDIUM: '⚠ Mittel', LOW: '✓ Niedrig' };
  return (
    <View style={[styles.riskBadge, { backgroundColor: `${color}1A`, borderColor: color }]}>
      <Text style={[styles.riskText, { color }]}>{labelMap[risk]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  body: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: '800', color: COLORS.text },
  italic: { fontStyle: 'italic' },
  bulletRow: { flexDirection: 'row', paddingRight: 6 },
  bulletDot: { color: COLORS.accent, fontWeight: '800', marginRight: 8, fontSize: 15 },
  numRow: { flexDirection: 'row', paddingRight: 6 },
  numDot: { color: COLORS.accent, fontWeight: '800', marginRight: 8, fontSize: 15 },
  riskBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    marginBottom: 6,
  },
  riskText: { fontWeight: '800', fontSize: 14 },
});