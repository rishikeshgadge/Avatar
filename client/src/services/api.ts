import type { SpeechTokenConfig, ServerHealth } from '../types';

const API_BASE_URL = '/api';

export async function fetchServerHealth(): Promise<ServerHealth> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Healthcheck failed');
    const data = await res.json();
    return data.config ? { status: data.status, ...data.config } : data;
  } catch (error) {
    return {
      status: 'offline',
      simulationMode: true,
      azureFoundryConnected: false,
      azureSpeechConnected: false,
      cosmosDbConnected: false,
    };
  }
}

export async function createSessionThread(): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/agent/thread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) return data.threadId;
  } catch (err) {
    console.error('Failed to create thread:', err);
  }
  return `thread_fallback_${Date.now()}`;
}

export async function sendUserMessage(threadId: string, message: string, language: string = 'en') {
  const res = await fetch(`${API_BASE_URL}/agent/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threadId, message, language }),
  });
  if (!res.ok) {
    throw new Error(`Server returned error: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchSpeechConfig(): Promise<SpeechTokenConfig> {
  try {
    const res = await fetch(`${API_BASE_URL}/speech/token`);
    const data = await res.json();
    if (data.success) return data;
  } catch (err) {
    console.error('Failed to fetch speech token:', err);
  }
  return {
    token: null,
    region: 'eastus',
    avatarCharacter: 'lisa',
    avatarStyle: 'graceful',
    isSimulated: true,
  };
}

export async function fetchConversationHistory(threadId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/history/${threadId}`);
    return await res.json();
  } catch (err) {
    return { success: false, messages: [] };
  }
}
