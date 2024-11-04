import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

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

  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}