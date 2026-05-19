import type { DeathlessPlayerTierClearCounts } from './hooks/useDeathlessData';
import type { LocationFilterValue } from './location';

export function getMonthStartKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}-01`;
}

export function filterPlayersByLocation(
  players: DeathlessPlayerTierClearCounts[],
  location: LocationFilterValue,
) {
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
}
