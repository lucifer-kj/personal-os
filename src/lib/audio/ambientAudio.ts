/**
 * Ambient Audio Generator using Web Audio API
 * Generates continuous soothing brown noise for deep focus sessions.
 * Zero external dependencies or network asset downloads.
 */

let activeContext: AudioContext | null = null;
let activeGain: GainNode | null = null;
let activeSource: AudioBufferSourceNode | null = null;

export function isAmbientPlaying(): boolean {
  return activeContext !== null && activeContext.state === "running";
}

export function startAmbientNoise(volume = 0.15): () => void {
  stopAmbientNoise();

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return () => {};

    const ctx = new AudioContextClass();
    activeContext = ctx;

    // 2-second looped buffer of brown noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration filter
      dataStep(white);
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      // Normalize gain
      output[i] *= 3.5;
    }

    function dataStep(_val: number) {}

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    activeSource = source;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    // Smooth fade in over 400ms
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), ctx.currentTime + 0.4);
    activeGain = gainNode;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    return () => stopAmbientNoise();
  } catch (err) {
    console.warn("Web Audio ambient generation could not start:", err);
    return () => {};
  }
}

export function stopAmbientNoise(): void {
  if (activeGain && activeContext && activeContext.state === "running") {
    try {
      const now = activeContext.currentTime;
      activeGain.gain.setValueAtTime(activeGain.gain.value, now);
      activeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      setTimeout(() => {
        try {
          if (activeSource) {
            activeSource.stop();
            activeSource.disconnect();
            activeSource = null;
          }
          if (activeContext) {
            activeContext.close();
            activeContext = null;
          }
          activeGain = null;
        } catch {
          // Context already closed
        }
      }, 350);
    } catch {
      activeContext = null;
      activeGain = null;
      activeSource = null;
    }
  } else {
    activeContext = null;
    activeGain = null;
    activeSource = null;
  }
}
