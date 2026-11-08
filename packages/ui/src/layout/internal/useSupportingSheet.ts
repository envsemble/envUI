'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

/** What Tab reaches inside an element, in order. */
const tabbables = (element: HTMLElement) =>
  [
    ...element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
    ),
  ].filter((candidate) => candidate.tabIndex >= 0 && candidate.getClientRects().length > 0);

/**
 * Makes everything on the page inert but the sheet and what holds it, so aria-modal holds; returns
 * what undoes it.
 */
function inertOthers(sheet: HTMLElement) {
  const document = sheet.ownerDocument;
  const others: HTMLElement[] = [];
  for (let node: Element = sheet; node.parentElement && node !== document.body;) {
    for (const other of node.parentElement.children)
      if (
        other instanceof HTMLElement &&
        other !== node &&
        !other.inert &&
        // The backdrop stays live, as a press on it closes the sheet, and so do live regions, such
        // as toasts, which announce what happens meanwhile.
        !other.classList.contains('env-panes-backdrop') &&
        !other.hasAttribute('aria-live')
      )
        others.push(other);
    node = node.parentElement;
  }
  for (const other of others) other.inert = true;
  return () => {
    for (const other of others) other.inert = false;
  };
}

/**
 * Keeps the page still under a sheet fixed to the window, keeping its scrollbar's room so nothing
 * moves; returns what restores it.
 */
function holdPageScroll(sheet: HTMLElement) {
  if (getComputedStyle(sheet).position !== 'fixed') return () => {};
  const html = sheet.ownerDocument.documentElement;
  const kept = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  html.style.scrollbarGutter = 'stable';
  html.style.overflow = 'hidden';
  return () => {
    html.style.overflow = kept.overflow;
    html.style.scrollbarGutter = kept.gutter;
  };
}

/**
 * Panes' supporting pane as a sheet, which CSS decides by positioning it over the main pane below
 * `splitAt`: whether it is one, read while it is open and again as the Panes' width changes, and
 * whether it is modal, as it is unless it belongs to a contained PortalContainer rather than the
 * window. While it is modal, everything else on the page is inert and focus moves in; as it closes,
 * focus goes back to where it was. A sheet that becomes a pane beside the main one, as the Panes
 * widen, keeps focus where it is. A sheet fixed to the window keeps the page still.
 */
export function useSupportingSheet(
  pane: RefObject<HTMLElement | null>,
  open: boolean,
  contained: boolean,
) {
  const [sheet, setSheet] = useState(false);
  useLayoutEffect(() => {
    const element = pane.current;
    if (!open || !element) {
      setSheet(false);
      return;
    }
    const check = () => {
      const { position } = getComputedStyle(element);
      setSheet(position === 'absolute' || position === 'fixed');
    };
    check();
    const observer = new ResizeObserver(check);
    if (element.parentElement) observer.observe(element.parentElement);
    return () => observer.disconnect();
  }, [pane, open]);
  const modal = sheet && !contained;
  // Read as the modal ends, in the same commit as a close: whether the sheet stays open, as it does
  // when it becomes a pane beside the main one.
  const openRef = useRef(open);
  openRef.current = open;
  useLayoutEffect(() => {
    const element = pane.current;
    if (!modal || !element) return;
    const document = element.ownerDocument;
    const active = document.activeElement;
    const returnFocus = active instanceof HTMLElement ? active : null;
    if (!element.contains(active)) element.focus();
    const restoreOthers = inertOthers(element);
    const releasePage = holdPageScroll(element);
    return () => {
      restoreOthers();
      releasePage();
      if (openRef.current) return;
      const now = document.activeElement;
      const lost = now === null || now === document.body || element.contains(now);
      if (!returnFocus?.isConnected || !lost) return;
      // WebKit lets focus onto what was inert only once styles are worked out again.
      returnFocus.getBoundingClientRect();
      returnFocus.focus();
    };
  }, [pane, modal]);
  return { sheet, modal };
}

/** Keeps Tab in a modal sheet, from its last stop to its first and back. */
export function keepTabInside(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Tab') return;
  const stops = tabbables(event.currentTarget);
  const first = stops[0];
  const last = stops[stops.length - 1];
  const active = event.currentTarget.ownerDocument.activeElement;
  if (!first || !last) {
    event.preventDefault();
  } else if (event.shiftKey && (active === first || active === event.currentTarget)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
