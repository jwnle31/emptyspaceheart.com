import { Fragment, type CSSProperties } from 'react';
import { IconCalendar, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import styles from '../Challenges.module.css';
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatFractionalTierDisplay,
  formatObjectiveTierDisplay,
  getProofEmbedUrl,
  getChallengeFracValue,
  getStatusChips,
  getTierColor,
} from './utils';
import type { NormalizedChallenge, Tier } from './types';

type ChallengesTableProps = {
  topChallenges: NormalizedChallenge[];
  expandedId: number | null;
  setExpandedId: (value: number | null) => void;
  isNarrowScreen: boolean;
  tiersBySort: Map<number, Tier>;
};

export default function ChallengesTable({
  topChallenges,
  expandedId,
  setExpandedId,
  isNarrowScreen,
  tiersBySort,
}: ChallengesTableProps) {
  return (
    <div className={styles['table-wrap']}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles['rank-head']}>#</th>
            <th className={styles['challenge-head']}>Challenge</th>
            <th className={styles['tier-head']}>Tier</th>
            {!isNarrowScreen && <th className={styles['stats-head']}>Stats</th>}
            {!isNarrowScreen && <th className={styles['created-head']}>Cleared</th>}
            <th className={styles['action-head']}> </th>
          </tr>
        </thead>
        <tbody>
          {topChallenges.map((challenge) => {
            const expanded = expandedId === challenge.id;
            const statusChips = getStatusChips(challenge);
            const baseTier = challenge.tier;
            const bottomValue = baseTier
              ? baseTier.sort + getChallengeFracValue(challenge.data?.frac)
              : null;
            const bottomTierValue =
              bottomValue != null ? Math.trunc(bottomValue) : null;
            const bottomTier =
              bottomTierValue != null
                ? tiersBySort.get(bottomTierValue) ?? baseTier
                : null;
            const bottomTierFraction =
              bottomTier && bottomValue != null ? bottomValue - bottomTier.sort : null;
            const rowStyle = challenge.tier?.id
              ? ({
                  '--tier-color': getTierColor(challenge.tier.id),
                } as CSSProperties)
              : undefined;
            const rankClassName =
              challenge.rank === 1
                ? styles['rank-gold']
                : challenge.rank === 2
                  ? styles['rank-silver']
                  : challenge.rank === 3
                    ? styles['rank-bronze']
                    : undefined;

            return (
              <Fragment key={challenge.id}>
                <tr
                  className={`${styles.row} ${expanded ? styles['row-open'] : ''} ${
                    rankClassName ?? ''
                  }`}
                  onClick={() => {
                    setExpandedId(expanded ? null : challenge.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setExpandedId(expanded ? null : challenge.id);
                    }
                  }}
                  tabIndex={0}
                  style={rowStyle}
                  aria-expanded={expanded}
                >
                  <td className={`${styles['rank-cell']} ${rankClassName ?? ''}`}>
                    {formatNumber(challenge.rank)}
                  </td>
                  <td
                    className={styles['challenge-cell']}
                    style={
                      challenge.thumbnailUrl
                        ? ({
                            '--challenge-bg-url': `url("${challenge.thumbnailUrl.replace(
                              'scale=1',
                              'scale=4',
                            )}")`,
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    <div className={styles['challenge-main']}>
                      {challenge.thumbnailUrl && (
                        <div className={styles['challenge-thumbnail-shell']}>
                          <img
                            src={challenge.thumbnailUrl}
                            alt=""
                            aria-hidden="true"
                            className={styles['challenge-thumbnail']}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className={styles['challenge-copy']}>
                        <div className={styles['challenge-title-row']}>
                          <span className={styles['challenge-title']}>{challenge.title}</span>
                        </div>
                        {challenge.authorName && (
                          <div className={styles['challenge-author']}>{challenge.authorName}</div>
                        )}
                        <div className={styles['challenge-subline']}>
                          {challenge.label && (
                            <span className={styles['meta-chip']}>{challenge.label}</span>
                          )}
                          {challenge.objective?.name && (
                            <span className={styles['meta-chip']}>
                              {challenge.objective.name}
                            </span>
                          )}
                          {statusChips.map((chip) => (
                            <span key={chip} className={styles['meta-chip']}>
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles['tier-cell']}>
                    {challenge.tier ? (
                      <div className={styles['tier-stack']}>
                        <span
                          className={styles['tier-badge']}
                          style={
                            {
                              '--tier-color': getTierColor(challenge.tier.id),
                            } as CSSProperties
                          }
                        >
                          {formatObjectiveTierDisplay(challenge.tier)}
                        </span>
                        <span
                          className={styles['tier-badge']}
                          style={
                            bottomTier
                              ? ({
                                  '--tier-color': getTierColor(bottomTier.id),
                                } as CSSProperties)
                              : undefined
                          }
                        >
                          {formatFractionalTierDisplay(bottomTier, bottomTierFraction)}
                        </span>
                      </div>
                    ) : (
                      <span className={styles['muted']}>Unknown</span>
                    )}
                  </td>
                  {!isNarrowScreen && (
                    <td className={styles['stats-cell']}>
                      <span className={styles['stat-line']}>
                        <strong>{formatNumber(challenge.submissionCount)}</strong>{' '}
                        {challenge.submissionCount === 1 ? 'clear' : 'clears'}
                      </span>
                    </td>
                  )}
                  {!isNarrowScreen && (
                    <td className={styles['created-cell']}>
                      <span className={styles['stat-line']}>
                        <IconCalendar size={12} />
                        <span className={styles['date-text']}>
                          {formatDate(challenge.date_created)}
                        </span>
                      </span>
                    </td>
                  )}
                  <td className={styles['action-cell']}>
                    <button
                      type="button"
                      className={styles['action-button']}
                      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${challenge.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedId(expanded ? null : challenge.id);
                      }}
                    >
                      {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
                <tr className={styles['detail-row']}>
                  <td colSpan={isNarrowScreen ? 4 : 6}>
                    <div
                      className={`${styles['detail-panel']} ${
                        expanded ? styles['detail-panel-open'] : ''
                      }`}
                    >
                      <div className={styles['detail-grid']}>
                        {isNarrowScreen && (
                          <div className={styles['detail-card']}>
                            <div className={styles['detail-label']}>Cleared</div>
                            <div className={styles['detail-value']}>
                              {formatDate(challenge.date_created)}
                            </div>
                          </div>
                        )}
                        <div className={`${styles['detail-card']} ${styles['detail-card-wide']}`}>
                          <div className={styles['detail-label']}>First Clear</div>
                          {challenge.firstClearSubmission ? (
                            <div className={styles['submission']}>
                              <div className={styles['submission-title']}>
                                {challenge.firstClearSubmission.player?.name ?? 'Unknown player'}
                              </div>
                              <div className={styles['submission-meta']}>
                                {challenge.firstClearSubmission.date_verified
                                  ? `Verified ${formatDate(
                                      challenge.firstClearSubmission.date_verified,
                                      true,
                                    )}`
                                  : challenge.firstClearSubmission.date_achieved
                                    ? `Achieved ${formatDate(
                                        challenge.firstClearSubmission.date_achieved,
                                        true,
                                      )}`
                                    : 'Recent submission'}
                              </div>
                              <div className={styles['submission-meta']}>
                                Time Taken: {formatDuration(challenge.firstClearSubmission.time_taken)}
                              </div>
                              {expanded && challenge.firstClearSubmission.proof_url && (
                                <div className={styles['proof-embed']}>
                                  <iframe
                                    src={
                                      getProofEmbedUrl(challenge.firstClearSubmission.proof_url) ??
                                      undefined
                                    }
                                    title={`Proof video for ${challenge.title}`}
                                    className={styles['proof-frame']}
                                    loading="lazy"
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              )}
                              <div className={styles['chip-row']}>
                                {challenge.firstClearSubmission.raw_session_url && (
                                  <a
                                    href={challenge.firstClearSubmission.raw_session_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles['link-chip']}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                    }}
                                  >
                                    Raw session
                                  </a>
                                )}
                                {challenge.firstClearSubmission.verifier?.name && (
                                  <span className={styles['status-chip']}>
                                    Verifier: {challenge.firstClearSubmission.verifier.name}
                                  </span>
                                )}
                                {challenge.firstClearSubmission.is_obsolete && (
                                  <span className={styles['status-chip']}>Obsolete</span>
                                )}
                              </div>
                              {challenge.firstClearSubmission.player_notes && (
                                <div className={styles['detail-text']}>
                                  {challenge.firstClearSubmission.player_notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={styles['empty-state']}>
                              No submissions are listed for this challenge.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
