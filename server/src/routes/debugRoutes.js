import express from 'express';

import {
  getErrors,
  clearErrors,
} from '../middleware/errorLogger.js';

const router = express.Router();

/**
 * GET /api/debug/health
 *
 * Checks whether the backend is running.
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/debug/errors
 *
 * Returns captured backend errors.
 */
router.get('/errors', (req, res) => {
  const errors = getErrors();

  res.status(200).json({
    success: true,
    count: errors.length,
    errors,
  });
});

/**
 * DELETE /api/debug/errors
 *
 * Clears captured backend errors.
 */
router.delete('/errors', (req, res) => {
  clearErrors();

  res.status(200).json({
    success: true,
    message: 'Debug errors cleared',
  });
});

export default router;