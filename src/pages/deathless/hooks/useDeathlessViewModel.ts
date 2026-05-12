import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDeathlessData } from '../useDeathlessData';
import {
  buildLocationGroups,
  type CountryOption,
  type DisplayModeValue,
  type LocationFilterValue,
  parseDisplayParam,
  parseLocationParam,
} from '../location';
import {
  buildTierWeights,
  compareTierProfiles,
  getProfileSummary,
  PAGE_SIZE,
  SCORE_SCALE,
  type DeathlessDisplayRow,
  type RankedPlayer,
  type RankingMode,
  scorePlayer,
} from '../utils';

export function useDeathlessViewModel() {
  const { tiers, players, globalCounts, loading, error } = useDeathlessData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [includeZeroes, setIncludeZeroes] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 40rem)');

    const updateLayout = () => {
      setIsMobileLayout(mediaQuery.matches);
    };

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => {
      mediaQuery.removeEventListener('change', updateLayout);
    };
  }, []);

  const selectedModeValue = searchParams.get('mode') ?? 'absolute';
  const rankingMode: RankingMode =
    selectedModeValue === 'weighted' ? 'weighted' : 'absolute';
  const displayMode: DisplayModeValue = parseDisplayParam(
    searchParams.get('display'),
  );
  const location = parseLocationParam(searchParams.get('location'));

  useEffect(() => {
    if (displayMode === 'region' && nameSearch) {
      setNameSearch('');
    }
  }, [displayMode, nameSearch]);

  const currentPageParam = Number(searchParams.get('page') ?? '1');
  const currentPage =
    Number.isFinite(currentPageParam) && currentPageParam > 0 ? currentPageParam : 1;

  const countries = useMemo<CountryOption[]>(() => {
    const countriesByCode = new Map<string, string>([['unknown', 'Unknown']]);

    players.forEach((row) => {
      if (!row.player.countryCode) {
        return;
      }

      if (!countriesByCode.has(row.player.countryCode)) {
        countriesByCode.set(
          row.player.countryCode,
          row.player.country ?? row.player.countryCode,
        );
      }
    });

    const countryList = Array.from(countriesByCode, ([code, name]) => ({ code, name })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );

    return countryList;
  }, [players]);

  const locationGroups = useMemo(
    () => buildLocationGroups(countries),
    [countries],
  );

  const locationFilteredPlayers = useMemo(() => {
    if (location === 'world') {
      return players;
    }

    if (location.startsWith('continent:')) {
      const continent = location.slice('continent:'.length);
      return players.filter((entry) => entry.player.continent === continent);
    }

    const countryCode = location.slice('country:'.length);
    if (countryCode === 'unknown') {
      return players.filter((entry) => !entry.player.countryCode);
    }

    return players.filter((entry) => entry.player.countryCode === countryCode);
  }, [location, players]);

  const rankingTiers = useMemo(
    () =>
      tiers
        .filter((tier) => tier.sort > 0)
        .sort((left, right) => right.sort - left.sort),
    [tiers],
  );

  const weightedTierScores = useMemo(
    () => buildTierWeights(rankingTiers, globalCounts),
    [globalCounts, rankingTiers],
  );

  const weightedDisplayScale = useMemo(() => {
    const tierWeights = Array.from(weightedTierScores.values())
      .map((entry) => entry.weight)
      .filter((value) => value > 0);

    if (tierWeights.length === 0) {
      return 0;
    }

    const minimumWeight = Math.min(...tierWeights);
    return minimumWeight > 0 ? 100 / minimumWeight : 0;
  }, [weightedTierScores]);

  const buildRankedPlayers = (sourcePlayers: typeof players) => {
    const filtered = sourcePlayers
      .map<RankedPlayer>((entry) => {
        const tierProfile = rankingTiers.map(
          (tier) => entry.clears[String(tier.id)] ?? 0,
        );
        const weightedScoreResult =
          rankingMode === 'weighted'
            ? scorePlayer(
                entry.clears,
                rankingTiers,
                weightedTierScores,
                SCORE_SCALE,
              )
            : { score: 0, scoreKey: 0 };

        return {
          ...entry,
          tierProfile,
          weightedScore: weightedScoreResult.score,
          weightedScoreKey: weightedScoreResult.scoreKey,
          rank: 0,
        };
      })
      .filter((entry) => includeZeroes || entry.total > 0)
      .sort((left, right) => {
        if (rankingMode === 'weighted') {
          const scoreDiff = right.weightedScoreKey - left.weightedScoreKey;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          return (
            right.total - left.total ||
            compareTierProfiles(left.tierProfile, right.tierProfile) ||
            left.player.name.localeCompare(right.player.name)
          );
        }

        const tierDiff = compareTierProfiles(left.tierProfile, right.tierProfile);
        if (tierDiff !== 0) {
          return tierDiff;
        }

        return (
          right.total - left.total ||
          left.player.name.localeCompare(right.player.name)
        );
      });

    return filtered.reduce<RankedPlayer[]>((result, entry, index) => {
      const previous = result[result.length - 1];
      const isTie =
        previous &&
        (rankingMode === 'weighted'
          ? previous.weightedScoreKey === entry.weightedScoreKey
          : previous.total === entry.total &&
            previous.tierProfile.length === entry.tierProfile.length &&
            previous.tierProfile.every(
              (value, valueIndex) => value === entry.tierProfile[valueIndex],
            ));

      result.push({
        ...entry,
        rank: isTie ? previous.rank : index + 1,
      });

      return result;
    }, []);
  };
  
  const rankedPlayersAll = useMemo(
    () => buildRankedPlayers(locationFilteredPlayers),
    [includeZeroes, locationFilteredPlayers, rankingMode, rankingTiers, weightedTierScores],
  );

  const globalRankByPlayerId = useMemo(
    () => new Map<number, number>(buildRankedPlayers(players).map((row) => [row.player.id, row.rank])),
    [players, includeZeroes, rankingMode, rankingTiers, weightedTierScores],
  );

  const rankedPlayers = useMemo(
    () => {
      const normalizedNameSearch =
        displayMode === 'person' ? nameSearch.trim().toLowerCase() : '';

      if (!normalizedNameSearch) {
        return rankedPlayersAll;
      }

      return rankedPlayersAll.filter((entry) =>
        entry.player.name.toLowerCase().includes(normalizedNameSearch),
      );
    },
    [displayMode, nameSearch, rankedPlayersAll],
  );

  const personRows = useMemo<DeathlessDisplayRow[]>(
    () =>
      rankedPlayers.map((row, index) => ({
        ...row,
        rowType: 'row',
        rowKey: `person-${row.player.id}-${index}`,
        displayRank: row.rank,
        globalRank: globalRankByPlayerId.get(row.player.id),
      })),
    [globalRankByPlayerId, rankedPlayers],
  );

  const regionRows = useMemo<DeathlessDisplayRow[]>(() => {
    const rankedRows: DeathlessDisplayRow[] = [];

    const hashKey = (value: string) => {
      let hash = 0;

      for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) | 0;
      }

      return Math.abs(hash) + 1;
    };

    const buildAggregateRows = (
      sourceRows: RankedPlayer[],
      rowKeyPrefix: string,
      groupKeySelector: (row: RankedPlayer) => string,
      displayLabelSelector: (row: RankedPlayer, key: string) => string,
    ): Array<RankedPlayer & { displayScope: string }> => {
      const groups = new Map<
        string,
        {
          clears: Record<string, number>;
          total: number;
          label: string;
          player: RankedPlayer['player'];
          rows: RankedPlayer[];
        }
      >();

      sourceRows.forEach((row) => {
        const key = groupKeySelector(row);
        const label = displayLabelSelector(row, key);
        const current = groups.get(key);

        if (!current) {
          groups.set(key, {
            clears: { ...row.clears },
            total: row.total,
            label,
            player: {
              ...row.player,
              name: label,
              countryCode:
                row.player.countryCode && row.player.countryCode !== 'unknown'
                  ? row.player.countryCode
                  : undefined,
              country: row.player.country ?? label,
              continent: row.player.continent ?? undefined,
              account: null,
            },
            rows: [row],
          });
          return;
        }

        current.rows.push(row);
        current.total += row.total;

        Object.entries(row.clears).forEach(([tierId, clears]) => {
          current.clears[tierId] = (current.clears[tierId] ?? 0) + clears;
        });
      });

      const aggregateRows = Array.from(groups.entries()).map(
        ([key, group]): RankedPlayer & { displayScope: string } => {
        const tierProfile = rankingTiers.map((tier) => group.clears[String(tier.id)] ?? 0);
        const weightedScoreResult =
          rankingMode === 'weighted'
            ? scorePlayer(
                group.clears,
                rankingTiers,
                weightedTierScores,
                SCORE_SCALE,
              )
            : { score: 0, scoreKey: 0 };

        const player =
          rowKeyPrefix === 'country'
            ? {
                ...group.player,
                id: hashKey(`${rowKeyPrefix}:${key}`),
                name: group.label,
                countryCode: key === 'unknown' ? undefined : key,
                country: group.label,
                account: null,
              }
            : rowKeyPrefix === 'continent'
              ? {
                  ...group.player,
                  id: hashKey(`${rowKeyPrefix}:${key}`),
                  name: group.label,
                  countryCode: undefined,
                  country: group.label,
                  continent: group.label,
                  account: null,
                }
              : {
                  ...group.player,
                  id: hashKey(`${rowKeyPrefix}:${key}`),
                  name: group.label,
                  countryCode: undefined,
                  country: group.label,
                  continent: undefined,
                  account: null,
                };

        return {
          ...group.rows[0],
          player,
          clears: group.clears,
          total: group.total,
          tierProfile,
          weightedScore: weightedScoreResult.score,
          weightedScoreKey: weightedScoreResult.scoreKey,
          rank: 0,
          displayScope: group.label,
        };
      });

      const visibleAggregateRows = aggregateRows.filter(
        (row) => row.displayScope !== 'Unknown',
      );

      visibleAggregateRows.sort((left, right) => {
        if (rankingMode === 'weighted') {
          const scoreDiff = right.weightedScoreKey - left.weightedScoreKey;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
        } else {
          const tierDiff = compareTierProfiles(left.tierProfile, right.tierProfile);
          if (tierDiff !== 0) {
            return tierDiff;
          }
        }

        const totalDiff = right.total - left.total;
        if (totalDiff !== 0) {
          return totalDiff;
        }

        return left.displayScope!.localeCompare(right.displayScope!);
      });

      return visibleAggregateRows.reduce<Array<RankedPlayer & { displayScope: string }>>((result, entry, index) => {
        const previous = result[result.length - 1];
        const isTie =
          previous &&
          (rankingMode === 'weighted'
            ? previous.weightedScoreKey === entry.weightedScoreKey
            : previous.total === entry.total &&
              previous.tierProfile.length === entry.tierProfile.length &&
              previous.tierProfile.every(
                (value, valueIndex) => value === entry.tierProfile[valueIndex],
              ));

        result.push({
          ...entry,
          rank: isTie ? previous.rank : index + 1,
        });

        return result;
      }, []);
    };

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-world',
      label: 'World',
    });
    rankedRows.push(
      ...buildAggregateRows(
        rankedPlayersAll,
        'world',
        () => 'world',
        () => 'World',
      ).map((row) => ({
        ...row,
        rowType: 'row' as const,
        rowKey: `world-${row.player.id}-${row.rank}`,
      })),
    );

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-continents',
      label: 'Continents',
    });
    rankedRows.push(
      ...buildAggregateRows(
        rankedPlayersAll,
        'continent',
        (row) => row.player.continent ?? 'Unknown',
        (_row, key) => key,
      ).map((row) => ({
        ...row,
        rowType: 'row' as const,
        rowKey: `continent-${row.player.id}-${row.rank}`,
      })),
    );

    rankedRows.push({
      rowType: 'separator',
      rowKey: 'region-countries',
      label: 'Countries',
    });
    rankedRows.push(
      ...buildAggregateRows(
        rankedPlayersAll,
        'country',
        (row) => row.player.countryCode ?? 'unknown',
        (row) => row.player.country ?? row.player.countryCode ?? 'Unknown',
      ).map((row) => ({
        ...row,
        rowType: 'row' as const,
        rowKey: `country-${row.player.id}-${row.rank}`,
      })),
    );

    return rankedRows;
  }, [rankingMode, rankingTiers, rankedPlayersAll, weightedTierScores]);

  const displayedRows = displayMode === 'person' ? personRows : regionRows;

  const pageCount = Math.max(1, Math.ceil(displayedRows.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, pageCount);
  const pageStart =
    displayedRows.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(displayedRows.length, effectivePage * PAGE_SIZE);
  const pageRows = displayedRows.slice(
    (effectivePage - 1) * PAGE_SIZE,
    effectivePage * PAGE_SIZE,
  );

  const profileSummaries = useMemo(
    () =>
      new Map(
        pageRows
          .filter((row): row is Extract<DeathlessDisplayRow, { rowType: 'row' }> => row.rowType === 'row')
          .map((row) => [
            row.player.id,
            getProfileSummary(row.tierProfile, rankingTiers, weightedTierScores),
          ]),
      ),
    [pageRows, rankingTiers, weightedTierScores],
  );

  const totalClears = useMemo(
    () => rankedPlayers.reduce((sum, entry) => sum + entry.total, 0),
    [rankedPlayers],
  );

  const updateSearchParams = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.set(key, value);
    });

    setSearchParams(nextParams, { replace: true });
  };

  const handlePageChange = (nextPage: number) => {
    updateSearchParams({
      page: String(nextPage),
    });
  };

  const handleDisplayModeChange = (nextDisplayMode: DisplayModeValue) => {
    updateSearchParams({
      display: nextDisplayMode,
      page: '1',
    });
  };

  const handleLocationChange = (nextLocation: LocationFilterValue) => {
    updateSearchParams({
      location: nextLocation,
      page: '1',
    });
    setIsLocationMenuOpen(false);
  };

  const handleModeChange = (nextMode: RankingMode) => {
    updateSearchParams({
      mode: nextMode,
      page: '1',
    });
  };

  return {
    loading,
    error,
    includeZeroes,
    setIncludeZeroes,
    rankingMode,
    rankingTiers,
    countries,
    location,
    locationGroups,
    displayMode,
    displayedRows,
    isLocationMenuOpen,
    setIsLocationMenuOpen,
    nameSearch,
    setNameSearch,
    weightedTierScores,
    weightedDisplayScale,
    rankedPlayers,
    pageCount,
    effectivePage,
    pageStart,
    pageEnd,
    pageRows,
    profileSummaries,
    totalClears,
    isMobileLayout,
    handlePageChange,
    handleModeChange,
    handleDisplayModeChange,
    handleLocationChange,
  };
}


