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
  showTooltip,
  onToggle,
}: {
  entry: NonNullable<ReturnType<typeof getProfilePreviewMetrics>>[number];
  className: string;
  expanded: boolean;
  showTooltip: boolean;
  onToggle: () => void;
}) {
  const buttonClassName = showTooltip ? className : `${className} ${styles['profile-fingerprint-pill-static']}`;

  return (
    <div className={styles['profile-fingerprint-badge-shell']}>
      <button
        type="button"
        className={buttonClassName}
        style={{ '--band-color': entry.color } as CSSProperties}
        onClick={showTooltip ? onToggle : undefined}
        aria-pressed={showTooltip ? expanded : undefined}
      >
        <span className={styles['profile-fingerprint-tier']}>
          {formatTierLabel(entry.tierName)}
        </span>
        <span className={styles['profile-fingerprint-count']}>
          x {formatNumber(entry.clears)}
        </span>
      </button>
      {showTooltip && expanded && (
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
  showTooltips = true,
}: {
  preview: ReturnType<typeof getProfilePreviewMetrics>;
  showTooltips?: boolean;
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
            expanded={showTooltips && activeTooltipTierId === entry.tierId}
            showTooltip={showTooltips}
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
