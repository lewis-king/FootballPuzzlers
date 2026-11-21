import questionsJson from '../data/questions.json';

export type PackId = 'starter' | 'twenties' | 'worldcup' | 'champions';
export type Question = { id: number; pack: PackId; text: string; answers: string[]; clues: number };

export const QUESTIONS = questionsJson as Question[];

export type Pack = {
  id: PackId;
  title: string;
  short: string;
  /** store product id; free packs have none */
  sku?: string;
  /** a question shown as a taste on the unlock sheet */
  teaser?: number;
};

export const PACKS: Pack[] = [
  { id: 'starter', title: 'The Starter Pack', short: 'Starter' },
  { id: 'twenties', title: 'The 2020s', short: '2020s' },
  { id: 'worldcup', title: 'World Cup', short: 'World Cup', sku: 'com.footballwhoami.worldcup_1', teaser: 140 },
  { id: 'champions', title: 'Champions League', short: 'Champions', sku: 'com.footballwhoami.championsleague_1', teaser: 176 },
];

export const SKUS = PACKS.flatMap((p) => (p.sku ? [p.sku] : []));

export const questionsIn = (pack: PackId) => QUESTIONS.filter((q) => q.pack === pack);
export const questionById = (id: number) => QUESTIONS.find((q) => q.id === id);

/** Clue order matches the bitmask used in questions.json, the legacy import and the save code. */
export const CLUES = [
  { key: 'GK', label: 'Goalkeeper' },
  { key: 'DEF', label: 'Defender' },
  { key: 'MID', label: 'Midfielder' },
  { key: 'FWD', label: 'Forward' },
  { key: 'RET', label: 'Retired' },
  { key: 'ENG', label: 'English' },
] as const;
export type ClueKey = (typeof CLUES)[number]['key'];
export const clueBit = (key: ClueKey) => 1 << CLUES.findIndex((c) => c.key === key);

export const MAX_CLUES = 2;
export const MAX_LETTERS = 3;

export const cluesUsed = (mask: number) => CLUES.filter((_, i) => mask & (1 << i)).length;
export const clueAnswer = (q: Question, key: ClueKey) => !!(q.clues & clueBit(key));

/** Case, accents, spacing and punctuation are forgiven; spelling is not (as in 2019). */
export function normalise(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ø/g, 'o')
    .replace(/ß/g, 'ss')
    .replace(/đ/g, 'd')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '');
}

export function isCorrect(given: string, q: Question): boolean {
  const g = normalise(given);
  return g.length > 0 && q.answers.some((a) => normalise(a) === g);
}

/** Revealed letters are the start of the surname, as in 2019: "R", "Ro", "Roo". */
export function revealedPrefix(q: Question, letters: number): string {
  const names = q.answers[0].trim().split(/\s+/);
  return names[names.length - 1].slice(0, letters);
}

/** Days since 1 Jan 2020 in the player's local time zone, for the daily streak. */
export function dayNumber(d = new Date()): number {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2020, 0, 1)) / 86400000);
}

/** Streak after solving a question today. */
export function nextStreak(streak: { days: number; lastDay: number }, today = dayNumber()) {
  if (streak.lastDay === today) return streak;
  return { days: streak.lastDay === today - 1 ? streak.days + 1 : 1, lastDay: today };
}

/** The streak as shown: it lapses once a whole day is missed. */
export const currentStreak = (streak: { days: number; lastDay: number }, today = dayNumber()) =>
  streak.lastDay >= today - 1 ? streak.days : 0;

/** Edit distance, for telling a near miss ("Marne" for Mané) from a wrong answer. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

/** One or two letters out from an accepted answer (names of four letters or more). */
export function isNearMiss(given: string, q: Question): boolean {
  const g = normalise(given);
  if (g.length < 4) return false;
  return q.answers.some((a) => {
    const n = normalise(a);
    return n.length >= 4 && distance(g, n) <= (n.length >= 7 ? 2 : 1);
  });
}

/** The surname shown on a solved tile. */
export const surnameOf = (q: Question) => q.answers[0].trim().split(/\s+/).slice(-1)[0];
