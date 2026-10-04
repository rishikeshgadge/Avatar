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

// Healthcheck & Config Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      simulationMode: config.simulationMode,
      azureFoundryConnected: Boolean(config.azureFoundry.endpoint && config.azureFoundry.agentId),
      azureSpeechConnected: Boolean(config.azureSpeech.key),
      cosmosDbConnected: config.cosmosDb.enabled,
    },
  });
});

const startServer = async () => {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`===========================================================`);
    console.log(`  Azure AI Foundry Avatar Server running on port ${config.port}`);
    console.log(`  Mode: ${config.simulationMode ? 'SIMULATION / DEMO MODE' : 'LIVE AZURE CONNECTED'}`);
    console.log(`  Foundry Agent ID: ${config.azureFoundry.agentId || '(Not set)'}`);
    console.log(`===========================================================`);
  });
};

startServer();
