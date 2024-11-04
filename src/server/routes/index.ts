import { Router } from 'express';
import { transformationRouter } from './transformation';
import { healthRouter } from './health';
import { metricsRouter } from './metrics';

const router = Router();

router.use('/api/transform', transformationRouter);
router.use('/health', healthRouter);
router.use('/metrics', metricsRouter);

export default router;