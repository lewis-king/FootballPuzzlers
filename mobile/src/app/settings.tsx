import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { encodeSave } from '../lib/saveCode';
import { SITE, SUPPORT_EMAIL } from '../services/config';
import { disableAlerts, enableAlerts } from '../services/alerts';
import { restore } from '../services/purchases';
import { saveOf, useProgress } from '../state/progress';
import { Button } from '../ui/Button';
import { ListRow } from '../ui/ListRow';
import { NavBar } from '../ui/NavBar';
import { Screen } from '../ui/Screen';
import { C, F, R, T } from '../ui/theme';

export default function Settings() {
  const answered = useProgress((s) => s.answered);
  const clues = useProgress((s) => s.clues);
  const letters = useProgress((s) => s.letters);
  const streak = useProgress((s) => s.streak);
  const setPurchased = useProgress((s) => s.setPurchased);
  const alerts = useProgress((s) => s.alerts);
  const setAlerts = useProgress((s) => s.setAlerts);
  const [alertNote, setAlertNote] = useState('');
  const code = useMemo(() => encodeSave(saveOf({ answered, clues, letters, streak })), [answered, clues, letters, streak]);
  const [copied, setCopied] = useState(false);
  const [restoreNote, setRestoreNote] = useState('');

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const onRestore = async () => {
    setRestoreNote('Checking…');
    const r = await restore((sku) => setPurchased([sku]));
    setRestoreNote(!r.ok ? "Couldn't reach the store" : r.found.length ? `Restored ${r.found.length}` : 'Nothing to restore');
  };
  const toggleAlerts = async () => {
    setAlertNote('');
    if (alerts === 'on') {
      setAlerts('off');
      await disableAlerts();
      return;
    }
    const ok = await enableAlerts();
    setAlerts(ok ? 'on' : 'off');
    if (!ok) setAlertNote('Allow notifications for this app in your phone settings');
  };
  const rate = async () => {
    if (await StoreReview.hasAction()) StoreReview.requestReview().catch(() => {});
    else {
      const url = StoreReview.storeUrl();
      if (url) Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <Screen glowTop={C.purple}>
      <NavBar title="Settings" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24, gap: 12 }}>
        <View style={styles.codeCard}>
          <Text style={[T.label, { color: C.magenta }]}>Your save code</Text>
          <Text style={styles.code} selectable numberOfLines={6} adjustsFontSizeToFit>{code}</Text>
          <Text style={[T.caption, { lineHeight: 18 }]}>
            Paste this into Football Who Am I on another phone to carry on where you left off. It updates as you play.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <Button label={copied ? 'Copied' : 'Copy code'} onPress={copy} style={{ flex: 1 }} />
            <Button label="Enter a code" variant="secondary" onPress={() => router.push('/enter-code')} style={{ flex: 1 }} />
          </View>
        </View>
        <View style={{ gap: 10, marginTop: 8 }}>
          <ListRow label="How to play" onPress={() => router.push('/how-to-play')} />
          <ListRow label="New pack alerts" toggle={alerts === 'on'} onPress={toggleAlerts} />
          {alertNote ? <Text style={[T.caption, { color: C.pink, marginTop: -4, marginLeft: 4 }]}>{alertNote}</Text> : null}
          <ListRow label="Restore purchases" detail={restoreNote} onPress={onRestore} />
          <ListRow label="Contact us" onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Football%20Who%20Am%20I`).catch(() => {})} />
          <ListRow label="Rate the app" onPress={rate} />
          <ListRow label="Privacy policy" onPress={() => Linking.openURL(`${SITE}/privacy`).catch(() => {})} />
          <ListRow label="Terms of use" onPress={() => Linking.openURL(`${SITE}/terms`).catch(() => {})} />
        </View>
        <Text style={[T.caption, { color: C.textMuted, textAlign: 'center', marginTop: 20 }]}>
          Version {Constants.expoConfig?.version} · Questions correct as of December 2026
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeCard: { marginTop: 8, padding: 18, gap: 10, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.purple, backgroundColor: C.card },
  code: { fontFamily: F.bold, fontSize: 19, letterSpacing: 1.5, lineHeight: 30, color: C.text },
});
