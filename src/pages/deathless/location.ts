import { createElement, type ReactNode } from 'react';

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

export type DisplayModeValue = 'person' | 'region';

export type DropdownOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

export type DropdownGroup = {
  options: DropdownOption[];
};

export type CountryOption = {
  code: string;
  name: string;
};

export function parseLocationParam(value: string | null): LocationFilterValue {
  if (
    value === 'world' ||
    value?.startsWith('continent:') ||
    value?.startsWith('country:')
  ) {
    return value as LocationFilterValue;
  }

  return 'world';
}

export function parseDisplayParam(value: string | null): DisplayModeValue {
  return value === 'region' ? 'region' : 'person';
}

export function buildLocationGroups(countries: CountryOption[]): DropdownGroup[] {
  return [
    {
      options: [{ value: 'world', label: 'World' }],
    },
    {
      options: CONTINENT_OPTIONS.map((continent) => ({
        value: `continent:${continent}` as const,
        label: continent,
      })),
    },
    {
      options: countries.map(({ name, code }) => ({
        value: `country:${code}` as const,
        label: name,
        leading: createElement('span', { className: `fi fi-${code}` }),
      })),
    },
  ];
}
