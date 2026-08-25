import cors from 'cors';
import { env } from '../config/env';

export const corsMiddleware = cors({
  origin: env.corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  credentials: false,
  maxAge: 86400,
});
