import { config } from '../config/env';

export interface AIResponse {
  response: string;
  language?: string;
  citations?: Array<{ title: string; url?: string }>;
  suggestedActions?: string[];
  model?: string;
}

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// In-memory conversation history per session
const sessionHistories: Record<string, ConversationMessage[]> = {};

/**
 * Send a message to the AI using direct API URL + API Key (no thread/run polling)
 * Supports: Azure OpenAI, OpenAI-compatible, or any chat completions endpoint
 */
export async function sendAIMessage(
  sessionId: string,
  userMessage: string,
  language: string = 'en'
): Promise<AIResponse> {
  // Initialize session history
  if (!sessionHistories[sessionId]) {
    sessionHistories[sessionId] = [
      {
        role: 'system',
        content: getSystemPrompt(language),
      },
    ];
  }

  // Add user message to history
  sessionHistories[sessionId].push({
    role: 'user',
    content: userMessage,
  });

  const { apiUrl, apiKey, modelName } = config.ai;

  // If API URL and key are configured, call the real API
  if (apiUrl && apiKey && !config.simulationMode) {
    try {
      const endpoint = apiUrl.endsWith('/')
        ? `${apiUrl}chat/completions`
        : `${apiUrl}/chat/completions`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName || 'gpt-4o',
          messages: sessionHistories[sessionId],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AI Service] API error ${res.status}: ${errorText}`);
        throw new Error(`AI API returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const assistantMessage =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text ||
        'No response received.';

      // Store assistant reply in history
      sessionHistories[sessionId].push({
        role: 'assistant',
        content: assistantMessage,
      });

      // Trim history to last 20 messages to avoid token overflow
      if (sessionHistories[sessionId].length > 21) {
        const systemMsg = sessionHistories[sessionId][0];
        sessionHistories[sessionId] = [
          systemMsg,
          ...sessionHistories[sessionId].slice(-20),
        ];
      }

      return {
        response: assistantMessage,
        language,
        model: data.model || modelName,
      };
    } catch (err) {
      console.error('[AI Service] Error calling AI API:', err);
      throw err;
    }
  }

  // Fallback simulation mode
  const simResponse = generateSimulatedResponse(userMessage, language);
  sessionHistories[sessionId].push({
    role: 'assistant',
    content: simResponse,
  });

  return {
    response: simResponse,
    language,
    model: 'simulation',
    suggestedActions: getSuggestedFollowups(language),
  };
}

/**
 * Create a new session (just returns a unique ID)
 */
export function createSession(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Clear session history
 */
export function clearSession(sessionId: string): void {
  delete sessionHistories[sessionId];
}

function getSystemPrompt(language: string): string {
  const base = `You are ARIA, an advanced AI voice assistant with a warm, professional, and intelligent personality. 
You have deep expertise across technology, science, business, and general knowledge.
Always respond in a conversational yet professional tone suitable for spoken dialogue.
Keep responses concise and clear — typically 2-4 sentences for voice responses.
If the user speaks in a different language, respond in that same language.`;

  if (language === 'hi') {
    return `${base}\nCurrently responding in Hindi (हिंदी).`;
  }
  if (language === 'mr') {
    return `${base}\nCurrently responding in Marathi (मराठी).`;
  }
  return base;
}

function generateSimulatedResponse(query: string, language: string): string {
  const lower = query.toLowerCase();

  if (language === 'hi' || lower.includes('नमस्ते')) {
    return `नमस्ते! मैं ARIA हूँ, आपकी AI सहायक। मैं आपकी किस प्रकार सहायता कर सकती हूँ?`;
  }
  if (language === 'mr' || lower.includes('नमस्कार')) {
    return `नमस्कार! मी ARIA आहे, तुमची AI सहाय्यक. मी तुम्हाला कशी मदत करू शकतो?`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I'm ARIA, your intelligent AI assistant. I'm here to help you with any questions, tasks, or conversations. What can I do for you today?`;
  }
  if (lower.includes('who are you') || lower.includes('what are you')) {
    return `I'm ARIA — an Advanced Real-time Intelligent Assistant. I'm designed for natural conversation, answering complex questions, and helping you accomplish tasks efficiently.`;
  }
  if (lower.includes('weather')) {
    return `I don't have real-time weather access in simulation mode, but I'd recommend checking your local weather service. Would you like to discuss anything else?`;
  }
  if (lower.includes('thank')) {
    return `You're very welcome! It's my pleasure to assist you. Is there anything else I can help you with?`;
  }

  return `That's an interesting question. In production mode with a configured AI API endpoint, I would provide a comprehensive, intelligent response based on my full capabilities. For now, I'm running in simulation mode. Please configure your API URL, API key, and model name in the server settings to enable full AI responses.`;
}

function getSuggestedFollowups(language: string): string[] {
  if (language === 'hi') {
    return ['आप क्या कार्य कर सकते हैं?', 'मुझे कुछ बताइए।'];
  }
  if (language === 'mr') {
    return ['तुमच्या क्षमता काय आहेत?', 'अधिक माहिती द्या.'];
  }
  return [
    'Tell me about your capabilities',
    'What topics can you help with?',
    'How do you work?',
  ];
}
