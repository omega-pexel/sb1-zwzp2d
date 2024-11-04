import express from 'express';
import { metrics } from '../utils/monitoring';

const router = express.Router();

router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.end(await metrics.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export default router;