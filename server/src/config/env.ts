import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),

  // Direct API configuration (URL + Key + Model)
  ai: {
    apiUrl: process.env.AI_API_URL || '',
    apiKey: process.env.AI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gpt-4o',
  },

  azureSpeech: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'eastus',
    avatarCharacter: process.env.AZURE_SPEECH_AVATAR_CHARACTER || 'aria',
    avatarStyle: process.env.AZURE_SPEECH_AVATAR_STYLE || 'casual',
  },

  cosmosDb: {
    connectionString: process.env.COSMOS_DB_CONNECTION_STRING || '',
    enabled: process.env.ENABLE_COSMOS_STORAGE === 'true',
  },

  simulationMode: process.env.SIMULATION_MODE !== 'false',
};
