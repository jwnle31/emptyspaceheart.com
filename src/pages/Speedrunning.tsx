import { useEffect, useMemo, useState } from 'react';
import SEO from '../components/SEO';
import LocationFilter from './speedrunning/LocationFilter';
import Pagination from './speedrunning/Pagination';
import SpeedrunningTable from './speedrunning/SpeedrunningTable';
import {
  RUNS_PER_PAGE,
  type CountryOption,
  type LocationFilterValue,
} from './speedrunning/types';
import { useLeaderboard } from './speedrunning/useLeaderboard';
import styles from './Speedrunning.module.css';

function Speedrunning() {
  const { rows, isLoading, error } = useLeaderboard();
  const [location, setLocation] = useState<LocationFilterValue>('world');
  const [page, setPage] = useState(1);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

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

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / RUNS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * RUNS_PER_PAGE;
  const pagedRows = filteredRows.slice(pageStart, pageStart + RUNS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [location]);

  const handleLocationSelect = (nextLocation: LocationFilterValue) => {
    setLocation(nextLocation);
    setIsLocationMenuOpen(false);
  };

  const summaryText = isLoading
    ? 'Loading leaderboard...'
    : filteredRows.length === 0
      ? '0 of 0 runs'
      : `${pageStart + 1}-${Math.min(
          pageStart + RUNS_PER_PAGE,
          filteredRows.length,
        )} of ${filteredRows.length} runs`;

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
            href="https://www.speedrun.com/celeste?h=Any&x=7kjpl1gk"
            target="_blank"
            rel="noopener noreferrer"
          >
            speedrun.com
          </a>
        </div>

        <div className={styles.controls}>
          <LocationFilter
            countries={countries as CountryOption[]}
            selectedLocation={location}
            isOpen={isLocationMenuOpen}
            onToggle={() => {
              setIsLocationMenuOpen((isOpen) => !isOpen);
            }}
            onSelect={handleLocationSelect}
          />
        </div>

        <div className={styles.summary}>{summaryText}</div>

        {error ? (
          <p className={styles.message}>{error}</p>
        ) : (
          <SpeedrunningTable
            rows={pagedRows}
            location={location}
            pageStart={pageStart}
          />
        )}

        {pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            pageCount={pageCount}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
          />
        )}
      </section>
    </>
  );
}

export default Speedrunning;
