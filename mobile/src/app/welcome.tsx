import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PACKS, questionsIn } from '../lib/game';
import { useProgress } from '../state/progress';
import { packStats } from '../state/selectors';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { Screen } from '../ui/Screen';
import { C, PACK_COLOUR, R, T } from '../ui/theme';

/** Shown once, after the 2019 save has been imported. */
export default function Welcome() {
  const answered = useProgress((s) => s.answered);
  const purchased = useProgress((s) => s.purchased);
  const dismiss = useProgress((s) => s.dismissWelcome);
  const rows = PACKS.filter((p) => p.id !== 'twenties').map((p) => {
    const s = packStats(p.id, answered);
    const value = s.solved ? `${s.solved} / ${s.total}` : p.sku && purchased.includes(p.sku) ? 'Owned' : null;
    return { p, value };
  }).filter((r) => r.value);
  const twenties = questionsIn('twenties').length;

  const go = () => {
    dismiss();
    router.replace('/');
  };

  return (
    <Screen glowTop={C.cyan} style={{ justifyContent: 'space-between' }}>
      <View style={{ marginTop: 40 }}>
        <Logo height={46} />
        <Animated.Text entering={FadeInDown.delay(100)} style={[T.display, { marginTop: 20 }]}>Welcome back</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(170)} style={[T.body, { marginTop: 10 }]}>
          We rebuilt the game from the ground up. Your progress came with you.
        </Animated.Text>
        <Animated.View entering={FadeInDown.delay(240)} style={styles.card}>
          <Text style={T.label}>Your progress</Text>
          {rows.map(({ p, value }) => (
            <View key={p.id} style={styles.row}>
              <Text style={T.bodyStrong}>{p.title}</Text>
              <Text style={[T.bodyStrong, { color: PACK_COLOUR[p.id] }]}>{value}</Text>
            </View>
          ))}
        </Animated.View>
        {twenties ? (
          <Animated.View entering={FadeInDown.delay(310)} style={[styles.card, { borderColor: PACK_COLOUR.twenties }]}>
            <Text style={[T.label, { color: PACK_COLOUR.twenties }]}>New pack</Text>
            <Text style={T.headline}>The 2020s</Text>
            <Text style={T.caption}>{twenties} new questions on the players of this decade, plus every old question re-checked for 2026.</Text>
          </Animated.View>
        ) : null}
      </View>
      <Button label="Let's play" onPress={go} style={{ marginBottom: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 20, padding: 18, gap: 12, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.stroke, backgroundColor: C.card },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
