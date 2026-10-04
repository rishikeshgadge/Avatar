import { Router } from 'express';
import { getSpeechToken, processAvatarSdpExchange } from '../services/azureSpeech';

const router = Router();

// GET Azure Speech Token & Avatar Settings
router.get('/token', async (req, res) => {
  try {
    const tokenInfo = await getSpeechToken();
    res.json({ success: true, ...tokenInfo });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST SDP Exchange for WebRTC Azure Talking Avatar
router.post('/avatar/sdp', async (req, res) => {
  try {
    const { sdp, peerId } = req.body;
    const answerSdp = await processAvatarSdpExchange(sdp, peerId);
    if (answerSdp) {
      res.json({ success: true, sdp: answerSdp });
    } else {
      res.json({ success: false, isSimulated: true, message: 'Azure Speech Avatar running in interactive canvas mode.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
