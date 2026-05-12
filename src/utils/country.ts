import countryData from 'flag-icons/country.json';

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

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getFlagIconCode(countryCode?: string) {
  const normalizedCode = countryCode?.toLowerCase();

  if (normalizedCode === 'es/cn') {
    return 'ic';
  }

  return normalizedCode?.replace('/', '-');
}

export function getCountryName(countryCode?: string) {
  const normalizedCode = getFlagIconCode(countryCode);
  if (!normalizedCode) {
    return undefined;
  }

  const regionCode = normalizedCode.toUpperCase();
  return regionNames.of(regionCode) ?? regionCode;
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
