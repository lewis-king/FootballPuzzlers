import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from './Icon';
import { C, F } from './theme';

export function NavBar({ title, right, onBack }: { title: string; right?: string; onBack?: () => void }) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.back}
      >
        <Icon name="back" size={20} color={C.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.right} numberOfLines={1}>{right ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: F.semibold, fontSize: 17, color: C.text },
  right: { width: 64, textAlign: 'right', fontFamily: F.medium, fontSize: 13, color: C.textSecondary },
});
