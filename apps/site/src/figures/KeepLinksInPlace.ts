import type { MouseEvent } from 'react';

function preventNavigation(event: MouseEvent<HTMLDivElement>) {
  const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!link) return;
  const href = link.getAttribute('href') ?? '';
  const targetsThisPage =
    href.length > 1 && href.startsWith('#') && document.getElementById(href.slice(1)) !== null;
  if (targetsThisPage) return;
  event.preventDefault();
}

export const keepLinksInPlace = {
  onClickCapture: preventNavigation,
  onAuxClickCapture: preventNavigation,
};
