import Ionicons from '@expo/vector-icons/Ionicons';

const NAMES = {
  back: 'chevron-back',
  next: 'chevron-forward',
  settings: 'options-outline',
  lock: 'lock-closed',
  check: 'checkmark',
  close: 'close',
  copy: 'copy-outline',
  share: 'share-outline',
  bell: 'notifications-outline',
  trophy: 'trophy-outline',
  target: 'locate-outline',
  home: 'home-outline',
} as const;

export function Icon({ name, size = 20, color }: { name: keyof typeof NAMES; size?: number; color: string }) {
  return <Ionicons name={NAMES[name]} size={size} color={color} />;
}
