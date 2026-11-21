import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from './Icon';
import { C, F, R } from './theme';

export type CheckPhase = 'idle' | 'checking' | 'right' | 'wrong';

/** How long "Checking" holds before the verdict. The same for right and wrong, so the wait gives nothing away. */
export const CHECK_MS = 1500;
/** The drumroll: light taps that speed up towards the verdict. */
export const CHECK_TICKS = [0, 550, 950, 1250];

const LABEL: Record<CheckPhase, string> = { idle: 'Check answer', checking: 'Checking', right: 'Correct!', wrong: 'Not quite' };
const ON_GREEN = '#062b18';
const ON_RED = '#2a070a';

/**
 * The answer button, with the 2019 app's suspense and payoff. While checking it breathes and a light
 * sweeps across it. Right: a tada (squash, wobble, bounce) with a green ring bursting outwards.
 * Wrong: it turns red and shakes. The screen owns the timing; this only shows the phase.
 * Every worklet here reads shared values and constants only (no JS calls), so it is safe on the UI thread.
 */
export function CheckButton({ phase, disabled, onPress }: { phase: CheckPhase; disabled?: boolean; onPress: () => void }) {
  const sweep = useSharedValue(0);
  const verdict = useSharedValue(0);
  const scale = useSharedValue(1);
  const tilt = useSharedValue(0);
  const shift = useSharedValue(0);
  const ring = useSharedValue(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    if (phase === 'checking') {
      sweep.set(0);
      verdict.set(0);
      ring.set(0);
      sweep.set(withTiming(1, { duration: CHECK_MS, easing: Easing.inOut(Easing.quad) }));
      scale.set(withRepeat(withSequence(withTiming(1.025, { duration: 380 }), withTiming(0.99, { duration: 380 })), -1, true));
      const t = setInterval(() => setDots((d) => (d + 1) % 4), 300);
      return () => { clearInterval(t); setDots(0); };
    }
    cancelAnimation(scale);
    if (phase === 'right') {
      verdict.set(withTiming(1, { duration: 140 }));
      // Animate.css "tada": squash, then grow and wobble, then settle.
      scale.set(withSequence(withTiming(0.9, { duration: 110 }), withTiming(1.1, { duration: 140 }), withDelay(280, withSpring(1, { damping: 8, stiffness: 180 }))));
      tilt.set(withSequence(withDelay(110, withTiming(-4, { duration: 70 })), withTiming(4, { duration: 70 }), withTiming(-4, { duration: 70 }), withTiming(4, { duration: 70 }), withTiming(0, { duration: 70 })));
      ring.set(withDelay(120, withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })));
    } else if (phase === 'wrong') {
      verdict.set(withTiming(1, { duration: 140 }));
      scale.set(withTiming(1, { duration: 120 }));
      shift.set(withSequence(
        withTiming(-12, { duration: 55 }), withTiming(12, { duration: 55 }), withTiming(-9, { duration: 55 }),
        withTiming(9, { duration: 55 }), withTiming(-4, { duration: 55 }), withTiming(0, { duration: 55 }),
      ));
    } else {
      scale.set(withTiming(1, { duration: 160 }));
      verdict.set(withTiming(0, { duration: 220 }));
      sweep.set(withTiming(0, { duration: 220 }));
    }
  }, [phase, sweep, verdict, scale, tilt, shift, ring]);

  const sweepStyle = useAnimatedStyle(() => ({ width: `${sweep.value * 100}%`, opacity: 1 - verdict.value }));
  const verdictStyle = useAnimatedStyle(() => ({ opacity: verdict.value }));
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shift.value }, { scale: scale.value }, { rotate: `${tilt.value}deg` }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value === 0 ? 0 : 1 - ring.value,
    transform: [{ scaleX: 1 + ring.value * 0.08 }, { scaleY: 1 + ring.value * 0.5 }],
  }));

  const busy = phase !== 'idle';
  const right = phase === 'right';
  const showVerdict = right || phase === 'wrong';
  const ink = right ? ON_GREEN : showVerdict ? ON_RED : C.text;
  return (
    <View>
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
      <Animated.View style={bodyStyle}>
        <Pressable
          onPress={onPress}
          disabled={disabled || busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || busy, busy: phase === 'checking' }}
          accessibilityLabel={LABEL[phase]}
          accessibilityLiveRegion="polite"
          style={({ pressed }) => [styles.base, { opacity: disabled && !busy ? 0.45 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <LinearGradient colors={[C.purple, C.magenta]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.sweep, sweepStyle]} />
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: right ? C.yes : C.no }, verdictStyle]} />
          <View style={styles.inner}>
            {showVerdict ? <Icon name={right ? 'check' : 'close'} size={20} color={ink} /> : null}
            <Text style={[styles.label, { color: ink }, right && styles.big]}>
              {LABEL[phase]}
              {phase === 'checking' ? '.'.repeat(dots).padEnd(3, ' ') : ''}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: R.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  sweep: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.22)' },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: R.pill, borderWidth: 3, borderColor: C.yes },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: F.semibold, fontSize: 16, color: C.text },
  big: { fontFamily: F.bold, fontSize: 17 },
});
