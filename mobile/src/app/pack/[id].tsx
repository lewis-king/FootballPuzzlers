import { Redirect, router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ReactNode, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, SharedValue, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';

import { PACKS, PackId, questionsIn, surnameOf } from '../../lib/game';
import { useProgress } from '../../state/progress';
import { maybeAskForRating } from '../../services/rate';
import { owns, packStats } from '../../state/selectors';
import { Icon } from '../../ui/Icon';
import { NavBar } from '../../ui/NavBar';
import { ProgressBar } from '../../ui/Progress';
import { Screen } from '../../ui/Screen';
import { C, F, PACK_COLOUR, R, T, tint } from '../../ui/theme';

export default function PackScreen() {
  const { id } = useLocalSearchParams<{ id: PackId }>();
  const pack = PACKS.find((p) => p.id === id);
  const answered = useProgress((s) => s.answered);
  const purchased = useProgress((s) => s.purchased);
  const setLastPack = useProgress((s) => s.setLastPack);
  const nudge = useSharedValue(0); // a tap on a locked tile makes the one in play throb harder

  useEffect(() => {
    if (pack) setLastPack(pack.id);
  }, [pack, setLastPack]);

  if (!pack || !owns(pack, purchased)) return <Redirect href="/" />;

  const qs = questionsIn(pack.id);
  const stats = packStats(pack.id, answered);
  const done = new Set(answered);
  const colour = PACK_COLOUR[pack.id];

  return (
    <Screen glowTop={colour} photo={pack.id}>
      <NavBar title={pack.title} onBack={() => router.dismissTo('/')} />
      {/* A plain ScrollView, not a FlatList: on Android a FlatList with a header and `gap` drew the
          header over the first row of tiles (seen on a Pixel 10, Nov 2026). 90 tiles don't need
          virtualising. */}
      {/* Pulled out past the screen padding and padded back in, so the throbbing tile in the first or
          last column isn't clipped at the scroll view's edge. */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginHorizontal: -12 }} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 12 }}>
        <View style={styles.summary}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={T.body}>
                <Text style={[T.number, { color: colour }]}>{stats.solved}</Text> / {stats.total} solved
              </Text>
              <Text style={[T.bodyStrong, { color: colour }]}>{stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}%</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <ProgressBar value={stats.total ? stats.solved / stats.total : 0} colour={colour} height={8} />
            </View>
          </View>
        <View style={styles.grid}>
          {Array.from({ length: Math.ceil(qs.length / 5) }, (_, r) => (
            <View key={r} style={styles.row}>
              {Array.from({ length: 5 }, (_, c) => {
                const index = r * 5 + c;
                const item = qs[index];
                if (!item) return <View key={c} style={styles.gap} />;
              const solved = done.has(item.id);
              const isNext = index === stats.nextIndex;
              // Played in order, as in 2019: tiles after the one in play stay dim and locked.
              const locked = !solved && stats.nextIndex >= 0 && index > stats.nextIndex;
              const tile = (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    if (locked) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                      nudge.set(withSequence(withTiming(1, { duration: 120 }), withTiming(0, { duration: 380 })));
                      return;
                    }
                    const open = () => router.push(`/question/${item.id}`);
                    if (isNext) maybeAskForRating(open); else open();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: locked }}
                  accessibilityLabel={`Question ${index + 1}${solved ? `, solved: ${surnameOf(item)}` : locked ? ', locked' : isNext ? ', up next' : ''}`}
                  style={({ pressed }) => [
                    styles.tile,
                    solved && { backgroundColor: tint(colour), borderColor: colour + '80' },
                    isNext && { borderColor: colour, borderWidth: 2, backgroundColor: C.raised },
                    locked && styles.locked,
                    !isNext && { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                  ]}
                >
                  {solved ? (
                    <>
                      <Text style={[styles.small, { color: colour }]}>{index + 1}</Text>
                      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{surnameOf(item)}</Text>
                    </>
                  ) : locked ? (
                    <>
                      <Text style={[styles.num, { color: C.textMuted, fontSize: 15 }]}>{index + 1}</Text>
                      <Icon name="lock" size={11} color={C.textMuted} />
                    </>
                  ) : <Text style={[styles.num, isNext && { color: colour }]}>{index + 1}</Text>}
                </Pressable>
              );
              return isNext ? <Throb key={item.id} colour={colour} nudge={nudge}>{tile}</Throb> : tile;
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

/** The question in play breathes gently, pointing the player at it, as the 2019 grid did. */
function Throb({ colour, nudge, children }: { colour: string; nudge: SharedValue<number>; children: ReactNode }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduced) t.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [reduced, t]);
  const ring = useAnimatedStyle(() => ({
    opacity: 0.15 + t.value * 0.45 + nudge.value * 0.4,
    transform: [{ scale: 1 + t.value * 0.08 + nudge.value * 0.12 }],
  }));
  const body = useAnimatedStyle(() => ({ transform: [{ scale: 1 + t.value * 0.045 + nudge.value * 0.08 }] }));
  return (
    <View style={{ flex: 1, aspectRatio: 1 }}>
      <Animated.View pointerEvents="none" style={[styles.ring, { borderColor: colour, backgroundColor: colour + '22' }, ring]} />
      <Animated.View style={[{ flex: 1 }, body]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.stroke, padding: 18, marginTop: 8, marginBottom: 16 },
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  gap: { flex: 1 },
  locked: { opacity: 0.6 },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 14, borderWidth: 2 },
  tile: { flex: 1, aspectRatio: 1, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: F.bold, fontSize: 17, color: C.text },
  small: { fontFamily: F.medium, fontSize: 10 },
  name: { fontFamily: F.semibold, fontSize: 10, color: C.text, marginTop: 2, paddingHorizontal: 3, textAlign: 'center' },
});
