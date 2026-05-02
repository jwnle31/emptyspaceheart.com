import { useEffect, useState } from 'react';
import type {
  CategoryOption,
  GameCategory,
  LevelCategoriesResponse,
} from '../types';

function getLevelCategoriesUrl(levelId: string) {
  return `https://www.speedrun.com/api/v1/levels/${levelId}/categories?embed=variables`;
}

function mapCategoryOption({
  id,
  name,
  miscellaneous,
  type,
  weblink,
  variables,
}: GameCategory): CategoryOption {
  return {
    id,
    name,
    label: name,
    value: id,
    weblink,
    variables,
    miscellaneous,
    type,
    scope: 'level',
  };
}

export function useLevelCategories(levelId: string | null) {
  const activeLevelId = levelId ?? '';
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(levelId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!levelId) {
      setCategories([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isCurrentRequest = true;

    async function loadLevelCategories() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(getLevelCategoriesUrl(activeLevelId), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`speedrun.com returned ${response.status}`);
        }

        const payload = (await response.json()) as LevelCategoriesResponse;
        const nextCategories = payload.data
          .filter((category) => category.type === 'per-level')
          .map(mapCategoryOption);

        if (isCurrentRequest) {
          setCategories(nextCategories);
        }
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
        if (!controller.signal.aborted && isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadLevelCategories();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [levelId]);

  return { categories, isLoading, error };
}
