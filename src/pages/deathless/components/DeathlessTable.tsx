import styles from '../../Deathless.module.css';
import type { RankingMode, PeerScoreFormat, DeathlessDisplayRow } from '../utils';
import {
  formatNumber,
  formatPeerPercent,
  formatPeerPoints,
  getPlayerAccentStyle,
  peerPercentUnits,
} from '../utils';
import PeerRecord from './PeerRecord';
import TierPills from './TierPills';
import DifferenceValue from './DifferenceValue';
import type { DisplayModeValue, LocationFilterValue } from '../location';
import type { DeathlessPlayerTierClearCounts, DifficultyTier } from '../hooks/useDeathlessData';

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
      return rankingMode === 'peer' ? 3 : 2;
    }

    return rankingMode === 'peer' ? 5 : 4;
  }

  if (isMobileLayout) {
    return rankingMode === 'peer' ? 3 : 2;
  }

  const baseColumns = location !== 'world' ? 5 : 4;
  return rankingMode === 'peer' ? baseColumns + 1 : baseColumns;
}

function getSectionMaximums(rows: DeathlessDisplayRow[]) {
  const maximums = new Map<string, { current?: number; previous?: number }>();
  let sectionKey: string | undefined;

  rows.forEach((row) => {
    if (row.rowType === 'separator') {
      sectionKey = row.rowKey;
      maximums.set(sectionKey, {});
      return;
    }

    if (!sectionKey) return;
    const section = maximums.get(sectionKey)!;
    if (!section.current && row.peerPossiblePoints > 0) {
      section.current = row.peerPossiblePoints;
    }
    if (!section.previous && row.comparisonPeerPossiblePoints) {
      section.previous = row.comparisonPeerPossiblePoints;
    }
  });

  return maximums;
}

function renderPlayerCell(
  row: Extract<DeathlessDisplayRow, { rowType: 'row' }>,
  displayMode: DisplayModeValue,
  rankingMode: RankingMode,
  peerScoreFormat: PeerScoreFormat,
  rankingTiers: DifficultyTier[],
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
            {rankingMode === 'absolute' ? (
              <TierPills tierProfile={row.tierProfile} tiers={rankingTiers} />
            ) : (
              <PeerRecord row={row} tiers={rankingTiers} scoreFormat={peerScoreFormat} />
            )}
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
          {rankingMode === 'absolute' ? (
            <TierPills tierProfile={row.tierProfile} tiers={rankingTiers} />
          ) : (
            <PeerRecord row={row} tiers={rankingTiers} scoreFormat={peerScoreFormat} />
          )}
        </div>
      )}
    </td>
  );
}

type DeathlessTableProps = {
  displayMode: DisplayModeValue;
  location: LocationFilterValue;
  rankingMode: RankingMode;
  peerScoreFormat: PeerScoreFormat;
  rows: DeathlessDisplayRow[];
  rankingTiers: DifficultyTier[];
  showDifferences: boolean;
  isMobileLayout: boolean;
};

