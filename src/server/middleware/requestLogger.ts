import { Request, Response, NextFunction } from 'express';
import { logInfo } from '../../utils/logger';
import { metrics } from '../../utils/monitoring';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logInfo('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });

    metrics.httpRequestDuration.record(
      duration,
      req.method,
      req.path,
      res.statusCode
    );
  });

  next();
}