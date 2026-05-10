import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IconTrophy } from '@tabler/icons-react';
import SEO from '../components/SEO';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  useDeathlessData,
  type DeathlessPlayerTierClearCounts,
} from './deathless/useDeathlessData';
import styles from './Deathless.module.css';

const PAGE_SIZE = 100;
const GOLD_BERRIES_API_DOCS = 'https://goldberries.net/api-docs';
const SCORE_SCALE = 1_000_000;
const DISPLAY_POINT_BASE = 100;

const DIFFICULTY_COLORS: Record<number, string> = {
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

type RankingMode = 'absolute' | 'weighted';

type ProfileSummaryEntry = {
  tierWeight: number;
  tierId: number;
  tierName: string;
  clears: number;
  tooltip: string;
};

type RankedPlayer = DeathlessPlayerTierClearCounts & {
  tierProfile: number[];
  weightedScore: number;
  weightedScoreKey: number;
  rank: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}


function Latex({
  expression,
  displayMode = false,
  className,
}: {
  expression: string;
  displayMode?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        displayMode,
        throwOnError: false,
        output: 'html',
      }),
    [displayMode, expression],
  );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function getPlayerAccentStyle(player: DeathlessPlayerTierClearCounts['player']) {
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

function getPlayerAccentClassName(
  player: DeathlessPlayerTierClearCounts['player'],
) {
  const start = player.account?.name_color_start;
  const end = player.account?.name_color_end;

  if (!start || !end || start === end) {
    return styles['player-swatch'];
  }

  return `${styles['player-swatch']} ${styles['player-swatch-gradient']}`;
}

function getTierColor(tierId: number) {
  return DIFFICULTY_COLORS[tierId] ?? 'var(--theme-color-hover)';
}

function formatTierLabel(tierName: string) {
  return tierName.startsWith('Tier ')
    ? `T${tierName.slice('Tier '.length)}`
    : tierName;
}

function compareTierProfiles(left: number[], right: number[]) {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const diff = (right[index] ?? 0) - (left[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function buildTierWeights(
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

function scorePlayer(
  playerClears: Record<string, number>,
  tiers: { id: number }[],
  tierWeights: Map<number, { cumulativeShare: number; weight: number }>,
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
    scoreKey: Math.round(score * SCORE_SCALE),
  };
}

function getProfileSummary(
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

function getProfilePreviewMetrics(
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

function ProfileFingerprint({
  preview,
}: {
  preview: ReturnType<typeof getProfilePreviewMetrics>;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!preview) {
    return null;
  }

  const visibleEntries = expanded ? preview : preview.slice(0, 5);
  const canToggle = preview.length > 5;

  return (
    <div className={styles['profile-fingerprint-shell']}>
      <div className={styles['profile-fingerprint-row']}>
        {visibleEntries.map((entry) => (
          <div
            key={entry.tierId}
            className={styles['profile-fingerprint-pill']}
            style={{ '--band-color': entry.color } as CSSProperties}
            title={entry.tooltip}
          >
            <span className={styles['profile-fingerprint-tier']}>
              {formatTierLabel(entry.tierName)}
            </span>
            <span className={styles['profile-fingerprint-count']}>
              x {formatNumber(entry.clears)}
            </span>
          </div>
        ))}
        {canToggle && (
          <button
            type="button"
            className={styles['profile-details']}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse profile' : 'Expand profile'}
            title={expanded ? 'Collapse profile' : 'Expand profile'}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </div>
    </div>
  );
}
function Pagination({
  currentPage,
  pageCount,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className={styles.pagination}>
      <button type="button" onClick={onPrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        Page {currentPage} of {pageCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === pageCount}
      >
        Next
      </button>
    </div>
  );
}

function Deathless() {
  const { tiers, players, globalCounts, loading, error } = useDeathlessData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [includeZeroes, setIncludeZeroes] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 40rem)');

    const updateLayout = () => {
      setIsMobileLayout(mediaQuery.matches);
    };

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => {
      mediaQuery.removeEventListener('change', updateLayout);
    };
  }, []);

  const selectedModeValue = searchParams.get('mode') ?? 'absolute';
  const rankingMode: RankingMode =
    selectedModeValue === 'weighted' ? 'weighted' : 'absolute';

  const currentPageParam = Number(searchParams.get('page') ?? '1');
  const currentPage =
    Number.isFinite(currentPageParam) && currentPageParam > 0 ? currentPageParam : 1;

  const rankingTiers = useMemo(
    () =>
      tiers
        .filter((tier) => tier.sort > 0)
        .sort((left, right) => right.sort - left.sort),
    [tiers],
  );

  const weightedTierScores = useMemo(
    () => buildTierWeights(rankingTiers, globalCounts),
    [globalCounts, rankingTiers],
  );

  const weightedDisplayScale = useMemo(() => {
    const tierWeights = Array.from(weightedTierScores.values())
      .map((entry) => entry.weight)
      .filter((value) => value > 0);

    if (tierWeights.length === 0) {
      return 0;
    }

    const minimumWeight = Math.min(...tierWeights);
    return minimumWeight > 0 ? DISPLAY_POINT_BASE / minimumWeight : 0;
  }, [weightedTierScores]);

  const rankedPlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = players
      .map<RankedPlayer>((entry) => {
        const tierProfile = rankingTiers.map(
          (tier) => entry.clears[String(tier.id)] ?? 0,
        );
        const weightedScoreResult =
          rankingMode === 'weighted'
            ? scorePlayer(entry.clears, rankingTiers, weightedTierScores)
            : { score: 0, scoreKey: 0 };

        return {
          ...entry,
          tierProfile,
          weightedScore: weightedScoreResult.score,
          weightedScoreKey: weightedScoreResult.scoreKey,
          rank: 0,
        };
      })
      .filter((entry) => includeZeroes || entry.total > 0)
      .filter((entry) =>
        entry.player.name.toLowerCase().includes(normalizedSearch),
      )
      .sort((left, right) => {
        if (rankingMode === 'weighted') {
          const scoreDiff = right.weightedScoreKey - left.weightedScoreKey;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return (
            right.total - left.total ||
            compareTierProfiles(left.tierProfile, right.tierProfile) ||
            left.player.name.localeCompare(right.player.name)
          );
        }

        const tierDiff = compareTierProfiles(left.tierProfile, right.tierProfile);
        if (tierDiff !== 0) {
          return tierDiff;
        }

        return (
          right.total - left.total ||
          left.player.name.localeCompare(right.player.name)
        );
      });

    return filtered.reduce<RankedPlayer[]>((result, entry, index) => {
      const previous = result[result.length - 1];
      const isTie =
        previous &&
        (rankingMode === 'weighted'
          ? previous.weightedScoreKey === entry.weightedScoreKey
          : previous.total === entry.total &&
            previous.tierProfile.length === entry.tierProfile.length &&
            previous.tierProfile.every(
              (value, valueIndex) => value === entry.tierProfile[valueIndex],
            ));

      result.push({
        ...entry,
        rank: isTie ? previous.rank : index + 1,
      });

      return result;
    }, []);
  }, [includeZeroes, players, rankingMode, rankingTiers, search, weightedTierScores]);

  const pageCount = Math.max(1, Math.ceil(rankedPlayers.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, pageCount);
  const pageStart =
    rankedPlayers.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(rankedPlayers.length, effectivePage * PAGE_SIZE);
  const pageRows = rankedPlayers.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE,
  );

  const profileSummaries = useMemo(
    () =>
      new Map(
        pageRows.map((row) => [
          row.player.id,
          getProfileSummary(row.tierProfile, rankingTiers, weightedTierScores),
        ]),
      ),
    [pageRows, rankingTiers, weightedTierScores],
  );

  const totalClears = useMemo(
    () => players.reduce((sum, entry) => sum + entry.total, 0),
    [players],
  );

  const updateSearchParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.set(key, value);
    });

    setSearchParams(nextParams, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams({
      page: String(nextPage),
    });
  };

  const handleModeChange = (nextMode: RankingMode) => {
    updateSearchParams({
      mode: nextMode,
      page: '1',
    });
  };

  return (
    <>
      <SEO
        title="Deathless"
        description="Goldberries deathless challenge rankings by tier profile"
      />
      <section className={styles.page}>
        <div className={styles.heading}>
          <div>
            <h2>Deathless Challenge</h2>
          </div>
          <a
            className={styles['docs-link']}
            href={GOLD_BERRIES_API_DOCS}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Goldberries API docs"
          >
            <IconTrophy size={16} />
          </a>
        </div>

        <div className={styles.controls}>
          <div className={styles['controls-row']}>
            <div className={styles['mode-filter']}>
              <span>Ranking</span>
              <div
                className={styles['display-toggle']}
                role="tablist"
                aria-label="Ranking mode"
              >
                <button
                  type="button"
                  className={
                    rankingMode === 'absolute'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleModeChange('absolute');
                  }}
                >
                  Absolute
                </button>
                <button
                  type="button"
                  className={
                    rankingMode === 'weighted'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleModeChange('weighted');
                  }}
                >
                  Weighted
                </button>
              </div>
            </div>

            <label className={styles.control}>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  handlePageChange(1);
                }}
                placeholder="Player name"
              />
            </label>

            <label className={styles['toggle-control']}>
              <input
                type="checkbox"
                checked={includeZeroes}
                onChange={(event) => {
                  setIncludeZeroes(event.target.checked);
                  handlePageChange(1);
                }}
              />
              <span>Include zeroes</span>
            </label>
          </div>
        </div>

        <div className={styles.summary}>
          {loading
            ? 'Loading deathless rankings...'
            : rankedPlayers.length > 0
              ? `${formatNumber(pageStart)}-${formatNumber(
                  pageEnd,
                )} of ${formatNumber(rankedPlayers.length)} players | ${rankingMode === 'absolute' ? 'Absolute' : 'Weighted'} ranking | ${formatNumber(
                  totalClears,
                )} total clears`
              : 'No players match this filter.'}
        </div>

        <p className={styles.description}>
          {rankingMode === 'absolute'
            ? 'Absolute mode ranks players by the full tier-clear profile, from higher tiers down.'
            : 'Weighted mode defines a tier weight from the cumulative global tail probability at or above that tier, then scores each player by the linear sum of their tier clears multiplied by those weights. The weighting is data-driven and parameter-free aside from display scaling, so the score surface shifts as the underlying tier distribution changes.'}
        </p>

        {error ? (
          <p className={styles.message}>{error}</p>
        ) : (
          <>
            {pageCount > 1 && rankedPlayers.length > 0 && (
              <Pagination
                currentPage={effectivePage}
                pageCount={pageCount}
                onPrevious={() => {
                  handlePageChange(Math.max(1, effectivePage - 1));
                }}
                onNext={() => {
                  handlePageChange(Math.min(pageCount, effectivePage + 1));
                }}
              />
            )}

            <div className={styles['table-wrapper']}>
              <table>
                <thead>
                  <tr>
                    <th className={styles['rank-head']}>#</th>
                    <th className={styles['player-head']}>Player</th>
                    {rankingMode === 'weighted' && !isMobileLayout && (
                      <th className={styles['score-head']}>Score</th>
                    )}
                    {!isMobileLayout && (
                      <th className={styles['profile-head']}>Tier profile</th>
                    )}
                    <th className={styles['total-head']}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => {
                    const playerAccentStyle = getPlayerAccentStyle(row.player);
                    const profileSummary =
                      profileSummaries.get(row.player.id) ?? [];

                    return (
                      <tr key={row.player.id}>
                        <td className={styles['rank-cell']}>
                          {formatNumber(row.rank)}
                        </td>
                        <td className={styles['player-cell']}>
                          <a
                            href={`https://goldberries.net/player/${row.player.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles['player-link'] }
                            title={row.player.name}
                          >
                            <span
                              className={getPlayerAccentClassName(row.player)}
                              style={playerAccentStyle}
                              aria-hidden="true"
                            />
                            <span className={styles['player-name']}>
                              {row.player.name}
                            </span>
                          </a>
                          {rankingMode === 'weighted' && (
                            <span className={styles['mobile-score']}>
                              Score {formatNumber(Math.round(row.weightedScore * weightedDisplayScale))}
                            </span>
                          )}
                        </td>
                        {rankingMode === 'weighted' && !isMobileLayout && (
                          <td className={styles['score-cell']}>
                            <div className={styles['score-value']}>
                              {formatNumber(Math.round(row.weightedScore * weightedDisplayScale))}
                            </div>
                          </td>
                        )}
                        <td className={styles['profile-cell']}>
                          <div className={styles['profile-row']}>
                            <div className={styles['profile-preview-and-more']}>
                              <div className={styles['profile-preview-column']}>
                                {profileSummary.length > 0 ? (
                                  <ProfileFingerprint
                                    preview={getProfilePreviewMetrics(
                                      profileSummary,
                                      weightedDisplayScale,
                                    )}
                                  />
                                ) : (
                                  <span className={styles['profile-empty']}>0</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={styles['total-cell']}>
                          {formatNumber(row.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pageCount > 1 && rankedPlayers.length > 0 && (
              <Pagination
                currentPage={effectivePage}
                pageCount={pageCount}
                onPrevious={() => {
                  handlePageChange(Math.max(1, effectivePage - 1));
                }}
                onNext={() => {
                  handlePageChange(Math.min(pageCount, effectivePage + 1));
                }}
              />
            )}

            {rankingMode === 'weighted' && (
              <section className={styles['weighted-legend']}>
                <div className={styles['weighted-section-title']}>Formula</div>
                <div className={styles['weighted-formula-row']}>
                  <Latex
                    className={styles['weighted-formula']}
                    expression="Q(t)=\frac{\sum_{k\ge t}G_k}{G_{\mathrm{total}}}"
                    displayMode
                  />
                  <Latex
                    className={styles['weighted-formula']}
                    expression="p(t)=100\cdot\frac{1/Q(t)}{\operatorname{mean}(1/Q)}"
                    displayMode
                  />
                  <Latex
                    className={styles['weighted-formula']}
                    expression="S=\sum_t c_t\,p(t)"
                    displayMode
                  />
                </div>
                <dl className={styles['weighted-symbols']}>
                  <div>
                    <dt>
                      <Latex expression="Q(t)" />
                    </dt>
                    <dd>
                      = cumulative global share at or above tier <Latex expression="t" />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Latex expression="G_k" />
                    </dt>
                    <dd>
                      = global clear count for tier <Latex expression="k" />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Latex expression="G_{\mathrm{total}}" />
                    </dt>
                    <dd>= total global clears across all tiers</dd>
                  </div>
                  <div>
                    <dt>
                      <Latex expression="c_t" />
                    </dt>
                    <dd>
                      = player clears in tier <Latex expression="t" />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Latex expression="p(t)" />
                    </dt>
                    <dd>
                      = normalized points per clear for tier <Latex expression="t" />
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Latex expression="S" />
                    </dt>
                    <dd>= weighted score</dd>
                  </div>
                </dl>
                <div className={styles['weighted-legend-note']}>
                  The score is the additive sum of <Latex expression="c_t \times p(t)" /> and the display scale is
                  normalized only for readability.
                </div>
                <details className={styles['weighted-legend-details']}>
                  <summary>Tier table</summary>
                  <div className={styles['weighted-legend-table-wrap']}>
                    <table className={styles['weighted-legend-table']}>
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Score</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingTiers.map((tier) => {
                          const tierWeight = weightedTierScores.get(tier.id);
                          if (!tierWeight) {
                            return null;
                          }

                          return (
                            <tr key={tier.id}>
                              <td>{tier.sort}</td>
                              <td>{formatNumber(Math.round(tierWeight.weight * weightedDisplayScale))}</td>
                              <td>{tierWeight.cumulativeShare.toFixed(5)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              </section>
            )}

          </>
        )}
      </section>
    </>
  );
}

export default Deathless;









