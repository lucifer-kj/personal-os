import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechToText } from "./useSpeechToText";

describe("useSpeechToText hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports isSupported=false when SpeechRecognition is not present in window", () => {
    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(false);
    expect(result.current.isListening).toBe(false);
  });

  it("initializes and handles start/stop when SpeechRecognition is present", () => {
    const startMock = vi.fn();
    const stopMock = vi.fn();
    const abortMock = vi.fn();

    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "en-US";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onresult: ((e: unknown) => void) | null = null;

      start() {
        startMock();
        if (this.onstart) this.onstart();
      }
      stop() {
        stopMock();
        if (this.onend) this.onend();
      }
      abort() {
        abortMock();
      }
    }

    (window as unknown as { webkitSpeechRecognition: typeof MockSpeechRecognition }).webkitSpeechRecognition =
      MockSpeechRecognition;

    const { result } = renderHook(() => useSpeechToText());
    expect(result.current.isSupported).toBe(true);

    act(() => {
      result.current.startListening();
    });
    expect(startMock).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);

    act(() => {
      result.current.stopListening();
    });
    expect(stopMock).toHaveBeenCalled();
    expect(result.current.isListening).toBe(false);

    // cleanup
    delete (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });
});
