import DropdownFilter from './DropdownFilter';
import type { CategoryVariableFilter, DropdownGroup } from '../types';

type VariableFilterProps = {
  variable: CategoryVariableFilter;
  selectedValue?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (variableId: string, value: string) => void;
};

function VariableFilter({
  variable,
  selectedValue,
  isOpen,
  onToggle,
  onSelect,
}: VariableFilterProps) {
  const selectedOption = variable.options.find(
    ({ value }) => value === selectedValue,
  );

  const groups: DropdownGroup[] = [
    {
      options: variable.options,
    },
  ];

  return (
    <DropdownFilter
      label={variable.name}
      selectedLabel={selectedOption?.label ?? variable.name}
      groups={groups}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={(value) => {
        onSelect(variable.id, value);
      }}
    />
  );
}

export default VariableFilter;
