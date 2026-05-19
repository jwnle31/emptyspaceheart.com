import styles from '../../Deathless.module.css';
import type { RankingMode, DeathlessDisplayRow, ProfileSummaryEntry } from '../utils';
import {
  formatNumber,
  getProfilePreviewMetrics,
  getPlayerAccentStyle,
} from '../utils';
import ProfileFingerprint from './ProfileFingerprint';
import type { DisplayModeValue, LocationFilterValue } from '../location';
import type { DeathlessPlayerTierClearCounts } from '../hooks/useDeathlessData';

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

function getSeparatorColSpan(
  displayMode: DisplayModeValue,
  location: LocationFilterValue,
  rankingMode: RankingMode,
  isMobileLayout: boolean,
) {
  if (displayMode === 'region') {
    if (isMobileLayout) {
      return rankingMode === 'weighted' ? 3 : 2;
    }

    return rankingMode === 'weighted' ? 5 : 4;
  }

  if (isMobileLayout) {
    return rankingMode === 'weighted' ? 3 : 2;
  }

  const baseColumns = location !== 'world' ? 5 : 4;
  return rankingMode === 'weighted' ? baseColumns + 1 : baseColumns;
}

function formatWeightedScore(
  value: number,
  useRawWeightedScore: boolean,
  log2WeightedDisplayScale: number,
) {
  return formatNumber(
    Math.round(
      useRawWeightedScore
        ? value
        : Math.log2(value + 1) * log2WeightedDisplayScale,
    ),
  );
}

function getWeightedDisplayValue(
  value: number,
  useRawWeightedScore: boolean,
  log2WeightedDisplayScale: number,
) {
  if (value <= 0) {
    return 0;
  }

  if (useRawWeightedScore) {
    return Math.round(value);
  }

  return Math.round(Math.log2(value + 1) * log2WeightedDisplayScale);
}

function formatPointDelta(value?: number) {
  if (!value) {
    return null;
  }

  const positive = value > 0;
  const label = `${positive ? '+' : '-'}${formatNumber(Math.abs(Math.round(value)))}`;

  return (
    <span
      className={
        positive
          ? styles['delta-bracket-positive']
          : styles['delta-bracket-negative']
      }
      aria-label={positive ? `${label} increase` : `${label} decrease`}
    >
      {label}
    </span>
  );
}

function formatPlacementDelta(value?: number) {
  if (!value) {
    return null;
  }

  const improving = value < 0;
  const label = `${value < 0 ? '-' : '+'}${formatNumber(Math.abs(Math.round(value)))}`;

  return (
    <span
      className={
        improving
          ? styles['delta-bracket-positive']
          : styles['delta-bracket-negative']
      }
      aria-label={improving ? `${label} improvement` : `${label} decline`}
    >
      {label}
    </span>
  );
}

