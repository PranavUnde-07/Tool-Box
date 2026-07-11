import type { ReactNode } from 'react';
import './Container.css';

interface ContainerProps {
  children: ReactNode;
  variant?: 'default' | 'fluid' | 'narrow';
  className?: string;
}

export function Container({
  children,
  variant = 'default',
  className = '',
}: ContainerProps) {
  const classes = [
    'container',
    variant !== 'default' ? `container--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
