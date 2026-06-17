import { IconSkull } from '@tabler/icons-react';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import Goldberry from '../assets/gifs/goldberry.gif';
import styles from './Challenges.module.css';
import ChallengesTable from './challenges/ChallengesTable';
import { useChallengesViewModel } from './challenges/useChallengesViewModel';

function Challenges() {
  const {
    loading,
    error,
    expandedId,
    setExpandedId,
    isNarrowScreen,
    topChallenges,
    tiersBySort,
  } = useChallengesViewModel();

  return (
    <>
      <SEO
        title="Top 200 Deathless Challenges"
        description="Expandable Goldberries list for the top modded deathless challenges"
      />
      <section className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={Goldberry} alt="Goldberry" className={styles.image} />
        </div>
        <Breathe />
        <div className={styles.heading}>
          <div>
            <h2>Top 200 Modded Deathless Challenges</h2>
          </div>
          <a
            className={styles['docs-link']}
            href="https://goldberries.net/top-golden-list"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Goldberries"
          >
            <IconSkull size={16} />
          </a>
        </div>

        <div className={styles['section-shell']}>
          {loading && <div className={styles.summary}>Loading the top 200 list...</div>}

          {error ? (
            <p className={styles.message}>{error}</p>
          ) : (
            <ChallengesTable
              topChallenges={topChallenges}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              isNarrowScreen={isNarrowScreen}
              tiersBySort={tiersBySort}
            />
          )}
        </div>
      </section>
    </>
  );
}

export default Challenges;
