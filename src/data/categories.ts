// RepairBuddy (rakip) analizinden türetilen kategori + alt kategori yapısı.
// Etiketler i18n anahtarıdır (translations.ts); ikonlar emoji'dir (görsel varlık gerekmez).

export interface Subcategory {
  id: string;
  key: string;
  icon: string;
}

export interface Category {
  id: string;
  key: string;
  icon: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'appliances',
    key: 'catAppliances',
    icon: '🧺',
    subcategories: [
      { id: 'dishwasher', key: 'subDishwasher', icon: '🍽️' },
      { id: 'washing_machine', key: 'subWashingMachine', icon: '🧺' },
      { id: 'refrigerator', key: 'subRefrigerator', icon: '🧊' },
      { id: 'dryer', key: 'subDryer', icon: '🌀' },
      { id: 'microwave_oven', key: 'subMicrowaveOven', icon: '♨️' },
      { id: 'oven_stove', key: 'subOvenStove', icon: '🍳' },
      { id: 'television', key: 'subTelevision', icon: '📺' },
      { id: 'ac_unit', key: 'subAcUnit', icon: '❄️' },
    ],
  },
  {
    id: 'electronics',
    key: 'catElectronics',
    icon: '📱',
    subcategories: [
      { id: 'smartphone', key: 'subSmartphone', icon: '📱' },
      { id: 'smartwatch', key: 'subSmartwatch', icon: '⌚' },
      { id: 'headphones', key: 'subHeadphones', icon: '🎧' },
      { id: 'laptop', key: 'subLaptop', icon: '💻' },
      { id: 'desktop', key: 'subDesktop', icon: '🖥️' },
      { id: 'router', key: 'subRouter', icon: '📶' },
      { id: 'camera', key: 'subCamera', icon: '📷' },
    ],
  },
  {
    id: 'plumbing',
    key: 'catPlumbing',
    icon: '🚰',
    subcategories: [
      { id: 'leaking_pipes', key: 'subLeakingPipes', icon: '💧' },
      { id: 'drain_clogs', key: 'subDrainClogs', icon: '🪠' },
      { id: 'faucet', key: 'subFaucet', icon: '🚿' },
      { id: 'toilet', key: 'subToilet', icon: '🚽' },
      { id: 'sink', key: 'subSink', icon: '🫗' },
      { id: 'shower', key: 'subShower', icon: '🛁' },
      { id: 'water_pressure', key: 'subWaterPressure', icon: '📊' },
      { id: 'pipes', key: 'subPipes', icon: '🔧' },
    ],
  },
  {
    id: 'car',
    key: 'catCar',
    icon: '🚗',
    subcategories: [
      { id: 'engine', key: 'subEngine', icon: '⚙️' },
      { id: 'body', key: 'subBody', icon: '🚙' },
      { id: 'tire', key: 'subTire', icon: '🛞' },
      { id: 'driving', key: 'subDriving', icon: '🛣️' },
      { id: 'interior', key: 'subInterior', icon: '🪑' },
      { id: 'fuel_cooling', key: 'subFuelCooling', icon: '⛽' },
      { id: 'electrical', key: 'subElectrical', icon: '🔌' },
      { id: 'warnings', key: 'subWarnings', icon: '⚠️' },
    ],
  },
  {
    id: 'furniture',
    key: 'catFurniture',
    icon: '🪑',
    subcategories: [
      { id: 'chair', key: 'subChair', icon: '🪑' },
      { id: 'sofa', key: 'subSofa', icon: '🛋️' },
      { id: 'wardrobe', key: 'subWardrobe', icon: '🚪' },
      { id: 'table', key: 'subTable', icon: '🪵' },
      { id: 'bed', key: 'subBed', icon: '🛏️' },
    ],
  },
  {
    id: 'other',
    key: 'catOther',
    icon: '🧰',
    subcategories: [{ id: 'others', key: 'subOthers', icon: '🔩' }],
  },
];

