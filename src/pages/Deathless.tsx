import { IconTrophy } from '@tabler/icons-react';
import SEO from '../components/SEO';
import styles from './Deathless.module.css';
import DeathlessTable from './deathless/components/DeathlessTable';
import LocationFilter from './deathless/components/LocationFilter';
import Pagination from './deathless/components/Pagination';
import WeightedLegend from './deathless/components/WeightedLegend';
import { useDeathlessViewModel } from './deathless/hooks/useDeathlessViewModel';
import { formatNumber, GOLD_BERRIES_API_DOCS } from './deathless/utils';

function Deathless() {
  const {
    loading,
    error,
    search,
    setSearch,
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
        <div className={styles.heading}>
          <div>
            <h2>Deathless Challenge</h2>
          </div>
          <a
            className={styles['docs-link']}
            href={GOLD_BERRIES_API_DOCS}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Goldberries API docs"
          >
            <IconTrophy size={16} />
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

            <label className={styles.control}>
              <span>Search</span>
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  handlePageChange(1);
                }}
                placeholder="Player name"
              />
            </label>

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
            : 'Weighted mode defines a tier weight from the cumulative global tail probability at or above that tier, then scores each player by the linear sum of their tier clears multiplied by those weights. The weighting is data-driven and parameter-free aside from display scaling, so the score surface shifts as the underlying tier distribution changes.'}
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
