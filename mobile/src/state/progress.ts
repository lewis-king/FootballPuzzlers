import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ClueKey, clueBit, cluesUsed, dayNumber, MAX_CLUES, MAX_LETTERS, nextStreak, CLUES, PackId } from '../lib/game';
import type { LegacyProgress } from '../lib/legacyRealm';
import type { SaveData } from '../lib/saveCode';

type Progress = SaveData & {
  /** store product ids the player owns (refreshed from the store on launch) */
  purchased: string[];
  /** set once the 2019 save has been looked for, so the import runs only once */
  legacyChecked: boolean;
  /** how many answers came over from the 2019 app, for the welcome-back screen */
  legacyImported: number | null;
  /** the pack the player was last in, for the Continue card */
  lastPack: PackId;
  /** new-pack notifications: not asked yet, opted in, or said no / turned off */
  alerts: 'unasked' | 'on' | 'off';
  /** times the Notify me sheet has been shown (20 in, then once more on Pack complete) */
  alertAsks: number;
  /** guesses checked per question, for "1st guess!" on the Correct screen (not in save codes) */
  guesses: Record<number, number>;
  /** the day (dayNumber) each question was solved, for "days to finish" on Pack complete (not in save codes) */
  solvedOn: Record<number, number>;
  /** times the store's own rating sheet has been asked for, and when last (ms) */
  rateAsks: number;
  rateLastAt: number | null;

  solve: (id: number) => void;
  revealClue: (id: number, key: ClueKey) => boolean;
  revealLetter: (id: number) => number;
  replaceWith: (save: SaveData) => void;
  importLegacy: (legacy: LegacyProgress | null) => void;
  setPurchased: (skus: string[]) => void;
  dismissWelcome: () => void;
  setLastPack: (pack: PackId) => void;
  setAlerts: (alerts: 'on' | 'off') => void;
  markAlertAsked: () => void;
  markRateAsked: () => void;
  addGuess: (id: number) => void;
};

const empty: SaveData = { answered: [], clues: {}, letters: {}, streak: { days: 0, lastDay: -10 } };

export const useProgress = create<Progress>()(
  persist(
    (set, get) => ({
      ...empty,
      purchased: [],
      legacyChecked: false,
      legacyImported: null,
      lastPack: 'starter',
      alerts: 'unasked',
      alertAsks: 0,
      rateAsks: 0,
      guesses: {},
      solvedOn: {},
      rateLastAt: null,

      solve: (id) =>
        set((s) => (s.answered.includes(id) ? s : {
          answered: [...s.answered, id], streak: nextStreak(s.streak), solvedOn: { ...s.solvedOn, [id]: dayNumber() },
        })),

      revealClue: (id, key) => {
        const mask = get().clues[id] ?? 0;
        const bit = clueBit(key);
        if (mask & bit) return true;
        if (cluesUsed(mask) >= MAX_CLUES) return false;
        set((s) => ({ clues: { ...s.clues, [id]: mask | bit } }));
        return true;
      },

      revealLetter: (id) => {
        const n = Math.min((get().letters[id] ?? 0) + 1, MAX_LETTERS);
        set((s) => ({ letters: { ...s.letters, [id]: n } }));
        return n;
      },

      replaceWith: (save) => set({ answered: save.answered, clues: save.clues, letters: save.letters, streak: save.streak }),

      importLegacy: (legacy) => {
        if (get().legacyChecked) return;
        if (!legacy) return set({ legacyChecked: true });
        const clues: Record<number, number> = { ...get().clues };
        for (const [id, chosen] of Object.entries(legacy.selectedClues)) {
          let mask = 0;
          CLUES.forEach((c, i) => { if (chosen[c.key]) mask |= 1 << i; });
          if (mask) clues[Number(id)] = (clues[Number(id)] ?? 0) | mask;
        }
        set((s) => ({
          legacyChecked: true,
          legacyImported: legacy.answeredIds.length || null,
          answered: [...new Set([...s.answered, ...legacy.answeredIds])],
          clues,
          purchased: [...new Set([...s.purchased, ...legacy.purchased])],
        }));
      },

      setPurchased: (skus) => set((s) => ({ purchased: [...new Set([...s.purchased, ...skus])] })),
      dismissWelcome: () => set({ legacyImported: null }),
      setLastPack: (pack) => set({ lastPack: pack }),
      setAlerts: (alerts) => set({ alerts }),
      markAlertAsked: () => set((s) => ({ alertAsks: s.alertAsks + 1 })),
      addGuess: (id) => set((s) => ({ guesses: { ...s.guesses, [id]: (s.guesses[id] ?? 0) + 1 } })),
      markRateAsked: () => set((s) => ({ rateAsks: s.rateAsks + 1, rateLastAt: Date.now() })),
    }),
    {
      name: 'progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

export const saveOf = (s: SaveData): SaveData => ({ answered: s.answered, clues: s.clues, letters: s.letters, streak: s.streak });
