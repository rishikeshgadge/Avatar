import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  azureFoundry: {
    endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT || '',
    connectionString: process.env.AZURE_AI_FOUNDRY_PROJECT_CONNECTION_STRING || '',
    agentId: process.env.AZURE_AI_FOUNDRY_AGENT_ID || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  },
  azureSpeech: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'eastus',
    avatarCharacter: process.env.AZURE_SPEECH_AVATAR_CHARACTER || 'lisa',
    avatarStyle: process.env.AZURE_SPEECH_AVATAR_STYLE || 'graceful',
  },
  cosmosDb: {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING || '',
    enabled: process.env.ENABLE_COSMOS_STORAGE === 'true',
  },
  simulationMode: process.env.SIMULATION_MODE !== 'false',
};
