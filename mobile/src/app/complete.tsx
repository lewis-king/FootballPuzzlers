import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { currentStreak, PACKS, PackId, questionsIn } from '../lib/game';
import { useProgress } from '../state/progress';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { Icon } from '../ui/Icon';
import { NotifySheet } from '../ui/NotifySheet';
import { Screen } from '../ui/Screen';
import { C, PACK_COLOUR, R, T } from '../ui/theme';

/** Pack complete v2 (Figma 26:326): the pack's photo, a trophy, confetti and the player's numbers. */
export default function Complete() {
  const { pack: id } = useLocalSearchParams<{ pack: PackId }>();
  const s = useProgress();
  const pack = PACKS.find((p) => p.id === id);
  const [notify, setNotify] = useState(false);

  // Second and last chance at the new-pack alerts, after the celebration has landed.
  useEffect(() => {
    const st = useProgress.getState();
    if (st.alerts === 'on' || st.alertAsks >= 2) return;
    const t = setTimeout(() => { st.markAlertAsked(); setNotify(true); }, 2600);
    return () => clearTimeout(t);
  }, []);

  if (!pack) return <Redirect href="/" />;
  const qs = questionsIn(pack.id);
  const clean = qs.filter((q) => s.answered.includes(q.id) && !(s.clues[q.id] ?? 0) && !(s.letters[q.id] ?? 0)).length;
  const streak = currentStreak(s.streak);
  const colour = PACK_COLOUR[pack.id];

  const share = () =>
    Share.share({ message: `I finished ${pack.title} on Football Who Am I: all ${qs.length}, ${clean} without a single clue. How well do you know your football?` }).catch(() => {});

  const stats = [
    { n: qs.length, label: 'solved' },
    { n: clean, label: 'without a clue' },
    ...(streak > 1 ? [{ n: streak, label: 'days in a row' }] : []),
  ];

  return (
    <Screen glowTop={colour} photo={pack.id} photoHeight={430} style={{ justifyContent: 'space-between' }}>
      <Confetti count={46} />
      <View style={{ alignItems: 'center', marginTop: 48 }}>
        <Animated.View entering={ZoomIn.springify().damping(10).delay(100)}>
          <LinearGradient colors={[colour, C.purple]} style={styles.medal}>
            <Icon name="trophy" size={72} color={C.text} />
          </LinearGradient>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(350)} style={[T.label, { color: colour, marginTop: 24 }]}>
          Pack complete · {qs.length} of {qs.length}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(420)} style={[T.display, { marginTop: 10, textAlign: 'center' }]}>{pack.title}</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(490)} style={[T.body, { marginTop: 10, textAlign: 'center' }]}>
          Every single one. Only a proper football brain gets through all {qs.length}.
        </Animated.Text>
        <View style={styles.stats}>
          {stats.map((x, i) => (
            <Animated.View key={x.label} entering={FadeInUp.delay(700 + i * 180)} style={styles.stat}>
              <CountUp to={x.n} delay={800 + i * 180} />
              <Text style={[T.caption, { textAlign: 'center' }]}>{x.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
      <View style={{ gap: 10, marginBottom: 8 }}>
        <Button label="Share my result" onPress={share} />
        <Button label="Back to home" variant="secondary" onPress={() => router.dismissTo('/')} />
      </View>
      <NotifySheet
        visible={notify}
        onClose={() => setNotify(false)}
        body="You've finished the lot. We'll send you a notification when the next pack lands."
      />
    </Screen>
  );
}

/** Counts up to the number, with a light tap of haptics when it lands. */
function CountUp({ to, delay }: { to: number; delay: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = Date.now() + delay;
    const ms = 700;
    const tick = () => {
      const t = Math.min(1, Math.max(0, (Date.now() - start) / ms));
      setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, delay]);
  return <Text style={T.number}>{n}</Text>;
}

const styles = StyleSheet.create({
  medal: { width: 156, height: 156, borderRadius: 78, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#ffffff59' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 28, alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 6, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.stroke },
});
