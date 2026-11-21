import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Pack, questionById, questionsIn } from '../lib/game';
import { buy, priceOf, restore } from '../services/purchases';
import { useProgress } from '../state/progress';
import { Button } from './Button';
import { PackArt } from './PackArt';
import { Sheet } from './Sheet';
import { C, PACK_COLOUR, R, T } from './theme';

const BLURB: Record<string, string> = {
  worldcup: 'Legends, records and famous misses from every World Cup.',
  champions: "Europe's biggest nights and the players who made them.",
};

export function UnlockSheet({ pack, onClose }: { pack: Pack | null; onClose: () => void }) {
  const setPurchased = useProgress((s) => s.setPurchased);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [note, setNote] = useState('');
  if (!pack?.sku) return <Sheet visible={false} onClose={onClose}>{null}</Sheet>;

  const owned = (sku: string) => setPurchased([sku]);
  const done = () => {
    onClose();
    router.push(`/pack/${pack.id}`);
  };
  const onBuy = async () => {
    setBusy('buy');
    setNote('');
    const r = await buy(pack.sku!, owned);
    setBusy(null);
    if (r.ok) return done();
    if (r.pending) setNote("Your payment is pending. The pack unlocks as soon as it goes through.");
    else if (r.unavailable) setNote("Couldn't reach the store. Check your connection and try again.");
    else if (r.failed) setNote('The purchase didn\'t go through. You haven\'t been charged.');
  };
  const onRestore = async () => {
    setBusy('restore');
    const r = await restore(owned);
    setBusy(null);
    if (r.found.includes(pack.sku!)) return done();
    setNote(r.ok ? "We couldn't find this pack on your store account." : "Couldn't reach the store. Check your connection and try again.");
  };

  const price = priceOf(pack.sku);
  const colour = PACK_COLOUR[pack.id];
  const teaser = pack.teaser ? questionById(pack.teaser) : undefined;
  return (
    <Sheet visible={!!pack} onClose={onClose}>
      <View style={styles.art}>
        <PackArt pack={pack.id} />
        <Text style={[T.label, { color: colour }]}>{questionsIn(pack.id).length} questions · yours to keep</Text>
        <Text style={[T.display, { marginTop: 4 }]}>{pack.title}</Text>
      </View>
      <Text style={[T.body, { marginTop: 16 }]}>
        {BLURB[pack.id] ?? ''} One payment, no subscription.
      </Text>
      {teaser ? (
        <View style={[styles.teaser, { borderColor: colour + '80' }]}>
          <Text style={[T.label, { color: colour }]}>A taste · Who am I?</Text>
          <Text style={[T.headline, { marginTop: 8, lineHeight: 25 }]}>{teaser.text}</Text>
        </View>
      ) : null}
      {note ? <Text style={[T.caption, { color: C.pink, marginTop: 12 }]}>{note}</Text> : null}
      <Button label={busy === 'buy' ? 'Opening the store…' : price ? `Unlock ${pack.title} · ${price}` : `Unlock ${pack.title}`} onPress={onBuy} disabled={!!busy} style={{ marginTop: 20 }} />
      <Button label={busy === 'restore' ? 'Checking…' : 'Restore purchases'} variant="ghost" onPress={onRestore} disabled={!!busy} style={{ marginTop: 6 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  art: { height: 168, borderRadius: R.md, overflow: 'hidden', backgroundColor: C.card, justifyContent: 'flex-end', padding: 18 },
  teaser: { marginTop: 16, padding: 16, borderRadius: R.md, borderWidth: 1, backgroundColor: C.card },
});
