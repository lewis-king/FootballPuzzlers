import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { enableAlerts } from '../services/alerts';
import { useProgress } from '../state/progress';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { C, T } from './theme';

/**
 * "Want to know when the next pack drops?" Only "Notify me" brings up the system prompt, so a
 * player who isn't interested never burns the one-shot iOS permission dialog.
 */
export function NotifySheet({ visible, onClose, body, footer }: {
  visible: boolean; onClose: () => void; body: string; footer?: string;
}) {
  const setAlerts = useProgress((s) => s.setAlerts);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const yes = async () => {
    setBusy(true);
    const ok = await enableAlerts();
    setBusy(false);
    setAlerts(ok ? 'on' : 'off');
    if (ok) onClose();
    else setNote('Notifications are turned off for this app. You can allow them in your phone settings.');
  };
  const no = () => {
    if (useProgress.getState().alerts === 'unasked') setAlerts('off');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={no}>
      <View style={styles.badge}><Icon name="bell" size={26} color={C.purple} /></View>
      <Text style={[T.title, { marginTop: 18 }]}>Want to know when the next pack drops?</Text>
      <Text style={[T.body, { marginTop: 8 }]}>{body}</Text>
      {footer ? <Text style={[T.bodyStrong, { fontSize: 14, marginTop: 16 }]}>{footer}</Text> : null}
      <Text style={[T.caption, { color: C.textMuted, marginTop: footer ? 4 : 14 }]}>You can turn this off in Settings.</Text>
      {note ? <Text style={[T.caption, { color: C.pink, marginTop: 12 }]}>{note}</Text> : null}
      <Button label={busy ? 'Just a sec…' : 'Notify me'} onPress={yes} disabled={busy} style={{ marginTop: 20 }} />
      <Button label="Not now" variant="ghost" onPress={no} style={{ marginTop: 6 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.purpleTint, alignItems: 'center', justifyContent: 'center' },
});
