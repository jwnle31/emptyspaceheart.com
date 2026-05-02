import DropdownFilter from './DropdownFilter';
import type { CategoryOption, DropdownGroup } from '../types';

type CategoryFilterProps = {
  categories: CategoryOption[];
  selectedCategoryId: string | null;
  groups: DropdownGroup[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (categoryId: string) => void;
};

function CategoryFilter({
  categories,
  selectedCategoryId,
  groups,
  isOpen,
  onToggle,
  onSelect,
}: CategoryFilterProps) {
  const selectedCategory = categories.find(({ id }) => id === selectedCategoryId);

  return (
    <DropdownFilter
      label="Category"
      selectedLabel={
        selectedCategory?.label ??
        selectedCategory?.name ??
        categories[0]?.label ??
        categories[0]?.name ??
        'Category'
      }
      groups={groups}
      isOpen={isOpen}
      onToggle={onToggle}
      onSelect={onSelect}
    />
  );
}

export default CategoryFilter;
