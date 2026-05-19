import Latex from './Latex';
import DifferenceValue from './DifferenceValue';
import { formatNumber } from '../utils';
import styles from '../../Deathless.module.css';

export default function WeightedLegend({
  rankingTiers,
  weightedTierScores,
  comparisonWeightedTierScores,
  weightedDisplayScale,
  showDifferences,
}: {
  rankingTiers: { id: number; sort: number }[];
  weightedTierScores: Map<number, { cumulativeShare: number; weight: number }>;
  comparisonWeightedTierScores?: Map<
    number,
    { cumulativeShare: number; weight: number }
  >;
  weightedDisplayScale: number;
  showDifferences: boolean;
}) {
  return (
    <section className={styles['weighted-legend']}>
      <div className={styles['weighted-section-title']}>Formula</div>
      <div className={styles['weighted-formula-row']}>
        <Latex
          className={styles['weighted-formula']}
          expression="Q(t)=\frac{\sum_{k\ge t}G_k}{G_{\mathrm{total}}}"
          displayMode
        />
        <Latex
          className={styles['weighted-formula']}
          expression="p(t)=\frac{1}{Q(t)}"
          displayMode
        />
        <Latex
          className={styles['weighted-formula']}
          expression="S=\sum_{t} c_t\,p(t)"
          displayMode
        />
        <Latex
          className={styles['weighted-formula']}
          expression="S_{\log_2}=1000\cdot\log_2(S+1)"
          displayMode
        />
      </div>
      <dl className={styles['weighted-symbols']}>
        <div>
          <dt>
            <Latex expression="Q(t)" />
          </dt>
          <dd>
            = cumulative global share at or above tier <Latex expression="t" />
          </dd>
        </div>
        <div>
          <dt>
            <Latex expression="G_k" />
          </dt>
          <dd>
            = global clear count for tier <Latex expression="k" />
          </dd>
        </div>
        <div>
          <dt>
            <Latex expression="G_{\mathrm{total}}" />
          </dt>
          <dd>= total global clears across all tiers</dd>
        </div>
        <div>
          <dt>
            <Latex expression="c_t" />
          </dt>
          <dd>
            = player clears in tier <Latex expression="t" />
          </dd>
        </div>
        <div>
          <dt>
            <Latex expression="p(t)" />
          </dt>
          <dd>
            = inverse cumulative share for tier <Latex expression="t" />
          </dd>
        </div>
        <div>
          <dt>
            <Latex expression="S" />
          </dt>
          <dd>= weighted score</dd>
        </div>
      </dl>
      <div className={styles['weighted-legend-note']}>
        <span className={styles['weighted-legend-note-base']}>
          The score is the additive sum of <Latex expression="c_t \times p(t)" />{' '}
          with no additional rescaling. The log2 display is then scaled so the
          lowest tier reads as 1000.
        </span>
      </div>
      <details className={styles['weighted-legend-details']}>
        <summary>Tier Table</summary>
        <div className={styles['weighted-legend-table-wrap']}>
          <div className={styles['weighted-legend-table-grid']}>
            {[
              rankingTiers.filter(({ sort }) => sort >= 12),
              rankingTiers.filter(({ sort }) => sort <= 11 && sort > 0),
            ].map((tiers, columnIndex) => (
              <table
                key={columnIndex}
                className={styles['weighted-legend-table']}
              >
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Raw Score</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => {
                    const tierWeight = weightedTierScores.get(tier.id);
                    if (!tierWeight) {
                      return null;
                    }

                    const comparisonTierWeight =
                      comparisonWeightedTierScores?.get(tier.id);
                    const currentScore = Math.round(
                      tierWeight.weight * weightedDisplayScale,
                    );
                    const comparisonScore = comparisonTierWeight
                      ? Math.round(
                          comparisonTierWeight.weight * weightedDisplayScale,
                        )
                      : undefined;
                    const delta =
                      comparisonScore === undefined
                        ? undefined
                        : currentScore - comparisonScore;

                    return (
                      <tr key={tier.id}>
                        <td>{tier.sort}</td>
                        <td>
                          <div className={styles['tier-score-value']}>
                            <span>{formatNumber(currentScore)}</span>
                            {showDifferences && (
                              <DifferenceValue
                                value={delta}
                                show={showDifferences}
                                className={styles['tier-score-delta']}
                              />
                            )}
                          </div>
                        </td>
                        <td>{tierWeight.cumulativeShare.toFixed(5)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
