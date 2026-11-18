export interface IdleTime {
  timeRemaining: () => number;
}

const assumedIdleMs = 12;
const idleTimeoutMs = 1000;
const fallbackDelayMs = 50;

export function onIdle(step: (time: IdleTime) => void): () => void {
  if (typeof requestIdleCallback === 'function') {
    const handle = requestIdleCallback(step, { timeout: idleTimeoutMs });
    return () => cancelIdleCallback(handle);
  }
  const timer = window.setTimeout(() => {
    const start = performance.now();
    step({ timeRemaining: () => Math.max(0, start + assumedIdleMs - performance.now()) });
  }, fallbackDelayMs);
  return () => window.clearTimeout(timer);
}

export function scrollerOf(element: Element) {
  for (let node = element.parentElement; node; node = node.parentElement)
    if (/auto|scroll|overlay/.test(getComputedStyle(node).overflowY)) return node;
  return null;
}
