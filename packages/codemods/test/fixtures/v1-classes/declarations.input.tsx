import type { CSSProperties } from 'react';

// Style keys and setProperty declare a property: a merged name stays and is reported.
export const toolbar = {
  '--control-height': '30px',
  '--control-height-small': '24px',
} as CSSProperties;

export const panel = {
  '--env-control-height': '2rem',
  '--control-height': '2.5rem',
} as CSSProperties;

export function size(element: HTMLElement) {
  element.style.setProperty('--icon-button-size', '40px');
  return getComputedStyle(element).getPropertyValue('--icon-button-size');
}

export const button = { blockSize: 'var(--control-height-small)' };
