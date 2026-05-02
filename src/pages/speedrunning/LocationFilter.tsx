import DropdownFilter from './DropdownFilter';
import {
  CONTINENT_OPTIONS,
  type CountryOption,
  type LocationFilterValue,
} from './types';

type LocationFilterProps = {
  countries: CountryOption[];
  selectedLocation: LocationFilterValue;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (location: LocationFilterValue) => void;
};

function LocationFilter({
  countries,
  selectedLocation,
  isOpen,
  onToggle,
  onSelect,
}: LocationFilterProps) {
  const selectedCountry = selectedLocation.startsWith('country:')
    ? selectedLocation.slice('country:'.length)
    : undefined;

  const selectedCountryOption = countries.find(
    ({ name }) => name === selectedCountry,
  );

  const selectedLabel = selectedLocation === 'world'
    ? 'World'
    : selectedLocation.startsWith('continent:')
      ? selectedLocation.slice('continent:'.length)
      : selectedCountry ?? 'World';

  const selectedLeading = selectedCountryOption?.code ? (
    <span className={`fi fi-${selectedCountryOption.code}`} />
  ) : undefined;

  const options = [
    { value: 'world', label: 'World' },
    ...CONTINENT_OPTIONS.map((continent) => ({
      value: `continent:${continent}` as const,
      label: continent,
    })),
    ...countries.map(({ name, code }) => ({
      value: `country:${name}` as const,
      label: name,
      leading: code ? <span className={`fi fi-${code}`} /> : undefined,
    })),
  ];

  return (
    <DropdownFilter
      label="Location"
      selectedLabel={selectedLabel}
      selectedLeading={selectedLeading}
      options={options}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={(value) => {
        onSelect(value as LocationFilterValue);
      }}
    />
  );
}

export default LocationFilter;
