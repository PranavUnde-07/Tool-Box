import type { ReactNode } from 'react';
import './CornerAccent.css';

interface CornerAccentProps {
  children: ReactNode;
  variant?: 'default' | 'accent';
  className?: string;
}

export function CornerAccent({
  children,
  variant = 'default',
  className = '',
}: CornerAccentProps) {
  const classes = [
    'corner-accent',
    variant === 'accent' ? 'corner-accent--accent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
