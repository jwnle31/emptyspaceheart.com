import type { ReactNode } from 'react';
import styles from '../Speedrunning.module.css';

type DropdownOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

type DropdownFilterProps = {
  label: string;
  selectedLabel: string;
  selectedLeading?: ReactNode;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

function DropdownFilter({
  label,
  selectedLabel,
  selectedLeading,
  options,
  isOpen,
  onToggle,
  onSelect,
}: DropdownFilterProps) {
  return (
    <div className={styles['country-filter']}>
      <span>{label}</span>
      <button type="button" onClick={onToggle} aria-expanded={isOpen}>
        {selectedLeading}
        <span>{selectedLabel}</span>
      </button>

      {isOpen && (
        <div className={styles['country-menu']}>
          {options.map(({ value, label: optionLabel, leading }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onSelect(value);
              }}
            >
              {leading}
              <span>{optionLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownFilter;
