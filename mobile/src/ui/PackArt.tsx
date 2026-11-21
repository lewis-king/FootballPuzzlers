import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { PackId } from '../lib/game';
import { F, PACK_COLOUR } from './theme';

export const PHOTOS: Partial<Record<PackId, number>> = {
  starter: require('../../assets/packs/starter.webp'),
  worldcup: require('../../assets/packs/worldcup.webp'),
  champions: require('../../assets/packs/champions.webp'),
  twenties: require('../../assets/packs/twenties.webp'),
};

/** The pack's photo with a dark fade for legible text, or a typographic card until a photo exists. */
export function PackArt({ pack }: { pack: PackId }) {
  const photo = PHOTOS[pack];
  return (
    <View style={StyleSheet.absoluteFill}>
      {photo ? (
        <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <LinearGradient colors={[PACK_COLOUR[pack], '#7b3fe4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill}>
          <Text style={styles.big}>20s</Text>
        </LinearGradient>
      )}
      <LinearGradient colors={['#070e1a00', '#070e1a66', '#070e1aee']} locations={[0.3, 0.6, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  big: { position: 'absolute', right: -14, top: 0, width: 220, textAlign: 'right', fontFamily: F.extrabold, fontSize: 96, color: '#ffffff30' },
});
