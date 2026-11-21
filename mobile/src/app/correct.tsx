import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { currentStreak, PACKS, questionById } from '../lib/game';
import { useProgress } from '../state/progress';
import { describeHelp, nextUnanswered, packStats, solvedWithoutHelp } from '../state/selectors';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { Icon } from '../ui/Icon';
import { Screen } from '../ui/Screen';
import { C, PACK_COLOUR, R, T } from '../ui/theme';

export default function Correct() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = questionById(Number(id));
  const s = useProgress();
  const stats = q ? packStats(q.pack, s.answered) : null;

  useEffect(() => {
    // Finishing a pack goes straight to its celebration.
    if (q && stats && stats.solved === stats.total) router.replace(`/complete?pack=${q.pack}`);
  }, [q, stats]);

  if (!q || !stats) return <Redirect href="/" />;
  const pack = PACKS.find((p) => p.id === q.pack)!;
  const next = nextUnanswered(q, s.answered);
  const streak = currentStreak(s.streak);

  return (
    <Screen glowTop={C.yes} style={{ justifyContent: 'space-between' }}>
      <Confetti />
      <View style={{ alignItems: 'center', marginTop: 60 }}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.tick}>
          <Icon name="check" size={56} color={C.yes} />
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(150)} style={[T.label, { color: C.yes, marginTop: 20 }]}>Correct</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(220)} style={[T.display, { marginTop: 10, textAlign: 'center' }]}>{q.answers[0]}</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(290)} style={[T.body, { marginTop: 10 }]}>
          {describeHelp(s.clues[q.id] ?? 0, s.letters[q.id] ?? 0)}
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(360)} style={styles.stats}>
          <Stat value={`${stats.solved}/${stats.total}`} label={pack.short} colour={PACK_COLOUR[q.pack]} />
          <Stat value={String(streak)} label={streak === 1 ? 'day in a row' : 'days in a row'} colour="#c9f25c" />
          <Stat value={String(solvedWithoutHelp(s))} label="without help" colour={C.cyan} />
        </Animated.View>
      </View>
      <View style={{ gap: 8, marginBottom: 8 }}>
        {next ? <Button label="Next question" onPress={() => router.replace(`/question/${next.id}`)} /> : null}
        <Button label="Back to the pack" variant="ghost" onPress={() => router.dismissTo(`/pack/${q.pack}`)} />
      </View>
    </Screen>
  );
}

function Stat({ value, label, colour }: { value: string; label: string; colour: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[T.headline, { color: colour }]}>{value}</Text>
      <Text style={[T.caption, { textAlign: 'center' }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tick: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: C.yes, backgroundColor: C.yesTint, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 32, alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.stroke },
});
