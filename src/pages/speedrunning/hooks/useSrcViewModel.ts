import { createElement, useMemo, useState } from 'react';
import type { DropdownGroup } from '../types';
import {
  CONTINENT_OPTIONS,
  RUNS_PER_PAGE,
  type CountryOption,
  type DisplayLeaderboardItem,
  type LocationFilterValue,
  type LeaderboardScope,
} from '../types';
import { useSrcData } from './useSrcData';
import { useSrcQueryState } from './useSrcQueryState';

export function useSrcViewModel() {
  const query = useSrcQueryState();
  const data = useSrcData(query);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [openVariableId, setOpenVariableId] = useState<string | null>(null);

  const closeAllMenus = () => {
    setIsLocationMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsLevelMenuOpen(false);
    setOpenVariableId(null);
  };

  const countries = useMemo<CountryOption[]>(() => {
    const countriesByName = new Map<string, string | undefined>();

    data.rows.forEach((row) => {
      if (!countriesByName.has(row.country)) {
        countriesByName.set(row.country, row.countryCode);
      }
    });

    return Array.from(countriesByName, ([name, code]) => ({ name, code })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );
  }, [data.rows]);

  const locationGroups = useMemo<DropdownGroup[]>(() => {
    return [
      {
        options: [{ value: 'world', label: 'World' }],
      },
      {
        options: CONTINENT_OPTIONS.map((continent) => ({
          value: `continent:${continent}` as const,
          label: continent,
        })),
      },
      {
        options: countries.map(({ name, code }) => ({
          value: `country:${name}` as const,
          label: name,
          leading: code
            ? createElement('span', { className: `fi fi-${code}` })
            : undefined,
        })),
      },
    ];
  }, [countries]);

  const categoryGroups = useMemo<DropdownGroup[]>(() => {
    return [
      {
        options: data.activeCategories.map((category) => ({
          value: category.value,
          label: category.label || category.name,
        })),
      },
    ];
  }, [data.activeCategories]);

  const filteredRows = useMemo(() => {
    if (query.location === 'world') {
      return data.rows;
    }

    if (query.location.startsWith('continent:')) {
      const continent = query.location.slice('continent:'.length);
      return data.rows.filter((row) => row.continent === continent);
    }

    const country = query.location.slice('country:'.length);
    return data.rows.filter((row) => row.country === country);
  }, [data.rows, query.location]);

  const personRows = useMemo<DisplayLeaderboardItem[]>(() => {
    return filteredRows.map((row, index) => ({
      ...row,
      rowType: 'row',
      rowKey: `person-${row.runUrl}-${row.place}-${index}`,
    }));
  }, [filteredRows]);

  const regionRows = useMemo<DisplayLeaderboardItem[]>(() => {
    const rankedRows: DisplayLeaderboardItem[] = [];

    const sortBySeconds = (
      left: (typeof filteredRows)[number],
      right: (typeof filteredRows)[number],
    ) =>
      left.seconds - right.seconds ||
      left.place - right.place ||
      left.runner.localeCompare(right.runner);

    const getBestRow = (
      sourceRows: typeof filteredRows,
      selector: (row: (typeof filteredRows)[number]) => string | undefined,
    ) => {
      const bestByKey = new Map<string, (typeof filteredRows)[number]>();

      sourceRows.forEach((row) => {
        const key = selector(row);

        if (!key) {
          return;
        }

        const currentBest = bestByKey.get(key);
        if (!currentBest || sortBySeconds(row, currentBest) < 0) {
          bestByKey.set(key, row);
        }
      });

      return Array.from(bestByKey.values()).sort(sortBySeconds);
    };

    const worldBest = [...filteredRows].sort(sortBySeconds)[0];
    const continentBests = getBestRow(filteredRows, (row) => row.continent);
    const countryBests = getBestRow(filteredRows, (row) => row.country);

    const pushRow = (
      row: (typeof filteredRows)[number],
      displayScope: string,
      rowKeyPrefix: string,
      displayRank: number,
    ) => {
      rankedRows.push({
        rowType: 'row',
        ...row,
        rowKey: `${rowKeyPrefix}-${row.runUrl}-${row.place}-${displayRank}`,
        displayRank,
        displayScope,
      });
    };

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-world',
      label: 'World',
    });
    if (worldBest) {
      pushRow(worldBest, 'World', 'world', 1);
    }

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-continents',
      label: 'Continents',
    });
    continentBests.forEach((row, index) => {
      pushRow(row, row.continent ?? 'Unknown', 'continent', index + 1);
    });

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-countries',
      label: 'Countries',
    });
    countryBests.forEach((row, index) => {
      pushRow(row, row.country, 'country', index + 1);
    });

    return rankedRows;
  }, [filteredRows]);

  const displayedRows =
    query.displayMode === 'person' ? personRows : regionRows;

  const pageCount = Math.max(1, Math.ceil(displayedRows.length / RUNS_PER_PAGE));
  const currentPage = query.page;
  const pageStart = (currentPage - 1) * RUNS_PER_PAGE;
  const pagedRows = displayedRows.slice(pageStart, pageStart + RUNS_PER_PAGE);

  const summaryText = data.pageLoading
    ? 'Loading leaderboard...'
    : displayedRows.length === 0
      ? '0 of 0 rows'
      : pageStart >= displayedRows.length
        ? `0 of ${displayedRows.length} rows`
        : `${pageStart + 1}-${Math.min(
            pageStart + RUNS_PER_PAGE,
            displayedRows.length,
          )} of ${displayedRows.length} rows`;

  const handleLocationSelect = (nextLocation: LocationFilterValue) => {
    query.setLocation(nextLocation);
    closeAllMenus();
  };

  const handleDisplaySelect = (nextDisplay: 'person' | 'region') => {
    query.setDisplayMode(nextDisplay);
  };

  const handlePageSelect = (nextPage: number) => {
    query.setPage(nextPage);
  };

  const handleScopeSelect = (nextScope: LeaderboardScope) => {
    query.setScope(nextScope, data.levels[0]?.id ?? null);
    closeAllMenus();
  };

  const handleLevelSelect = (nextLevelId: string) => {
    query.setLevel(nextLevelId);
    closeAllMenus();
  };

  const handleCategorySelect = (nextCategoryId: string) => {
    query.setCategory(nextCategoryId);
    closeAllMenus();
  };

  const handleVariableSelect = (variableId: string, value: string) => {
    query.setVariable(variableId, value);
    setOpenVariableId(null);
  };

  return {
    activeCategories: data.activeCategories,
    categoryGroups,
    closeAllMenus,
    countries,
    currentPage,
    displayMode: query.displayMode,
    displayedRows,
    error: data.pageError,
    filteredRows,
    handleCategorySelect,
    handleDisplaySelect,
    handleLevelSelect,
    handleLocationSelect,
    handlePageSelect,
    handleScopeSelect,
    handleVariableSelect,
    isCategoryMenuOpen,
    isLevelMenuOpen,
    isLocationMenuOpen,
    levels: data.levels,
    location: query.location,
    locationGroups,
    openVariableId,
    pageCount,
    pageLoading: data.pageLoading,
    pageStart,
    pagedRows,
    scope: query.scope,
    selectedCategoryId: data.selectedCategoryId,
    selectedLevelId: data.selectedLevelId,
    setIsCategoryMenuOpen,
    setIsLevelMenuOpen,
    setIsLocationMenuOpen,
    setOpenVariableId,
    subcategoryFilters: data.subcategoryFilters,
    summaryText,
    variableSelections: data.variableSelections,
  };
}

export type SrcViewModelState = ReturnType<typeof useSrcViewModel>;
