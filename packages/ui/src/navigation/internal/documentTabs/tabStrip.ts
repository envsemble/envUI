import '../../../styles/Base.css';
import '../../../styles/DocumentTabs.css';

/** A document tab's element in the strip, found by its value. */
export function tabElement(strip: HTMLElement | null, value: string | null) {
  if (value === null || !strip) return null;
  for (const tab of strip.querySelectorAll<HTMLElement>('[role="tab"]'))
    if (tab.dataset.value === value) return tab;
  return null;
}

export const tabHolding = (element: Element) =>
  element.closest('.env-document-tabs-item')?.querySelector<HTMLElement>('[role="tab"]') ?? null;

/** The value of the tab whose item holds focus within the strip, or null. */
export function focusedTabValue(strip: HTMLElement | null) {
  const active = strip?.ownerDocument.activeElement;
  if (!strip || !active || !strip.contains(active)) return null;
  return tabHolding(active)?.dataset.value ?? null;
}

/** The tabs' values in order, with one tab moved to an index among the others. */
export function moveValue(values: readonly string[], value: string, index: number) {
  const next = values.filter((other) => other !== value);
  next.splice(index, 0, value);
  return next;
}
