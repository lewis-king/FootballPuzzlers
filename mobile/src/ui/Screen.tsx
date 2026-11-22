import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PackId } from '../lib/game';
import { PHOTOS } from './PackArt';
import { C } from './theme';

const glow = require('../../assets/fx/glow.png');

/** The widest the content gets (tablets): about a large phone's width plus the side padding. */
export const MAX_WIDTH = 520;

/** Night gradient with two soft glows (the Figma "aurora"), in the pack's colour at the top. */
export function Screen({ children, glowTop = '#5ee6d0', glowBottom = C.magenta, style, photo, photoHeight = 320 }: {
  children: ReactNode; glowTop?: string; glowBottom?: string; style?: ViewStyle;
  /** the pack's photo behind the top of the screen, fading into the night (Pack v2, Pack complete v2) */
  photo?: PackId; photoHeight?: number;
}) {
  const src = photo ? PHOTOS[photo] : undefined;
  return (
    <View style={styles.root}>
      {/* With a photo, it sits under the night gradient, which starts see-through and turns solid
          lower down, so the photo melts into the background with no edge (a gradient drawn on the
          photo's own box left a hard line through the second row of tiles). */}
      {src ? (
        <View style={[styles.photo, { height: photoHeight + 160 }]} pointerEvents="none">
          <Image source={src} style={[StyleSheet.absoluteFill, { opacity: 0.55 }]} contentFit="cover" />
        </View>
      ) : null}
      <LinearGradient
        colors={src ? [C.bgTop + '59', C.bgTop + 'b3', C.bgTop, C.bgBase, C.bgDeep] : [C.bgTop, C.bgBase, C.bgDeep]}
        locations={src ? [0, 0.2, 0.42, 0.62, 1] : [0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Image source={glow} tintColor={glowTop} style={[styles.glow, { top: -260, left: -260, opacity: 0.55 }]} />
      <Image source={glow} tintColor={glowBottom} style={[styles.glow, { bottom: -300, right: -300, opacity: 0.45 }]} />
      {/* On a tablet the content keeps a phone-like column, centred, with the background full width;
          stretched to an iPad's width the tiles and text looked lost (Nov 2026). */}
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'bottom']}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgBase },
  glow: { position: 'absolute', width: 640, height: 640 },
  safe: { flex: 1, paddingHorizontal: 24, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  photo: { position: 'absolute', top: 0, left: 0, right: 0 },
});
