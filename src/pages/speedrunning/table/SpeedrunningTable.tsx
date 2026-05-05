import { IconExternalLink, IconVideo } from '@tabler/icons-react';
import type {
  DisplayLeaderboardItem,
  LocationFilterValue,
} from '../types';
import styles from '../../Speedrunning.module.css';

type SpeedrunningTableProps = {
  rows: DisplayLeaderboardItem[];
  location: LocationFilterValue;
  rankRegions: boolean;
  pageStart: number;
};

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

function isSeparatorRow(
  row: DisplayLeaderboardItem,
): row is { rowType: 'separator'; rowKey: string; label: string } {
  return row.rowType === 'separator';
}

function parseRunDate(date: string) {
  if (!date || date === 'Unknown') {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return Date.UTC(year, month - 1, day);
}

function isRunRecent(date: string) {
  const parsedDate = parseRunDate(date);

  if (parsedDate === null) {
    return false;
  }

  return Date.now() - parsedDate <= MONTH_IN_MS;
}

function getPersonRankTone(rank: number) {
  if (rank === 1) {
    return 'gold';
  }

  if (rank === 2) {
    return 'silver';
  }

  if (rank === 3) {
    return 'bronze';
  }

  return null;
}

function SpeedrunningTable({
  rows,
  location,
  rankRegions,
  pageStart,
}: SpeedrunningTableProps) {
  const columnCount = rankRegions ? 6 : location === 'world' ? 5 : 6;

  return (
    <div className={`${styles['table-wrapper']} ${rankRegions ? styles['region-mode'] : ''}`}>
      <table>
        <thead>
          <tr>
            {rankRegions ? (
              <>
                <th className={styles['region-rank-head']}>#</th>
                <th className={styles['region-head']}>Region</th>
              </>
            ) : (
              <>
                <th>#</th>
                {location !== 'world' && <th className={styles['desktop-global']}>Global</th>}
              </>
            )}
            <th className={rankRegions ? styles['region-hidden-cell'] : styles['mobile-runner-head']}>Runner</th>
            <th className={rankRegions ? styles['mobile-time-head'] : styles['mobile-time-head']}>Time</th>
            <th className={rankRegions ? styles['region-hidden-cell'] : styles['desktop-date']}>Date</th>
            <th className={rankRegions ? styles['region-hidden-cell'] : styles['desktop-links']}>Links</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            if (isSeparatorRow(row)) {
              return (
                <tr key={row.rowKey}>
                  <td className={styles['section-row']} colSpan={columnCount}>
                    {row.label}
                  </td>
                </tr>
              );
            }

            const displayedRank = rankRegions
              ? row.displayRank ?? 0
              : location === 'world'
                ? row.place
                : pageStart + index + 1;
            const rankTone = rankRegions ? null : getPersonRankTone(displayedRank);
            const isRecent = !rankRegions && isRunRecent(row.date);
            const rowClassName = [
              rankTone ? styles[`rank-${rankTone}`] : '',
              isRecent ? styles['recent-run'] : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr key={row.rowKey} className={rowClassName || undefined}>
                {rankRegions ? (
                  <>
                    <td>{row.displayRank ?? 0}</td>
                    <td className={styles['region-cell']}>
                      <span className={styles['region-main']}>
                        {row.countryCode ? (
                          <span
                            className={`fi fi-${row.countryCode} ${styles['mobile-flag']}`}
                            title={row.country}
                          />
                        ) : (
                          <span className={styles.spacer} aria-hidden="true" />
                        )}
                        <span className={styles['region-main-text']}>{row.displayScope ?? 'World'}</span>
                      </span>
                      <span className={styles['region-mobile-meta']}>
                        <a
                          className={styles['region-mobile-runner-name']}
                          href={row.runnerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {row.runner}
                        </a>
                        <span className={styles['region-mobile-date']}>{row.date || 'Unknown'}</span>
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className={
                        rankTone
                          ? `${styles['mobile-rank-cell']} ${styles[`rank-${rankTone}`]}`
                          : styles['mobile-rank-cell']
                      }
                    >
                      <span
                        className={
                          rankTone
                            ? `${styles['mobile-rank-main']} ${styles[`rank-${rankTone}`]}`
                            : styles['mobile-rank-main']
                        }
                      >
                        {displayedRank}
                      </span>
                      {location !== 'world' && (
                        <span
                          className={`${styles['mobile-rank-sub']} ${styles['mobile-only']}`}
                        >
                          {row.place}
                        </span>
                      )}
                    </td>
                    {location !== 'world' && <td className={styles['desktop-global']}>{row.place}</td>}
                  </>
                )}
                <td className={rankRegions ? styles['region-runner-cell'] : styles['mobile-runner-cell']}>
                  <div className={styles['runner-cell']}>
                    {!rankRegions && !row.countryCode && (
                      <span className={styles.spacer} aria-hidden="true" />
                    )}
                    {!rankRegions && row.countryCode && (
                      <span
                        className={`fi fi-${row.countryCode} ${styles['mobile-flag']}`}
                        title={row.country}
                      />
                    )}
                    <span
                      className={`${styles.swatch} ${styles['desktop-swatch']}`}
                      style={row.nameStyle}
                    />
                    <a
                      className={styles.runner}
                      href={row.runnerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={row.nameStyle}
                    >
                      {row.runner}
                    </a>
                  </div>
                  <span className={styles['mobile-date']}>
                    {row.date || 'Unknown'}
                  </span>
                </td>
                <td
                  className={
                    rankRegions
                      ? `${styles.time} ${styles['mobile-time-cell']}`
                      : `${styles.time} ${styles['mobile-time-cell']}`
                  }
                >
                  <span>{row.time}</span>
                  <div className={styles['mobile-meta']}>
                    <span
                      className={`${styles.swatch} ${styles['mobile-swatch']}`}
                      style={row.nameStyle}
                    />
                    <div className={styles['mobile-links']}>
                      <a
                        className={styles['icon-link']}
                        href={row.runUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Run"
                        title="Run"
                      >
                        <IconExternalLink size={14} />
                      </a>
                      {row.videoUrl && (
                        <a
                          className={styles['icon-link']}
                          href={row.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Video"
                          title="Video"
                        >
                          <IconVideo size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td
                  className={
                    rankRegions
                      ? styles['region-hidden-cell']
                      : `${styles['desktop-date']} ${isRecent ? styles['recent-date'] : ''}`
                  }
                >
                  {row.date || 'Unknown'}
                </td>
                <td className={rankRegions ? styles['region-hidden-cell'] : styles['desktop-links']}>
                  <div className={styles.links}>
                    <a
                      className={styles['icon-link']}
                      href={row.runUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Run"
                      title="Run"
                    >
                      <IconExternalLink size={14} />
                    </a>
                    {row.videoUrl && (
                      <a
                        className={styles['icon-link']}
                        href={row.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Video"
                        title="Video"
                      >
                        <IconVideo size={14} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SpeedrunningTable;
