import { useEffect, useState } from 'react';
import {
  type Category,
  type CategoryVariable,
  type CategoryVariableFilter,
} from '../types';

type VariableResponse = {
  data: CategoryVariable[];
};

function getCategoryVariablesUrl(categoryId: string) {
  return `https://www.speedrun.com/api/v1/categories/${categoryId}/variables`;
}

function buildVariableFilters(
  variables: CategoryVariable[],
) {
  return variables.map<CategoryVariableFilter>((variable) => ({
    id: variable.id,
    name: variable.name,
    options: Object.entries(variable.values.values)
      .map(([value, option]) => ({
        value,
        label: option.label,
      })),
  }));
}

type VariableBuckets = {
  subcategoryFilters: CategoryVariableFilter[];
};

export function useVariables(
  categoryId: string | null = null,
  embeddedVariables?: Category['variables'] | null,
  allowFetch = true,
) {
  const activeCategoryId = categoryId ?? '';
  const [variableBuckets, setVariableBuckets] = useState<VariableBuckets>({
    subcategoryFilters: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setVariableBuckets({
        subcategoryFilters: [],
      });
      setError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isCurrentRequest = true;

    async function loadVariables() {
      try {
        setVariableBuckets({
          subcategoryFilters: [],
        });
        setIsLoading(true);
        setError(null);

        if (embeddedVariables?.data) {
          if (isCurrentRequest) {
            setVariableBuckets({
              subcategoryFilters: buildVariableFilters(
                embeddedVariables.data.filter(
                  (variable) => variable['is-subcategory'],
                ),
              ),
            });
          }

          return;
        }

        if (!allowFetch) {
          if (isCurrentRequest) {
            setVariableBuckets({
              subcategoryFilters: [],
            });
          }

          return;
        }

        const response = await fetch(getCategoryVariablesUrl(activeCategoryId), {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`speedrun.com returned ${response.status}`);
        }

        const payload = (await response.json()) as VariableResponse;
        const subcategoryVariables = payload.data.filter(
          (variable) => variable['is-subcategory'],
        );

        if (isCurrentRequest) {
          setVariableBuckets({
            subcategoryFilters: buildVariableFilters(subcategoryVariables),
          });
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
            : 'Could not load variables',
        );
      } finally {
        if (!controller.signal.aborted && isCurrentRequest) {
          setIsLoading(false);
        }
      }
    }

    loadVariables();

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [categoryId, embeddedVariables, allowFetch, activeCategoryId]);

  return { ...variableBuckets, isLoading, error };
}
