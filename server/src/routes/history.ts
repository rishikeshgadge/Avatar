import { Router } from 'express';
import { MessageModel } from '../services/database';
import { config } from '../config/env';

const router = Router();

// GET conversation history for a thread
router.get('/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;
    if (!config.cosmosDb.enabled) {
      return res.json({ success: true, messages: [], storageEnabled: false });
    }

    const messages = await MessageModel.find({ threadId }).sort({ timestamp: 1 });
    res.json({ success: true, messages, storageEnabled: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
