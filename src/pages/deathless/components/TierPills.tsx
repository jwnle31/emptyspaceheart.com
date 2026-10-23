import { useState, type CSSProperties } from 'react';
import type { DifficultyTier } from '../hooks/useDeathlessData';
import { formatNumber, formatTierLabel, getTierColor } from '../utils';
import styles from '../../Deathless.module.css';

type TierPillsProps = {
  tierProfile: number[];
  tiers: DifficultyTier[];
};

export default function TierPills({ tierProfile, tiers }: TierPillsProps) {
  const [expanded, setExpanded] = useState(false);
  const entries = tiers.flatMap((tier, index) => {
    const clears = tierProfile[index] ?? 0;
    return clears > 0 ? [{ tier, clears }] : [];
  });
  if (entries.length === 0) return <span className={styles['profile-empty']}>—</span>;

  return (
    <div className={styles['tier-pills']}>
      {(expanded ? entries : entries.slice(0, 5)).map(({ tier, clears }) => (
        <span
          key={tier.id}
          className={styles['tier-pill']}
          style={{ '--tier-color': getTierColor(tier.id) } as CSSProperties}
        >
          <span>{formatTierLabel(tier.name)}</span>
          <strong>x {formatNumber(clears)}</strong>
        </span>
      ))}
      {entries.length > 5 && (
        <button
          type="button"
          className={styles['tier-pills-toggle']}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}
