import type { MouseEvent } from 'react';

/**
 * Links in an example keep their semantics without navigating away from the documentation. A link
 * to a part of the page, such as a table of contents' link to its section, stays on it and works.
 */
function preventNavigation(event: MouseEvent<HTMLDivElement>) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  if (href.length > 1 && href.startsWith('#') && document.getElementById(href.slice(1))) return;
  event.preventDefault();
}

/**
 * The handlers that keep an example's links from leaving the documentation. A module of its own,
 * so the figures that use it import no other figure's module: modules that import each other
 * reload the page on a hot update rather than updating in place.
 */
export const keepLinksInPlace = {
  onClickCapture: preventNavigation,
  onAuxClickCapture: preventNavigation,
};
