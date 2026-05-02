import type { CSSProperties } from 'react';
import countryData from 'flag-icons/country.json';
import type { Player } from './types';

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

  return (
    continentOverrides.get(normalizedCode) ??
    continentByCountryCode.get(normalizedCode)
  );
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
