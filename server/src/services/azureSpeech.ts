import { config } from '../config/env';

export interface SpeechTokenResponse {
  token: string | null;
  region: string;
  avatarCharacter: string;
  avatarStyle: string;
  isSimulated: boolean;
}

/**
 * Returns Speech authorization token and configuration for frontend Speech SDK & Avatar rendering
 */
export async function getSpeechToken(): Promise<SpeechTokenResponse> {
  const { key, region, avatarCharacter, avatarStyle } = config.azureSpeech;

  if (!key || config.simulationMode) {
    return {
      token: null,
      region: region || 'eastus',
      avatarCharacter,
      avatarStyle,
      isSimulated: true,
    };
  }

  try {
    const fetchUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const res = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (res.ok) {
      const token = await res.text();
      return {
        token,
        region,
        avatarCharacter,
        avatarStyle,
        isSimulated: false,
      };
    }
  } catch (error) {
    console.error('[AzureSpeech] Error fetching Speech authentication token:', error);
  }

  return {
    token: null,
    region,
    avatarCharacter,
    avatarStyle,
    isSimulated: true,
  };
}

/**
 * Handle WebRTC SDP Exchange for Azure Speech Neural Talking Avatar WebRTC Endpoint
 */
export async function processAvatarSdpExchange(clientSdp: string, peerId: string): Promise<string | null> {
  const { key, region, avatarCharacter, avatarStyle } = config.azureSpeech;

  if (!key || config.simulationMode) {
    console.log('[AzureSpeech Avatar] SDP Exchange operating in simulated mode.');
    return null;
  }

  try {
    const avatarApiUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/avatar/webrtc/v1/sessions`;
    const response = await fetch(avatarApiUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sdp: clientSdp,
        peerId,
        avatarConfig: {
          character: avatarCharacter,
          style: avatarStyle,
          format: 'mp4',
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.sdp || null;
    }
  } catch (err) {
    console.error('[AzureSpeech Avatar] WebRTC SDP negotiation failed:', err);
  }


  return null;
}
