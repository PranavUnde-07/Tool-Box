import type { ReactNode } from 'react';
import './Section.css';

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Section({
  children,
  title,
  subtitle,
  size = 'md',
  className = '',
}: SectionProps) {
  const classes = [
    'section',
    size !== 'md' ? `section--${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {(title || subtitle) && (
        <div className="section__header">
          {title && <h2 className="section__title">{title}</h2>}
          {subtitle && <p className="section__subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
