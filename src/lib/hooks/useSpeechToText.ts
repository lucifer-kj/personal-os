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
  edgeWorkerUrl?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscriptChange, lang = "en-US", edgeWorkerUrl } = options;
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);
  const [isEdgeFallback, setIsEdgeFallback] = React.useState(false);

  const recognitionRef = React.useRef<IWindowSpeechRecognition | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasWebSpeech = !!(
        (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
      );
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      // Supported if either Web Speech or getUserMedia is available
      setIsSupported(hasWebSpeech || hasMediaDevices);
      setIsEdgeFallback(!hasWebSpeech && hasMediaDevices);
    }
  }, []);

  // Initialize native Web Speech API if available
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
          // ignore error on abort
        }
      }
    };
  }, [lang, onTranscriptChange]);

  const startListening = React.useCallback(async () => {
    setError(null);
    setTranscript("");

    // If native speech recognition is available, use it
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch {
        // Fallback to MediaRecorder
      }
    }

    // MediaRecorder / Edge fallback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        audioChunksRef.current = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/ogg;codecs=opus";

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size === 0) return;

          try {
            const endpoint =
              edgeWorkerUrl ||
              process.env.NEXT_PUBLIC_EDGE_API_URL ||
              "/api/v1/voice/transcribe";

            const res = await fetch(`${endpoint.replace(/\/$/, "")}/api/v1/voice/transcribe`, {
              method: "POST",
              headers: { "Content-Type": audioBlob.type },
              body: audioBlob,
            });

            if (res.ok) {
              const data = await res.json();
              const resultText = data.text || data.transcript || "";
              setTranscript(resultText);
              onTranscriptChange?.(resultText, true);
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Voice transcription failed";
            setError(msg);
          } finally {
            setIsListening(false);
          }
        };

        recorder.start(250);
        setIsListening(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Microphone access denied";
        setError(msg);
        setIsListening(false);
      }
    }
  }, [edgeWorkerUrl, onTranscriptChange]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
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
    isListening,
    transcript,
    error,
    isSupported,
    isEdgeFallback,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}
