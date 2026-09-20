import { useSyncExternalStore } from "react";

let current = Date.now();
const listeners = new Set<() => void>();
let intervalId: number | null = null;

function emit() {
  current = Date.now();
  listeners.forEach((fn) => fn());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (intervalId == null) {
    current = Date.now();
    intervalId = window.setInterval(emit, 250);
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && intervalId != null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return 0;
}

export function useNow(_intervalMs = 250): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
