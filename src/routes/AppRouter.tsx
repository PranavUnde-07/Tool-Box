import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ToolPage } from '../pages/ToolPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tool/:slug" element={<ToolPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
