import { GAME_OPTIONS } from '../games';

export function useGames() {
  return {
    games: GAME_OPTIONS,
    isLoading: false,
    error: null as string | null,
  };
}
