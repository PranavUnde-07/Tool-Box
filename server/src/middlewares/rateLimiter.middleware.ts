import rateLimit from 'express-rate-limit';

/**
 * General API limiter — protects health checks and light endpoints.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
    code: 'RATE_LIMITED',
  },
});

/**
 * Processing limiter — file conversion/compression is CPU-heavy.
 * Deliberately stricter than the general limiter.
 */
export const processLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Processing rate limit reached. Wait a moment before uploading again.',
    code: 'RATE_LIMITED',
  },
});
