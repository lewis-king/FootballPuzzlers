import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PackId } from '../lib/game';
import { PHOTOS } from './PackArt';
import { C } from './theme';

const glow = require('../../assets/fx/glow.png');

/** Night gradient with two soft glows (the Figma "aurora"), in the pack's colour at the top. */
export function Screen({ children, glowTop = '#5ee6d0', glowBottom = C.magenta, style, photo, photoHeight = 320 }: {
  children: ReactNode; glowTop?: string; glowBottom?: string; style?: ViewStyle;
  /** the pack's photo behind the top of the screen, fading into the night (Pack v2, Pack complete v2) */
  photo?: PackId; photoHeight?: number;
}) {
  const src = photo ? PHOTOS[photo] : undefined;
  return (
    <View style={styles.root}>
      <LinearGradient colors={[C.bgTop, C.bgBase, C.bgDeep]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <Image source={glow} tintColor={glowTop} style={[styles.glow, { top: -260, left: -260, opacity: 0.55 }]} />
      <Image source={glow} tintColor={glowBottom} style={[styles.glow, { bottom: -300, right: -300, opacity: 0.45 }]} />
      {src ? (
        <View style={[styles.photo, { height: photoHeight }]} pointerEvents="none">
          <Image source={src} style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} contentFit="cover" />
          <LinearGradient colors={[C.bgTop + '26', C.bgTop + 'cc', C.bgBase]} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
        </View>
      ) : null}
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom']}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  glow: { position: 'absolute', width: 640, height: 640 },
  safe: { flex: 1, paddingHorizontal: 24 },
  photo: { position: 'absolute', top: 0, left: 0, right: 0 },
});
