import express from 'express';
import { DatabaseService } from '../services/DatabaseService';
import { TransformationService } from '../services/TransformationService';
import { databaseFormSchema } from '../../utils/validation';
import { logError, logInfo } from '../../utils/logger';

const router = express.Router();
const transformService = new TransformationService();

let currentTransformation: any = null;

router.post('/', async (req, res) => {
  try {
    const validatedData = databaseFormSchema.parse(req.body);
    
    logInfo('Starting transformation', { database: validatedData.database });
    
    // Simulate transformation start for demo
    currentTransformation = {
      startTime: Date.now(),
      processedRecords: 0,
      totalRecords: 100,
      status: 'running'
    };

    // Simulate progress updates
    const interval = setInterval(() => {
      if (currentTransformation.processedRecords < currentTransformation.totalRecords) {
        currentTransformation.processedRecords += 10;
      } else {
        currentTransformation.status = 'completed';
        clearInterval(interval);
      }
    }, 1000);

    res.json({ 
      success: true,
      message: 'Transformation started'
    });
  } catch (error) {
    logError(error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
});

router.get('/status', (req, res) => {
  if (!currentTransformation) {
    return res.json({
      status: 'idle',
      processedRecords: 0,
      totalRecords: 0
    });
  }

  res.json({
    ...currentTransformation,
    duration: Date.now() - currentTransformation.startTime
  });
});

export const transformationRouter = router;