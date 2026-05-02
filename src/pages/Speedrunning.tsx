import { useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { IconTrophy } from '@tabler/icons-react';
import SEO from '../components/SEO';
import LocationFilter from './speedrunning/LocationFilter';
import Pagination from './speedrunning/Pagination';
import SpeedrunningTable from './speedrunning/SpeedrunningTable';
import {
  CONTINENT_OPTIONS,
  RUNS_PER_PAGE,
  type DisplayLeaderboardItem,
  type CountryOption,
  type LocationFilterValue,
} from './speedrunning/types';
import type { DropdownGroup } from './speedrunning/DropdownFilter';
import { useLeaderboard } from './speedrunning/useLeaderboard';
import styles from './Speedrunning.module.css';

const DEFAULT_LOCATION: LocationFilterValue = 'world';
const DEFAULT_DISPLAY_MODE: 'person' | 'region' = 'person';
const DEFAULT_PAGE = 1;

function parseLocationParam(value: string | null): LocationFilterValue {
  if (
    value === 'world' ||
    value?.startsWith('continent:') ||
    value?.startsWith('country:')
  ) {
    return value as LocationFilterValue;
  }

  return DEFAULT_LOCATION;
}

function parseDisplayParam(value: string | null): 'person' | 'region' {
  return value === 'region' ? 'region' : DEFAULT_DISPLAY_MODE;
}

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function Speedrunning() {
  const { rows, isLoading, error } = useLeaderboard();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  const location = parseLocationParam(searchParams.get('location'));
  const displayMode = parseDisplayParam(searchParams.get('display'));
  const pageParam = parsePageParam(searchParams.get('page'));

  const countries = useMemo(() => {
    const countriesByName = new Map<string, string | undefined>();

    rows.forEach((row) => {
      if (!countriesByName.has(row.country)) {
        countriesByName.set(row.country, row.countryCode);
      }
    });

    return Array.from(countriesByName, ([name, code]) => ({ name, code })).sort(
      (a, b) => a.name.localeCompare(b.name),
    );
  }, [rows]);

  const locationGroups = useMemo<DropdownGroup[]>(() => {
    return [
      {
        options: [{ value: 'world', label: 'World' }],
      },
      {
        options: CONTINENT_OPTIONS.map((continent) => ({
          value: `continent:${continent}` as const,
          label: continent,
        })),
      },
      {
        options: countries.map(({ name, code }) => ({
          value: `country:${name}` as const,
          label: name,
          leading: code ? <span className={`fi fi-${code}`} /> : undefined,
        })),
      },
    ];
  }, [countries]);

  const filteredRows = useMemo(() => {
    if (location === 'world') {
      return rows;
    }

    if (location.startsWith('continent:')) {
      const continent = location.slice('continent:'.length);
      return rows.filter((row) => row.continent === continent);
    }

    const country = location.slice('country:'.length);
    return rows.filter((row) => row.country === country);
  }, [location, rows]);

  const personRows = useMemo<DisplayLeaderboardItem[]>(() => {
    return filteredRows.map((row) => ({
      ...row,
      rowType: 'row',
      rowKey: `person-${row.runUrl}-${row.place}`,
    }));
  }, [filteredRows]);

  const regionRows = useMemo<DisplayLeaderboardItem[]>(() => {
    if (filteredRows.length === 0) {
      return [];
    }

    const sortBySeconds = (
      left: (typeof filteredRows)[number],
      right: (typeof filteredRows)[number],
    ) =>
      left.seconds - right.seconds ||
      left.place - right.place ||
      left.runner.localeCompare(right.runner);

    const getBestRow = (
      sourceRows: typeof filteredRows,
      selector: (row: (typeof filteredRows)[number]) => string | undefined,
    ) => {
      const bestByKey = new Map<string, (typeof filteredRows)[number]>();

      sourceRows.forEach((row) => {
        const key = selector(row);

        if (!key) {
          return;
        }

        const currentBest = bestByKey.get(key);
        if (!currentBest || sortBySeconds(row, currentBest) < 0) {
          bestByKey.set(key, row);
        }
      });

      return Array.from(bestByKey.values()).sort(sortBySeconds);
    };

    const worldBest = [...filteredRows].sort(sortBySeconds)[0];
    const continentBests = getBestRow(filteredRows, (row) => row.continent);
    const countryBests = getBestRow(filteredRows, (row) => row.country);

    const rankedRows: DisplayLeaderboardItem[] = [];
    const pushRow = (
      row: (typeof filteredRows)[number],
      displayScope: string,
      rowKeyPrefix: string,
      displayRank: number,
    ) => {
      rankedRows.push({
        rowType: 'row',
        ...row,
        rowKey: `${rowKeyPrefix}-${row.runUrl}-${row.place}`,
        displayRank,
        displayScope,
      });
    };

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'separator-World',
      label: 'World',
    });
    if (worldBest) {
      pushRow(worldBest, 'World', 'world', 1);
    }

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'separator-Continents',
      label: 'Continents',
    });
    continentBests.forEach((row, index) => {
      pushRow(row, row.continent ?? 'Unknown', 'continent', index + 1);
    });

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'separator-Countries',
      label: 'Countries',
    });
    countryBests.forEach((row, index) => {
      pushRow(row, row.country, 'country', index + 1);
    });

    return rankedRows;
  }, [filteredRows]);

  const displayedRows =
    displayMode === 'person' ? personRows : regionRows;

  const pageCount = Math.max(1, Math.ceil(displayedRows.length / RUNS_PER_PAGE));
  const currentPage = pageParam;
  const pageStart = (currentPage - 1) * RUNS_PER_PAGE;
  const pagedRows = displayedRows.slice(pageStart, pageStart + RUNS_PER_PAGE);

  const handleLocationSelect = (nextLocation: LocationFilterValue) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('location', nextLocation);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    setSearchParams(nextParams, { replace: true });
    setIsLocationMenuOpen(false);
  };

  const summaryText = isLoading
    ? 'Loading leaderboard...'
    : displayedRows.length === 0
      ? '0 of 0 rows'
      : pageStart >= displayedRows.length
        ? `0 of ${displayedRows.length} rows`
      : `${pageStart + 1}-${Math.min(
          pageStart + RUNS_PER_PAGE,
          displayedRows.length,
        )} of ${displayedRows.length} rows`;

  if (!isLoading && !error && currentPage > pageCount) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <SEO
        title="Speedrunning"
        description="A filterable Celeste Any% leaderboard from speedrun.com"
      />
      <section className={styles.page}>
        <div className={styles.heading}>
          <h2>Speedrunning</h2>
          <a
            className={styles['speedrun-link']}
            href="https://www.speedrun.com/celeste?h=Any&x=7kjpl1gk"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="speedrun.com"
          >
            <IconTrophy size={16} />
          </a>
        </div>

        <div className={styles.controls}>
          <LocationFilter
            countries={countries as CountryOption[]}
            selectedLocation={location}
            groups={locationGroups}
            isOpen={isLocationMenuOpen}
            onToggle={() => {
              setIsLocationMenuOpen((isOpen) => !isOpen);
            }}
            onSelect={handleLocationSelect}
          />
          <div className={styles['mode-filter']}>
            <span>Display</span>
            <div className={styles['display-toggle']} role="tablist" aria-label="Display mode">
              <button
                type="button"
                className={
                  displayMode === 'person'
                    ? styles['display-toggle-active']
                    : undefined
                }
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('display', 'person');
                  nextParams.set('location', location);
                  nextParams.set('page', String(DEFAULT_PAGE));
                  setSearchParams(nextParams, { replace: true });
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
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('display', 'region');
                  nextParams.set('location', location);
                  nextParams.set('page', String(DEFAULT_PAGE));
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                By Region
              </button>
            </div>
          </div>
        </div>

        {pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPrevious={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('location', location);
              nextParams.set('display', displayMode);
              nextParams.set('page', String(Math.max(1, currentPage - 1)));
              setSearchParams(nextParams, { replace: true });
            }}
            onNext={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('location', location);
              nextParams.set('display', displayMode);
              nextParams.set('page', String(Math.min(pageCount, currentPage + 1)));
              setSearchParams(nextParams, { replace: true });
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
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('location', location);
              nextParams.set('display', displayMode);
              nextParams.set('page', String(Math.max(1, currentPage - 1)));
              setSearchParams(nextParams, { replace: true });
            }}
            onNext={() => {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('location', location);
              nextParams.set('display', displayMode);
              nextParams.set('page', String(Math.min(pageCount, currentPage + 1)));
              setSearchParams(nextParams, { replace: true });
            }}
          />
        )}
      </section>
    </>
  );
}

export default Speedrunning;
