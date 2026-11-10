"use client";

import * as React from "react";

interface EdgeVoiceOptions {
  workerUrl?: string; // e.g. https://personal-os-edge.workers.dev
  apiToken?: string;
  onTranscriptionComplete?: (transcript: string) => void;
  onError?: (error: Error) => void;
}

export function useEdgeVoiceRecording(options: EdgeVoiceOptions = {}) {
  const {
    workerUrl = process.env.NEXT_PUBLIC_EDGE_API_URL || "",
    apiToken = process.env.NEXT_PUBLIC_EDGE_API_TOKEN || "",
    onTranscriptionComplete,
    onError,
  } = options;

  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [audioDurationSec, setAudioDurationSec] = React.useState(0);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startRecording = React.useCallback(async () => {
    try {
      audioChunksRef.current = [];
      setTranscript("");
      setAudioDurationSec(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Prefer opus audio in webm container
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/ogg;codecs=opus";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) return;

        setIsProcessing(true);
        try {
          // If workerUrl is configured, send directly to Cloudflare Whisper Worker
          // Otherwise, fall back to Next.js API or local buffer
          const endpoint = workerUrl ? `${workerUrl}/api/v1/voice/transcribe` : "/api/v1/voice/transcribe";
          const headers: Record<string, string> = {
            "Content-Type": audioBlob.type,
          };
          if (apiToken) {
            headers["Authorization"] = `Bearer ${apiToken}`;
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers,
            body: audioBlob,
          });

          if (!res.ok) {
            throw new Error(`Edge voice processing failed: ${res.statusText}`);
          }

          const data = await res.json();
          const resultText = data.text || data.transcript || "";
          setTranscript(resultText);
          onTranscriptionComplete?.(resultText);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          onError?.(error);
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start(250); // collect 250ms chunks
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setAudioDurationSec((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Could not access microphone");
      onError?.(error);
    }
  }, [workerUrl, apiToken, onTranscriptionComplete, onError]);

  const stopRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const cancelRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null; // discard onstop handler
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(false);
      audioChunksRef.current = [];
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    audioDurationSec,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
