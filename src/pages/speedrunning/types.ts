import type { CSSProperties } from 'react';
import countryData from 'flag-icons/country.json';

export const LEADERBOARD_URL =
  'https://www.speedrun.com/api/v1/leaderboards/o1y9j9v6/category/7kjpl1gk?embed=players';
export const RUNS_PER_PAGE = 100;
export const CONTINENT_OPTIONS = [
  'Africa',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
] as const;

export type LocationFilterValue =
  | 'world'
  | `continent:${(typeof CONTINENT_OPTIONS)[number]}`
  | `country:${string}`;

export type LeaderboardRun = {
  place: number;
  run: {
    id: string;
    weblink: string;
    date: string | null;
    times: {
      primary_t: number;
    };
    videos?: {
      links?: Array<{
        uri: string;
      }>;
    };
    players: Array<{
      id?: string;
      name?: string;
      rel: string;
    }>;
  };
};

export type Player = {
  id: string;
  names?: {
    international?: string;
  };
  'name-style'?:
    | {
        style: 'solid';
        color: {
          light: string;
          dark: string;
        };
      }
    | {
        style: 'gradient';
        'color-from': {
          light: string;
          dark: string;
        };
        'color-to': {
          light: string;
          dark: string;
        };
      };
  weblink?: string;
  location?: {
    country?: {
      code?: string;
      names?: {
        international?: string;
      };
    };
  };
};

export type LeaderboardResponse = {
  data: {
    runs: LeaderboardRun[];
    players: {
      data: Player[];
    };
  };
};

export type LeaderboardRow = {
  place: number;
  runner: string;
  runnerUrl: string;
  time: string;
  seconds: number;
  date: string;
  year: string;
  country: string;
  countryCode?: string;
  continent?: string;
  videoUrl?: string;
  runUrl: string;
  nameStyle: CSSProperties;
};

export type DisplayLeaderboardRow = LeaderboardRow & {
  rowType: 'row';
  rowKey: string;
  displayRank?: number;
  displayScope?: string;
};

export type SeparatorRow = {
  rowType: 'separator';
  rowKey: string;
  label: string;
};

export type DisplayLeaderboardItem = DisplayLeaderboardRow | SeparatorRow;

export type CountryOption = {
  name: string;
  code?: string;
};

type CountryMetadata = {
  code: string;
  continent?: string;
};

const continentByCountryCode = new Map(
  (countryData as CountryMetadata[]).map(({ code, continent }) => [
    code.toLowerCase(),
    continent,
  ]),
);

const continentOverrides = new Map<string, string>([
  ['ic', 'Europe'],
  ['es-ga', 'Europe'],
  ['es-pv', 'Europe'],
]);

export function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}:${String(remainingMinutes).padStart(2, '0')}:${seconds
      .toFixed(3)
      .padStart(6, '0')}`;
  }

  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

export function getFlagIconCode(countryCode?: string) {
  const normalizedCode = countryCode?.toLowerCase();

  if (normalizedCode === 'es/cn') {
    return 'ic';
  }

  return normalizedCode?.replace('/', '-');
}

export function getCountryContinent(countryCode?: string) {
  const normalizedCode = getFlagIconCode(countryCode);

  if (!normalizedCode) {
    return undefined;
  }

  return continentOverrides.get(normalizedCode) ?? continentByCountryCode.get(normalizedCode);
}

export function getRunnerNameStyle(player?: Player | null) {
  const nameStyle = player?.['name-style'];

  if (!nameStyle) {
    return {
      style: {},
    };
  }

  if (nameStyle.style === 'solid') {
    return {
      style: {
        '--runner-accent-light': nameStyle.color.light,
        '--runner-accent-dark': nameStyle.color.dark,
      } as CSSProperties,
    };
  }

  return {
    style: {
      '--runner-accent-light': `linear-gradient(90deg, ${nameStyle['color-from'].light}, ${nameStyle['color-to'].light})`,
      '--runner-accent-dark': `linear-gradient(90deg, ${nameStyle['color-from'].dark}, ${nameStyle['color-to'].dark})`,
    } as CSSProperties,
  };
}
