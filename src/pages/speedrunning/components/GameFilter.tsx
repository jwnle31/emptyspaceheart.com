import DropdownFilter from './DropdownFilter';
import type { DropdownGroup, GameOption } from '../types';

type GameFilterProps = {
  games: GameOption[];
  selectedGameId: string | null;
  groups: DropdownGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (gameId: string) => void;
};

function GameFilter({
  games,
  selectedGameId,
  groups,
  isOpen,
  onToggle,
  onSelect,
}: GameFilterProps) {
  const selectedGame = games.find(({ id }) => id === selectedGameId);

  return (
    <DropdownFilter
      label="Game"
      selectedLabel={selectedGame?.label ?? games[0]?.label ?? 'Game'}
      groups={groups}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={onSelect}
    />
  );
}

export default GameFilter;
