import Latex from './Latex';
import { formatNumber } from '../utils';
import styles from '../../Deathless.module.css';

export default function WeightedLegend({
  rankingTiers,
  weightedTierScores,
  weightedDisplayScale,
}: {
  rankingTiers: { id: number; sort: number }[];
  weightedTierScores: Map<number, { cumulativeShare: number; weight: number }>;
  weightedDisplayScale: number;
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
          expression="p(t)=100\cdot\frac{1/Q(t)}{\operatorname{mean}(1/Q)}"
          displayMode
        />
        <Latex
          className={styles['weighted-formula']}
          expression="S=\sum_t c_t\,p(t)"
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
            = normalized points per clear for tier <Latex expression="t" />
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
        The score is the additive sum of <Latex expression="c_t \times p(t)" /> and the display scale is
        normalized only for readability.
      </div>
      <details className={styles['weighted-legend-details']}>
        <summary>Tier table</summary>
        <div className={styles['weighted-legend-table-wrap']}>
          <table className={styles['weighted-legend-table']}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Score</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {rankingTiers.map((tier) => {
                const tierWeight = weightedTierScores.get(tier.id);
                if (!tierWeight) {
                  return null;
                }

                return (
                  <tr key={tier.id}>
                    <td>{tier.sort}</td>
                    <td>{formatNumber(Math.round(tierWeight.weight * weightedDisplayScale))}</td>
                    <td>{tierWeight.cumulativeShare.toFixed(5)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