export default function DeathlessTable({
  displayMode,
  location,
  rankingMode,
  peerScoreFormat,
  rows,
  rankingTiers,
  showDifferences,
  isMobileLayout,
}: DeathlessTableProps) {
  const pointsView = rankingMode === 'peer' && peerScoreFormat === 'fraction';
  const currentMaximum = rows.find(
    (row) => row.rowType === 'row' && row.peerPossiblePoints > 0,
  );
  const previousMaximum = rows.find(
    (row) => row.rowType === 'row' && row.comparisonPeerPossiblePoints,
  );
  const sectionMaximums = displayMode === 'region' ? getSectionMaximums(rows) : undefined;
  const hasSectionHeader = rows.some((row) => row.rowType === 'separator');
  const sectionlessMaximums = new Set(
    rows.flatMap((row) => row.rowType === 'row' && row.peerPossiblePoints > 0
      ? [row.peerPossiblePoints]
      : []),
  );
  const headerMaximum = displayMode === 'person' || (!hasSectionHeader && sectionlessMaximums.size === 1)
    ? currentMaximum?.rowType === 'row' ? currentMaximum.peerPossiblePoints : undefined
    : undefined;
  const headerPreviousMaximum = previousMaximum?.rowType === 'row'
    ? previousMaximum.comparisonPeerPossiblePoints
    : undefined;
  const scoreHeader = pointsView ? 'Peer points' : 'Peer score';

  return (
    <div
      className={`${styles['table-wrapper']} ${
        displayMode === 'region' ? styles['region-mode'] : ''
      } ${rankingMode === 'absolute' ? styles['absolute-mode'] : ''} ${pointsView ? styles['score-points'] : ''}`}
    >
      {pointsView && headerMaximum && (
        <div className={styles['score-maximum']}>
          Maximum: {formatNumber(headerMaximum)} peer points
          {showDifferences && headerPreviousMaximum
            ? ` · previous maximum: ${formatNumber(headerPreviousMaximum)}`
            : ''}
        </div>
      )}
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
          {rankingMode === 'peer' && !isMobileLayout && (
            <th className={styles['score-head']}>{scoreHeader}</th>
          )}
          {!isMobileLayout && (
            <th className={styles['profile-head']}>
              {rankingMode === 'absolute' ? 'Tier Profile' : 'Peer record'}
            </th>
          )}
            {!isMobileLayout && <th className={styles['total-head']}>Total</th>}
          {rankingMode === 'peer' && isMobileLayout && (
              <th className={styles['score-head']}>{scoreHeader}</th>
          )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.rowType === 'separator') {
              const maximum = sectionMaximums?.get(row.rowKey);
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
                    {pointsView && maximum?.current && (
                      <span className={styles['section-maximum']}>
                        Max {formatNumber(maximum.current)} points
                        {showDifferences && maximum.previous
                          ? ` · prior max ${formatNumber(maximum.previous)}`
                          : ''}
                      </span>
                    )}
                  </td>
                </tr>
              );
            }

            const displayRank = row.displayRank ?? row.rank;
            const rankDelta =
              row.comparisonDisplayRank === undefined
                ? undefined
                : displayRank - row.comparisonDisplayRank;
            const peerScoreValue =
              rankingMode === 'peer'
                ? row.displayScope === 'World'
                  ? '—'
                  : peerScoreFormat === 'fraction'
                    ? row.peerPossiblePoints > 0
                      ? formatPeerPoints(row.peerScoreKey)
                      : '—'
                    : formatPeerPercent(row.peerScoreKey, row.peerPossiblePoints, 2)
                : '0';
            const peerDelta =
              rankingMode === 'peer' &&
              row.comparisonPeerScoreKey !== undefined &&
              row.comparisonPeerPossiblePoints !== undefined &&
              row.displayScope !== 'World'
                ? (peerPercentUnits(row.peerScoreKey, row.peerPossiblePoints, 2) -
                  peerPercentUnits(row.comparisonPeerScoreKey, row.comparisonPeerPossiblePoints, 2)) / 100
                : undefined;
            const previousPeerPoints =
              row.comparisonPeerScoreKey !== undefined &&
              row.comparisonPeerPossiblePoints !== undefined &&
              row.displayScope !== 'World'
                ? row.comparisonPeerPossiblePoints > 0
                  ? formatPeerPoints(row.comparisonPeerScoreKey)
                  : undefined
                : undefined;
            const peerDifference = peerScoreFormat === 'fraction'
              ? showDifferences && previousPeerPoints
                ? `was ${previousPeerPoints}`
                : null
              : <DifferenceValue value={peerDelta} show={showDifferences} decimals={2} />;
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
                  <div>{formatNumber(displayRank)}</div>
                  <div className={styles['rank-delta']}>
                    <DifferenceValue value={rankDelta} show={showDifferences} invert />
                  </div>
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
                  peerScoreFormat,
                  rankingTiers,
                  isMobileLayout,
                )}
                {rankingMode === 'peer' && isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      <div>{peerScoreValue}</div>
                      <div className={styles['score-delta']}>
                        {peerDifference}
                      </div>
                    </div>
                  </td>
                )}
                {rankingMode === 'peer' && !isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      <div>{peerScoreValue}</div>
                      <div className={styles['score-delta']}>
                        {peerDifference}
                      </div>
                    </div>
                  </td>
                )}
                {!isMobileLayout && (
                  <td className={styles['profile-cell']}>
                    {rankingMode === 'absolute' ? (
                      <TierPills tierProfile={row.tierProfile} tiers={rankingTiers} />
                    ) : (
                      <PeerRecord row={row} tiers={rankingTiers} scoreFormat={peerScoreFormat} />
                    )}
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
