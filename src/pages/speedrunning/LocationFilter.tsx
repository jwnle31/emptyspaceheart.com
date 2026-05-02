import DropdownFilter from './DropdownFilter';
import {
  type CountryOption,
  type LocationFilterValue,
} from './types';
import type { DropdownGroup } from './DropdownFilter';

type LocationFilterProps = {
  countries: CountryOption[];
  selectedLocation: LocationFilterValue;
  groups: DropdownGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (location: LocationFilterValue) => void;
};

function LocationFilter({
  countries,
  selectedLocation,
  groups,
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

  return (
    <DropdownFilter
      label="Location"
      selectedLabel={selectedLabel}
      selectedLeading={selectedLeading}
      groups={groups}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={(value) => {
        onSelect(value as LocationFilterValue);
      }}
    />
  );
}

export default LocationFilter;
