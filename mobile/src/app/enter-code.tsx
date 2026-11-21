import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { decodeSave, SaveCodeError } from '../lib/saveCode';
import { useProgress } from '../state/progress';
import { summarise } from '../state/selectors';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { NavBar } from '../ui/NavBar';
import { Screen } from '../ui/Screen';
import { C, F, R, T } from '../ui/theme';

export default function EnterCode() {
  const [text, setText] = useState('');
  const answered = useProgress((s) => s.answered);
  const replaceWith = useProgress((s) => s.replaceWith);

  const result = useMemo(() => {
    if (text.replace(/[\s-]/g, '').length < 8) return null;
    try {
      return { save: decodeSave(text) };
    } catch (e) {
      return { error: e instanceof SaveCodeError ? e.message : "That code doesn't check out." };
    }
  }, [text]);

  const save = result && 'save' in result ? result.save : null;
  const lines = save ? summarise(save.answered) : [];
  const summary = lines.length
    ? lines.map((l, i) => (i === 0 ? `${l.solved} solved in ${l.pack.title}` : `${l.solved} in ${l.pack.title}`)).join(', ')
    : 'a fresh start, nothing solved yet';

  const load = () => {
    if (!save) return;
    replaceWith(save);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.dismissAll();
    router.replace('/');
  };

  return (
    <Screen glowTop={C.purple}>
      <NavBar title="Enter a save code" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 12 }}>
          <View style={{ gap: 14, marginTop: 8 }}>
            <Text style={T.body}>Paste the code from your other phone.</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="WHO-…"
              placeholderTextColor={C.textMuted}
              multiline
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              accessibilityLabel="Save code"
              style={[styles.input, save && { borderColor: C.yes }, result && 'error' in result && { borderColor: C.no }]}
            />
            {save ? (
              <View style={[styles.note, { backgroundColor: C.yesTint }]}>
                <Icon name="check" size={18} color={C.yes} />
                <Text style={[T.caption, { color: C.yes, flex: 1 }]}>Valid code: {summary}.</Text>
              </View>
            ) : null}
            {result && 'error' in result ? (
              <View style={[styles.note, { backgroundColor: C.noTint }]}>
                <Text style={[T.caption, { color: C.no, flex: 1 }]}>{result.error}</Text>
              </View>
            ) : null}
            {save && answered.length ? (
              <View style={styles.warn}>
                <Text style={[T.label, { color: C.no }]}>This replaces your progress</Text>
                <Text style={[T.caption, { color: C.text, lineHeight: 18, marginTop: 6 }]}>
                  This phone has {answered.length} question{answered.length === 1 ? '' : 's'} solved. Loading the code swaps them for the {save.answered.length} in the code. Purchases are not affected.
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{ gap: 6, marginTop: 20 }}>
            <Button label="Load this save" onPress={load} disabled={!save} />
            <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 120, borderRadius: R.md, borderWidth: 2, borderColor: C.purple, backgroundColor: C.card, padding: 18, fontFamily: F.bold, fontSize: 18, letterSpacing: 1.5, lineHeight: 28, color: C.text, textAlignVertical: 'top' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: R.sm + 2 },
  warn: { padding: 16, borderRadius: R.md, borderWidth: 1.5, borderColor: C.no, backgroundColor: C.noTint },
});
