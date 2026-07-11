import { useState, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Hero } from '../../components/Hero';
import { ToolCard } from '../../components/ToolCard';
import { Section } from '../../components/Section';
import { tools } from '../../config/tools';
import type { ToolCategory } from '../../types';
import './HomePage.css';

export function HomePage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

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
      onCategoryChange={setActiveCategory}
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
