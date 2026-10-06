import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import agentRoutes from './routes/agent';
import speechRoutes from './routes/speech';
import historyRoutes from './routes/history';
import { connectDatabase } from './services/database';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/agent', agentRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/history', historyRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      simulationMode: config.simulationMode,
      aiConnected: Boolean(config.ai.apiUrl && config.ai.apiKey),
      aiModel: config.ai.modelName || 'not-set',
      azureSpeechConnected: Boolean(config.azureSpeech.key),
      cosmosDbConnected: config.cosmosDb.enabled,
    },
  });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`===========================================================`);
    console.log(`  ARIA AI Avatar Server running on port ${config.port}`);
    console.log(`  Mode: ${config.simulationMode ? 'SIMULATION / DEMO MODE' : 'LIVE AI CONNECTED'}`);
    console.log(`  AI API URL: ${config.ai.apiUrl || '(Not configured)'}`);
    console.log(`  AI Model: ${config.ai.modelName || 'gpt-4o'}`);
    console.log(`===========================================================`);
  });
};

startServer();
