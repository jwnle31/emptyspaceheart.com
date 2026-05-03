import type { CSSProperties, ReactNode } from 'react';

export type DropdownOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

export type DropdownGroup = {
  options: DropdownOption[];
};

export const SERIES_ID = 'q4zj23gn';
export const SERIES_GAMES_URL = `https://www.speedrun.com/api/v1/series/${SERIES_ID}/games`;
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
    values: Record<string, string>;
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

export type GameCategory = {
  id: string;
  name: string;
  weblink: string;
  type: 'per-game' | 'per-level';
  miscellaneous: boolean;
  variables?: {
    data: CategoryVariable[];
  };
  links: Array<{
    rel: string;
    uri: string;
  }>;
};

export type GameResponse = {
  data: {
    categories: {
      data: GameCategory[];
    };
  };
};

export type GameLevel = {
  id: string;
  name: string;
  weblink: string;
  categories?: {
    data: GameCategory[];
  };
  links: Array<{
    rel: string;
    uri: string;
  }>;
};

export type GameLevelsResponse = {
  data: GameLevel[];
};

export type LevelCategoriesResponse = {
  data: GameCategory[];
};

export type SeriesGame = {
  id: string;
  names?: {
    international?: string;
  };
  abbreviation?: string;
  weblink: string;
};

export type SeriesGamesResponse = {
  data: SeriesGame[];
};

export type CategoryVariableValue = {
  label: string;
  rules?: string | null;
  flags?: {
    miscellaneous?: boolean;
  };
};

export type CategoryVariableFilterOption = {
  value: string;
  label: string;
};

export type CategoryVariableFilter = {
  id: string;
  name: string;
  options: CategoryVariableFilterOption[];
};

export type CategoryVariable = {
  id: string;
  name: string;
  mandatory: boolean;
  'user-defined': boolean;
  'is-subcategory': boolean;
  values: {
    values: Record<string, CategoryVariableValue>;
  };
};

export type Category = {
  id: string;
  name: string;
  type: 'per-game' | 'per-level';
  miscellaneous: boolean;
  weblink?: string;
  links: Array<{
    rel: string;
    uri: string;
  }>;
  variables?: {
    data: CategoryVariable[];
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
  values: Record<string, string>;
};

export type CategoryOption = {
  id: string;
  name: string;
  label: string;
  value: string;
  weblink?: string;
  variables?: Category['variables'];
  miscellaneous: boolean;
  type: 'per-game' | 'per-level';
  levelName?: string;
  scope: 'full-game' | 'level';
};

export type GameOption = {
  id: string;
  label: string;
  value: string;
  weblink: string;
  leading?: ReactNode;
};

export type LeaderboardScope = 'full-game' | 'level';

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
