import { useEffect, useState } from 'react';
import {
  type LeaderboardResponse,
  type LeaderboardRow,
  LEADERBOARD_URL,
  formatTime,
  getFlagIconCode,
  getCountryContinent,
  getRunnerNameStyle,
} from './types';

const LEADERBOARD_CACHE_KEY = 'speedrunning-leaderboard-cache-v1';
const LEADERBOARD_CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000;

type LeaderboardCache = {
  timestamp: number;
  rows: LeaderboardRow[];
};

function readCachedLeaderboard() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(LEADERBOARD_CACHE_KEY);

    if (!rawCache) {
      return null;
    }

    const cached = JSON.parse(rawCache) as LeaderboardCache;

    if (
      !cached ||
      typeof cached.timestamp !== 'number' ||
      !Array.isArray(cached.rows) ||
      Date.now() - cached.timestamp > LEADERBOARD_CACHE_TTL_MS
    ) {
      return null;
    }

    return cached.rows;
  } catch {
    return null;
  }
}

function writeCachedLeaderboard(rows: LeaderboardRow[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: LeaderboardCache = {
      timestamp: Date.now(),
      rows,
    };

    window.localStorage.setItem(
      LEADERBOARD_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage quota / private mode failures.
  }
}

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>(() => readCachedLeaderboard() ?? []);
  const [isLoading, setIsLoading] = useState(() => readCachedLeaderboard() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedRows = readCachedLeaderboard();

    if (cachedRows) {
      setRows(cachedRows);
      setIsLoading(false);
      return;
    }

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

        const nextRows = leaderboard.data.runs.map(({ place, run }) => {
          const runPlayer = run.players[0];
          const player = runPlayer.id ? playersById.get(runPlayer.id) : null;
          const runner =
            player?.names?.international ?? runPlayer.name ?? 'Guest';
          const country =
            player?.location?.country?.names?.international ?? 'Unknown';
          const countryCode = getFlagIconCode(player?.location?.country?.code);
          const continent = getCountryContinent(player?.location?.country?.code);
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
            continent,
            videoUrl: run.videos?.links?.[0]?.uri,
            runUrl: run.weblink,
            nameStyle: runnerNameStyle.style,
          };
        });

        setRows(nextRows);
        writeCachedLeaderboard(nextRows);
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

  return { rows, isLoading, error };
}
