type Observed = Element | null | undefined;

/**
 * Calls onResize as each of the elements changes size, and once each is first observed; returns
 * what stops it. Where there is no ResizeObserver, as on the server, it observes nothing.
 */
export function observeResize(
  elements: Observed | readonly Observed[],
  onResize: ResizeObserverCallback,
  options?: ResizeObserverOptions,
): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {};
  const observer = new ResizeObserver(onResize);
  for (const element of [elements].flat()) if (element) observer.observe(element, options);
  return () => observer.disconnect();
}
