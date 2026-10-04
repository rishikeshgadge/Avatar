import { Router } from 'express';
import { createFoundryThread, sendFoundryMessage } from '../services/azureFoundry';
import { MessageModel } from '../services/database';
import { config } from '../config/env';

const router = Router();

// Create new Assistant Thread
router.post('/thread', async (req, res) => {
  try {
    const threadId = await createFoundryThread();
    res.json({ success: true, threadId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message to Azure AI Foundry Agent
router.post('/message', async (req, res) => {
  try {
    const { threadId, message, language = 'en' } = req.body;

    if (!message || !threadId) {
      return res.status(400).json({ success: false, error: 'threadId and message are required' });
    }

    const agentResult = await sendFoundryMessage(threadId, message, language);

    // Save to DB if enabled
    if (config.cosmosDb.enabled) {
      try {
        await MessageModel.create({
          threadId,
          sender: 'user',
          content: message,
          language,
        });
        await MessageModel.create({
          threadId,
          sender: 'assistant',
          content: agentResult.response,
          language,
        });
      } catch (dbErr) {
        console.warn('[DB] Failed to save conversation history record:', dbErr);
      }
    }

    res.json({
      success: true,
      ...agentResult,
    });
  } catch (error: any) {
    console.error('[Route agent/message] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
