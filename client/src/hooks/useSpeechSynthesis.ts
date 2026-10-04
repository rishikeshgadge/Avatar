import { useState, useCallback, useRef } from 'react';
import type { LanguageCode } from '../types';

interface UseSpeechSynthesisProps {
  language: LanguageCode;
  onSpeechEnd?: () => void;
  onLipSyncFrame?: (amplitude: number) => void;
}

const VOICE_PREFERENCES: Record<LanguageCode, string[]> = {
  en: ['Google US English', 'Microsoft Jenny Online (Natural)', 'en-US'],
  hi: ['Google हिन्दी', 'Microsoft Swara Online (Natural)', 'hi-IN'],
  mr: ['Microsoft Aarohi Online (Natural)', 'mr-IN'],
};

export function useSpeechSynthesis({ language, onSpeechEnd, onLipSyncFrame }: UseSpeechSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsSpeaking(false);
    if (onLipSyncFrame) onLipSyncFrame(0);
  }, [onLipSyncFrame]);

  const speakText = useCallback(
    (text: string) => {
      stopSpeaking();

      if (!('speechSynthesis' in window)) {
        console.warn('Browser speech synthesis not supported.');
        if (onSpeechEnd) onSpeechEnd();
        return;
      }

      // Remove markdown artifacts for clean speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_#~]/g, '')
        .trim();

      if (!cleanText) {
        if (onSpeechEnd) onSpeechEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Match voice language
      const voices = window.speechSynthesis.getVoices();
      const preferred = VOICE_PREFERENCES[language] || [];
      const matchedVoice = voices.find((v) =>
        preferred.some((p) => v.name.includes(p) || v.lang.includes(p))
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);

        // Simulate viseme lip sync movement frames
        let startTime = Date.now();
        const animateLipSync = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          // Oscillate lip sync amplitude based on speech rhythm
          const wave1 = Math.sin(elapsed * 12);
          const wave2 = Math.cos(elapsed * 18);
          const amplitude = Math.abs(wave1 * 0.6 + wave2 * 0.4);

          if (onLipSyncFrame) {
            onLipSyncFrame(amplitude);
          }
          animFrameRef.current = requestAnimationFrame(animateLipSync);
        };
        animateLipSync();
      };

      utterance.onend = () => {
        stopSpeaking();
        if (onSpeechEnd) onSpeechEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        stopSpeaking();
        if (onSpeechEnd) onSpeechEnd();
      };

      window.speechSynthesis.speak(utterance);
    },
    [language, stopSpeaking, onSpeechEnd, onLipSyncFrame]
  );

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
  };
}
