import { useSearchParams } from 'react-router-dom';
import type { LeaderboardScope, LocationFilterValue } from '../types';

const DEFAULT_LOCATION: LocationFilterValue = 'world';
const DEFAULT_DISPLAY_MODE: 'person' | 'region' = 'person';
const DEFAULT_PAGE = 1;
const DEFAULT_SCOPE: LeaderboardScope = 'full-game';
const VARIABLE_PARAM_PREFIX = 'var-';

function parseLocationParam(value: string | null): LocationFilterValue {
  if (
    value === 'world' ||
    value?.startsWith('continent:') ||
    value?.startsWith('country:')
  ) {
    return value as LocationFilterValue;
  }

  return DEFAULT_LOCATION;
}

function parseDisplayParam(value: string | null): 'person' | 'region' {
  return value === 'region' ? 'region' : DEFAULT_DISPLAY_MODE;
}

function parsePageParam(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE;
}

function parseScopeParam(value: string | null): LeaderboardScope {
  return value === 'level' ? 'level' : DEFAULT_SCOPE;
}

function parseGameParam(value: string | null) {
  return value ?? '';
}

function parseLevelParam(value: string | null) {
  return value ?? '';
}

function getVariableParamKey(variableId: string) {
  return `${VARIABLE_PARAM_PREFIX}${variableId}`;
}

function clearVariableParams(params: URLSearchParams) {
  Array.from(params.keys()).forEach((key) => {
    if (key.startsWith(VARIABLE_PARAM_PREFIX)) {
      params.delete(key);
    }
  });
}

export function useSrcQueryState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const location = parseLocationParam(searchParams.get('location'));
  const displayMode = parseDisplayParam(searchParams.get('display'));
  const page = parsePageParam(searchParams.get('page'));
  const scope = parseScopeParam(searchParams.get('scope'));
  const requestedGameId = parseGameParam(searchParams.get('game'));
  const requestedLevelId = parseLevelParam(searchParams.get('level'));
  const requestedCategoryId = searchParams.get('category');

  const setLocation = (nextLocation: LocationFilterValue) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('location', nextLocation);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    setSearchParams(nextParams, { replace: true });
  };

  const setDisplayMode = (nextDisplay: 'person' | 'region') => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('display', nextDisplay);
    nextParams.set('location', location);
    nextParams.set('page', String(DEFAULT_PAGE));
    setSearchParams(nextParams, { replace: true });
  };

  const setPage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(nextPage));
    setSearchParams(nextParams, { replace: true });
  };

  const setScope = (nextScope: LeaderboardScope, defaultLevelId?: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scope', nextScope);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    clearVariableParams(nextParams);

    if (nextScope === 'level' && defaultLevelId) {
      nextParams.set('level', defaultLevelId);
    } else {
      nextParams.delete('level');
    }

    nextParams.delete('category');
    setSearchParams(nextParams, { replace: true });
  };

  const setGame = (nextGameId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('game', nextGameId);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    nextParams.delete('level');
    nextParams.delete('category');
    clearVariableParams(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  const setLevel = (nextLevelId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scope', 'level');
    nextParams.set('level', nextLevelId);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    setSearchParams(nextParams, { replace: true });
  };

  const setCategory = (nextCategoryId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    nextParams.set('category', nextCategoryId);
    clearVariableParams(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  const setVariable = (variableId: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('location', location);
    nextParams.set('display', displayMode);
    nextParams.set('page', String(DEFAULT_PAGE));
    nextParams.set(getVariableParamKey(variableId), value);
    setSearchParams(nextParams, { replace: true });
  };

  const clearVariables = () => {
    const nextParams = new URLSearchParams(searchParams);
    clearVariableParams(nextParams);
    setSearchParams(nextParams, { replace: true });
  };

  return {
    clearVariables,
    displayMode,
    location,
    page,
    requestedCategoryId,
    requestedGameId,
    requestedLevelId,
    scope,
    searchParams,
    setCategory,
    setDisplayMode,
    setLevel,
    setGame,
    setLocation,
    setPage,
    setScope,
    setSearchParams,
    setVariable,
  };
}

export type SrcQueryState = ReturnType<typeof useSrcQueryState>;
