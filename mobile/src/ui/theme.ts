import type { PackId } from '../lib/game';

/** Tokens from the Figma file (Colour collection, mode Night). */
export const C = {
  bgBase: '#0e1b2f',
  bgDeep: '#070e1a',
  bgTop: '#13264a',
  card: '#16263f',
  raised: '#1e3354',
  stroke: '#2b4268',
  text: '#f4f6ff',
  textSecondary: '#aebbd3',
  textMuted: '#6f7f9c',
  purple: '#7b3fe4',
  magenta: '#d6249f',
  pink: '#f48cbf',
  cyan: '#9be8f2',
  yes: '#2ee58a',
  no: '#ff5a63',
  yesTint: '#2ee58a29',
  noTint: '#ff5a6329',
  purpleTint: '#7b3fe429',
  gold: '#ffc53d',
};

export const PACK_COLOUR: Record<PackId, string> = {
  starter: '#5ee6d0',
  twenties: '#c9f25c',
  worldcup: '#ffc53d',
  champions: '#7db2ff',
};

export const tint = (hex: string) => hex + '29';

export const F = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extrabold: 'Montserrat_800ExtraBold',
};

export const R = { sm: 10, md: 16, lg: 24, pill: 999 };

export const T = {
  display: { fontFamily: F.extrabold, fontSize: 34, color: C.text },
  title: { fontFamily: F.bold, fontSize: 24, color: C.text },
  headline: { fontFamily: F.bold, fontSize: 18, color: C.text },
  question: { fontFamily: F.medium, fontSize: 20, lineHeight: 30, color: C.text },
  body: { fontFamily: F.regular, fontSize: 15, lineHeight: 22, color: C.textSecondary },
  bodyStrong: { fontFamily: F.semibold, fontSize: 15, color: C.text },
  label: { fontFamily: F.bold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' as const, color: C.textMuted },
  caption: { fontFamily: F.medium, fontSize: 12, color: C.textSecondary },
  number: { fontFamily: F.extrabold, fontSize: 28, color: C.text },
  answer: { fontFamily: F.bold, fontSize: 22, letterSpacing: 1, color: C.text },
};
