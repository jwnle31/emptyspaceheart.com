import { IconSkull, IconX } from '@tabler/icons-react';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import Goldberry from '../assets/gifs/goldberry.gif';
import styles from './Deathless.module.css';
import DeathlessTable from './deathless/components/DeathlessTable';
import LocationFilter from './deathless/components/LocationFilter';
import Pagination from './deathless/components/Pagination';
import { getMonthStartKey } from './deathless/comparison';
import { useDeathlessViewModel } from './deathless/hooks/useDeathlessViewModel';
import { formatNumber } from './deathless/utils';

function Deathless() {
  const {
    loading,
    error,
    includeZeroes,
    setIncludeZeroes,
    rankingMode,
    displayMode,
    rankedPlayers,
    countries,
    location,
    locationGroups,
    isLocationMenuOpen,
    setIsLocationMenuOpen,
    nameSearch,
    setNameSearch,
    rankingTiers,
    showDifferences,
    setShowDifferences,
    pageCount,
    effectivePage,
    pageStart,
    pageEnd,
    pageRows,
    totalClears,
    isMobileLayout,
    handlePageChange,
    handleModeChange,
    handleDisplayModeChange,
    handleLocationChange,
  } = useDeathlessViewModel();
  const comparisonDateLabel = getMonthStartKey();

  return (
    <>
      <SEO
        title="Deathless"
        description="Goldberries deathless challenge rankings by peer comparison"
      />
      <section className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={Goldberry} alt="Goldberry" className={styles.image} />
        </div>
        <Breathe />
        <div className={styles.heading}>
          <div>
            <h2>Deathless Ranking</h2>
          </div>
          <a
            className={styles['docs-link']}
            href="https://goldberries.net/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Goldberries"
          >
            <IconSkull size={16} />
          </a>
        </div>

        <div className={styles.controls}>
          <div className={styles['controls-row']}>
            <div className={styles['mode-filter']}>
              <span>Ranking</span>
              <div
                className={styles['display-toggle']}
                role="tablist"
                aria-label="Ranking mode"
              >
                <button
                  type="button"
                  className={
                    rankingMode === 'absolute'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleModeChange('absolute');
                  }}
                >
                  Absolute
                </button>
                <button
                  type="button"
                  className={
                    rankingMode === 'peer'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleModeChange('peer');
                  }}
                >
                  Peer
                </button>
              </div>
            </div>

            <div className={styles['mode-filter']}>
              <span>Display</span>
              <div
                className={styles['display-toggle']}
                role="tablist"
                aria-label="Display mode"
              >
                <button
                  type="button"
                  className={
                    displayMode === 'person'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleDisplayModeChange('person');
                  }}
                >
                  Player
                </button>
                <button
                  type="button"
                  className={
                    displayMode === 'region'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleDisplayModeChange('region');
                  }}
                >
                  Region
                </button>
              </div>
            </div>

            <LocationFilter
              countries={countries}
              selectedLocation={location}
              groups={locationGroups}
              isOpen={isLocationMenuOpen}
              onToggle={() => {
                setIsLocationMenuOpen((current) => !current);
              }}
              onSelect={handleLocationChange}
            />
            {displayMode === 'person' && (
              <label className={styles.control}>
                <span>Search</span>
                <div className={styles['search-control']}>
                  <input
                    type="search"
                    value={nameSearch}
                    className={styles['search-input']}
                    placeholder="Filter by player name"
                    onChange={(event) => {
                      setNameSearch(event.target.value);
                      handlePageChange(1);
                    }}
                  />
                  {nameSearch && (
                    <button
                      type="button"
                      className={styles['search-clear']}
                      aria-label="Clear search"
                      onClick={() => {
                        setNameSearch('');
                        handlePageChange(1);
                      }}
                    >
                      <IconX size={14} stroke={2.5} />
                    </button>
                  )}
                </div>
              </label>
            )}

            <div className={styles['controls-utility']}>
              <label className={styles['toggle-control']}>
                <input
                  type="checkbox"
                  checked={showDifferences}
                  onChange={(event) => {
                    setShowDifferences(event.target.checked);
                  }}
                />
                <span>
                  Differences
                  <span className={styles['toggle-control-subtle']}>
                    [{comparisonDateLabel}]
                  </span>
                </span>
              </label>

              <label className={styles['toggle-control']}>
                <input
                  type="checkbox"
                  checked={includeZeroes}
                  onChange={(event) => {
                    setIncludeZeroes(event.target.checked);
                    handlePageChange(1);
                  }}
                />
                <span>Include zeroes</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          {loading
            ? 'Loading deathless rankings...'
            : rankedPlayers.length > 0
              ? `${formatNumber(pageStart)}-${formatNumber(
                  pageEnd,
                )} of ${formatNumber(rankedPlayers.length)} players | ${formatNumber(totalClears)} total clears`
              : 'No players match this filter.'}
        </div>

        <p className={styles.description}>
          {rankingMode === 'absolute'
          ? 'Absolute mode ranks players by the full tier-clear profile, from higher tiers down.'
            : (
                <>
                  Peer mode compares each player&apos;s cumulative clears at every
                  tier threshold with every other active player. A win earns 1
                  point, a tie earns ½, and a loss earns 0. The score is the
                  percentage of possible points across all thresholds. Players
                  are ranked by their exact point total before rounding the
                  displayed percentage. Region scores compare continents with
                  continents and countries with countries. Open a Peer record
                  to see the cumulative clears and standing at each threshold.
                </>
              )}
        </p>
        {error ? (
          <p className={styles.message}>{error}</p>
        ) : (
          <>
            {pageCount > 1 && rankedPlayers.length > 0 && (
              <Pagination
                currentPage={effectivePage}
                pageCount={pageCount}
                onPrevious={() => {
                  handlePageChange(Math.max(1, effectivePage - 1));
                }}
                onNext={() => {
                  handlePageChange(Math.min(pageCount, effectivePage + 1));
                }}
              />
            )}

            <DeathlessTable
              displayMode={displayMode}
              location={location}
              rankingMode={rankingMode}
              rows={pageRows}
              rankingTiers={rankingTiers}
              showDifferences={showDifferences}
              isMobileLayout={isMobileLayout}
            />

            {pageCount > 1 && rankedPlayers.length > 0 && (
              <Pagination
                currentPage={effectivePage}
                pageCount={pageCount}
                onPrevious={() => {
                  handlePageChange(Math.max(1, effectivePage - 1));
                }}
                onNext={() => {
                  handlePageChange(Math.min(pageCount, effectivePage + 1));
                }}
              />
            )}

          </>
        )}
      </section>
    </>
  );
}

export default Deathless;
