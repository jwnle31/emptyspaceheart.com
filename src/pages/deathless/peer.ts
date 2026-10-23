function lowerBound(sorted: number[], value: number) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] < value) low = middle + 1;
    else high = middle;
  }
  return low;
}

function upperBound(sorted: number[], value: number) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] <= value) low = middle + 1;
    else high = middle;
  }
  return low;
}

export type PeerThreshold = {
  cumulative: number;
  standing: number | null;
};

export type PeerScore = { key: number; percent: number; thresholds: PeerThreshold[] };

// Profiles contain exact tier counts, ordered from hardest to easiest.
// Zero-clear profiles are excluded from the comparison population, but keep
// a zero score so callers can display them when requested.
export function scorePeerProfiles(profiles: number[][]): PeerScore[] {
  if (profiles.length === 0) return [];
  const cumulative = profiles.map((profile) => {
    let count = 0;
    return profile.map((clears) => {
      count += clears;
      return count;
    });
  });
  const eligible = cumulative.filter((profile) => profile[profile.length - 1] > 0);
  const population = eligible.length;
  if (population === 0) return profiles.map((profile) => ({
    key: 0,
    percent: 0,
    thresholds: profile.map(() => ({ cumulative: 0, standing: null })),
  }));

  const distributions = profiles[0].map((_, tierIndex) =>
    eligible.map((profile) => profile[tierIndex]).sort((a, b) => a - b),
  );
  const activeThresholds = distributions.filter(
    (distribution) => distribution[distribution.length - 1] > 0,
  );
  return cumulative.map((profile) => {
    if (profile[profile.length - 1] === 0) return {
      key: 0,
      percent: 0,
      thresholds: profile.map((cumulative) => ({ cumulative, standing: null })),
    };
    let key = 0;
    const thresholds = profile.map((clears, tierIndex) => {
      const distribution = distributions[tierIndex];
      if (distribution[distribution.length - 1] === 0 || population < 2) {
        return { cumulative: clears, standing: null };
      }
      const fewer = lowerBound(distribution, clears);
      const tiedOtherPlayers = upperBound(distribution, clears) - fewer - 1;
      const pointsTwice = 2 * fewer + tiedOtherPlayers;
      key += pointsTwice;
      return {
        cumulative: clears,
        standing: (100 * pointsTwice) / (2 * (population - 1)),
      };
    });
    return {
      key,
      percent: population > 1
        ? (100 * key) / (2 * (population - 1) * activeThresholds.length)
        : 0,
      thresholds,
    };
  });
}
