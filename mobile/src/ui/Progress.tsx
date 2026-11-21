import { View } from 'react-native';

export function ProgressBar({ value, colour, track = '#ffffff26', height = 6 }: { value: number; colour: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: colour }} />
    </View>
  );
}
