import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { C, F, R } from './theme';

type Props = {
  label: string;
  sub?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
};

export function Button({ label, sub, onPress, variant = 'primary', disabled, style, icon }: Props) {
  const press = () => {
    if (disabled) return;
    Haptics.selectionAsync().catch(() => {});
    onPress?.();
  };
  const content = (
    <View style={styles.inner}>
      {icon}
      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.label, variant === 'ghost' && { color: C.textSecondary }]}>{label}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
  return (
    <Pressable
      onPress={press}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' && styles.secondary,
        { opacity: disabled ? 0.45 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={[C.purple, C.magenta]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fill}>
          {content}
        </LinearGradient>
      ) : (
        <View style={styles.fill}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: R.pill, overflow: 'hidden' },
  secondary: { backgroundColor: C.raised, borderWidth: 1, borderColor: C.stroke },
  fill: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontFamily: F.semibold, fontSize: 16, color: C.text },
  sub: { fontFamily: F.medium, fontSize: 12, color: C.textSecondary, marginTop: 1 },
});
