import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../theme';

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
 */
export default function RichText({ content, color }: Props) {
  const lines = content.split('\n');

  const blocks: React.ReactNode[] = [];
  let listMode: 'none' | 'bullet' | 'number' = 'none';

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      listMode = 'none';
      blocks.push(<View key={idx} style={styles.spacer} />);
      return;
    }

    const risk = matchRisk(trimmed);
    if (risk) {
      listMode = 'none';
      blocks.push(<RiskBadge key={idx} risk={risk} />);
      return;
    }

    const heading = matchHeading(trimmed);
    if (heading) {
      listMode = 'none';
      blocks.push(<Text key={idx} style={styles.heading}>{heading}</Text>);
      return;
    }

    const bullet = trimmed.match(/^[-•*]\s+(.*)$/);
    if (bullet) {
      listMode = 'bullet';
      blocks.push(
        <View key={idx} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, color && { color }]}>{color ? '›' : '•'}</Text>
          <Text style={[styles.body, color && { color }]}>{renderInline(bullet[1], color)}</Text>
        </View>
      );
      return;
    }

    const num = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (num) {
      listMode = 'number';
      blocks.push(
        <View key={idx} style={styles.numRow}>
          <Text style={[styles.numDot, color && { color }]}>{trimmed.match(/^\d+/)?.[0]}.</Text>
          <Text style={[styles.body, color && { color }]}>{renderInline(num[1], color)}</Text>
        </View>
      );
      return;
    }

    // Normal paragraf.
    listMode = 'none';
    blocks.push(
      <Text key={idx} style={[styles.body, color && { color }]}>
        {renderInline(trimmed, color)}
      </Text>
    );
  });

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
  // Aynı bölüm içinde **kalın** bölmeleri işle.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <Text key={i} style={[styles.bold, color && { color }]}>
          {bold[1]}
        </Text>
      );
    }
    return <Text key={i} style={color && { color }}>{part}</Text>;
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
  spacer: { height: 10 },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 6,
    marginBottom: 4,
  },
  body: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: '800', color: COLORS.text },
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