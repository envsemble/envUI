'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import type { HeadingLevel } from '../../../foundations/headingLevel.js';
import { useLatest } from '../../../internal/react/useLatest.js';
import type { TableOfContentsItem } from '../../TableOfContents.js';
import { outline, slug, uniqueId, type HeadingEntry } from './contentsOutline.js';
import { collapseWhitespace } from '../../../internal/text/labelText.js';

function resolveContainer(container: RefObject<HTMLElement | null> | string | undefined) {
  if (typeof document === 'undefined') return null;
  if (typeof container === 'string') return document.querySelector<HTMLElement>(container);
  if (container) return container.current;
  return document.querySelector<HTMLElement>('main') ?? document.body;
}

function headingText(heading: HTMLElement): string {
  const copy = heading.cloneNode(true) as HTMLElement;
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  return collapseWhitespace(copy.textContent ?? '');
}

function readHeadings(
  container: HTMLElement,
  levels: readonly HeadingLevel[],
  filter: ((heading: HTMLElement) => boolean) | undefined,
  own: Element | null,
): HeadingEntry[] {
  if (levels.length === 0) return [];
  const selector = levels.map((level) => `h${level}`).join(', ');
  const entries: HeadingEntry[] = [];
  for (const heading of container.querySelectorAll<HTMLElement>(selector)) {
    if (own?.contains(heading)) continue;
    const hider = heading.closest('[hidden], [inert], [aria-hidden="true"]');
    const hiddenOnlyWhilePopupOpen =
      hider !== null && hider.closest('[data-base-ui-inert]') !== null;
    const hiddenByPage = hider && (hider.hasAttribute('hidden') || !hiddenOnlyWhilePopupOpen);
    if (hiddenByPage) continue;
    if (filter && !filter(heading)) continue;
    const label = headingText(heading);
    if (!label) continue;
    if (!heading.id) {
      const document = heading.ownerDocument;
      heading.id = uniqueId(slug(label), (id) => document.getElementById(id) !== null);
    }
    entries.push({ id: heading.id, label, level: Number(heading.tagName.slice(1)) });
  }
  return entries;
}

function signature(items: readonly TableOfContentsItem[]): string {
  return JSON.stringify(
    items.map((item): unknown => [
      item.id,
      typeof item.label === 'string' ? item.label : '',
      signature(item.children ?? []),
    ]),
  );
}

/**
 * Without items given, a table of contents lists the headings in its container, read again as its
 * content changes; `own` is the list's own element, whose headings are left out.
 */
export function useContentsHeadings({
  givenItems,
  container,
  levels,
  filter,
  own,
}: {
  givenItems: readonly TableOfContentsItem[] | undefined;
  container: RefObject<HTMLElement | null> | string | undefined;
  levels: readonly HeadingLevel[];
  filter: ((heading: HTMLElement) => boolean) | undefined;
  own: RefObject<HTMLElement | null>;
}) {
  const [readItems, setReadItems] = useState<readonly TableOfContentsItem[]>([]);
  const filterRef = useLatest(filter);
  const levelKey = levels.join(',');

  useLayoutEffect(() => {
    if (givenItems) return;
    const element = resolveContainer(container);
    if (!element) return;
    const headingLevels = levelKey.split(',').filter(Boolean).map(Number) as HeadingLevel[];
    let last = '';
    const read = () => {
      const next = outline(readHeadings(element, headingLevels, filterRef.current, own.current));
      const key = signature(next);
      if (key === last) return;
      last = key;
      setReadItems(next);
    };
    read();
    if (typeof MutationObserver === 'undefined' || headingLevels.length === 0) return;
    const headings = headingLevels.map((level) => `h${level}`).join(', ');
    const holdsHeadings = (node: Node) =>
      node.nodeType === Node.ELEMENT_NODE &&
      ((node as Element).matches(headings) || (node as Element).querySelector(headings) !== null);
    const changesHeadings = ({ target, addedNodes, removedNodes }: MutationRecord) =>
      (target.nodeType === Node.ELEMENT_NODE ? (target as Element) : target.parentElement)?.closest(
        headings,
      ) ||
      [...addedNodes].some(holdsHeadings) ||
      [...removedNodes].some(holdsHeadings);
    let frame = 0;
    const observer = new MutationObserver((records) => {
      if (!records.some(changesHeadings)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [givenItems, container, levelKey, filterRef, own]);

  return givenItems ?? readItems;
}
