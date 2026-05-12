import { IconSkull, IconX } from '@tabler/icons-react';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import Goldberry from '../assets/gifs/goldberry.gif';
import styles from './Deathless.module.css';
import DeathlessTable from './deathless/components/DeathlessTable';
import LocationFilter from './deathless/components/LocationFilter';
import Pagination from './deathless/components/Pagination';
import WeightedLegend from './deathless/components/WeightedLegend';
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
    rankingTiers,
    countries,
    location,
    locationGroups,
    isLocationMenuOpen,
    setIsLocationMenuOpen,
    nameSearch,
    setNameSearch,
    weightedTierScores,
    weightedDisplayScale,
    pageCount,
    effectivePage,
    pageStart,
    pageEnd,
    pageRows,
    profileSummaries,
    totalClears,
    isMobileLayout,
    handlePageChange,
    handleModeChange,
    handleDisplayModeChange,
    handleLocationChange,
  } = useDeathlessViewModel();

  return (
    <>
      <SEO
        title="Deathless"
        description="Goldberries deathless challenge rankings by tier profile"
      />
      <section className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={Goldberry} alt="Goldberry" className={styles.image} />
        </div>
        <Breathe />
        <div className={styles.heading}>
          <div>
            <h2>Deathless Challenge</h2>
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
                    rankingMode === 'weighted'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleModeChange('weighted');
                  }}
                >
                  Weighted
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
            : 'Weighted mode defines a tier value from the cumulative global tail probability at or above that tier, then scores each player by the linear sum of their tier clears multiplied by those values; the result reflects the current distribution, so it is not a guarantee that a future clear at the same tier will increase the score by that amount.'}
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
              profileSummaries={profileSummaries}
              weightedDisplayScale={weightedDisplayScale}
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

            {rankingMode === 'weighted' && <Breathe />}

            {rankingMode === 'weighted' && (
              <WeightedLegend
                rankingTiers={rankingTiers}
                weightedTierScores={weightedTierScores}
                weightedDisplayScale={weightedDisplayScale}
              />
            )}
          </>
        )}
      </section>
    </>
  );
}

export default Deathless;
