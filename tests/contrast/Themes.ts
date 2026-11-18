import type { Page } from '@playwright/test';
import type { ContrastKind } from './Pairs.ts';

export interface ContrastTheme {
  name: string;
  attributes: Readonly<Record<string, string>>;
  media?: Parameters<Page['emulateMedia']>[0];
  contrast: 'standard' | 'high';
  minimums: Readonly<Record<ContrastKind, number>>;
}

const oneJustNoticeableDifference = 0.02;
const wcagAAMinimums = {
  text: 4.5,
  'non-text': 3,
  focus: 3,
  difference: oneJustNoticeableDifference,
  distinct: 0.03,
} as const;
const highContrastMinimums = {
  text: 7,
  'non-text': 4.5,
  focus: 4.5,
  difference: oneJustNoticeableDifference,
  distinct: 0.04,
} as const;

export const themes: readonly ContrastTheme[] = [
  {
    name: 'light',
    attributes: { 'data-env-theme': 'light' },
    contrast: 'standard',
    minimums: wcagAAMinimums,
  },
  {
    name: 'dark',
    attributes: { 'data-env-theme': 'dark' },
    contrast: 'standard',
    minimums: wcagAAMinimums,
  },
  {
    name: 'light-high-contrast',
    attributes: { 'data-env-theme': 'light', 'data-env-contrast': 'high' },
    contrast: 'high',
    minimums: highContrastMinimums,
  },
  {
    name: 'dark-high-contrast',
    attributes: { 'data-env-theme': 'dark', 'data-env-contrast': 'high' },
    contrast: 'high',
    minimums: highContrastMinimums,
  },
];
