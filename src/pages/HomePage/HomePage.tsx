import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Hero } from '../../components/Hero';
import { ToolCard } from '../../components/ToolCard';
import { Section } from '../../components/Section';
import { tools } from '../../config/tools';
import type { ToolCategory } from '../../types';
import './HomePage.css';

const VALID_CATEGORIES: ToolCategory[] = ['all', 'image', 'pdf', 'qr', 'video', 'audio', 'utility'];

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const categoryParam = searchParams.get('category') as ToolCategory | null;
  const activeCategory: ToolCategory =
    categoryParam && VALID_CATEGORIES.includes(categoryParam) ? categoryParam : 'all';

  // Keep the URL in sync when the dashboard's own filter is used
  const handleCategoryChange = (category: ToolCategory) => {
    setSearchParams(category === 'all' ? {} : { category }, { replace: true });
  };

  useEffect(() => {
    document.title = 'ToolBox — Privacy-first Local File Toolkit';
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        searchValue === '' ||
        tool.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchValue.toLowerCase());

      const matchesCategory =
        activeCategory === 'all' || tool.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchValue, activeCategory]);

  return (
    <DashboardLayout
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
    >
      <Hero />

      <Section
        title="Tools"
        subtitle={`${filteredTools.length} tool${filteredTools.length !== 1 ? 's' : ''} available`}
      >
        <div className="home-page__tools-grid">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))
          ) : (
            <div className="home-page__no-results">
              <p className="home-page__no-results-title">No tools found</p>
              <p className="home-page__no-results-text">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </Section>
    </DashboardLayout>
  );
}
