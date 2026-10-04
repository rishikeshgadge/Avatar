export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'stopped' | 'error';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechCode: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: LanguageCode;
  citations?: Array<{ title: string; url?: string }>;
  suggestedActions?: string[];
  isStreaming?: boolean;
}

export interface SpeechTokenConfig {
  token: string | null;
  region: string;
  avatarCharacter: string;
  avatarStyle: string;
  isSimulated: boolean;
}

export interface ServerHealth {
  status: string;
  simulationMode: boolean;
  azureFoundryConnected: boolean;
  azureSpeechConnected: boolean;
  cosmosDbConnected: boolean;
}
