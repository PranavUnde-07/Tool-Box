import { Link } from 'react-router';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Button } from '../../components/Button';
import { Home } from 'lucide-react';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <DashboardLayout showNavbar={false}>
      <div className="not-found-page">
        <div className="not-found-page__code">404</div>
        <h1 className="not-found-page__title">Page Not Found</h1>
        <p className="not-found-page__description">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Head back to the dashboard.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home size={14} />}>
            Go Home
          </Button>
        </Link>
      </div>
    </DashboardLayout>
  );
}
