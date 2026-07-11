import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { TopNavbar } from '../TopNavbar';
import { Footer } from '../Footer';
import type { ToolCategory } from '../../types';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  activeCategory?: ToolCategory;
  onCategoryChange?: (category: ToolCategory) => void;
}

export function DashboardLayout({
  children,
  showNavbar = true,
  searchValue = '',
  onSearchChange,
  activeCategory = 'all',
  onCategoryChange,
}: DashboardLayoutProps) {
  const handleSearchChange = onSearchChange ?? (() => {});
  const handleCategoryChange = onCategoryChange ?? (() => {});

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-layout__main">
        {showNavbar && (
          <TopNavbar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}
        <div className="dashboard-layout__content">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
