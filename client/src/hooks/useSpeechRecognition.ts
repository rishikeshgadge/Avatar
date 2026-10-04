import { useState, useEffect, useRef, useCallback } from 'react';
import type { LanguageCode } from '../types';

interface UseSpeechRecognitionProps {
  language: LanguageCode;
  onTranscriptFinal: (text: string) => void;
  onSpeechStart?: () => void;
  onVolumeChange?: (vol: number) => void;
}

const LANGUAGE_SPEECH_CODES: Record<LanguageCode, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export function useSpeechRecognition({
  language,
  onTranscriptFinal,
  onSpeechStart,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const speechCode = LANGUAGE_SPEECH_CODES[language] || 'en-US';

  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Please use Chrome/Edge or enable Speech SDK.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = speechCode;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        if (onSpeechStart) onSpeechStart();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interim || final);

        if (final.trim()) {
          onTranscriptFinal(final.trim());
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Speech recognition error:', event.error);
          setError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setError(err.message || 'Failed to start speech recognition');
      setIsListening(false);
    }
  }, [speechCode, onTranscriptFinal, onSpeechStart]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening,
  };
}
