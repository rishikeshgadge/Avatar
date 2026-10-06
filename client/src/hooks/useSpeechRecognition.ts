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
  const isStoppingRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const onTranscriptFinalRef = useRef(onTranscriptFinal);
  const onSpeechStartRef = useRef(onSpeechStart);

  // Keep refs in sync
  useEffect(() => { onTranscriptFinalRef.current = onTranscriptFinal; }, [onTranscriptFinal]);
  useEffect(() => { onSpeechStartRef.current = onSpeechStart; }, [onSpeechStart]);

  const speechCode = LANGUAGE_SPEECH_CODES[language] || 'en-US';

  const createRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechCode;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      onSpeechStartRef.current?.();
    };

    recognition.onspeechstart = () => {
      onSpeechStartRef.current?.();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) setInterimTranscript(interim);

      if (final.trim()) {
        setInterimTranscript('');
        onTranscriptFinalRef.current(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const ignoredErrors = ['no-speech', 'aborted'];
      if (!ignoredErrors.includes(event.error)) {
        console.warn('[SpeechRecognition] Error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'network') {
          setError('Network error during speech recognition. Check your connection.');
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');

      // Auto-restart if should be continuously listening
      if (shouldRestartRef.current && !isStoppingRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current && !isStoppingRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Recognition may already be running
            }
          }
        }, 200);
      }
    };

    return recognition;
  }, [speechCode]);

  const startListening = useCallback(() => {
    isStoppingRef.current = false;
    shouldRestartRef.current = true;
    setError(null);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err: any) {
      setError(err.message || 'Failed to start speech recognition');
      setIsListening(false);
    }
  }, [createRecognition]);

  const stopListening = useCallback(() => {
    isStoppingRef.current = true;
    shouldRestartRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Restart recognition when language changes (if currently listening)
  useEffect(() => {
    if (shouldRestartRef.current && !isStoppingRef.current) {
      startListening();
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
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
