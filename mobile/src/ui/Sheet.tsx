import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C } from './theme';

/**
 * Bottom sheet over a dimmed screen, as in the Clue sheet, Reveal and Unlock designs. Drag it down
 * (from anywhere on the sheet) or tap the dim to close. No border: on Android a hairline border
 * on rounded corners shows as a ragged edge.
 */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [drag] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) drag.setValue(0);
  }, [visible, drag]);

  const pan = useMemo(() =>
    PanResponder.create({
      // only take over for a clear downward drag, so buttons and taps inside still work
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
      onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110 || g.vy > 1.1) {
          Animated.timing(drag, { toValue: 800, duration: 180, useNativeDriver: true }).start(() => onClose());
        } else {
          Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
      onPanResponderTerminate: () => Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start(),
    }), [drag, onClose]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.dim} onPress={onClose} accessibilityLabel="Close" />
      <Animated.View {...pan.panHandlers} style={[styles.sheet, { paddingBottom: insets.bottom + 16, transform: [{ translateY: drag }] }]}>
        <View style={styles.handleHit}>
          <View style={styles.handle} />
        </View>
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, backgroundColor: '#070e1abf' },
  sheet: {
    backgroundColor: C.raised,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  handleHit: { paddingTop: 12, paddingBottom: 20, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.textMuted },
});
