import { Router } from 'express';
import imageRoutes from './image.routes';
import pdfRoutes from './pdf.routes';
import qrRoutes from './qr.routes';
import { apiLimiter, processLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.use(apiLimiter);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'TOOLBOX API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

const processing = [processLimiter];

router.use('/image', ...processing, imageRoutes);
router.use('/pdf', ...processing, pdfRoutes);
router.use('/qr', processing, qrRoutes);

export default router;
