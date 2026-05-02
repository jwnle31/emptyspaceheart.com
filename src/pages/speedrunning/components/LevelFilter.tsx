import DropdownFilter from './DropdownFilter';
import type { GameLevel, DropdownGroup } from '../types';

type LevelFilterProps = {
  levels: GameLevel[];
  selectedLevelId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (levelId: string) => void;
};

function LevelFilter({
  levels,
  selectedLevelId,
  isOpen,
  onToggle,
  onSelect,
}: LevelFilterProps) {
  const selectedLevel = levels.find(({ id }) => id === selectedLevelId);

  const groups: DropdownGroup[] = [
    {
      options: levels.map((level) => ({
        value: level.id,
        label: level.name,
      })),
    },
  ];

  return (
    <DropdownFilter
      label="Level"
      selectedLabel={selectedLevel?.name ?? levels[0]?.name ?? 'Level'}
      groups={groups}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={onSelect}
    />
  );
}

export default LevelFilter;
