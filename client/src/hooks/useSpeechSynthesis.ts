import { useState, useCallback, useRef, useEffect } from 'react';
import type { LanguageCode } from '../types';

interface UseSpeechSynthesisProps {
  language: LanguageCode;
  onSpeechEnd?: () => void;
  onLipSyncFrame?: (amplitude: number) => void;
}

const VOICE_PREFERENCES: Record<LanguageCode, string[]> = {
  en: [
    'Microsoft Aria Online (Natural)',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Google US English',
    'en-US',
    'en-GB',
  ],
  hi: [
    'Microsoft Swara Online (Natural)',
    'Microsoft Madhur Online (Natural)',
    'Google हिन्दी',
    'hi-IN',
  ],
  mr: ['Microsoft Aarohi Online (Natural)', 'mr-IN'],
};

export function useSpeechSynthesis({ language, onSpeechEnd, onLipSyncFrame }: UseSpeechSynthesisProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const startTimeRef = useRef(0);

  // Load voices eagerly and on voiceschanged
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() || [];
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const stopLipSync = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    onLipSyncFrame?.(0);
  }, [onLipSyncFrame]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopLipSync();
    setIsSpeaking(false);
  }, [stopLipSync]);

  const startLipSyncAnimation = useCallback(() => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Natural-looking multi-frequency lip sync
      const w1 = Math.sin(elapsed * 8.5) * 0.45;
      const w2 = Math.cos(elapsed * 14.3) * 0.3;
      const w3 = Math.sin(elapsed * 5.7 + 1.2) * 0.25;
      const amplitude = Math.max(0, Math.min(1, Math.abs(w1 + w2 + w3)));

      onLipSyncFrame?.(amplitude);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [onLipSyncFrame]);

  const getBestVoice = useCallback((lang: LanguageCode): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis?.getVoices() || [];

    const prefs = VOICE_PREFERENCES[lang] || [];

    // Try exact name match first
    for (const pref of prefs) {
      const found = voices.find((v) => v.name === pref);
      if (found) return found;
    }

    // Try partial name match
    for (const pref of prefs) {
      const found = voices.find((v) => v.name.includes(pref));
      if (found) return found;
    }

    // Try lang code match
    for (const pref of prefs) {
      const found = voices.find((v) => v.lang.startsWith(pref));
      if (found) return found;
    }

    // Fallback to any voice matching the language
    const langCode = lang === 'en' ? 'en' : lang === 'hi' ? 'hi' : 'mr';
    return voices.find((v) => v.lang.startsWith(langCode)) || null;
  }, []);

  const speakText = useCallback(
    (text: string) => {
      stopSpeaking();

      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        onSpeechEnd?.();
        return;
      }

      // Clean text for speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[_~]/g, '')
        .trim();

      if (!cleanText) {
        onSpeechEnd?.();
        return;
      }

      // Chrome bug: cancel pending utterances before new one
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      const voice = getBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'mr-IN';
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        startLipSyncAnimation();
      };

      utterance.onend = () => {
        stopLipSync();
        setIsSpeaking(false);
        utteranceRef.current = null;
        onSpeechEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e.error);
        }
        stopLipSync();
        setIsSpeaking(false);
        utteranceRef.current = null;
        onSpeechEnd?.();
      };

      // Small delay helps Chrome initialize voices correctly
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    },
    [language, stopSpeaking, stopLipSync, startLipSyncAnimation, getBestVoice, onSpeechEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    isSpeaking,
    speakText,
    stopSpeaking,
  };
}
