import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import type { ToolCategory } from '../../types';
import './TopNavbar.css';

interface TopNavbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeCategory: ToolCategory;
  onCategoryChange: (category: ToolCategory) => void;
}

export function TopNavbar({
  searchValue,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}: TopNavbarProps) {
  return (
    <div className="top-navbar">
      <div className="top-navbar__search">
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>
      <div className="top-navbar__filters">
        <CategoryFilter
          activeCategory={activeCategory}
          onChange={onCategoryChange}
        />
      </div>
    </div>
  );
}