export function findCategory(id: string | undefined): Category | null {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

export function findSubcategory(
  categoryId: string | undefined,
  subId: string | undefined
): Subcategory | null {
  const cat = findCategory(categoryId);
  if (!cat) return null;
  return cat.subcategories.find((s) => s.id === subId) ?? null;
}

export interface CategorySelection {
  category: string;
  subcategory?: string;
}

/**
 * Açıklama metninden kategori + (varsa) alt kategori tahmini yapar.
 * Dil agnostik anahtar kelime eşleştirmesi — haritaya bağlanmaz, sadece formu
 * doldurur (tek dokunuşla "kategori önerisi" uygulanır).
 */
interface Kw {
  id: string;
  words: string[];
}

const CAT_KW: Kw[] = [
  {
    id: 'plumbing',
    words: ['wasser', 'leck', 'rohr', 'hahn', 'waschbecken', 'toilette', 'abfluss', 'verstopf', 'dusche', 'druck', 'spül', 'spuel', 'eau', 'fuite', 'tuyau', 'robinet', 'lavabo', 'wc', 'canalisation', 'bouch', 'douche', 'pression', 'acqua', 'perd', 'tubo', 'rubinetto', 'lavandino', 'scarico', 'intasat', 'doccia', 'pressione', 'water', 'leak', 'pipe', 'faucet', 'tap', 'sink', 'toilet', 'drain', 'clog', 'shower', 'pressure', 'su', 'musluk', 'boru', 'lavabo', 'tuvalet', 'tikan', 'gider', 'dus', 'basinc', 'kirec'],
  },
  {
    id: 'appliances',
    words: ['spulmaschine', 'spuelmaschine', 'waschmaschine', 'kuhlschrank', 'kuehlschrank', 'trockner', 'mikrowelle', 'backofen', 'herd', 'klimaanlage', 'geschirrspuler', 'geschirrspueler', 'lave-vaisselle', 'machine a laver', 'refrigerateur', 'frigo', 'seche', 'micro-ondes', 'four', 'cuisiniere', 'climatiseur', 'lavastoviglie', 'lavatrice', 'frigorifero', 'frigo', 'asciugatrice', 'microonde', 'forno', 'condizionatore', 'dishwasher', 'washing', 'fridge', 'refrigerator', 'dryer', 'microwave', 'oven', 'stove', 'ac unit', 'clima', 'bulasik', 'camasir', 'buzdolabi', 'kurutucu', 'mikrodalga', 'firin', 'ocak'],
  },
  {
    id: 'electronics',
    words: ['telefon', 'smartphone', 'tv', 'television', 'televisore', 'television', 'laptop', 'computer', 'router', 'modem', 'headphones', 'casque', 'cuffie', 'kulaklik', 'camera', 'fotocamera', 'kamera', 'watch', 'smartwatch', 'montre', 'orologio', 'saat', 'fernseher', 'handy', 'bildschirm', 'ecran', 'schermo', 'ekran', 'batterie', 'bateria', 'pil', 'akü', 'aku', 'telefone', 'portable', 'klavier', 'klavye', 'keyboard'],
  },
  {
    id: 'car',
    words: ['auto', 'motor', 'reifen', 'bremse', 'batterie', 'fahrzeug', 'voiture', 'moteur', 'pneu', 'frein', 'batterie', 'vehicule', 'motore', 'pneumatico', 'freno', 'batteria', 'veicolo', 'car', 'engine', 'tire', 'tyre', 'wheel', 'brake', 'battery', 'vehicle', 'araba', 'lastik', 'teker', 'fren', 'akü', 'aku', 'oto', 'vites', 'klima', 'hava filtresi'],
  },
  {
    id: 'furniture',
    words: ['mobel', 'möbel', 'stuhl', 'schrank', 'tisch', 'bett', 'meuble', 'chaise', 'canape', 'armoire', 'table', 'lit', 'mobile', 'sedia', 'divano', 'armadio', 'tavolo', 'letto', 'chair', 'sofa', 'couch', 'wardrobe', 'closet', 'bed', 'sandalye', 'koltuk', 'gardrop', 'dolap', 'masa', 'yatak', 'mobilya'],
  },
];

const SUB_KW: Record<string, Kw[]> = {
  plumbing: [
    { id: 'faucet', words: ['hahn', 'faucet', 'tap', 'robinet', 'rubinetto', 'musluk'] },
    { id: 'leaking_pipes', words: ['leck', 'leak', 'fuite', 'perd', 'siz', 'kacak', 'daml'] },
    { id: 'drain_clogs', words: ['abfluss', 'verstopf', 'drain', 'clog', 'canalisation', 'bouch', 'scarico', 'intasat', 'gider', 'tikan'] },
    { id: 'toilet', words: ['toilette', 'toilet', 'wc', 'tuvalet'] },
    { id: 'shower', words: ['dusche', 'douche', 'doccia', 'shower', 'dus'] },
    { id: 'sink', words: ['waschbecken', 'lavabo', 'evier', 'lavandino', 'sink', 'lavabo'] },
    { id: 'water_pressure', words: ['druck', 'pression', 'pressione', 'pressure', 'basinc'] },
  ],
  appliances: [
    { id: 'dishwasher', words: ['spulmaschine', 'spuelmaschine', 'geschirrspuler', 'lave-vaisselle', 'lavastoviglie', 'dishwasher', 'bulasik'] },
    { id: 'washing_machine', words: ['waschmaschine', 'machine a laver', 'lavatrice', 'washing', 'camasir'] },
    { id: 'refrigerator', words: ['kuhlschrank', 'kuehlschrank', 'refrigerateur', 'frigo', 'frigorifero', 'fridge', 'refrigerator', 'buzdolabi'] },
    { id: 'microwave_oven', words: ['mikrowelle', 'micro-ondes', 'microonde', 'microwave', 'mikrodalga'] },
    { id: 'oven_stove', words: ['backofen', 'herd', 'four', 'cuisiniere', 'forno', 'oven', 'stove', 'firin', 'ocak'] },
  ],
  electronics: [
    { id: 'smartphone', words: ['handy', 'telefon', 'smartphone', 'telefone', 'telefono', 'phone'] },
    { id: 'television', words: ['fernseher', 'tv', 'television', 'televisore', 'television'] },
    { id: 'laptop', words: ['laptop', 'portable', 'ordi', 'ordinateur', 'notebook'] },
    { id: 'router', words: ['router', 'modem'] },
    { id: 'headphones', words: ['kopfhorer', 'kopfhörer', 'casque', 'cuffie', 'headphones', 'kulaklik'] },
  ],
  car: [
    { id: 'engine', words: ['motor', 'moteur', 'motore', 'engine'] },
    { id: 'tire', words: ['reifen', 'pneu', 'pneumatico', 'tire', 'tyre', 'lastik'] },
    { id: 'brake', words: ['bremse', 'frein', 'freno', 'brake', 'fren'] },
    { id: 'electrical', words: ['batterie', 'batteria', 'battery', 'akü', 'aku', 'elektrik', 'elektri'] },
  ],
  furniture: [
    { id: 'sofa', words: ['sofa', 'couch', 'canape', 'divano', 'koltuk'] },
    { id: 'chair', words: ['stuhl', 'chaise', 'sedia', 'chair', 'sandalye'] },
    { id: 'table', words: ['tisch', 'table', 'tavolo', 'masa'] },
    { id: 'bed', words: ['bett', 'lit', 'letto', 'bed', 'yatak'] },
    { id: 'wardrobe', words: ['schrank', 'armoire', 'armadio', 'wardrobe', 'closet', 'gardrop', 'dolap'] },
  ],
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[ä]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ìî]/g, 'i')
    .replace(/[òô]/g, 'o')
    .replace(/[ùû]/g, 'u')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreWords(text: string, words: string[]): number {
  const t = norm(text);
  let score = 0;
  for (const w of words) {
    const nw = norm(w);
    if (t.includes(nw)) score += nw.length >= 5 ? 2 : 1;
  }
  return score;
}

/** Açıklamaya göre kategori (+ alt kategori) önerir; zayıf eşleşmede null döner. */
export function suggestCategory(description: string): { category: string; subcategory?: string } | null {
  const text = description ?? '';
  if (text.trim().length < 6) return null;

  let best: string | null = null;
  let bestScore = 0;
  for (const c of CAT_KW) {
    const s = scoreWords(text, c.words);
    if (s > bestScore) {
      bestScore = s;
      best = c.id;
    }
  }
  if (!best || bestScore === 0) return null;

  let sub: string | undefined;
  const subs = SUB_KW[best] ?? [];
  let bestSub: string | null = null;
  let bestSubScore = 0;
  for (const s of subs) {
    const sc = scoreWords(text, s.words);
    if (sc > bestSubScore) {
      bestSubScore = sc;
      bestSub = s.id;
    }
  }
  if (bestSub && bestSubScore > 0) sub = bestSub;

  return { category: best, subcategory: sub };
}
