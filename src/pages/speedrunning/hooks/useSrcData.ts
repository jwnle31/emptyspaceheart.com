import { useMemo } from 'react';
import { useGames } from './useGames';
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
  requestedGameId,
  requestedLevelId,
  scope,
  searchParams,
}: Pick<
  SrcQueryState,
  'requestedCategoryId' | 'requestedGameId' | 'requestedLevelId' | 'scope' | 'searchParams'
>) {
  const {
    games,
    isLoading: gamesLoading,
    error: gamesError,
  } = useGames();

  const selectedGameId =
    requestedGameId && games.some((game) => game.value === requestedGameId)
      ? requestedGameId
      : games[0]?.value ?? null;

  const {
    fullGameCategories,
    levelCategories,
    levels,
    loadedGameId,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories(selectedGameId);

  const categoriesReady = loadedGameId === selectedGameId && !categoriesLoading;
  const hasFullGameScope = fullGameCategories.length > 0;
  const hasLevelScope = levelCategories.length > 0;
  const effectiveScope =
    scope === 'level'
      ? hasLevelScope
        ? 'level'
        : hasFullGameScope
          ? 'full-game'
          : scope
      : hasFullGameScope
        ? 'full-game'
        : hasLevelScope
          ? 'level'
          : scope;

  const selectedLevelId =
    categoriesReady && effectiveScope === 'level'
      ? levels.find((level) => level.id === requestedLevelId)?.id ??
        getDefaultLevelId(levels)
      : null;
  const {
    categories: selectedLevelCategories,
    isLoading: selectedLevelCategoriesLoading,
    error: selectedLevelCategoriesError,
  } = useLevelCategories(selectedLevelId);

  const activeCategories = categoriesReady
    ? effectiveScope === 'level'
      ? levelCategories
      : fullGameCategories
    : [];
  const selectedCategoryId =
    categoriesReady &&
    requestedCategoryId &&
    activeCategories.some((category) => category.value === requestedCategoryId)
      ? requestedCategoryId
      : getDefaultCategoryId(activeCategories);
  const selectedCategory = activeCategories.find(
    (category) => category.value === selectedCategoryId,
  );
  const selectedLevelCategory =
    categoriesReady && effectiveScope === 'level'
      ? selectedLevelCategories.find(
          (category) => category.value === selectedCategoryId,
        )
      : null;

  const {
    subcategoryFilters,
    loadedCategoryId: loadedVariablesCategoryId,
    isLoading: variablesLoading,
    error: variablesError,
  } = useVariables(
    selectedCategoryId,
    categoriesReady && effectiveScope === 'level'
      ? selectedLevelCategory?.variables
      : selectedCategory?.variables,
    categoriesReady && effectiveScope !== 'level',
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

  const variablesReady =
    !variablesLoading &&
    loadedVariablesCategoryId === selectedCategoryId &&
    subcategoryFilters.length === leaderboardVariableSelections.length;

  const leaderboardReady =
    categoriesReady &&
    !selectedLevelCategoriesLoading &&
    variablesReady &&
    Boolean(selectedCategoryId) &&
    (effectiveScope !== 'level' || Boolean(selectedLevelId)) &&
    (effectiveScope !== 'level' || Boolean(selectedLevelCategory));

  const { rows, isLoading, error } = useLeaderboard(
    selectedGameId,
    effectiveScope,
    selectedCategoryId,
    selectedLevelId,
    leaderboardVariableSelections,
    leaderboardReady,
  );

  const pageLoading =
    isLoading ||
    gamesLoading ||
    categoriesLoading ||
    selectedLevelCategoriesLoading ||
    variablesLoading;
  const pageError =
    error ??
    gamesError ??
    categoriesError ??
    selectedLevelCategoriesError ??
    variablesError;

  return {
    activeCategories,
    categoriesLoading,
    games,
    gamesLoading,
    leaderboardReady,
    selectedLevelCategoriesLoading,
    pageError,
    pageLoading,
    effectiveScope,
    hasFullGameScope,
    hasLevelScope,
    rows,
    levels,
    selectedGameId,
    selectedCategory,
    selectedCategoryId,
    selectedLevelId,
    subcategoryFilters,
    variableSelections,
  };
}

export type SrcDataState = ReturnType<typeof useSrcData>;
