import express from 'express';
import { metrics } from '../../utils/monitoring';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(metrics.getMetrics());
});

export const metricsRouter = router;