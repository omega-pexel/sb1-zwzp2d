import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { logInfo, logError } from '../utils/logger';
import { startMonitoring } from '../utils/monitoring';
import router from './routes';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());
app.use(requestLogger);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// API Routes
app.use('/api', router);

// Serve index.html for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Error handling
app.use(errorHandler);

async function startServer() {
  try {
    // Initialize monitoring
    startMonitoring();

    // Start the server
    app.listen(port, () => {
      logInfo(`Server running on port ${port}`);
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

startServer();