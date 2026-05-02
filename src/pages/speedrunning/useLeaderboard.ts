import { useEffect, useState } from 'react';
import {
  type LeaderboardResponse,
  type LeaderboardRow,
  LEADERBOARD_URL,
  formatTime,
  getFlagIconCode,
  getCountryContinent,
  getRunnerNameStyle,
} from './types';

export function useLeaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeaderboard() {
      try {
        const response = await fetch(LEADERBOARD_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`speedrun.com returned ${response.status}`);
        }

        const leaderboard = (await response.json()) as LeaderboardResponse;
        const playersById = new Map(
          leaderboard.data.players.data.map((player) => [player.id, player]),
        );

        setRows(
          leaderboard.data.runs.map(({ place, run }) => {
            const runPlayer = run.players[0];
            const player = runPlayer.id ? playersById.get(runPlayer.id) : null;
            const runner =
              player?.names?.international ?? runPlayer.name ?? 'Guest';
            const country = 
              player?.location?.country?.names?.international ?? 'Unknown';
            const countryCode = getFlagIconCode(
              player?.location?.country?.code,
            );
            const continent = getCountryContinent(player?.location?.country?.code);
            const date = run.date ?? '';
            const runnerNameStyle = getRunnerNameStyle(player);

            return {
              place,
              runner,
              runnerUrl: player?.weblink ?? run.weblink,
              time: formatTime(run.times.primary_t),
              seconds: run.times.primary_t,
              date,
              year: date ? date.slice(0, 4) : 'Unknown',
              country,
              countryCode,
              continent,
              videoUrl: run.videos?.links?.[0]?.uri,
              runUrl: run.weblink,
              nameStyle: runnerNameStyle.style,
            };
          }),
        );
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load leaderboard',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => controller.abort();
  }, []);

  return { rows, isLoading, error };
}
