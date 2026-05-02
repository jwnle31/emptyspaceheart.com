import { useMemo } from 'react';
import { useCategories } from './useCategories';
import { useLeaderboard } from './useLeaderboard';
import { useLevelCategories } from './useLevelCategories';
import { useVariables } from './useVariables';
import {
  type CategoryOption,
  type GameLevel,
} from '../types';
import type { SrcQueryState } from './useSrcQueryState';

function getDefaultCategoryId(categories: CategoryOption[]) {
  return categories[0]?.value ?? null;
}

function getDefaultLevelId(levels: GameLevel[]) {
  return levels[0]?.id ?? null;
}

export function useSrcData({
  requestedCategoryId,
  requestedLevelId,
  scope,
  searchParams,
}: Pick<
  SrcQueryState,
  'requestedCategoryId' | 'requestedLevelId' | 'scope' | 'searchParams'
>) {
  const {
    fullGameCategories,
    levelCategories,
    levels,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const selectedLevelId =
    scope === 'level'
      ? levels.find((level) => level.id === requestedLevelId)?.id ??
        getDefaultLevelId(levels)
      : null;
  const {
    categories: selectedLevelCategories,
    isLoading: selectedLevelCategoriesLoading,
    error: selectedLevelCategoriesError,
  } = useLevelCategories(selectedLevelId);

  const activeCategories = scope === 'level' ? levelCategories : fullGameCategories;
  const selectedCategoryId =
    requestedCategoryId &&
    activeCategories.some((category) => category.value === requestedCategoryId)
      ? requestedCategoryId
      : getDefaultCategoryId(activeCategories);
  const selectedCategory = activeCategories.find(
    (category) => category.value === selectedCategoryId,
  );
  const selectedLevelCategory =
    scope === 'level'
      ? selectedLevelCategories.find(
          (category) => category.value === selectedCategoryId,
        )
      : null;

  const {
    subcategoryFilters,
    isLoading: variablesLoading,
    error: variablesError,
  } = useVariables(
    selectedCategoryId,
    scope === 'level'
      ? selectedLevelCategory?.variables
      : selectedCategory?.variables,
    scope !== 'level',
  );

  const variableSelectionKey = subcategoryFilters
    .map((variable) => {
      const selectedValue = searchParams.get(`var-${variable.id}`);
      const defaultValue = variable.options[0]?.value ?? '';

      return `${variable.id}=${
        selectedValue &&
        variable.options.some(({ value }) => value === selectedValue)
          ? selectedValue
          : defaultValue
      }`;
    })
    .join('|');

  const variableSelections = useMemo(() => {
    const selections = new Map<string, string>();

    subcategoryFilters.forEach((variable) => {
      const selectedValue = searchParams.get(`var-${variable.id}`);
      const defaultValue = variable.options[0]?.value;

      if (
        selectedValue &&
        variable.options.some(({ value }) => value === selectedValue)
      ) {
        selections.set(variable.id, selectedValue);
      } else if (defaultValue) {
        selections.set(variable.id, defaultValue);
      }
    });

    return selections;
  }, [subcategoryFilters, variableSelectionKey]);

  const leaderboardVariableSelections = useMemo(
    () => Array.from(variableSelections, ([id, value]) => ({ id, value })),
    [variableSelections],
  );

  const { rows, isLoading, error } = useLeaderboard(
    scope,
    selectedCategoryId,
    selectedLevelId,
    leaderboardVariableSelections,
  );

  const pageLoading =
    isLoading ||
    categoriesLoading ||
    selectedLevelCategoriesLoading ||
    variablesLoading;
  const pageError =
    error ?? categoriesError ?? selectedLevelCategoriesError ?? variablesError;

  return {
    activeCategories,
    categoriesLoading,
    selectedLevelCategoriesLoading,
    pageError,
    pageLoading,
    rows,
    levels,
    selectedCategory,
    selectedCategoryId,
    selectedLevelId,
    subcategoryFilters,
    variableSelections,
  };
}

export type SrcDataState = ReturnType<typeof useSrcData>;
