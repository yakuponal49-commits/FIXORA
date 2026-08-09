/** AI yanitindaki yapilandirilmis soru + secenek blogunu ayiklar. */
export function parseQuestionBlock(text: string): {
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
