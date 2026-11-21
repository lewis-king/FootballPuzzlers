import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PACKS, PackId, questionsIn, surnameOf } from '../../lib/game';
import { useProgress } from '../../state/progress';
import { owns, packStats } from '../../state/selectors';
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
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
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/question/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Question ${index + 1}${solved ? `, solved: ${surnameOf(item)}` : ''}`}
                  style={({ pressed }) => [
                    styles.tile,
                    solved && { backgroundColor: tint(colour), borderColor: colour + '80' },
                    isNext && { borderColor: colour, borderWidth: 2, backgroundColor: C.raised },
                    { transform: [{ scale: pressed ? 0.94 : 1 }] },
                  ]}
                >
                  {solved ? (
                    <>
                      <Text style={[styles.small, { color: colour }]}>{index + 1}</Text>
                      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{surnameOf(item)}</Text>
                    </>
                  ) : <Text style={styles.num}>{index + 1}</Text>}
                </Pressable>
              );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.stroke, padding: 18, marginTop: 8, marginBottom: 16 },
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  gap: { flex: 1 },
  tile: { flex: 1, aspectRatio: 1, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.stroke, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: F.bold, fontSize: 17, color: C.text },
  small: { fontFamily: F.medium, fontSize: 10 },
  name: { fontFamily: F.semibold, fontSize: 10, color: C.text, marginTop: 2, paddingHorizontal: 3, textAlign: 'center' },
});
