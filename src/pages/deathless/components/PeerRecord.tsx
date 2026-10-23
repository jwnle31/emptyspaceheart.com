import type { DifficultyTier } from '../hooks/useDeathlessData';
import type { RankedPlayer } from '../utils';
import { formatNumber, formatTierLabel } from '../utils';
import styles from '../../Deathless.module.css';

type PeerRecordProps = {
  row: RankedPlayer;
  tiers: DifficultyTier[];
};

export default function PeerRecord({ row, tiers }: PeerRecordProps) {
  const bestTier = tiers.find((_, index) => row.tierProfile[index] > 0);
  const measured = row.peerThresholds.filter((entry) => entry.standing !== null);
  const aboveMedian = measured.filter((entry) => entry.standing! > 50).length;
  const summary = bestTier
    ? `${formatTierLabel(bestTier.name)} best · ${measured.length > 0
      ? `${aboveMedian}/${measured.length} above median`
      : 'no peers'}`
    : 'No clears';

  return (
    <details className={styles['peer-record']}>
      <summary>{summary} <span className={styles['peer-record-action']}>View</span></summary>
      <div className={styles['peer-record-detail']}>
        <div className={styles['peer-record-heading']}>
          <span>Tier</span><span>Clears</span><span>Standing</span>
        </div>
        {tiers.map((tier, index) => {
          const threshold = row.peerThresholds[index];
          if (!threshold) return null;
          return (
            <div className={styles['peer-record-line']} key={tier.id}>
              <span>{formatTierLabel(tier.name)}+</span>
              <span>{formatNumber(threshold.cumulative)}</span>
              <span>{threshold.standing === null ? '—' : `${threshold.standing.toFixed(1)}%`}</span>
            </div>
          );
        })}
        <p>Standing is the share of peer matchups won, with ties counting half.</p>
      </div>
    </details>
  );
}
