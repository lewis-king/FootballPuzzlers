import * as StoreReview from 'expo-store-review';

import { PACKS } from '../lib/game';
import { useProgress } from '../state/progress';
import { packStats } from '../state/selectors';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Asking for a rating, rarely. The first time comes when the player is half way through any pack
 * (at least 10 solved), which says they're enjoying it. At most one more ask, 90 days or more later.
 * It shows the store's own rating sheet as they move on to their next question, over whatever screen
 * they're on. Apple and Google both forbid a home-made "Enjoying the app?" question first, and both
 * also cap how often their sheet really appears, so a call can quietly show nothing.
 */
export function shouldAskForRating(now = Date.now()) {
  const s = useProgress.getState();
  if (s.rateAsks >= 2) return false;
  if (s.rateAsks === 1 && s.rateLastAt && now - s.rateLastAt < 90 * DAY) return false;
  return PACKS.some((p) => {
    const st = packStats(p.id, s.answered);
    return st.solved >= 10 && st.solved / st.total >= 0.5;
  });
}

/** Call on the way to the next question: asks if it's time, then carries on to `go`. */
export async function maybeAskForRating(go: () => void) {
  if (!shouldAskForRating()) return go();
  try {
    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return go();
    useProgress.getState().markRateAsked();
    await StoreReview.requestReview();
  } catch {
    // never let the rating sheet get in the way of playing
  }
  go();
}
