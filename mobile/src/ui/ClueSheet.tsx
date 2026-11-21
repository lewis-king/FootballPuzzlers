import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { clueAnswer, CLUES, cluesUsed, MAX_CLUES, Question } from '../lib/game';
import { useProgress } from '../state/progress';
import { Button } from './Button';
import { ClueBadge, ClueIcon } from './ClueIcon';
import { Sheet } from './Sheet';
import { C, F, R, T } from './theme';

/** Six yes/no clues, two per question. A third tap shakes the sheet (kept from 2019). */
export function ClueSheet({ visible, question, onClose }: { visible: boolean; question: Question; onClose: () => void }) {
  const mask = useProgress((s) => s.clues[question.id] ?? 0);
  const revealClue = useProgress((s) => s.revealClue);
  const used = cluesUsed(mask);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const tap = (key: (typeof CLUES)[number]['key']) => {
    if (revealClue(question.id, key)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    shake.set(withSequence(withTiming(-8, { duration: 50 }), withTiming(8, { duration: 50 }), withTiming(-5, { duration: 50 }), withTiming(0, { duration: 50 })));
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={T.title}>Pick two clues</Text>
      <Text style={[T.body, { marginTop: 6 }]}>Each clue is a yes or no about the player. You get two per question, so choose wisely.</Text>
      <Animated.View style={[styles.grid, shakeStyle]}>
        {CLUES.map((c, i) => {
          const shown = !!(mask & (1 << i));
          const yes = clueAnswer(question, c.key);
          const spent = !shown && used >= MAX_CLUES;
          const colour = shown ? (yes ? C.yes : C.no) : C.textSecondary;
          return (
            <Pressable
              key={c.key}
              onPress={() => tap(c.key)}
              accessibilityRole="button"
              accessibilityLabel={shown ? `${c.label}: ${yes ? 'yes' : 'no'}` : `Reveal ${c.label}`}
              style={({ pressed }) => [
                styles.chip,
                shown && { borderColor: colour, backgroundColor: yes ? C.yesTint : C.noTint },
                spent && { opacity: 0.4 },
                { transform: [{ scale: pressed && !shown ? 0.96 : 1 }] },
              ]}
            >
              <ClueIcon clue={c.key} size={36} color={C.text} />
              <Text style={[styles.chipText, { color: shown ? colour : C.text }]}>{c.label}</Text>
              {shown ? <View style={styles.badge}><ClueBadge yes={yes} size={22} ring={C.raised} /></View> : null}
            </Pressable>
          );
        })}
      </Animated.View>
      <Text style={[T.caption, { color: C.textMuted, marginTop: 14 }]}>English = born in England</Text>
      <Button label="Back to the question" onPress={onClose} style={{ marginTop: 20 }} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 20 },
  chip: { flexBasis: '30%', flexGrow: 1, height: 96, borderRadius: R.md, borderWidth: 1.5, borderColor: C.stroke, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', gap: 8 },
  chipText: { fontFamily: F.semibold, fontSize: 13 },
  badge: { position: 'absolute', top: 6, right: 6 },
});
