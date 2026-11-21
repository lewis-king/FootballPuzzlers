import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import type { ClueKey } from '../lib/game';

/**
 * The six clue icons (Figma "Clue icon" 36:534, sources in design/art/icons/). Positions are a pitch
 * attacking to the right with the player's zone filled; Retired is an hourglass; English is the
 * St George's cross, always in its own colours.
 */
export function ClueIcon({ clue, size = 24, color }: { clue: ClueKey; size?: number; color: string }) {
  if (clue === 'ENG') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Rect x={2.5} y={5} width={19} height={14} rx={2.5} fill="#ffffff" />
        <Path d="M10.4 5h3.2v14h-3.2zM2.5 10.4h19v3.2h-19z" fill="#ce1124" />
      </Svg>
    );
  }
  const stroke = { stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  if (clue === 'RET') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M6.5 2.5h11M6.5 21.5h11" {...stroke} />
        <Path d="M8 2.5v2.6c0 1.5.7 2.9 1.9 3.8L12 10.5l2.1-1.6A4.8 4.8 0 0 0 16 5.1V2.5" {...stroke} />
        <Path d="M8 21.5v-2.6c0-1.5.7-2.9 1.9-3.8L12 13.5l2.1 1.6c1.2.9 1.9 2.3 1.9 3.8v2.6" {...stroke} />
        <Path d="M9.3 20.2c.4-1.6 1.3-2.6 2.7-3.2 1.4.6 2.3 1.6 2.7 3.2z" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G opacity={0.5}>
        <Path d="M12 5v14" {...stroke} strokeWidth={1.3} />
        <Circle cx={12} cy={12} r={2.6} {...stroke} strokeWidth={1.3} />
        <Path d="M1.8 9h2.8v6H1.8M22.2 9h-2.8v6h2.8" {...stroke} strokeWidth={1.3} />
      </G>
      {clue === 'GK' ? <Rect x={1.8} y={9} width={2.8} height={6} fill={color} /> : null}
      {clue === 'DEF' ? <Path d="M4.2 5h4.2v14H4.2a2.4 2.4 0 0 1-2.4-2.4V7.4A2.4 2.4 0 0 1 4.2 5z" fill={color} /> : null}
      {clue === 'MID' ? <Rect x={8.6} y={5} width={6.8} height={14} fill={color} /> : null}
      {clue === 'FWD' ? <Path d="M15.6 5h4.2a2.4 2.4 0 0 1 2.4 2.4v9.2a2.4 2.4 0 0 1-2.4 2.4h-4.2z" fill={color} /> : null}
      <Rect x={1.8} y={5} width={20.4} height={14} rx={2.4} {...stroke} />
    </Svg>
  );
}

/** The ✓ / ✗ badge on a revealed clue. */
export function ClueBadge({ yes, size = 20, ring }: { yes: boolean; size?: number; ring: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={yes ? '#2ee58a' : '#ff5a63'} stroke={ring} strokeWidth={2} />
      {yes ? (
        <Path d="M7.5 12.4l3 3 6-6.4" stroke="#062b18" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <Path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#2a070a" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}
