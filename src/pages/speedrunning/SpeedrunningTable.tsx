import { IconExternalLink, IconVideo } from '@tabler/icons-react';
import type { LeaderboardRow, LocationFilterValue } from './types';
import styles from '../Speedrunning.module.css';

type SpeedrunningTableProps = {
  rows: LeaderboardRow[];
  location: LocationFilterValue;
  pageStart: number;
};

function SpeedrunningTable({ rows, location, pageStart }: SpeedrunningTableProps) {
  return (
    <div className={styles['table-wrapper']}>
      <table>
        <thead>
          <tr>
            <th>{location === 'world' ? 'Place' : 'Local'}</th>
            {location !== 'world' && <th>Global</th>}
            <th>Runner</th>
            <th>Time</th>
            <th>Date</th>
            <th>Links</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.place}-${row.runner}-${row.seconds}`}>
              <td>{location === 'world' ? row.place : pageStart + index + 1}</td>
              {location !== 'world' && <td>{row.place}</td>}
              <td>
                <div className={styles['runner-cell']}>
                  {!row.countryCode && (
                    <span className={styles.spacer} aria-hidden="true" />
                  )}
                  {row.countryCode && (
                    <span className={`fi fi-${row.countryCode}`} title={row.country} />
                  )}
                  <span className={styles.swatch} style={row.nameStyle} />
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
              </td>
              <td className={styles.time}>{row.time}</td>
              <td>{row.date || 'Unknown'}</td>
              <td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SpeedrunningTable;
