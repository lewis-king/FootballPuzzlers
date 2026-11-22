import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { clueAnswer, CLUES, cluesUsed, isCorrect, isNearMiss, MAX_CLUES, MAX_LETTERS, PACKS, questionById, revealedPrefix } from '../../lib/game';
import { Banner, maybeShowInterstitial } from '../../services/ads';
import { useProgress } from '../../state/progress';
import { isLocked, nextUnanswered, numberInPack, owns, packStats } from '../../state/selectors';
import { Button } from '../../ui/Button';
import { CHECK_MS, CHECK_TICKS, CheckButton, type CheckPhase } from '../../ui/CheckButton';
import { ClueSheet } from '../../ui/ClueSheet';
import { ClueBadge, ClueIcon } from '../../ui/ClueIcon';
import { NavBar } from '../../ui/NavBar';
import { maybeAskForRating } from '../../services/rate';
import { NotifySheet } from '../../ui/NotifySheet';
import { ProgressBar } from '../../ui/Progress';
import { RevealSheet } from '../../ui/RevealSheet';
import { Icon } from '../../ui/Icon';
import { Screen } from '../../ui/Screen';
import { C, F, PACK_COLOUR, R, T } from '../../ui/theme';

/** Short questions are set bigger so the card never looks empty. */
const SIZES = [{ fontSize: 26, lineHeight: 36 }, { fontSize: 22, lineHeight: 32 }, { fontSize: 20, lineHeight: 29 }, { fontSize: 18, lineHeight: 26 }, { fontSize: 16, lineHeight: 23 }];
const sizeFor = (text: string, shortScreen: boolean) => {
  const step = text.length < 80 ? 0 : text.length < 150 ? 1 : text.length < 230 ? 2 : 3;
  return SIZES[Math.min(SIZES.length - 1, step + (shortScreen ? 1 : 0))];
};

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Keyed by id so moving to the next question starts with fresh input state.
  return <QuestionBody key={id} id={Number(id)} />;
}

