import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { corsMiddleware } from './middlewares/cors.middleware';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { ensureDir } from './utils/fileCleanup';
import { env } from './config/env';
import apiRoutes from './routes';

/* ─────────────── Ensure temp directories exist ─────────────── */
ensureDir(env.tempUploadsDir);
ensureDir(env.tempGeneratedDir);

/* ─────────────── App ─────────────── */
const app = express();

/* ─────────────── Security ─────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ─────────────── CORS ─────────────── */
app.use(corsMiddleware);

/* ─────────────── Compression ─────────────── */
app.use(compression());

/* ─────────────── Request Logging ─────────────── */
app.use(morgan(env.isDev ? 'dev' : 'combined'));

/* ─────────────── JSON Parser ─────────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/* ─────────────── API Routes ─────────────── */
app.use('/api', apiRoutes);

/* ─────────────── 404 ─────────────── */
app.use(notFoundHandler);

/* ─────────────── Global Error Handler ─────────────── */
app.use(errorHandler);

export default app;
