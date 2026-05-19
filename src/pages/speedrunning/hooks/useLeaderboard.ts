import { useEffect, useState } from 'react';
import {
  type LeaderboardResponse,
  type LeaderboardRow,
  type LeaderboardScope,
} from '../types';
import {
  formatTime,
  getCountryContinent,
  getFlagIconCode,
  getRunnerNameStyle,
} from '../utils';

type VariableSelection = {
  id: string;
  value: string;
};

const LEADERBOARD_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function buildLeaderboardUrl(
  gameId: string,
  scope: LeaderboardScope,
  categoryId: string,
  levelId?: string | null,
  variableSelections: VariableSelection[] = [],
) {
  const baseUrl =
    scope === 'level' && levelId
      ? `https://www.speedrun.com/api/v1/leaderboards/${gameId}/level/${levelId}/${categoryId}`
      : `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}`;

  const params = new URLSearchParams();
  params.set('embed', 'players');

  variableSelections.forEach(({ id, value }) => {
    params.set(`var-${id}`, value);
  });

  return `${baseUrl}?${params.toString()}`;
}

function getBoardTimingSeconds(
  run: LeaderboardResponse['data']['runs'][number]['run'],
  boardTiming: LeaderboardResponse['data']['timing'],
) : { seconds: number | null; isPrimaryFallback: boolean } {
  const timingWithSuffix = run.times[`${boardTiming}_t`];

  if (typeof timingWithSuffix === 'number' && timingWithSuffix > 0) {
    return { seconds: timingWithSuffix, isPrimaryFallback: false };
  }

  if (typeof run.times.primary_t === 'number' && run.times.primary_t > 0) {
    return { seconds: run.times.primary_t, isPrimaryFallback: true };
  }

  return { seconds: null, isPrimaryFallback: false };
}

function getCacheKey(
  gameId: string,
  scope: LeaderboardScope,
  categoryId: string,
  levelId?: string | null,
  variableSelections: VariableSelection[] = [],
) {
  const selectionKey = variableSelections
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(({ id, value }) => `${id}=${value}`)
    .join('&');

  return `speedrunning-leaderboard-cache-v7-${gameId}-${scope}-${levelId ?? 'full'}-${categoryId}-${selectionKey}`;
}

type LeaderboardCache = {
  timestamp: number;
  rows: LeaderboardRow[];
};

function readCachedLeaderboard(
  gameId: string,
  scope: LeaderboardScope,
  categoryId: string,
  levelId?: string | null,
  variableSelections: VariableSelection[] = [],
) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(
      getCacheKey(gameId, scope, categoryId, levelId, variableSelections),
    );

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

function writeCachedLeaderboard(
  gameId: string,
  scope: LeaderboardScope,
  categoryId: string,
  rows: LeaderboardRow[],
  levelId?: string | null,
  variableSelections: VariableSelection[] = [],
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: LeaderboardCache = {
      timestamp: Date.now(),
      rows,
    };

    window.localStorage.setItem(
      getCacheKey(gameId, scope, categoryId, levelId, variableSelections),
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage quota / private mode failures.
  }
}

export function useLeaderboard(
  gameId: string | null,
  scope: LeaderboardScope,
  categoryId: string | null = null,
  levelId?: string | null,
  variableSelections: VariableSelection[] = [],
  enabled = true,
) {
  const shouldLoad =
    enabled &&
    Boolean(gameId) &&
    Boolean(categoryId) &&
    (scope === 'full-game' || Boolean(levelId));
  const activeCategoryId = categoryId ?? '';
  const activeLevelId = levelId ?? undefined;
  const activeGameId = gameId ?? '';
  const cachedLeaderboard = shouldLoad && categoryId
    ? readCachedLeaderboard(activeGameId, scope, activeCategoryId, activeLevelId, variableSelections)
    : null;
  const [rows, setRows] = useState<LeaderboardRow[]>(
    () => cachedLeaderboard ?? [],
  );
  const [isLoading, setIsLoading] = useState(() => cachedLeaderboard === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldLoad || !categoryId || (scope === 'level' && !levelId)) {
      setRows([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const cachedRows = readCachedLeaderboard(
      activeGameId,
      scope,
      activeCategoryId,
      activeLevelId,
      variableSelections,
    );

    if (cachedRows) {
      setRows(cachedRows);
      setIsLoading(false);
      return;
    }

    setRows([]);

    const controller = new AbortController();

    async function loadLeaderboard() {
      try {
        const leaderboardUrl = buildLeaderboardUrl(
          activeGameId,
          scope,
          activeCategoryId,
          activeLevelId,
          variableSelections,
        );

        const leaderboardResponse = await fetch(leaderboardUrl, {
          signal: controller.signal,
        });

        if (!leaderboardResponse.ok) {
          throw new Error(`speedrun.com returned ${leaderboardResponse.status}`);
        }

        const leaderboard = (await leaderboardResponse.json()) as LeaderboardResponse;
        const boardTiming = leaderboard.data.timing;
        const playersById = new Map(
          leaderboard.data.players.data.map((player) => [player.id, player]),
        );

        const nextRows = leaderboard.data.runs.map(({ place, run }) => {
          const runPlayer = run.players[0];
          const player = runPlayer.id ? playersById.get(runPlayer.id) : null;
          const timing = getBoardTimingSeconds(run, boardTiming);
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
            time:
              timing.seconds === null
                ? '—'
                : timing.isPrimaryFallback
                  ? `(${formatTime(timing.seconds)})`
                  : formatTime(timing.seconds),
            seconds: timing.seconds,
            date,
            year: date ? date.slice(0, 4) : 'Unknown',
            country,
            countryCode,
            continent,
            videoUrl: run.videos?.links?.[0]?.uri,
            runUrl: run.weblink,
            nameStyle: runnerNameStyle.style,
            values: run.values,
          };
        });

        setRows(nextRows);
        writeCachedLeaderboard(
          activeGameId,
          scope,
          activeCategoryId,
          nextRows,
          activeLevelId,
          variableSelections,
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
  }, [gameId, scope, categoryId, levelId, variableSelections, enabled, shouldLoad, activeGameId, activeCategoryId, activeLevelId]);

  return { rows, isLoading, error };
}