function QuestionBody({ id }: { id: number }) {
  const q = questionById(id);
  const { height } = useWindowDimensions();
  const answered = useProgress((s) => s.answered);
  const addGuess = useProgress((s) => s.addGuess);
  const purchased = useProgress((s) => s.purchased);
  const clueMask = useProgress((s) => (q ? s.clues[q.id] ?? 0 : 0));
  const letters = useProgress((s) => (q ? s.letters[q.id] ?? 0 : 0));
  const solve = useProgress((s) => s.solve);

  const [guess, setGuess] = useState(() => (q && letters ? revealedPrefix(q, letters) : ''));
  const [wrong, setWrong] = useState<'near' | 'miss' | null>(null);
  const [focused, setFocused] = useState(false);
  const [sheet, setSheet] = useState<'clues' | 'reveal' | 'notify' | null>(null);
  const [phase, setPhase] = useState<CheckPhase>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };
  const stats = packStats(q?.pack ?? 'starter', answered);

  // The new-pack alerts ask: once, the first time a player is 20 questions into any pack.
  useEffect(() => {
    const s = useProgress.getState();
    if (s.alerts !== 'unasked' || s.alertAsks > 0 || stats.solved < 20) return;
    const t = setTimeout(() => { s.markAlertAsked(); setSheet('notify'); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const pack = q && PACKS.find((p) => p.id === q.pack);
  if (!q || !pack || !owns(pack, purchased)) return <Redirect href="/" />;
  // A locked question (one after the question in play) sends you to the one in play instead.
  if (isLocked(q, answered) && stats.next) return <Redirect href={`/question/${stats.next.id}`} />;

  const solved = answered.includes(q.id);
  const colour = PACK_COLOUR[q.pack];
  const cluesLeft = MAX_CLUES - cluesUsed(clueMask);
  const lettersLeft = MAX_LETTERS - letters;

  // The 2019 app's suspense: "Checking" for a moment with a drumroll of light taps, then the verdict.
  // Right holds green briefly before the Correct screen; wrong shakes the field and hands it back.
  const check = () => {
    if (!guess.trim() || phase === 'checking' || phase === 'right') return;
    const right = isCorrect(guess, q);
    setWrong(null);
    setPhase('checking');
    addGuess(q.id);
    CHECK_TICKS.forEach((ms) => later(ms, () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})));
    later(CHECK_MS, () => {
      if (right) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setPhase('right');
        later(1000, () => {
          solve(q.id);
          maybeShowInterstitial();
          router.replace(`/correct?id=${q.id}`);
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setPhase('wrong');
        setWrong(isNearMiss(guess, q) ? 'near' : 'miss');
        shake.set(withSequence(
          withTiming(-10, { duration: 50 }), withTiming(10, { duration: 50 }),
          withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(0, { duration: 50 }),
        ));
        later(1200, () => setPhase((p) => (p === 'wrong' ? 'idle' : p)));
      }
    });
  };

  const locked = phase === 'checking' || phase === 'right';
  const next = nextUnanswered(q, answered);
  const revealed = CLUES.filter((_, i) => clueMask & (1 << i));

  return (
    <Screen glowTop={colour}>
      <NavBar title={`Question ${numberInPack(q)} of ${stats.total}`} right={pack.short} onBack={() => router.dismissTo(`/pack/${q.pack}`)} />
      <View style={{ marginTop: 4, marginBottom: 4 }}>
        <ProgressBar value={stats.total ? stats.solved / stats.total : 0} colour={colour} height={4} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Pulled out past the screen padding and padded back in, so the Check button's tada and ring
            aren't cut off at the scroll view's edges. */}
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={styles.scroll}>
          {/* Question v3 A (Figma 36:637): the card fills the space, the question centred in it, and
              two clue slots at the bottom that fill as clues are picked. */}
          <View style={[styles.card, phase === 'right' && { borderColor: C.yes, backgroundColor: C.yesTint }]}>
            <Text style={[T.label, { color: colour, textAlign: 'center' }]}>Who am I?</Text>
            <Text style={[T.question, sizeFor(q.text, height < 740), { textAlign: 'center' }]} selectable>{q.text}</Text>
            <View style={styles.slots}>
              {Array.from({ length: MAX_CLUES }, (_, i) => {
                const c = revealed[i];
                if (!c) {
                  return (
                    <Pressable key={i} onPress={() => !solved && !locked && setSheet('clues')} disabled={solved || locked}
                      accessibilityRole="button" accessibilityLabel="Pick a clue"
                      style={({ pressed }) => [styles.slot, styles.open, { transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
                      <Text style={styles.plus}>+</Text>
                    </Pressable>
                  );
                }
                const yes = clueAnswer(q, c.key);
                return (
                  <View key={c.key} accessibilityLabel={`${c.label}: ${yes ? 'yes' : 'no'}`}
                    style={[styles.slot, { borderColor: yes ? C.yes : C.no, backgroundColor: yes ? C.yesTint : C.noTint }]}>
                    <ClueIcon clue={c.key} size={28} color={C.text} />
                    <View style={styles.badge}><ClueBadge yes={yes} size={18} ring={C.card} /></View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Animated.View style={shakeStyle}>
              <TextInput
                value={solved ? q.answers[0] : guess}
                editable={!solved && phase !== 'checking' && phase !== 'right'}
                onChangeText={(t) => { setGuess(t); setWrong(null); if (phase === 'wrong') setPhase('idle'); }}
                onSubmitEditing={check}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Type the player's name"
                placeholderTextColor={C.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                returnKeyType="done"
                accessibilityLabel="Your answer"
                style={[styles.input, focused && { borderColor: C.purple }, wrong && { borderColor: C.no }, phase === 'right' && { borderColor: C.yes }, solved && { borderColor: colour }]}
              />
            </Animated.View>
            {wrong === 'near' ? (
              <View style={styles.near}>
                <Icon name="target" size={18} color={C.gold} />
                <Text style={[T.bodyStrong, { color: C.gold }]}>So close. Check the spelling.</Text>
              </View>
            ) : wrong ? <Text style={[T.caption, { color: C.no, marginTop: -4 }]}>Not this time. Try a clue, or reveal a letter.</Text> : null}

            {solved ? (
              <>
                <Text style={[T.caption, { color: colour, textAlign: 'center' }]}>You&apos;ve solved this one</Text>
                {next ? <Button label="Next question" onPress={() => maybeAskForRating(() => router.replace(`/question/${next.id}`))} /> : null}
                <Button label="Back to the pack" variant="secondary" onPress={() => router.dismissTo(`/pack/${q.pack}`)} />
              </>
            ) : (
              <>
                <View style={styles.help}>
                  <Button label="Clues" sub={`${cluesLeft} left`} variant="secondary" style={{ flex: 1 }} disabled={locked} onPress={() => setSheet('clues')} />
                  <Button label="Reveal a letter" sub={`${lettersLeft} left`} variant="secondary" style={{ flex: 1 }} disabled={locked} onPress={() => setSheet('reveal')} />
                </View>
                <CheckButton phase={phase} onPress={check} disabled={!guess.trim()} />
              </>
            )}
            <Banner />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ClueSheet visible={sheet === 'clues'} question={q} onClose={() => setSheet(null)} />
      <NotifySheet
        visible={sheet === 'notify'}
        onClose={() => setSheet(null)}
        body={`You're ${stats.solved} in. Packs take a while, so we'll send you a notification when a new one lands.`}
        footer={`${stats.solved} of ${stats.total} · ${pack.title}`}
      />
      <RevealSheet visible={sheet === 'reveal'} question={q} onClose={() => setSheet(null)} onReveal={(n) => setGuess(revealedPrefix(q, n))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, gap: 20, paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16 },
  card: { flex: 1, minHeight: 200, backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.stroke, padding: 22, alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  slots: { flexDirection: 'row', gap: 12 },
  slot: { width: 52, height: 52, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  open: { borderStyle: 'dashed', borderColor: C.stroke },
  plus: { fontFamily: F.medium, fontSize: 24, color: C.textMuted, marginTop: -2 },
  badge: { position: 'absolute', top: -6, right: -6 },
  input: { height: 68, borderRadius: R.md, borderWidth: 2, borderColor: C.stroke, backgroundColor: C.card, paddingHorizontal: 20, fontFamily: F.bold, fontSize: 22, color: C.text },
  help: { flexDirection: 'row', gap: 11 },
  near: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -2 },
});
