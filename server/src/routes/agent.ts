import { Router } from 'express';
import { sendAIMessage, createSession, clearSession } from '../services/aiService';
import { MessageModel } from '../services/database';
import { config } from '../config/env';

const router = Router();

// Create new session
router.post('/session', async (req, res) => {
  try {
    const sessionId = createSession();
    res.json({ success: true, sessionId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message to AI
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, language = 'en' } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ success: false, error: 'sessionId and message are required' });
    }

    const result = await sendAIMessage(sessionId, message, language);

    // Save to DB if enabled
    if (config.cosmosDb.enabled) {
      try {
        await MessageModel.create({
          threadId: sessionId,
          sender: 'user',
          content: message,
          language,
        });
        await MessageModel.create({
          threadId: sessionId,
          sender: 'assistant',
          content: result.response,
          language,
        });
      } catch (dbErr) {
        console.warn('[DB] Failed to save conversation history:', dbErr);
      }
    }

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[Route agent/message] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear session history
router.delete('/session/:sessionId', (req, res) => {
  try {
    clearSession(req.params.sessionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
