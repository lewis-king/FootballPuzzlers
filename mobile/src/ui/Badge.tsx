import { StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { F } from './theme';

export function Badge({ label, lock, colour = '#f4f6ff' }: { label: string; lock?: boolean; colour?: string }) {
  return (
    <View style={styles.badge}>
      {lock ? <Icon name="lock" size={12} color={colour} /> : null}
      <Text style={[styles.text, { color: colour }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#070e1aa6' },
  text: { fontFamily: F.bold, fontSize: 12, letterSpacing: 1 },
});
