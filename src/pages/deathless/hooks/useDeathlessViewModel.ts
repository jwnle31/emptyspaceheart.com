import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDeathlessData } from './useDeathlessData';
import {
  buildLocationGroups,
  type CountryOption,
  type DisplayModeValue,
  type LocationFilterValue,
  parseDisplayParam,
  parseLocationParam,
} from '../location';
import { filterPlayersByLocation } from '../comparison';
import { scorePeerProfiles, type PeerScore } from '../peer';
import {
  compareTierProfiles,
  PAGE_SIZE,
  type DeathlessDisplayRow,
  type RankedPlayer,
  type RankingMode,
} from '../utils';

export function useDeathlessViewModel() {
  const {
    tiers,
    players,
    comparisonPlayers,
    loading,
    error,
  } = useDeathlessData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [includeZeroes, setIncludeZeroes] = useState(false);
  const [showDifferences, setShowDifferences] = useState(false);
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

  const selectedModeValue = searchParams.get('mode') ?? 'peer';
  const rankingMode: RankingMode =
    selectedModeValue === 'absolute' ? 'absolute' : 'peer';
  const displayMode: DisplayModeValue = parseDisplayParam(
    searchParams.get('display'),
  );
  const location = parseLocationParam(searchParams.get('location'));

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

  const locationFilteredPlayers = useMemo(
    () => filterPlayersByLocation(players, location),
    [location, players],
  );

  const comparisonLocationFilteredPlayers = useMemo(
    () => filterPlayersByLocation(comparisonPlayers, location),
    [comparisonPlayers, location],
  );

  const rankingTiers = useMemo(
    () =>
      tiers
        .filter((tier) => tier.sort > 0)
        .sort((left, right) => right.sort - left.sort),
    [tiers],
  );

  const profileOf = useCallback(
    (entry: (typeof players)[number]) =>
      rankingTiers.map((tier) => entry.clears[String(tier.id)] ?? 0),
    [rankingTiers],
  );
  const peerScores = useMemo(() => {
    const scores = scorePeerProfiles(players.map(profileOf));
    return new Map(players.map((entry, index) => [entry.player.id, scores[index]] as const));
  }, [players, profileOf]);
  const comparisonPeerScores = useMemo(() => {
    const scores = scorePeerProfiles(comparisonPlayers.map(profileOf));
    return new Map(comparisonPlayers.map((entry, index) => [entry.player.id, scores[index]] as const));
  }, [comparisonPlayers, profileOf]);

  const comparisonPlayerById = useMemo(
    () =>
      new Map<number, (typeof comparisonPlayers)[number]>(
        comparisonPlayers.map((entry) => [entry.player.id, entry]),
      ),
    [comparisonPlayers],
  );


  const buildRankedPlayers = useCallback((
    sourcePlayers: typeof players,
    scores: Map<number, PeerScore>,
  ) => {
    const filtered = sourcePlayers
      .map<RankedPlayer>((entry) => {
        const tierProfile = profileOf(entry);
        const peerScoreResult = scores.get(entry.player.id) ?? {
          percent: 0,
          key: 0,
          thresholds: tierProfile.map((cumulative) => ({ cumulative, standing: null })),
        };
        const comparisonPlayer = comparisonPlayerById.get(entry.player.id);
        const comparisonPeerScoreResult =
          comparisonPlayer ? comparisonPeerScores.get(entry.player.id) : undefined;

        return {
          ...entry,
          tierProfile,
          peerScore: peerScoreResult.percent,
          peerScoreKey: peerScoreResult.key,
          peerThresholds: peerScoreResult.thresholds,
          comparisonPeerScore: comparisonPeerScoreResult?.percent,
          rank: 0,
        };
      })
      .filter((entry) => includeZeroes || entry.total > 0)
      .sort((left, right) => {
        if (rankingMode === 'peer') {
          const scoreDiff = right.peerScoreKey - left.peerScoreKey;
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
        (rankingMode === 'peer'
          ? previous.peerScoreKey === entry.peerScoreKey
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
  }, [comparisonPeerScores, comparisonPlayerById, includeZeroes, profileOf, rankingMode]);
  
  const rankedPlayersAll = useMemo(
    () => buildRankedPlayers(locationFilteredPlayers, peerScores),
    [
      locationFilteredPlayers,
      peerScores,
      buildRankedPlayers,
    ],
  );

  const comparisonRankedPlayersAll = useMemo(
    () => buildRankedPlayers(comparisonLocationFilteredPlayers, comparisonPeerScores),
    [
      comparisonLocationFilteredPlayers,
      comparisonPeerScores,
      buildRankedPlayers,
    ],
  );

  const comparisonRankByPlayerId = useMemo(
    () =>
      new Map<number, number>(
        comparisonRankedPlayersAll.map((row) => [row.player.id, row.rank]),
      ),
    [comparisonRankedPlayersAll],
  );

  const globalRankByPlayerId = useMemo(
    () =>
      new Map<number, number>(
        buildRankedPlayers(players, peerScores).map((row) => [
          row.player.id,
          row.rank,
        ]),
      ),
    [
      players,
      peerScores,
      buildRankedPlayers,
    ],
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
        comparisonDisplayRank: comparisonRankByPlayerId.get(row.player.id),
        comparisonPeerScore: row.comparisonPeerScore,
      })),
    [comparisonRankByPlayerId, globalRankByPlayerId, rankedPlayers],
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
          peerScore: 0,
          peerScoreKey: 0,
          peerThresholds: [],
          rank: 0,
          displayScope: group.label,
        };
      });

      const visibleAggregateRows = aggregateRows.filter(
        (row) => row.displayScope !== 'Unknown',
      );
      const groupScores = scorePeerProfiles(visibleAggregateRows.map((row) => row.tierProfile));
      visibleAggregateRows.forEach((row, index) => {
        row.peerScore = groupScores[index].percent;
        row.peerScoreKey = groupScores[index].key;
        row.peerThresholds = groupScores[index].thresholds;
      });

      visibleAggregateRows.sort((left, right) => {
        if (rankingMode === 'peer') {
          const scoreDiff = right.peerScoreKey - left.peerScoreKey;
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
          (rankingMode === 'peer'
            ? previous.peerScoreKey === entry.peerScoreKey
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

    const comparisonRankedRows = buildRankedPlayers(
      comparisonLocationFilteredPlayers,
      comparisonPeerScores,
    );
    const comparisonWorldRows = buildAggregateRows(
      comparisonRankedRows,
      'world',
      () => 'world',
      () => 'World',
    );
    const comparisonWorldRanks = new Map<string, { rank: number; score: number }>(
      comparisonWorldRows
        .filter((row) => row.displayScope !== 'Unknown')
        .map((row) => [`world:${row.displayScope}`, { rank: row.rank, score: row.peerScore }]),
    );
    const comparisonContinentRows = buildAggregateRows(
      comparisonRankedRows,
      'continent',
      (row) => row.player.continent ?? 'Unknown',
      (_row, key) => key,
    );
    const comparisonContinentRanks = new Map<string, { rank: number; score: number }>(
      comparisonContinentRows
        .filter((row) => row.displayScope !== 'Unknown')
        .map((row) => [`continent:${row.displayScope}`, { rank: row.rank, score: row.peerScore }]),
    );
    const comparisonCountryRows = buildAggregateRows(
      comparisonRankedRows,
      'country',
      (row) => row.player.countryCode ?? 'unknown',
      (row) => row.player.country ?? row.player.countryCode ?? 'Unknown',
    );
    const comparisonCountryRanks = new Map<string, { rank: number; score: number }>(
      comparisonCountryRows
        .filter((row) => row.displayScope !== 'Unknown')
        .map((row) => [`country:${row.displayScope}`, { rank: row.rank, score: row.peerScore }]),
    );

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
        comparisonDisplayRank: comparisonWorldRanks.get('world:World')?.rank,
        comparisonPeerScore: comparisonWorldRanks.get('world:World')?.score,
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
        comparisonDisplayRank: comparisonContinentRanks.get(
          `continent:${row.displayScope}`,
        )?.rank,
        comparisonPeerScore: comparisonContinentRanks.get(
          `continent:${row.displayScope}`,
        )?.score,
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
        comparisonDisplayRank: comparisonCountryRanks.get(
          `country:${row.displayScope}`,
        )?.rank,
        comparisonPeerScore: comparisonCountryRanks.get(
          `country:${row.displayScope}`,
        )?.score,
      })),
    );

    return rankedRows;
  }, [
    comparisonLocationFilteredPlayers,
    comparisonPeerScores,
    buildRankedPlayers,
    rankingMode,
    rankingTiers,
    rankedPlayersAll,
  ]);

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
    if (nextDisplayMode === 'region') setNameSearch('');
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
    showDifferences,
    setShowDifferences,
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
    rankedPlayers,
    pageCount,
    effectivePage,
    pageStart,
    pageEnd,
    pageRows,
    totalClears,
    isMobileLayout,
    handlePageChange,
    handleModeChange,
    handleDisplayModeChange,
    handleLocationChange,
  };
}


