import { Navigate } from 'react-router-dom';
import { IconTrophy } from '@tabler/icons-react';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import WingedStrawberry from '../assets/gifs/winged_strawberry.gif';
import GameFilter from './speedrunning/components/GameFilter';
import CategoryFilter from './speedrunning/components/CategoryFilter';
import LevelFilter from './speedrunning/components/LevelFilter';
import LocationFilter from './speedrunning/components/LocationFilter';
import VariableFilter from './speedrunning/components/VariableFilter';
import Pagination from './speedrunning/table/Pagination';
import SpeedrunningTable from './speedrunning/table/SpeedrunningTable';
import type { SrcViewModelState } from './speedrunning/hooks/useSrcViewModel';
import { useSrcViewModel } from './speedrunning/hooks/useSrcViewModel';
import styles from './Speedrunning.module.css';

type SpeedrunningViewProps = SrcViewModelState;

function SpeedrunningView({
  activeCategories,
  categoryGroups,
  countries,
  currentPage,
  displayMode,
  error,
  effectiveScope,
  displayedRows,
  handleCategorySelect,
  handleDisplaySelect,
  handleGameSelect,
  handleLevelSelect,
  handleLocationSelect,
  handleScopeSelect,
  handleVariableSelect,
  gameGroups,
  games,
  isGameMenuOpen,
  isCategoryMenuOpen,
  isLevelMenuOpen,
  isLocationMenuOpen,
  location,
  locationGroups,
  levels,
  openVariableId,
  pageCount,
  pageLoading,
  pageStart,
  pagedRows,
  leaderboardReady,
  handlePageSelect,
  selectedCategoryId,
  selectedLevelId,
  selectedGameId,
  setIsCategoryMenuOpen,
  setIsLevelMenuOpen,
  setIsGameMenuOpen,
  setIsLocationMenuOpen,
  setOpenVariableId,
  subcategoryFilters,
  summaryText,
  variableSelections,
  hasFullGameScope,
  hasLevelScope,
}: SpeedrunningViewProps) {
  const setPage = (nextPage: number) => {
    handlePageSelect(nextPage);
  };

  const toggleLocationMenu = () => {
    if (isLocationMenuOpen) {
      setIsLocationMenuOpen(false);
      return;
    }

    setIsCategoryMenuOpen(false);
    setIsLevelMenuOpen(false);
    setOpenVariableId(null);
    setIsLocationMenuOpen(true);
  };

  const toggleGameMenu = () => {
    if (isGameMenuOpen) {
      setIsGameMenuOpen(false);
      return;
    }

    setIsLocationMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsLevelMenuOpen(false);
    setOpenVariableId(null);
    setIsGameMenuOpen(true);
  };

  const toggleCategoryMenu = () => {
    if (isCategoryMenuOpen) {
      setIsCategoryMenuOpen(false);
      return;
    }

    setIsLocationMenuOpen(false);
    setIsLevelMenuOpen(false);
    setOpenVariableId(null);
    setIsCategoryMenuOpen(true);
  };

  const toggleLevelMenu = () => {
    if (isLevelMenuOpen) {
      setIsLevelMenuOpen(false);
      return;
    }

    setIsLocationMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setOpenVariableId(null);
    setIsLevelMenuOpen(true);
  };

  const selectedGame = games.find(({ id }) => id === selectedGameId);

  if (
    !pageLoading &&
    leaderboardReady &&
    !error &&
    displayedRows.length > 0 &&
    currentPage > pageCount
  ) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <SEO
        title="Speedrunning"
        description="Leaderboard browsing tool for Celeste speedruns"
      />
      <section className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img
            src={WingedStrawberry}
            alt="Winged Strawberry"
            className={styles.image}
          />
        </div>
        <Breathe />

        <div className={styles.heading}>
          <h2>Speedrun Leaderboard</h2>
          <a
            className={styles['speedrun-link']}
            href={selectedGame?.weblink ?? 'https://www.speedrun.com'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="speedrun.com"
          >
            <IconTrophy size={16} />
          </a>
        </div>

        <div className={styles.controls}>
          <div className={styles['controls-row']}>
            <GameFilter
              games={games}
              selectedGameId={selectedGameId}
              groups={gameGroups}
              isOpen={isGameMenuOpen}
              onToggle={toggleGameMenu}
              onSelect={handleGameSelect}
            />

            <div className={styles['mode-filter']}>
              <span>Scope</span>
              <div
                className={styles['display-toggle']}
                role="tablist"
                aria-label="Scope mode"
              >
                {hasFullGameScope && (
                  <button
                    type="button"
                    className={
                      effectiveScope === 'full-game'
                        ? styles['display-toggle-active']
                        : undefined
                    }
                    onClick={() => {
                      handleScopeSelect('full-game');
                    }}
                  >
                    Full Game
                  </button>
                )}
                {hasLevelScope && (
                  <button
                    type="button"
                    className={
                      effectiveScope === 'level'
                        ? styles['display-toggle-active']
                        : undefined
                    }
                    onClick={() => {
                      handleScopeSelect('level');
                    }}
                  >
                    Level
                  </button>
                )}
              </div>
            </div>

            {effectiveScope === 'level' && (
              <LevelFilter
                levels={levels}
                selectedLevelId={selectedLevelId}
                isOpen={isLevelMenuOpen}
                onToggle={toggleLevelMenu}
                onSelect={handleLevelSelect}
              />
            )}

            <CategoryFilter
              categories={activeCategories}
              selectedCategoryId={selectedCategoryId}
              groups={categoryGroups}
              isOpen={isCategoryMenuOpen}
              onToggle={toggleCategoryMenu}
              onSelect={handleCategorySelect}
            />

            {subcategoryFilters.map((variable) => (
              <VariableFilter
                key={variable.id}
                variable={variable}
                selectedValue={variableSelections.get(variable.id)}
                isOpen={openVariableId === variable.id}
                onToggle={() => {
                  if (openVariableId === variable.id) {
                    setOpenVariableId(null);
                    return;
                  }

                  setIsLocationMenuOpen(false);
                  setIsCategoryMenuOpen(false);
                  setIsLevelMenuOpen(false);
                  setOpenVariableId(variable.id);
                }}
                onSelect={handleVariableSelect}
              />
            ))}
          </div>

          <div className={styles['controls-row']}>
            <LocationFilter
              countries={countries}
              selectedLocation={location}
              groups={locationGroups}
              isOpen={isLocationMenuOpen}
              onToggle={toggleLocationMenu}
              onSelect={handleLocationSelect}
            />
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
                    handleDisplaySelect('person');
                  }}
                >
                  By Person
                </button>
                <button
                  type="button"
                  className={
                    displayMode === 'region'
                      ? styles['display-toggle-active']
                      : undefined
                  }
                  onClick={() => {
                    handleDisplaySelect('region');
                  }}
                >
                  By Region
                </button>
              </div>
            </div>
          </div>
        </div>

        {pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPrevious={() => {
              setPage(Math.max(1, currentPage - 1));
            }}
            onNext={() => {
              setPage(Math.min(pageCount, currentPage + 1));
            }}
          />
        )}

        <div className={styles.summary}>{summaryText}</div>

        {error ? (
          <p className={styles.message}>{error}</p>
        ) : (
          <SpeedrunningTable
            rows={pagedRows}
            location={location}
            rankRegions={displayMode === 'region'}
            pageStart={pageStart}
          />
        )}

        {pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPrevious={() => {
              setPage(Math.max(1, currentPage - 1));
            }}
            onNext={() => {
              setPage(Math.min(pageCount, currentPage + 1));
            }}
          />
        )}
      </section>
    </>
  );
}

function Speedrunning() {
  const pageState = useSrcViewModel();

  return <SpeedrunningView {...pageState} />;
}

export default Speedrunning;
