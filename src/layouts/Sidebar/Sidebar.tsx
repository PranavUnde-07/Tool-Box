import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Home,
  Image,
  FileText,
  QrCode,
  Video,
  AudioLines,
  Wrench,
  Menu,
  X,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
];

const categoryItems = [
  { label: 'Image', icon: Image, path: '/?category=image' },
  { label: 'PDF', icon: FileText, path: '/?category=pdf' },
  { label: 'QR Code', icon: QrCode, path: '/?category=qr' },
  { label: 'Video', icon: Video, path: '/?category=video' },
  { label: 'Audio', icon: AudioLines, path: '/?category=audio' },
  { label: 'Utility', icon: Wrench, path: '/?category=utility' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    return location.pathname + location.search === path;
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button
        className="sidebar__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={`sidebar__overlay ${isOpen ? 'sidebar__overlay--visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <Link to="/" className="sidebar__logo" onClick={closeSidebar}>
            <span className="sidebar__logo-text">
              Tool<span className="sidebar__logo-accent">Box</span>
            </span>
            <span className="sidebar__version">v1.0</span>
          </Link>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__nav-group">
            <div className="sidebar__nav-label">Navigation</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar__nav-item ${
                  isActive(item.path) ? 'sidebar__nav-item--active' : ''
                }`}
                onClick={closeSidebar}
              >
                <span className="sidebar__nav-icon">
                  <item.icon size={16} />
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="sidebar__nav-group">
            <div className="sidebar__nav-label">Categories</div>
            {categoryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar__nav-item ${
                  isActive(item.path) ? 'sidebar__nav-item--active' : ''
                }`}
                onClick={closeSidebar}
              >
                <span className="sidebar__nav-icon">
                  <item.icon size={16} />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar__footer">
          <p className="sidebar__footer-text">
            All processing happens{' '}
            <span className="sidebar__footer-highlight">locally</span>
          </p>
        </div>
      </aside>
    </>
  );
}
