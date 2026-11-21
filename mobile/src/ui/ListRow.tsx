import { Pressable, StyleSheet, Switch, Text } from 'react-native';

import { Icon } from './Icon';
import { C, F, R } from './theme';

export function ListRow({ label, onPress, detail, toggle }: { label: string; onPress: () => void; detail?: string; toggle?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole={toggle === undefined ? 'button' : 'switch'} accessibilityState={toggle === undefined ? undefined : { checked: toggle }} style={({ pressed }) => [styles.row, pressed && { backgroundColor: C.raised }]}>
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {toggle === undefined ? (
        <Icon name="next" size={18} color={C.textMuted} />
      ) : (
        <Switch value={toggle} onValueChange={onPress} trackColor={{ false: C.stroke, true: C.purple }} thumbColor={C.text} ios_backgroundColor={C.stroke} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { height: 56, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.stroke, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, fontFamily: F.semibold, fontSize: 15, color: C.text },
  detail: { fontFamily: F.medium, fontSize: 13, color: C.textSecondary },
});
