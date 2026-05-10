import { type CSSProperties } from 'react';
import { type DeathlessPlayerTierClearCounts } from './useDeathlessData';

export const PAGE_SIZE = 100;
export const GOLD_BERRIES_API_DOCS = 'https://goldberries.net/api-docs';
export const SCORE_SCALE = 1_000_000;
export const DISPLAY_POINT_BASE = 100;

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

export type RankingMode = 'absolute' | 'weighted';

export type ProfileSummaryEntry = {
  tierWeight: number;
  tierId: number;
  tierName: string;
  clears: number;
  tooltip: string;
};

export type RankedPlayer = DeathlessPlayerTierClearCounts & {
  tierProfile: number[];
  weightedScore: number;
  weightedScoreKey: number;
  rank: number;
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
    });

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
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

export function buildTierWeights(
  tiers: { id: number; sort: number }[],
  globalCounts: Record<string, number>,
): Map<number, { cumulativeShare: number; weight: number }> {
  const orderedTiers = tiers
    .filter((tier) => tier.sort > 0)
    .sort((left, right) => left.sort - right.sort);

  const totalClears = orderedTiers.reduce(
    (sum, tier) => sum + (globalCounts[String(tier.id)] ?? 0),
    0,
  );

  if (totalClears === 0) {
    return new Map<number, { cumulativeShare: number; weight: number }>();
  }

  const rawWeights = orderedTiers.map((tier) => {
    const cumulativeClears = orderedTiers
      .filter((nextTier) => nextTier.sort >= tier.sort)
      .reduce(
        (sum, nextTier) => sum + (globalCounts[String(nextTier.id)] ?? 0),
        0,
      );
    const cumulativeShare = cumulativeClears / totalClears;
    const rawWeight = cumulativeShare > 0 ? 1 / cumulativeShare : 0;

    return {
      tierId: tier.id,
      cumulativeShare,
      rawWeight,
    };
  });

  const meanRawWeight =
    rawWeights.reduce((sum, entry) => sum + entry.rawWeight, 0) /
    rawWeights.length;

  const weights = new Map<number, { cumulativeShare: number; weight: number }>();

  rawWeights.forEach((entry) => {
    weights.set(entry.tierId, {
      cumulativeShare: entry.cumulativeShare,
      weight: meanRawWeight > 0 ? entry.rawWeight / meanRawWeight : 0,
    });
  });

  return weights;
}

export function scorePlayer(
  playerClears: Record<string, number>,
  tiers: { id: number }[],
  tierWeights: Map<number, { cumulativeShare: number; weight: number }>,
  scale: number,
) {
  const score = tiers.reduce((sum, tier) => {
    const clears = playerClears[String(tier.id)] ?? 0;
    if (clears === 0) {
      return sum;
    }

    const weight = tierWeights.get(tier.id)?.weight ?? 0;

    return sum + clears * weight;
  }, 0);

  return {
    score,
    scoreKey: Math.round(score * scale),
  };
}

export function getProfileSummary(
  tierProfile: number[],
  rankingTiers: { id: number; name: string; sort: number }[],
  tierWeights: Map<number, { cumulativeShare: number; weight: number }>,
) {
  return rankingTiers
    .map<ProfileSummaryEntry>((tier, index) => ({
      tierId: tier.id,
      tierName: tier.name,
      clears: tierProfile[index] ?? 0,
      tierWeight: tierWeights.get(tier.id)?.weight ?? 0,
      tooltip: '',
    }))
    .filter((entry) => entry.clears > 0);
}

export function getProfilePreviewMetrics(
  preview: ProfileSummaryEntry[],
  weightedScale: number,
) {
  if (preview.length === 0) {
    return null;
  }

  return preview.map((entry: ProfileSummaryEntry) => ({
    ...entry,
    color: getTierColor(entry.tierId),
    tooltip: `${formatNumber(Math.round(entry.tierWeight * weightedScale))} × ${formatNumber(entry.clears)} = ${formatNumber(Math.round(entry.tierWeight * entry.clears * weightedScale))}`,
  }));
}
