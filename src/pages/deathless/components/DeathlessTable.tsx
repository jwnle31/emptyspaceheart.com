import styles from '../../Deathless.module.css';
import type { RankingMode, DeathlessDisplayRow, ProfileSummaryEntry } from '../utils';
import {
  formatNumber,
  getProfilePreviewMetrics,
  getPlayerAccentStyle,
} from '../utils';
import ProfileFingerprint from './ProfileFingerprint';
import type { DisplayModeValue } from '../location';
import type { DeathlessPlayerTierClearCounts } from '../useDeathlessData';

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
  rankingMode: RankingMode,
  isMobileLayout: boolean,
) {
  const baseColumns = isMobileLayout ? 3 : 4;
  return rankingMode === 'weighted' && !isMobileLayout ? baseColumns + 1 : baseColumns;
}

function renderPlayerCell(
  row: Extract<DeathlessDisplayRow, { rowType: 'row' }>,
  displayMode: DisplayModeValue,
  weightedDisplayScale: number,
  profileSummary: ProfileSummaryEntry[],
  isMobileLayout: boolean,
) {
  const playerAccentStyle = getPlayerAccentStyle(row.player);

  const content = (
    <a
      href={`https://goldberries.net/player/${row.player.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles['player-link']}
      title={row.player.name}
    >
      {row.player.countryCode ? (
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
      )}
      <span
        className={getPlayerAccentClassName(row.player)}
        style={playerAccentStyle}
        aria-hidden="true"
      />
      <span className={styles['player-name']}>{row.player.name}</span>
    </a>
  );

  if (displayMode === 'region') {
    return (
      <td className={styles['region-cell']}>
        <span className={styles['region-main']}>
          {row.displayScope ?? 'World'}
        </span>
        <span className={styles['region-meta']}>{content}</span>
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
                  />
                ) : (
                  <span className={styles['profile-empty']}>0</span>
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
                />
              ) : (
                <span className={styles['profile-empty']}>0</span>
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
  rankingMode: RankingMode;
  rows: DeathlessDisplayRow[];
  profileSummaries: Map<number, ProfileSummaryEntry[]>;
  weightedDisplayScale: number;
  isMobileLayout: boolean;
};

export default function DeathlessTable({
  displayMode,
  rankingMode,
  rows,
  profileSummaries,
  weightedDisplayScale,
  isMobileLayout,
}: DeathlessTableProps) {
  return (
    <div
      className={`${styles['table-wrapper']} ${
        displayMode === 'region' ? styles['region-mode'] : ''
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
                    colSpan={getSeparatorColSpan(rankingMode, isMobileLayout)}
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
                  {formatNumber(row.displayRank ?? row.rank)}
                </td>
                {renderPlayerCell(
                  row,
                  displayMode,
                  weightedDisplayScale,
                  profileSummary,
                  isMobileLayout,
                )}
                {rankingMode === 'weighted' && !isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      {formatNumber(
                        Math.round(row.weightedScore * weightedDisplayScale),
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
                            />
                          ) : (
                            <span className={styles['profile-empty']}>0</span>
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
                {rankingMode === 'weighted' && isMobileLayout && (
                  <td className={styles['score-cell']}>
                    <div className={styles['score-value']}>
                      {formatNumber(
                        Math.round(row.weightedScore * weightedDisplayScale),
                      )}
                    </div>
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
