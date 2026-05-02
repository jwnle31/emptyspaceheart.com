import type { ReactNode } from 'react';
import styles from '../../Speedrunning.module.css';
import type { DropdownGroup } from '../types';

type DropdownFilterProps = {
  label: string;
  selectedLabel: string;
  selectedLeading?: ReactNode;
  groups: DropdownGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

function DropdownFilter({
  label,
  selectedLabel,
  selectedLeading,
  groups,
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
          {groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {groupIndex > 0 && (
                <div className={styles['menu-separator']} role="separator" />
              )}
              {group.options.map(({ value, label: optionLabel, leading }) => (
                <button
                  key={`${groupIndex}-${value}`}
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
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownFilter;
