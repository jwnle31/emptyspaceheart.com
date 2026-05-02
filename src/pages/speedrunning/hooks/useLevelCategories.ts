import { useEffect, useState } from 'react';
import type { Category, CategoryOption } from '../types';

const LEVEL_CATEGORY_CACHE_KEY = 'speedrunning-level-categories-cache-v1';
const LEVEL_CATEGORY_CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000;

type LevelCategoryCache = {
  timestamp: number;
  levelId: string;
  categories: CategoryOption[];
};

function getLevelCategoryUrl(levelId: string) {
  return `https://www.speedrun.com/api/v1/levels/${levelId}/categories?embed=variables`;
}

function readCachedLevelCategories(levelId: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(LEVEL_CATEGORY_CACHE_KEY);

    if (!rawCache) {
      return null;
    }

    const cached = JSON.parse(rawCache) as LevelCategoryCache;

    if (
      !cached ||
      cached.levelId !== levelId ||
      typeof cached.timestamp !== 'number' ||
      !Array.isArray(cached.categories) ||
      Date.now() - cached.timestamp > LEVEL_CATEGORY_CACHE_TTL_MS
    ) {
      return null;
    }

    return cached.categories.map(normalizeCategoryOption);
  } catch {
    return null;
  }
}

function writeCachedLevelCategories(
  levelId: string,
  categories: CategoryOption[],
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const payload: LevelCategoryCache = {
      timestamp: Date.now(),
      levelId,
      categories,
    };

    window.localStorage.setItem(
      LEVEL_CATEGORY_CACHE_KEY,
      JSON.stringify(payload),
    );
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

export function useLevelCategories(levelId: string | null) {
  const cachedCategories = levelId ? readCachedLevelCategories(levelId) : null;
  const activeLevelId = levelId ?? '';
  const [categories, setCategories] = useState<CategoryOption[]>(
    () => cachedCategories ?? [],
  );
  const [isLoading, setIsLoading] = useState(() => levelId !== null && cachedCategories === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    const cached = readCachedLevelCategories(levelId);

    if (cached) {
      setCategories(cached);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadLevelCategories() {
      try {
        const response = await fetch(getLevelCategoryUrl(activeLevelId), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`speedrun.com returned ${response.status}`);
        }

        const payload = (await response.json()) as { data: Category[] };

        const nextCategories = payload.data
          .filter((category) => category.type === 'per-level')
          .map(({ id, name, miscellaneous, type, weblink, variables }) => ({
            id,
            name,
            label: name,
            value: id,
            weblink,
            variables,
            miscellaneous,
            type,
            scope: 'level' as const,
          }));

        setCategories(nextCategories);
        writeCachedLevelCategories(activeLevelId, nextCategories);
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
            : 'Could not load level categories',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    setError(null);
    setCategories([]);
    loadLevelCategories();

    return () => controller.abort();
  }, [levelId, activeLevelId]);

  return { categories, isLoading, error };
}
