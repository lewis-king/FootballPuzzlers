import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MAX_LETTERS, Question, revealedPrefix } from '../lib/game';
import { showRewarded } from '../services/ads';
import { useProgress } from '../state/progress';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { C, F, R, T } from './theme';

/** Up to three letters of the surname, each for a rewarded ad, explained before it plays. */
export function RevealSheet({ visible, question, onClose, onReveal }: {
  visible: boolean; question: Question; onClose: () => void; onReveal: (letters: number) => void;
}) {
  const letters = useProgress((s) => s.letters[question.id] ?? 0);
  const revealLetter = useProgress((s) => s.revealLetter);
  const [busy, setBusy] = useState(false);
  const prefix = revealedPrefix(question, letters);
  const all = letters >= MAX_LETTERS || prefix.length < letters;

  const watch = async () => {
    setBusy(true);
    const earned = await showRewarded();
    setBusy(false);
    if (!earned) return;
    const n = revealLetter(question.id);
    onReveal(n);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={T.title}>Reveal a letter</Text>
      <Text style={[T.body, { marginTop: 6 }]}>
        Watch a short ad to reveal the next letter of the surname. You can reveal up to three per question.
      </Text>
      <View style={styles.row}>
        {Array.from({ length: MAX_LETTERS }, (_, i) => {
          const shown = i < letters;
          const isNext = i === letters;
          return (
            <View key={i} style={[styles.box, shown && styles.shown, isNext && styles.next]}>
              <Text style={styles.letter}>{shown ? prefix[i]?.toUpperCase() ?? '' : isNext ? '?' : ''}</Text>
            </View>
          );
        })}
      </View>
      {all ? (
        <Button label="Back to the question" onPress={onClose} />
      ) : (
        <Button label={busy ? 'Loading ad…' : 'Watch ad and reveal'} onPress={watch} disabled={busy} />
      )}
      <Button label="No thanks" variant="ghost" onPress={onClose} style={{ marginTop: 6 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 24 },
  box: { width: 64, height: 72, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  shown: { borderColor: C.purple, backgroundColor: '#2c2a6b' },
  next: { borderColor: C.purple, borderStyle: 'dashed', backgroundColor: C.purpleTint },
  letter: { fontFamily: F.extrabold, fontSize: 28, color: C.text },
});
