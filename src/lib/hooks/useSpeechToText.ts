"use client";

import * as React from "react";

// Web Speech API interface declarations for TypeScript
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    item: (index: number) => ISpeechRecognitionResult;
    [index: number]: ISpeechRecognitionResult;
  };
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item: (index: number) => { transcript: string; confidence: number };
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionConstructor {
  new (): IWindowSpeechRecognition;
}

interface UseSpeechToTextOptions {
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscriptChange, lang = "en-US" } = options;
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const [isSupported] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });

  const recognitionRef = React.useRef<IWindowSpeechRecognition | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI: SpeechRecognitionConstructor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (e) => {
          setError(e.error || "Speech recognition error");
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          let currentTranscript = "";
          let finalFound = false;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            currentTranscript += item[0].transcript;
            if (item.isFinal) {
              finalFound = true;
            }
          }

          if (currentTranscript) {
            setTranscript(currentTranscript);
            if (onTranscriptChange) {
              onTranscriptChange(currentTranscript, finalFound);
            }
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.error("Failed to initialize SpeechRecognition:", err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore error on abort during unmount
        }
      }
    };
  }, [lang, onTranscriptChange]);

  const startListening = React.useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    try {
      recognitionRef.current.start();
    } catch {
      // already running or blocked
    }
  }, []);

  const stopListening = React.useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // already stopped
    }
  }, []);

  const toggleListening = React.useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearTranscript = React.useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}
