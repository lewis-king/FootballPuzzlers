import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { C } from './theme';

const COLOURS = ['#c9f25c', C.cyan, C.magenta, C.yes, '#7b3fe4', '#ffc53d'];
const { width, height } = Dimensions.get('window');

/** A short burst of confetti; skipped when the player has asked for reduced motion. */
export function Confetti({ count = 18 }: { count?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }, (_, i) => <Bit key={i} i={i} />)}
    </View>
  );
}

function Bit({ i }: { i: number }) {
  const t = useSharedValue(0);
  const seed = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  const x = seed(1) * width;
  // Every piece falls right past the bottom edge, so the burst clears instead of hanging mid-screen.
  const fall = height + 80 + seed(2) * 120;
  const spin = (seed(3) - 0.5) * 720;
  // Worked out here, not in the animated style: that runs on the UI thread, where calling a plain JS
  // function such as seed() crashes the app on a phone (the web build doesn't show it).
  const drift = (seed(6) - 0.5) * 60;
  useEffect(() => {
    t.set(withDelay(seed(4) * 400, withTiming(1, { duration: 2600 + seed(5) * 1400, easing: Easing.in(Easing.quad) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -40 + t.value * fall }, { translateX: drift * t.value }, { rotate: `${spin * t.value}deg` }],
  }));
  return <Animated.View style={[{ position: 'absolute', left: x, top: 0, width: 10, height: 16, borderRadius: 3, backgroundColor: COLOURS[i % COLOURS.length] }, style]} />;
}
