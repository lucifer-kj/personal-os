import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  if (typeof window === "undefined") return;

  // Guard for headless / test environments without 2D canvas support
  try {
    const testCanvas = document.createElement("canvas");
    if (!testCanvas.getContext || !testCanvas.getContext("2d")) {
      return;
    }
  } catch {
    return;
  }

  const count = 70;
  const defaults = {
    origin: { y: 0.7 },
    disableForReducedMotion: true,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Warm editorial palette: champagne gold, emerald, indigo, rose
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#3b82f6"];

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors,
  });
  fire(0.2, {
    spread: 60,
    colors,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors,
  });
}
