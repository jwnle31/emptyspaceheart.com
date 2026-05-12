import { useEffect, useState } from 'react';
import {
  getCountryContinent,
  getCountryName,
  getFlagIconCode,
} from '../../../utils/country';

type DifficultyTier = {
  id: number;
  name: string;
  sort: number;
};

type DeathlessPlayerAccount = {
  role?: number;
  is_suspended?: boolean;
  name_color_start?: string;
  name_color_end?: string;
  country?: string;
};

type DeathlessPlayer = {
  id: number;
  name: string;
  country?: string;
  countryCode?: string;
  continent?: string;
  account?: DeathlessPlayerAccount | null;
};

type DeathlessPlayerTierClearCounts = {
  player: DeathlessPlayer;
  clears: Record<string, number>;
  total: number;
};

type CachedPayload<T> = {
  timestamp: number;
  data: T;
};

type DeathlessDataState = {
  tiers: DifficultyTier[];
  players: DeathlessPlayerTierClearCounts[];
  globalCounts: Record<string, number>;
  loading: boolean;
  error: string | null;
};

const CACHE_TTL_MS = 2 * 24 * 60 * 60 * 1000;
const DIFFICULTY_CACHE_KEY = 'deathless:difficulty:v1';
const PLAYER_CACHE_KEY = 'deathless:player-tier-clear-counts:v1';
const PLAYER_META_CACHE_KEY = 'deathless:player-all-customization:v2';
const GLOBAL_STATS_CACHE_KEY = 'deathless:global-stats:v1';

function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as CachedPayload<T>;
    if (
      !cached ||
      typeof cached !== 'object' ||
      typeof cached.timestamp !== 'number' ||
      Date.now() - cached.timestamp > CACHE_TTL_MS
    ) {
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload && typeof payload.message === 'string') {
        message = payload.message;
      }
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function fetchWithCache<T>(
  key: string,
  url: string,
  signal: AbortSignal,
) {
  const cached = readCache<T>(key);
  if (cached) {
    return cached;
  }

  const data = await fetchJson<T>(url, signal);
  writeCache(key, data);
  return data;
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object') {
    const maybeData = (value as { data?: unknown }).data;
    if (Array.isArray(maybeData)) {
      return maybeData as T[];
    }

    const maybeItems = (value as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) {
      return maybeItems as T[];
    }
  }

  return [];
}

function extractCountryInfo(entry: unknown) {
  if (!entry || typeof entry !== 'object') {
    return {};
  }

  const source = entry as {
    country?:
      | string
      | {
          code?: unknown;
          name?: unknown;
          names?: { international?: unknown };
        };
    country_code?: unknown;
    countryCode?: unknown;
    account?: {
      country?: unknown;
    };
    location?: {
      country?: {
        code?: unknown;
        names?: { international?: unknown };
      };
    };
    country_name?: unknown;
    countryName?: unknown;
  };

  const countryCode =
    typeof source.countryCode === 'string'
      ? source.countryCode
      : typeof source.country_code === 'string'
        ? source.country_code
        : source.country &&
            typeof source.country === 'object' &&
            typeof source.country.code === 'string'
          ? source.country.code
          : typeof source.account?.country === 'string'
            ? source.account.country
            : typeof source.location?.country?.code === 'string'
              ? source.location.country.code
              : typeof source.country === 'string'
                ? source.country
                : undefined;

  const countryName =
    typeof source.countryName === 'string'
      ? source.countryName
      : typeof source.country_name === 'string'
        ? source.country_name
        : source.country &&
            typeof source.country === 'object' &&
            typeof source.country.name === 'string'
          ? source.country.name
          : source.country &&
              typeof source.country === 'object' &&
              typeof source.country.names?.international === 'string'
            ? source.country.names.international
            : typeof source.location?.country?.names?.international === 'string'
              ? source.location.country.names.international
              : typeof source.country === 'string' && countryCode
                ? source.country
                : undefined;

  return {
    countryCode: getFlagIconCode(countryCode),
    country: countryName ?? getCountryName(countryCode),
    continent: getCountryContinent(countryCode),
  };
}

function extractPlayerId(entry: unknown) {
  if (!entry || typeof entry !== 'object') {
    return undefined;
  }

  const source = entry as {
    id?: unknown;
    player?: { id?: unknown };
    user?: { id?: unknown };
  };

  const directId = Number(source.id);
  if (Number.isFinite(directId)) {
    return directId;
  }

  const nestedPlayerId = Number(source.player?.id);
  if (Number.isFinite(nestedPlayerId)) {
    return nestedPlayerId;
  }

  const nestedUserId = Number(source.user?.id);
  if (Number.isFinite(nestedUserId)) {
    return nestedUserId;
  }

  return undefined;
}

export type {
  DifficultyTier,
  DeathlessPlayer,
  DeathlessPlayerAccount,
  DeathlessPlayerTierClearCounts,
};

export function useDeathlessData(): DeathlessDataState {
  const [tiers, setTiers] = useState<DifficultyTier[]>([]);
  const [players, setPlayers] = useState<DeathlessPlayerTierClearCounts[]>([]);
  const [globalCounts, setGlobalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadData() {
      try {
        const [tierData, playerData, playerMetaData, globalStatsData] =
          await Promise.all([
            fetchWithCache<unknown>(
              DIFFICULTY_CACHE_KEY,
              'https://goldberries.net/api/difficulty?id=all',
              controller.signal,
            ),
            fetchWithCache<unknown>(
              PLAYER_CACHE_KEY,
              'https://goldberries.net/api/stats/player-tier-clear-counts',
              controller.signal,
            ),
            fetchWithCache<unknown>(
              PLAYER_META_CACHE_KEY,
              'https://goldberries.net/api/player/all?customization=true',
              controller.signal,
            ),
            fetchWithCache<unknown>(
              GLOBAL_STATS_CACHE_KEY,
              'https://goldberries.net/api/stats/global',
              controller.signal,
            ),
          ]);

        if (!active) {
          return;
        }

        const normalizedTiers = toArray<DifficultyTier>(tierData).sort(
          (left, right) =>
            right.sort - left.sort || left.name.localeCompare(right.name),
        );
        const playerMetaById = new Map<
          number,
          { country?: string; countryCode?: string; continent?: string }
        >();
        toArray<unknown>(playerMetaData).forEach((entry) => {
          const id = extractPlayerId(entry);
          if (id === undefined) {
            return;
          }

          const existing = playerMetaById.get(id) ?? {};
          playerMetaById.set(id, {
            ...existing,
            ...extractCountryInfo(entry),
          });
        });

        const normalizedPlayers = toArray<DeathlessPlayerTierClearCounts>(
          playerData,
        ).map((entry) => ({
          ...entry,
          player: {
            ...entry.player,
            ...playerMetaById.get(entry.player.id),
          },
        }));
        const normalizedGlobalCounts = (() => {
          if (!globalStatsData || typeof globalStatsData !== 'object') {
            return {};
          }

          const payload = globalStatsData as {
            difficulty?: Record<string, unknown>;
          };

          const difficulty = payload.difficulty ?? {};

          return Object.entries(difficulty).reduce<Record<string, number>>(
            (result, [key, value]) => {
              const count = Number(value);
              if (Number.isFinite(count)) {
                result[key] = count;
              }

              return result;
            },
            {},
          );
        })();

        setTiers(normalizedTiers);
        setPlayers(normalizedPlayers);
        setGlobalCounts(normalizedGlobalCounts);
        setError(null);
      } catch (caughtError) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load deathless rankings.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return { tiers, players, globalCounts, loading, error };
}


