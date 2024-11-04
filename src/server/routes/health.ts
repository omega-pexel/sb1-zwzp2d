import express from 'express';
import { metrics } from '../../utils/monitoring';

const router = express.Router();

router.get('/', (req, res) => {
  const activeTransformations = metrics.activeTransformations.get();
  
  res.json({
    status: 'healthy',
    activeTransformations,
    timestamp: new Date().toISOString()
  });
});

export const healthRouter = router;