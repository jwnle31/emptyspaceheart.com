import { type CSSProperties } from 'react';
import { type DeathlessPlayerTierClearCounts } from './hooks/useDeathlessData';
import type { PeerThreshold } from './peer';

export const PAGE_SIZE = 100;
export const GOLD_BERRIES_API_DOCS = 'https://goldberries.net/api-docs';

export const DIFFICULTY_COLORS: Record<number, string> = {
  26: '#bd60ff',
  25: '#d863ff',
  24: '#f266ff',
  2: '#ff68d9',
  3: '#ff6daa',
  23: '#ff6d79',
  4: '#ff7c70',
  5: '#ff9572',
  6: '#ffae75',
  7: '#ffc677',
  8: '#ffdd7a',
  9: '#fff47c',
  10: '#f4ff7f',
  11: '#d5ff82',
  12: '#b7ff84',
  14: '#9bff87',
  15: '#89ffb0',
  16: '#8cffe2',
  17: '#8eecff',
  22: '#91c8ff',
  18: '#93aeff',
  21: '#9696ff',
  20: '#ffffff',
  19: '#aaaaaa',
};

export type RankingMode = 'absolute' | 'peer';
export type PeerScoreFormat = 'percent' | 'fraction';

export type RankedPlayer = DeathlessPlayerTierClearCounts & {
  tierProfile: number[];
  peerScore: number;
  peerScoreKey: number;
  peerPossiblePoints: number;
  peerThresholds: PeerThreshold[];
  comparisonPeerScore?: number;
  comparisonPeerScoreKey?: number;
  comparisonPeerPossiblePoints?: number;
  rank: number;
  globalRank?: number;
};

export type DeathlessDisplayRow =
  | {
      rowType: 'separator';
      rowKey: string;
      label: string;
    }
  | (RankedPlayer & {
      rowType: 'row';
      rowKey: string;
      displayRank?: number;
      displayScope?: string;
      globalRank?: number;
      comparisonDisplayRank?: number;
      comparisonPeerScore?: number;
      comparisonPeerScoreKey?: number;
      comparisonPeerPossiblePoints?: number;
    });

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPeerPoints(pointsTwice: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(pointsTwice / 2);
}

export function peerPercentUnits(pointsTwice: number, possiblePoints: number, decimals: number) {
  const scale = 10 ** decimals;
  return possiblePoints > 0
    ? Math.floor((50 * pointsTwice * scale) / possiblePoints)
    : 0;
}

export function formatPeerPercent(pointsTwice: number, possiblePoints: number, decimals: number) {
  const scale = 10 ** decimals;
  return `${(peerPercentUnits(pointsTwice, possiblePoints, decimals) / scale).toFixed(decimals)}%`;
}

export function getPlayerAccentStyle(
  player: DeathlessPlayerTierClearCounts['player'],
) {
  const start = player.account?.name_color_start;
  const end = player.account?.name_color_end;

  if (!start) {
    return undefined;
  }

  if (!end || start === end) {
    return {
      '--swatch-start': start,
      '--swatch-end': start,
    } as CSSProperties;
  }

  return {
    '--swatch-start': start,
    '--swatch-end': end,
  } as CSSProperties;
}

export function getTierColor(tierId: number) {
  return DIFFICULTY_COLORS[tierId] ?? 'var(--theme-color-hover)';
}

export function formatTierLabel(tierName: string) {
  return tierName.startsWith('Tier ')
    ? `T${tierName.slice('Tier '.length)}`
    : tierName;
}

export function compareTierProfiles(left: number[], right: number[]) {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (right[index] ?? 0) - (left[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}
