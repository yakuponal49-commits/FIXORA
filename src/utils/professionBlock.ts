/** AI yanitindaki yerel firma arama (PROFESSION_SEARCH_BLOCK) blogunu ayiklar.
 *  AI, nihai cozum yanitinin sonuna bu blogu ekler; uygulama blogu gizler ve
 *  Google Maps aramasinda kullanir. */
export interface ProfessionBlock {
  clean: string;
  profession: string | null;
  services: string[];
  materials: string[];
}

const START = 'PROFESSION_SEARCH_BLOCK_START';
const END = 'PROFESSION_SEARCH_BLOCK_END';

export function parseProfessionBlock(text: string): ProfessionBlock {
  const s = text.indexOf(START);
  const e = text.indexOf(END);
  if (s === -1 || e === -1 || e < s) {
    return { clean: text, profession: null, services: [], materials: [] };
  }
  const block = text.slice(s, e + END.length);
  const clean = (text.slice(0, s) + text.slice(e + END.length)).replace(/\n{3,}/g, '\n\n').trim();
  const grab = (key: string): string | null => {
    const m = block.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : null;
  };
  const profession = grab('PROFESSION');
  const splitList = (v: string | null): string[] =>
    (v ?? '').split(',').map((x) => x.trim().replace(/^[-•*]\s*/, '')).filter(Boolean);
  return {
    clean,
    profession,
    services: splitList(grab('SERVICES')),
    materials: splitList(grab('MATERIALS')),
  };
}
