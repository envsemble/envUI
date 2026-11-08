import { isRightToLeft } from '../../internal/direction.js';

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

/**
 * Whether the strip has tabs past its left and right edges to scroll to. In right-to-left text
 * scrollLeft runs from 0 down to -max. Less than 1.5 px doesn't count: subpixel rounding can leave a
 * pixel of scroll range, past even the start, that hides nothing.
 */
export function scrollBeyond(strip: HTMLElement) {
  const max = strip.scrollWidth - strip.clientWidth;
  const scrolled = strip.scrollLeft;
  const rtl = isRightToLeft(strip);
  const leftOver = rtl ? max + scrolled : scrolled;
  const rightOver = rtl ? -scrolled : max - scrolled;
  return { left: max > 1.5 && leftOver > 1.5, right: max > 1.5 && rightOver > 1.5 };
}

/** The tabs' values in order, with one tab moved to an index among the others. */
export function moveValue(values: readonly string[], id: string, index: number) {
  const next = values.filter((other) => other !== id);
  next.splice(index, 0, id);
  return next;
}
