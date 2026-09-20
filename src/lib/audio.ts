let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export async function unlockAudio(): Promise<void> {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* ignore */
    }
  }
  unlocked = true;
}

function tone(
  c: AudioContext,
  time: number,
  freq: number,
  dur: number,
  gain = 0.08,
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

export function playGridStart(): void {
  const c = getCtx();
  if (!c || !unlocked) return;
  const t0 = c.currentTime + 0.02;
  for (let i = 0; i < 5; i++) {
    tone(c, t0 + i * 0.18, 880, 0.12, 0.07);
  }
  tone(c, t0 + 1.05, 1320, 0.42, 0.1);
}

export async function notifyAlarm(title: string, body: string): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body, tag: "cap-pit-clock" });
    }
  } catch {
    /* preview iframes may block */
  }
}

export async function requestNotifyPermission(): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  } catch {
    /* ignore */
  }
}

export function vibe(pattern: number[] = [180, 80, 180, 80, 320]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(pattern);
  }
}
