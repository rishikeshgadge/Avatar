import mongoose from 'mongoose';
import { config } from '../config/env';

export interface IMessageRecord {
  threadId: string;
  sender: 'user' | 'assistant';
  content: string;
  language?: string;
  timestamp: Date;
}

const MessageSchema = new mongoose.Schema<IMessageRecord>({
  threadId: { type: String, required: true, index: true },
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  language: { type: String, default: 'en' },
  timestamp: { type: Date, default: Date.now }
});

export const MessageModel = mongoose.model<IMessageRecord>('Message', MessageSchema);

export const connectDatabase = async () => {
  if (!config.cosmosDb.enabled || !config.cosmosDb.connectionString) {
    console.log('[CosmosDB] Storage is disabled or connection string not provided. Session will run in-memory.');
    return false;
  }
  try {
    await mongoose.connect(config.cosmosDb.connectionString);
    console.log('[CosmosDB] Connected successfully to Cosmos DB / MongoDB instance.');
    return true;
  } catch (error) {
    console.error('[CosmosDB] Connection failed:', error);
    return false;
  }
};
