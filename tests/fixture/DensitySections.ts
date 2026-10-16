/**
 * The sections of the density fixture (Density.tsx), in order. The visual baseline captures each
 * one in both themes, so this list is the one both read.
 */
export const densitySectionNames = [
  'form',
  'toolbar',
  'menu',
  'tree',
  'table',
  'tabs',
  'navigation',
  'desktop',
] as const;

export type DensitySection = (typeof densitySectionNames)[number];
