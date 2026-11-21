import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pack, PACKS } from '../lib/game';
import { priceOf } from '../services/purchases';
import { useProgress } from '../state/progress';
import { isFree, owns, packStats } from '../state/selectors';
import { Badge } from '../ui/Badge';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { NotifySheet } from '../ui/NotifySheet';
import { PackArt } from '../ui/PackArt';
import { ProgressBar } from '../ui/Progress';
import { Screen } from '../ui/Screen';
import { C, PACK_COLOUR, R, T } from '../ui/theme';
import { UnlockSheet } from '../ui/UnlockSheet';

export default function Home() {
  const answered = useProgress((s) => s.answered);
  const purchased = useProgress((s) => s.purchased);
  const lastPack = useProgress((s) => s.lastPack);
  const [unlocking, setUnlocking] = useState<Pack | null>(null);
  const alerts = useProgress((s) => s.alerts);
  const [notify, setNotify] = useState(false);

  const playable = (p: Pack) => owns(p, purchased) && packStats(p.id, answered).total > 0;
  const last = PACKS.find((p) => p.id === lastPack)!;
  const hero =
    (playable(last) && packStats(last.id, answered).next ? last : undefined) ??
    PACKS.find((p) => playable(p) && packStats(p.id, answered).next) ??
    PACKS[0];
  const others = PACKS.filter((p) => p.id !== hero.id);

  const open = (p: Pack) => {
    if (packStats(p.id, answered).total === 0) return;
    if (!owns(p, purchased)) return setUnlocking(p);
    router.push(`/pack/${p.id}`);
  };

  return (
    <Screen glowTop={PACK_COLOUR[hero.id]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Logo />
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} style={styles.settings}>
            <Icon name="settings" size={22} color={C.text} />
          </Pressable>
        </View>
        <Text style={styles.title}>How well do you know your football?</Text>

        <HeroCard pack={hero} answered={answered} purchased={purchased} onPress={() => open(hero)} />

        <Text style={[T.label, { marginTop: 28, marginBottom: 12 }]}>More packs</Text>
        <View style={styles.grid}>
          {others.map((p) => (
            <PackTile key={p.id} pack={p} answered={answered} purchased={purchased} onPress={() => open(p)} />
          ))}
          <Pressable
            onPress={() => alerts !== 'on' && setNotify(true)}
            disabled={alerts === 'on'}
            accessibilityRole="button"
            accessibilityLabel={alerts === 'on' ? "Next pack: we'll let you know" : 'Next pack: tap to get notified'}
            style={({ pressed }) => [styles.tile, styles.soon, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <View style={styles.bell}><Icon name="bell" size={22} color={C.purple} /></View>
            <Text style={[T.bodyStrong, { color: C.textSecondary, marginTop: 4 }]}>Next pack</Text>
            <Text style={[T.caption, { color: alerts === 'on' ? C.textMuted : C.purple }]}>
              {alerts === 'on' ? "We'll let you know" : 'Tap to get notified'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <UnlockSheet pack={unlocking} onClose={() => setUnlocking(null)} />
      <NotifySheet visible={notify} onClose={() => setNotify(false)} body="New packs take a while to make. We'll send you a notification when the next one lands." />
    </Screen>
  );
}

function HeroCard({ pack, answered, purchased, onPress }: { pack: Pack; answered: number[]; purchased: string[]; onPress: () => void }) {
  const s = packStats(pack.id, answered);
  const started = s.solved > 0;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${started ? 'Continue' : 'Play'} ${pack.title}`}
      style={({ pressed }) => [styles.hero, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
      <PackArt pack={pack.id} />
      <View style={styles.heroTop}>
        <Badge label={started ? 'CONTINUE' : 'PLAY'} />
        {isFree(pack) ? <View /> : <Badge label={owns(pack, purchased) ? 'OWNED' : priceOf(pack.sku!)} />}
      </View>
      <View>
        <Text style={[T.title, { fontSize: 26 }]}>{pack.title}</Text>
        <Text style={[T.caption, { color: C.text, marginTop: 6, marginBottom: 10 }]}>
          {s.next ? `Question ${s.nextIndex + 1} · ` : ''}{s.solved} of {s.total} solved
        </Text>
        <ProgressBar value={s.total ? s.solved / s.total : 0} colour={PACK_COLOUR[pack.id]} />
      </View>
    </Pressable>
  );
}

function PackTile({ pack, answered, purchased, onPress }: { pack: Pack; answered: number[]; purchased: string[]; onPress: () => void }) {
  const s = packStats(pack.id, answered);
  const mine = owns(pack, purchased);
  const empty = s.total === 0;
  const badge = empty ? null : !mine ? <Badge label={priceOf(pack.sku!)} lock /> : isFree(pack) && s.solved === 0 ? <Badge label="NEW" colour={PACK_COLOUR[pack.id]} /> : pack.sku ? <Badge label="OWNED" /> : null;
  const meta = empty ? 'coming soon' : mine && s.solved ? `${s.solved} of ${s.total} solved` : `${s.total} questions`;
  return (
    <Pressable onPress={onPress} disabled={empty} accessibilityRole="button" accessibilityLabel={`${pack.title}, ${meta}`}
      style={({ pressed }) => [styles.tile, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <PackArt pack={pack.id} />
      <View style={styles.tileTop}>{badge}</View>
      <View>
        <Text style={[T.headline, { fontSize: 17 }]} numberOfLines={2}>{pack.title}</Text>
        <Text style={[T.caption, { marginTop: 4 }]}>{meta}</Text>
        {mine && s.solved > 0 ? (
          <View style={{ marginTop: 8 }}><ProgressBar value={s.solved / s.total} colour={PACK_COLOUR[pack.id]} /></View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  settings: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...T.title, marginTop: 20, marginBottom: 20, maxWidth: 300 },
  hero: { height: 230, borderRadius: R.lg, overflow: 'hidden', padding: 18, justifyContent: 'space-between', backgroundColor: C.card },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13 },
  tile: { flexBasis: '45%', flexGrow: 1, aspectRatio: 1, borderRadius: R.md + 4, overflow: 'hidden', padding: 12, justifyContent: 'space-between', backgroundColor: C.card },
  tileTop: { flexDirection: 'row', justifyContent: 'flex-end', minHeight: 28 },
  soon: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.stroke, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', gap: 4 },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.purpleTint, alignItems: 'center', justifyContent: 'center' },
});
