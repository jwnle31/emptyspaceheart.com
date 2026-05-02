import { useEffect, useState } from 'react';
import {
  type CategoryOption,
  type GameLevelsResponse,
  type GameResponse,
  GAME_CATEGORIES_URL,
  GAME_LEVELS_URL,
  type GameCategory,
  type GameLevel,
} from '../types';

const CATEGORY_CACHE_KEY = 'speedrunning-categories-cache-v6';
const CATEGORY_CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000;

type CategoryCache = {
  timestamp: number;
  fullGameCategories: CategoryOption[];
  levelCategories: CategoryOption[];
  levels: GameLevel[];
};

function readCachedCategories() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(CATEGORY_CACHE_KEY);

    if (!rawCache) {
      return null;
    }

    const cached = JSON.parse(rawCache) as CategoryCache;

    if (
      !cached ||
      typeof cached.timestamp !== 'number' ||
      !Array.isArray(cached.fullGameCategories) ||
      !Array.isArray(cached.levelCategories) ||
      !Array.isArray(cached.levels) ||
      Date.now() - cached.timestamp > CATEGORY_CACHE_TTL_MS
    ) {
      return null;
    }

    return {
      timestamp: cached.timestamp,
      fullGameCategories: cached.fullGameCategories.map(normalizeCategoryOption),
      levelCategories: cached.levelCategories.map(normalizeCategoryOption),
      levels: cached.levels,
    };
  } catch {
    return null;
  }
}

function writeCachedCategories(
  fullGameCategories: CategoryOption[],
  levelCategories: CategoryOption[],
  levels: GameLevel[],
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: CategoryCache = {
      timestamp: Date.now(),
      fullGameCategories,
      levelCategories,
      levels,
    };

    window.localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures.
  }
}

function normalizeCategoryOption(category: CategoryOption) {
  return {
    ...category,
    label: category.label || category.name,
    value: category.value || category.id,
  };
}

export function useCategories() {
  const cachedCategories = readCachedCategories();
  const [fullGameCategories, setFullGameCategories] = useState<CategoryOption[]>(
    () => cachedCategories?.fullGameCategories ?? [],
  );
  const [levelCategories, setLevelCategories] = useState<CategoryOption[]>(
    () => cachedCategories?.levelCategories ?? [],
  );
  const [levels, setLevels] = useState<GameLevel[]>(
    () => cachedCategories?.levels ?? [],
  );
  const [isLoading, setIsLoading] = useState(() => cachedCategories === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readCachedCategories();

    if (cached) {
      setFullGameCategories(cached.fullGameCategories);
      setLevelCategories(cached.levelCategories);
      setLevels(cached.levels);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadCategories() {
      try {
        const [gameResponse, levelsResponse] = await Promise.all([
          fetch(GAME_CATEGORIES_URL, { signal: controller.signal }),
          fetch(GAME_LEVELS_URL, { signal: controller.signal }),
        ]);

        if (!gameResponse.ok) {
          throw new Error(`speedrun.com returned ${gameResponse.status}`);
        }

        if (!levelsResponse.ok) {
          throw new Error(`speedrun.com returned ${levelsResponse.status}`);
        }

        const game = (await gameResponse.json()) as GameResponse;
        const levelsPayload = (await levelsResponse.json()) as GameLevelsResponse;

        const nextFullGameCategories: CategoryOption[] = game.data.categories.data
          .filter((category) => category.type === 'per-game')
          .map(({ id, name, miscellaneous, type, weblink, variables }) => ({
            id,
            name,
            label: name,
            value: id,
            weblink,
            variables,
            miscellaneous,
            type,
            scope: 'full-game' as const,
          }));

        const nextLevelCategories: CategoryOption[] = game.data.categories.data
          .filter((category) => category.type === 'per-level')
          .map(mapCategoryOption('level'));

        setFullGameCategories(nextFullGameCategories);
        setLevelCategories(nextLevelCategories);
        setLevels(levelsPayload.data);
        writeCachedCategories(
          nextFullGameCategories,
          nextLevelCategories,
          levelsPayload.data,
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
            : 'Could not load categories',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  return { fullGameCategories, levelCategories, levels, isLoading, error };
}

function mapCategoryOption(scope: 'full-game' | 'level') {
  return ({
    id,
    name,
    miscellaneous,
    type,
    weblink,
    variables,
  }: GameCategory): CategoryOption => ({
    id,
    name,
    label: name,
    value: id,
    weblink,
    variables,
    miscellaneous,
    type,
    scope,
  });
}
