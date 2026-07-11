import type { ToolCategory } from '../../types';
import { categories } from '../../config/tools';
import './CategoryFilter.css';

interface CategoryFilterProps {
  activeCategory: ToolCategory;
  onChange: (category: ToolCategory) => void;
}

export function CategoryFilter({ activeCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" role="tablist" aria-label="Filter by category">
      {categories.map((cat) => (
        <button
          key={cat.value}
          className={`category-filter__chip ${
            activeCategory === cat.value ? 'category-filter__chip--active' : ''
          }`}
          onClick={() => onChange(cat.value)}
          role="tab"
          aria-selected={activeCategory === cat.value}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
