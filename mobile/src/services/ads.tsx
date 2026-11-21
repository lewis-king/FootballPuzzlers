// Web preview and tests: no ads. The native implementation is ads.native.tsx.
import { Text, View } from 'react-native';

export async function startAds() {}
export async function showRewarded(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600));
  return true;
}
export function maybeShowInterstitial() {}
export function Banner() {
  return (
    <View style={{ height: 50, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#2b4268', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#6f7f9c', fontSize: 12 }}>Banner ad</Text>
    </View>
  );
}
