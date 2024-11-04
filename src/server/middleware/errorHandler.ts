import { Request, Response, NextFunction } from 'express';
import { logError } from '../../utils/logger';
import { ZodError } from 'zod';
import { AxiosError } from 'axios';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(err, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        details: err.errors,
      },
    });
  }

  if (err instanceof AxiosError) {
    return res.status(err.response?.status || 500).json({
      error: {
        message: err.response?.data?.message || 'External service error',
      },
    });
  }

  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}