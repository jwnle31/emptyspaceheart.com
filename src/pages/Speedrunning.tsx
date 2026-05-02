import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { IconExternalLink, IconVideo } from '@tabler/icons-react';
import SEO from '../components/SEO';
import styles from './Speedrunning.module.css';

const LEADERBOARD_URL =
  'https://www.speedrun.com/api/v1/leaderboards/o1y9j9v6/category/7kjpl1gk?embed=players';
const RUNS_PER_PAGE = 100;

type LeaderboardRun = {
  place: number;
  run: {
    id: string;
    weblink: string;
    date: string | null;
    times: {
      primary_t: number;
    };
    videos?: {
      links?: Array<{
        uri: string;
      }>;
    };
    players: Array<{
      id?: string;
      name?: string;
      rel: string;
    }>;
  };
};

type Player = {
  id: string;
  names?: {
    international?: string;
  };
  'name-style'?:
    | {
        style: 'solid';
        color: {
          light: string;
          dark: string;
        };
      }
    | {
        style: 'gradient';
        'color-from': {
          light: string;
          dark: string;
        };
        'color-to': {
          light: string;
          dark: string;
        };
      };
  weblink?: string;
  location?: {
    country?: {
      code?: string;
      names?: {
        international?: string;
      };
    };
  };
};

type LeaderboardResponse = {
  data: {
    runs: LeaderboardRun[];
    players: {
      data: Player[];
    };
  };
};

type LeaderboardRow = {
  place: number;
  runner: string;
  runnerUrl: string;
  time: string;
  seconds: number;
  date: string;
  year: string;
  country: string;
  countryCode?: string;
  videoUrl?: string;
  runUrl: string;
  nameStyle: CSSProperties;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

function getFlagIconCode(countryCode?: string) {
  const normalizedCode = countryCode?.toLowerCase();

  if (normalizedCode === 'es/cn') {
    return 'ic';
  }

  return normalizedCode?.replace('/', '-');
}

function getRunnerNameStyle(player?: Player | null) {
  const nameStyle = player?.['name-style'];

  if (!nameStyle) {
    return {
      style: {},
    };
  }

  if (nameStyle.style === 'solid') {
    return {
      style: {
        '--runner-accent-light': nameStyle.color.light,
        '--runner-accent-dark': nameStyle.color.dark,
      } as CSSProperties,
    };
  }

  return {
    style: {
      '--runner-accent-light': `linear-gradient(90deg, ${nameStyle['color-from'].light}, ${nameStyle['color-to'].light})`,
      '--runner-accent-dark': `linear-gradient(90deg, ${nameStyle['color-from'].dark}, ${nameStyle['color-to'].dark})`,
    } as CSSProperties,
  };
}

function Speedrunning() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [country, setCountry] = useState('all');
  const [page, setPage] = useState(1);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeaderboard() {
      try {
        const response = await fetch(LEADERBOARD_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`speedrun.com returned ${response.status}`);
        }

        const leaderboard = (await response.json()) as LeaderboardResponse;
        const playersById = new Map(
          leaderboard.data.players.data.map((player) => [player.id, player]),
        );

        setRows(
          leaderboard.data.runs.map(({ place, run }) => {
            const runPlayer = run.players[0];
            const player = runPlayer.id ? playersById.get(runPlayer.id) : null;
            const runner =
              player?.names?.international ?? runPlayer.name ?? 'Guest';
            const country =
              player?.location?.country?.names?.international ?? 'Unknown';
            const countryCode = getFlagIconCode(
              player?.location?.country?.code,
            );
            const date = run.date ?? '';
            const runnerNameStyle = getRunnerNameStyle(player);

            return {
              place,
              runner,
              runnerUrl: player?.weblink ?? run.weblink,
              time: formatTime(run.times.primary_t),
              seconds: run.times.primary_t,
              date,
              year: date ? date.slice(0, 4) : 'Unknown',
              country,
              countryCode,
              videoUrl: run.videos?.links?.[0]?.uri,
              runUrl: run.weblink,
              nameStyle: runnerNameStyle.style,
            };
          }),
        );
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load leaderboard',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => controller.abort();
  }, []);

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

  const selectedCountry = countries.find(({ name }) => name === country);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => country === 'all' || row.country === country);
  }, [country, rows]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / RUNS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * RUNS_PER_PAGE;
  const pagedRows = filteredRows.slice(pageStart, pageStart + RUNS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [country]);

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
          <div className={styles['country-filter']}>
            <span>Country</span>
            <button
              type="button"
              onClick={() => setIsCountryMenuOpen((isOpen) => !isOpen)}
              aria-expanded={isCountryMenuOpen}
            >
              {selectedCountry?.code && (
                <span className={`fi fi-${selectedCountry.code}`} />
              )}
              <span>{country === 'all' ? 'All countries' : country}</span>
            </button>

            {isCountryMenuOpen && (
              <div className={styles['country-menu']}>
                <button
                  type="button"
                  onClick={() => {
                    setCountry('all');
                    setIsCountryMenuOpen(false);
                  }}
                >
                  All countries
                </button>
                {countries.map(({ name, code }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setCountry(name);
                      setIsCountryMenuOpen(false);
                    }}
                  >
                    {code && <span className={`fi fi-${code}`} />}
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.summary}>
          {isLoading
            ? 'Loading leaderboard...'
            : `${pageStart + 1}-${Math.min(
                pageStart + RUNS_PER_PAGE,
                filteredRows.length,
              )} of ${filteredRows.length} runs`}
        </div>

        {error ? (
          <p className={styles.message}>{error}</p>
        ) : (
          <div className={styles['table-wrapper']}>
            <table>
              <thead>
                <tr>
                  <th>{country === 'all' ? 'Place' : 'Local'}</th>
                  {country !== 'all' && <th>Global</th>}
                  <th>Runner</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Links</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row, index) => (
                  <tr key={`${row.place}-${row.runner}-${row.seconds}`}>
                    <td>
                      {country === 'all' ? row.place : pageStart + index + 1}
                    </td>
                    {country !== 'all' && <td>{row.place}</td>}
                    <td>
                      <div className={styles['runner-cell']}>
                        {!row.countryCode && (
                          <span className={styles.spacer} aria-hidden="true" />
                        )}
                        {row.countryCode && (
                          <span
                            className={`fi fi-${row.countryCode}`}
                            title={row.country}
                          />
                        )}
                        <span className={styles.swatch} style={row.nameStyle} />
                        <a
                          className={styles.runner}
                          href={row.runnerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={row.nameStyle}
                        >
                          {row.runner}
                        </a>
                      </div>
                    </td>
                    <td className={styles.time}>{row.time}</td>
                    <td>{row.date || 'Unknown'}</td>
                    <td>
                      <div className={styles.links}>
                        <a
                          className={styles['icon-link']}
                          href={row.runUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Run"
                          title="Run"
                        >
                          <IconExternalLink size={14} />
                        </a>
                        {row.videoUrl && (
                          <a
                            className={styles['icon-link']}
                            href={row.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Video"
                            title="Video"
                          >
                            <IconVideo size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pageCount > 1 && (
          <div className={styles.pagination}>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default Speedrunning;
