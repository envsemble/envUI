import '../../../styles/Base.css';
import '../../../styles/DocumentTabs.css';

/** A document tab's element in the strip, found by its value. */
export function tabElement(strip: HTMLElement | null, id: string | null) {
  if (id === null || !strip) return null;
  for (const tab of strip.querySelectorAll<HTMLElement>('[role="tab"]'))
    if (tab.dataset.tabId === id) return tab;
  return null;
}

/** The id of the tab whose item holds focus within the strip, or null. */
export function focusedTabId(strip: HTMLElement | null) {
  const active = strip?.ownerDocument.activeElement;
  if (!strip || !active || !strip.contains(active)) return null;
  return (
    active.closest('.env-document-tabs-item')?.querySelector<HTMLElement>('[role="tab"]')?.dataset
      .tabId ?? null
  );
}

/** The tabs' values in order, with one tab moved to an index among the others. */
export function moveValue(values: readonly string[], id: string, index: number) {
  const next = values.filter((other) => other !== id);
  next.splice(index, 0, id);
  return next;
}
