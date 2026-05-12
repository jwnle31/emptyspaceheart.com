import type { CSSProperties } from 'react';
export { getCountryContinent, getFlagIconCode } from '../../utils/country';
import type { Player } from './types';

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
