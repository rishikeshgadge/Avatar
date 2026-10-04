import { useState, useEffect, useCallback, useRef } from 'react';
import type { AvatarState, LanguageCode, ChatMessage, ServerHealth } from '../types';
import { createSessionThread, sendUserMessage, fetchServerHealth } from '../services/api';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { AudioAnalyserHelper } from '../utils/audioVisualizer';

export function useVoiceAssistant() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [lipSyncAmplitude, setLipSyncAmplitude] = useState(0);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [sessionActive, setSessionActive] = useState(false);

  const audioAnalyserRef = useRef<AudioAnalyserHelper | null>(null);

  // Initialize Audio Analyser
  useEffect(() => {
    audioAnalyserRef.current = new AudioAnalyserHelper();
    return () => {
      if (audioAnalyserRef.current) {
        audioAnalyserRef.current.stopMicrophone();
      }
    };
  }, []);

  // Fetch initial server health check & thread ID
  useEffect(() => {
    const init = async () => {
      const health = await fetchServerHealth();
      setServerHealth(health);
      const tid = await createSessionThread();
      setThreadId(tid);
    };
    init();
  }, []);

  // Speech Synthesis callback for end of AI speech
  const handleSpeechEnd = useCallback(() => {
    if (sessionActive && !micMuted) {
      setAvatarState('listening');
    } else {
      setAvatarState('idle');
    }
  }, [sessionActive, micMuted]);

  const { speakText, stopSpeaking, isSpeaking } = useSpeechSynthesis({
    language,
    onSpeechEnd: handleSpeechEnd,
    onLipSyncFrame: (amp) => setLipSyncAmplitude(amp),
  });

  // Handle final user transcript from Speech STT
  const handleTranscriptFinal = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      // 1. Interrupt avatar if currently speaking
      if (isSpeaking) {
        stopSpeaking();
      }

      // 2. Add user message to UI
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };

      setMessages((prev) => [...prev, userMsg]);
      setAvatarState('thinking');

      // 3. Send message to Azure AI Foundry Agent backend
      try {
        const currentTid = threadId || (await createSessionThread());
        if (!threadId) setThreadId(currentTid);

        const data = await sendUserMessage(currentTid, userText, language);

        if (data.success && data.response) {
          const aiMsg: ChatMessage = {
            id: `ai_${Date.now()}`,
            sender: 'assistant',
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language,
            citations: data.citations,
            suggestedActions: data.suggestedActions,
          };

          setMessages((prev) => [...prev, aiMsg]);
          setAvatarState('speaking');

          // 4. Trigger speech synthesis & avatar lip movement
          speakText(data.response);
        } else {
          throw new Error(data.error || 'Failed to receive response from Azure agent');
        }
      } catch (err: any) {
        console.error('Agent interaction error:', err);
        setAvatarState('error');

        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: `⚠️ Error contacting Azure AI Foundry Agent: ${err.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [isSpeaking, stopSpeaking, threadId, language, speakText]
  );

  const { startListening, stopListening, isListening, interimTranscript, error: sttError } =
    useSpeechRecognition({
      language,
      onTranscriptFinal: handleTranscriptFinal,
      onSpeechStart: () => {
        if (isSpeaking) {
          stopSpeaking();
        }
        setAvatarState('listening');
      },
    });

  // Start Session
  const handleStartSession = useCallback(async () => {
    setSessionActive(true);
    setMicMuted(false);
    setAvatarState('listening');

    if (audioAnalyserRef.current) {
      audioAnalyserRef.current.startMicrophone((vol) => setMicVolume(vol));
    }

    startListening();
  }, [startListening]);

  // Stop Session
  const handleStopSession = useCallback(() => {
    setSessionActive(false);
    stopSpeaking();
    stopListening();
    if (audioAnalyserRef.current) {
      audioAnalyserRef.current.stopMicrophone();
    }
    setMicVolume(0);
    setAvatarState('stopped');
  }, [stopSpeaking, stopListening]);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (micMuted) {
      setMicMuted(false);
      if (sessionActive) {
        setAvatarState('listening');
        startListening();
      }
    } else {
      setMicMuted(true);
      stopListening();
      if (avatarState === 'listening') {
        setAvatarState('idle');
      }
    }
  }, [micMuted, sessionActive, avatarState, startListening, stopListening]);

  // Direct manual message input (for typing in chat panel)
  const sendManualMessage = useCallback(
    (text: string) => {
      handleTranscriptFinal(text);
    },
    [handleTranscriptFinal]
  );

  return {
    avatarState,
    language,
    setLanguage,
    messages,
    sessionActive,
    micMuted,
    micVolume,
    lipSyncAmplitude,
    interimTranscript,
    serverHealth,
    sttError,
    handleStartSession,
    handleStopSession,
    toggleMic,
    sendManualMessage,
    clearChat: () => setMessages([]),
  };
}
