import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Tool } from '../../types';
import './ToolCard.css';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ size?: number }>;
  const isComingSoon = tool.status === 'coming-soon';

  const cardClasses = [
    'tool-card',
    isComingSoon ? 'tool-card--coming-soon' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const cardContent = (
    <>
      <div className="tool-card__header">
        <div className="tool-card__icon-wrapper">
          {IconComponent && <IconComponent size={20} />}
        </div>
        <span className="tool-card__category">{tool.category}</span>
      </div>

      <h3 className="tool-card__name">{tool.name}</h3>
      <p className="tool-card__description">{tool.description}</p>

      <div className="tool-card__footer">
        <span
          className={`tool-card__status tool-card__status--${tool.status}`}
        >
          <span className="tool-card__status-dot" />
          {isComingSoon ? 'Coming Soon' : 'Available'}
        </span>
        {!isComingSoon && (
          <ArrowRight size={14} className="tool-card__arrow" />
        )}
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
    >
      {isComingSoon ? (
        <div className={cardClasses}>{cardContent}</div>
      ) : (
        <Link to={tool.route} className={cardClasses}>
          {cardContent}
        </Link>
      )}
    </motion.div>
  );
}
