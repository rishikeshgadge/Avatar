import { useState, useEffect, useCallback, useRef } from 'react';
import type { AvatarState, LanguageCode, ChatMessage, ServerHealth } from '../types';
import { createSession, sendUserMessage, fetchServerHealth } from '../services/api';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { AudioAnalyserHelper } from '../utils/audioVisualizer';

export function useVoiceAssistant() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [lipSyncAmplitude, setLipSyncAmplitude] = useState(0);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioAnalyserRef = useRef<AudioAnalyserHelper | null>(null);
  const sessionActiveRef = useRef(false);
  const micMutedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { sessionActiveRef.current = sessionActive; }, [sessionActive]);
  useEffect(() => { micMutedRef.current = micMuted; }, [micMuted]);

  // Initialize Audio Analyser
  useEffect(() => {
    audioAnalyserRef.current = new AudioAnalyserHelper();
    return () => {
      if (audioAnalyserRef.current) {
        audioAnalyserRef.current.stopMicrophone();
      }
    };
  }, []);

  // Fetch initial server health
  useEffect(() => {
    const init = async () => {
      const health = await fetchServerHealth();
      setServerHealth(health);
      const sid = await createSession();
      setSessionId(sid);
    };
    init();
  }, []);

  // Speech Synthesis callback for end of AI speech
  const handleSpeechEnd = useCallback(() => {
    if (sessionActiveRef.current && !micMutedRef.current) {
      setAvatarState('listening');
    } else {
      setAvatarState('idle');
    }
  }, []);

  const { speakText, stopSpeaking, isSpeaking } = useSpeechSynthesis({
    language,
    onSpeechEnd: handleSpeechEnd,
    onLipSyncFrame: (amp) => setLipSyncAmplitude(amp),
  });

  const isSpeakingRef = useRef(false);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Handle final user transcript from Speech STT
  const handleTranscriptFinal = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isProcessing) return;

      // Interrupt avatar if currently speaking
      if (isSpeakingRef.current) {
        stopSpeaking();
      }

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        sender: 'user',
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };

      setMessages((prev) => [...prev, userMsg]);
      setAvatarState('thinking');
      setIsProcessing(true);

      try {
        const currentSid = sessionId || (await createSession());
        if (!sessionId) setSessionId(currentSid);

        const data = await sendUserMessage(currentSid, userText, language);

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
          speakText(data.response);
        } else {
          throw new Error(data.error || 'Failed to receive a response from AI');
        }
      } catch (err: any) {
        console.error('Agent interaction error:', err);
        setAvatarState('error');

        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: `⚠️ ${err.message || 'An error occurred. Please check your API configuration.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);

        // Return to listening after error
        setTimeout(() => {
          if (sessionActiveRef.current && !micMutedRef.current) {
            setAvatarState('listening');
          } else {
            setAvatarState('idle');
          }
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, stopSpeaking, sessionId, language, speakText]
  );

  const { startListening, stopListening, isListening, interimTranscript, error: sttError } =
    useSpeechRecognition({
      language,
      onTranscriptFinal: handleTranscriptFinal,
      onSpeechStart: () => {
        if (isSpeakingRef.current) {
          stopSpeaking();
        }
        if (!isProcessing) {
          setAvatarState('listening');
        }
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
    setLipSyncAmplitude(0);
    setAvatarState('stopped');
    setIsProcessing(false);
  }, [stopSpeaking, stopListening]);

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (micMuted) {
      setMicMuted(false);
      if (sessionActive) {
        setAvatarState('listening');
        startListening();
        if (audioAnalyserRef.current) {
          audioAnalyserRef.current.startMicrophone((vol) => setMicVolume(vol));
        }
      }
    } else {
      setMicMuted(true);
      stopListening();
      if (audioAnalyserRef.current) {
        audioAnalyserRef.current.stopMicrophone();
      }
      setMicVolume(0);
      if (avatarState === 'listening') {
        setAvatarState('idle');
      }
    }
  }, [micMuted, sessionActive, avatarState, startListening, stopListening]);

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
    isProcessing,
    handleStartSession,
    handleStopSession,
    toggleMic,
    sendManualMessage,
    clearChat: () => setMessages([]),
  };
}
