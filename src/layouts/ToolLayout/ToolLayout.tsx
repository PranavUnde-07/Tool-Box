import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../DashboardLayout';
import './ToolLayout.css';

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <DashboardLayout showNavbar={false}>
      <div className="tool-layout__header">
        <Link to="/" className="tool-layout__back">
          <ArrowLeft size={14} />
          Back to tools
        </Link>
        <h1 className="tool-layout__title">{title}</h1>
        <p className="tool-layout__description">{description}</p>
      </div>
      <div className="tool-layout__body">
        {children}
      </div>
    </DashboardLayout>
  );
}
