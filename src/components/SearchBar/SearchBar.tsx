import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search tools...',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <Search size={15} />
      </span>
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search tools"
      />
      <span className="search-bar__shortcut">⌘K</span>
    </div>
  );
}
