'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

const tabbables = (element: HTMLElement) =>
  [
    ...element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
    ),
  ].filter((candidate) => candidate.tabIndex >= 0 && candidate.getClientRects().length > 0);

function inertEverythingButSheet(sheet: HTMLElement, staysLive: (element: Element) => boolean) {
  const document = sheet.ownerDocument;
  const others: HTMLElement[] = [];
  for (let node: Element = sheet; node.parentElement && node !== document.body;) {
    for (const other of node.parentElement.children) {
      const isLiveRegion = other.hasAttribute('aria-live');
      if (
        other instanceof HTMLElement &&
        other !== node &&
        !other.inert &&
        !staysLive(other) &&
        !isLiveRegion
      )
        others.push(other);
    }
    node = node.parentElement;
  }
  for (const other of others) other.inert = true;
  return () => {
    for (const other of others) other.inert = false;
  };
}

function holdPageStillUnderFixedSheet(sheet: HTMLElement) {
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

function recalculateStylesSoWebKitAllowsFocus(element: HTMLElement) {
  element.getBoundingClientRect();
}

/**
 * Panes' supporting pane as a modal sheet below `splitAt`, one element at every width: whether CSS
 * makes it a sheet, and whether it is modal, as it is unless it belongs to a contained
 * PortalContainer. While it is modal, the rest of the page but what `staysLive` keeps is inert,
 * focus moves in and the page under a sheet fixed to the window stays still; as it closes, focus
 * goes back to where it was.
 */
export function useSupportingSheet(
  pane: RefObject<HTMLElement | null>,
  open: boolean,
  contained: boolean,
  staysLive: (element: Element) => boolean,
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
  const openAsModalEnds = useRef(open);
  openAsModalEnds.current = open;
  useLayoutEffect(() => {
    const element = pane.current;
    if (!modal || !element) return;
    const document = element.ownerDocument;
    const active = document.activeElement;
    const returnFocus = active instanceof HTMLElement ? active : null;
    if (!element.contains(active)) element.focus();
    const restoreOthers = inertEverythingButSheet(element, staysLive);
    const releasePage = holdPageStillUnderFixedSheet(element);
    return () => {
      restoreOthers();
      releasePage();
      const stillOpenAsPaneBesideMain = openAsModalEnds.current;
      if (stillOpenAsPaneBesideMain) return;
      const now = document.activeElement;
      const focusLostWithSheet = now === null || now === document.body || element.contains(now);
      if (!returnFocus?.isConnected || !focusLostWithSheet) return;
      recalculateStylesSoWebKitAllowsFocus(returnFocus);
      returnFocus.focus();
    };
  }, [pane, modal, staysLive]);
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
