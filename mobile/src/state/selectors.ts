import { CLUES, PACKS, PackId, Pack, Question, questionsIn, QUESTIONS } from '../lib/game';
import type { SaveData } from '../lib/saveCode';

export const isFree = (p: Pack) => !p.sku;
export const owns = (p: Pack, purchased: string[]) => isFree(p) || purchased.includes(p.sku!);

export function packStats(pack: PackId, answered: number[]) {
  const qs = questionsIn(pack);
  const done = new Set(answered);
  const solved = qs.filter((q) => done.has(q.id)).length;
  const nextIndex = qs.findIndex((q) => !done.has(q.id));
  return { total: qs.length, solved, nextIndex, next: nextIndex >= 0 ? qs[nextIndex] : undefined };
}

/** Position of a question within its pack, 1-based, as shown on tiles and the nav bar. */
export const numberInPack = (q: Question) => questionsIn(q.pack).findIndex((x) => x.id === q.id) + 1;

/**
 * Questions are played in order, as in 2019: the first unsolved question in a pack is the one in
 * play, and everything after it stays locked until it's solved. Solved ones can always be reopened.
 */
export function isLocked(q: Question, answered: number[]) {
  if (answered.includes(q.id)) return false;
  const { next } = packStats(q.pack, answered);
  return !!next && next.id !== q.id;
}

/** The question in play after this one: the first unsolved question in its pack. */
export function nextUnanswered(q: Question, answered: number[]): Question | undefined {
  const done = new Set(answered);
  return questionsIn(q.pack).find((x) => x.id !== q.id && !done.has(x.id));
}

export const solvedWithoutHelp = (s: SaveData) =>
  s.answered.filter((id) => !(s.clues[id] ?? 0) && !(s.letters[id] ?? 0)).length;

export function describeHelp(clueMask: number, letters: number) {
  const clues = CLUES.filter((_, i) => clueMask & (1 << i)).length;
  if (!clues && !letters) return 'Solved without any help';
  const parts = [];
  if (clues) parts.push(`${clues} clue${clues > 1 ? 's' : ''}`);
  if (letters) parts.push(`${letters} letter${letters > 1 ? 's' : ''}`);
  return `Solved with ${parts.join(' and ')}`;
}

/** One line per pack for the Enter a code and Welcome back screens. */
export function summarise(answered: number[]) {
  return PACKS.map((p) => ({ pack: p, ...packStats(p.id, answered) })).filter((x) => x.solved > 0);
}

export const totalQuestions = QUESTIONS.length;