function renderPlayerCell(
  row: Extract<DeathlessDisplayRow, { rowType: 'row' }>,
  displayMode: DisplayModeValue,
  rankingMode: RankingMode,
  weightedDisplayScale: number,
  profileSummary: ProfileSummaryEntry[],
  isMobileLayout: boolean,
) {
  const playerAccentStyle = getPlayerAccentStyle(row.player);
  const showCountryFlag = displayMode !== 'region';
  const showRegionFlag = displayMode !== 'region' || !!row.player.countryCode;
  const regionFlag = row.player.countryCode ? (
    <span
      className={`fi fi-${row.player.countryCode} ${styles['region-flag']}`}
      title={row.player.country ?? row.player.countryCode}
      aria-hidden="true"
    />
  ) : (
    <span className={styles['region-flag-placeholder']} aria-hidden="true" />
  );

  const content = (
    <a
      href={`https://goldberries.net/player/${row.player.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles['player-link']}
      title={row.player.name}
    >
      {showCountryFlag ? (
        row.player.countryCode ? (
          <span
            className={`fi fi-${row.player.countryCode} ${styles['player-flag']}`}
            title={row.player.country ?? row.player.countryCode}
            aria-hidden="true"
          />
        ) : (
          <span
            className={styles['player-flag-placeholder']}
            aria-hidden="true"
          />
        )
      ) : null}
      {showCountryFlag ? (
        <span
          className={getPlayerAccentClassName(row.player)}
          style={playerAccentStyle}
          aria-hidden="true"
        />
      ) : (
        <span
          className={getPlayerAccentClassName(row.player)}
          style={playerAccentStyle}
          aria-hidden="true"
        />
      )}
      <span className={styles['player-name']}>{row.player.name}</span>
    </a>
  );

  if (displayMode === 'region') {
    return (
      <td className={styles['region-cell']}>
        <span className={styles['region-main']}>
          {showRegionFlag ? regionFlag : null}
          <span className={styles['region-main-label']}>
            {row.displayScope ?? 'World'}
          </span>
        </span>
        {isMobileLayout && (
          <div className={styles['profile-row']}>
            <div className={styles['profile-preview-and-more']}>
              <div className={styles['profile-preview-column']}>
                {profileSummary.length > 0 ? (
                  <ProfileFingerprint
                    preview={getProfilePreviewMetrics(
                      profileSummary,
                      weightedDisplayScale,
                    )}
                    showTooltips={rankingMode === 'weighted'}
                  />
                ) : (
                  <span className={styles['profile-empty']} aria-hidden="true">
                    &nbsp;
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </td>
    );
  }

  return (
    <td className={styles['player-cell']}>
      {content}
      {isMobileLayout && (
        <span className={styles['mobile-total']}>
          Total: {formatNumber(row.total)}
        </span>
      )}
      {isMobileLayout && (
        <div className={styles['profile-row']}>
          <div className={styles['profile-preview-and-more']}>
            <div className={styles['profile-preview-column']}>
              {profileSummary.length > 0 ? (
              <ProfileFingerprint
                preview={getProfilePreviewMetrics(
                  profileSummary,
                  weightedDisplayScale,
                )}
                showTooltips={rankingMode === 'weighted'}
              />
              ) : (
                <span className={styles['profile-empty']} aria-hidden="true">
                  &nbsp;
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </td>
  );
}

type DeathlessTableProps = {
  displayMode: DisplayModeValue;
  location: LocationFilterValue;
  rankingMode: RankingMode;
  rows: DeathlessDisplayRow[];
  profileSummaries: Map<number, ProfileSummaryEntry[]>;
  weightedDisplayScale: number;
  log2WeightedDisplayScale: number;
  useRawWeightedScore: boolean;
  showDifferences: boolean;
  isMobileLayout: boolean;
};

export default function DeathlessTable({
  displayMode,
  location,
  rankingMode,
  rows,
  profileSummaries,
  weightedDisplayScale,
  log2WeightedDisplayScale,
  useRawWeightedScore,
  showDifferences,
  isMobileLayout,
}: DeathlessTableProps) {
  return (
    <div
      className={`${styles['table-wrapper']} ${
        displayMode === 'region' ? styles['region-mode'] : ''
      } ${rankingMode === 'absolute' ? styles['absolute-mode'] : ''} ${
        rankingMode === 'weighted' ? styles['weighted-mode'] : ''
      }`}
    >
      <table>
        <thead>
          <tr>
            {displayMode === 'region' ? (
              <>
                <th className={styles['rank-head']}>#</th>
                <th className={styles['region-head']}>Region</th>
              </>
            ) : (
              <>
                <th className={styles['rank-head']}>#</th>
                {location !== 'world' && !isMobileLayout && (
                  <th className={styles['global-head']}>Global</th>
                )}
                <th className={styles['player-head']}>Player</th>
              </>
            )}
          {rankingMode === 'weighted' && !isMobileLayout && (
            <th className={styles['score-head']}>Score</th>
          )}
          {!isMobileLayout && (
            <th className={styles['profile-head']}>Tier Profile</th>
          )}
            {!isMobileLayout && <th className={styles['total-head']}>Total</th>}
          {rankingMode === 'weighted' && isMobileLayout && (
              <th className={styles['score-head']}>Score</th>
          )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.rowType === 'separator') {
              return (
                <tr key={row.rowKey}>
                  <td
                    className={styles['section-row']}
                    colSpan={getSeparatorColSpan(
                      displayMode,
                      location,
                      rankingMode,
                      isMobileLayout,
                    )}
                  >
                    {row.label}
                  </td>
                </tr>
              );
            }

            const profileSummary = profileSummaries.get(row.player.id) ?? [];
            const podiumClassName =
              displayMode === 'person' && row.rank === 1
                ? styles['rank-gold']
                : displayMode === 'person' && row.rank === 2
                  ? styles['rank-silver']
                  : displayMode === 'person' && row.rank === 3
                    ? styles['rank-bronze']
                    : undefined;

            return (
              <tr key={row.rowKey} className={podiumClassName}>
                <td
                  className={
                    podiumClassName
                      ? `${styles['rank-cell']} ${podiumClassName}`
                      : styles['rank-cell']
                  }
                >
                  <div>{formatNumber(row.displayRank ?? row.rank)}</div>
                  {showDifferences &&
                    formatPlacementDelta(
                      row.comparisonDisplayRank === undefined
                        ? undefined
                        : (row.displayRank ?? row.rank) - row.comparisonDisplayRank,
                    ) && (
                    <div className={styles['rank-delta']}>
                      {formatPlacementDelta(
                        row.comparisonDisplayRank === undefined
                          ? undefined
                          : (row.displayRank ?? row.rank) -
                              row.comparisonDisplayRank,
                      )}
                    </div>
                  )}
                  {displayMode === 'person' &&
                    location !== 'world' &&
                    isMobileLayout && (
                      <span className={styles['mobile-rank-sub']}>
                        {formatNumber(row.globalRank ?? row.rank)}
                      </span>
                    )}
                </td>
                {displayMode === 'person' &&
                  location !== 'world' &&
                  !isMobileLayout && (
                    <td className={styles['global-cell']}>
                      {formatNumber(row.globalRank ?? row.rank)}
                    </td>
                  )}
                {renderPlayerCell(
                  row,
                  displayMode,
                  rankingMode,
                  weightedDisplayScale,
                  profileSummary,
                  isMobileLayout,
                )}
                {rankingMode === 'weighted' && isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      <div>
                        {formatWeightedScore(
                          row.weightedScore,
                          useRawWeightedScore,
                          log2WeightedDisplayScale,
                        )}
                      </div>
                      {showDifferences &&
                        formatPointDelta(
                          row.comparisonWeightedScore === undefined
                            ? undefined
                            : getWeightedDisplayValue(
                                row.weightedScore,
                                useRawWeightedScore,
                                log2WeightedDisplayScale,
                              ) -
                              getWeightedDisplayValue(
                                row.comparisonWeightedScore,
                                useRawWeightedScore,
                                log2WeightedDisplayScale,
                              ),
                        ) && (
                          <div className={styles['score-delta']}>
                            {formatPointDelta(
                              row.comparisonWeightedScore === undefined
                                ? undefined
                                : getWeightedDisplayValue(
                                    row.weightedScore,
                                    useRawWeightedScore,
                                    log2WeightedDisplayScale,
                                  ) -
                                  getWeightedDisplayValue(
                                    row.comparisonWeightedScore,
                                    useRawWeightedScore,
                                    log2WeightedDisplayScale,
                                  ),
                            )}
                          </div>
                        )}
                    </div>
                  </td>
                )}
                {rankingMode === 'weighted' && !isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      <div>
                        {formatWeightedScore(
                          row.weightedScore,
                          useRawWeightedScore,
                          log2WeightedDisplayScale,
                        )}
                      </div>
                      {showDifferences &&
                        formatPointDelta(
                          row.comparisonWeightedScore === undefined
                            ? undefined
                            : getWeightedDisplayValue(
                                row.weightedScore,
                                useRawWeightedScore,
                                log2WeightedDisplayScale,
                              ) -
                              getWeightedDisplayValue(
                                row.comparisonWeightedScore,
                                useRawWeightedScore,
                                log2WeightedDisplayScale,
                              ),
                        ) && (
                        <div className={styles['score-delta']}>
                          {formatPointDelta(
                            row.comparisonWeightedScore === undefined
                              ? undefined
                              : getWeightedDisplayValue(
                                    row.weightedScore,
                                    useRawWeightedScore,
                                    log2WeightedDisplayScale,
                                  ) -
                                  getWeightedDisplayValue(
                                    row.comparisonWeightedScore,
                                    useRawWeightedScore,
                                    log2WeightedDisplayScale,
                                  ),
                            )}
                          </div>
                        )}
                    </div>
                  </td>
                )}
                {!isMobileLayout && (
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
                              showTooltips={rankingMode === 'weighted'}
                            />
                          ) : (
                            <span
                              className={styles['profile-empty']}
                              aria-hidden="true"
                            >
                              &nbsp;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                {!isMobileLayout && (
                  <td className={styles['total-cell']}>
                    {formatNumber(row.total)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
