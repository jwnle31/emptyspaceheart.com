import { type CSSProperties, useState } from 'react';
import {
  formatNumber,
  formatTierLabel,
  getProfilePreviewMetrics,
} from '../utils';
import styles from '../../Deathless.module.css';

function ProfileBadge({
  entry,
  className,
  expanded,
  onToggle,
}: {
  entry: NonNullable<ReturnType<typeof getProfilePreviewMetrics>>[number];
  className: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles['profile-fingerprint-badge-shell']}>
      <button
        type="button"
        className={className}
        style={{ '--band-color': entry.color } as CSSProperties}
        onClick={onToggle}
      >
        <span className={styles['profile-fingerprint-tier']}>
          {formatTierLabel(entry.tierName)}
        </span>
        <span className={styles['profile-fingerprint-count']}>
          x {formatNumber(entry.clears)}
        </span>
      </button>
      {expanded && (
        <div
          className={styles['profile-fingerprint-tooltip']}
          style={{ '--band-color': entry.color } as CSSProperties}
        >
          {entry.tooltip}
        </div>
      )}
    </div>
  );
}

export default function ProfileFingerprint({
  preview,
}: {
  preview: ReturnType<typeof getProfilePreviewMetrics>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTooltipTierId, setActiveTooltipTierId] = useState<number | null>(
    null,
  );
  if (!preview) {
    return null;
  }

  const visibleEntries = expanded ? preview : preview.slice(0, 5);
  const canToggle = preview.length > 5;

  return (
    <div className={styles['profile-fingerprint-shell']}>
      <div className={styles['profile-fingerprint-row']}>
        {visibleEntries.map((entry) => (
          <ProfileBadge
            key={entry.tierId}
            entry={entry}
            className={styles['profile-fingerprint-pill']}
            expanded={activeTooltipTierId === entry.tierId}
            onToggle={() => {
              setActiveTooltipTierId((current) =>
                current === entry.tierId ? null : entry.tierId,
              );
            }}
          />
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
