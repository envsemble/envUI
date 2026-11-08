/**
 * The sections of the density fixture (Scale.fixture.tsx), in order. Each section shows the same content
 * in the comfortable and the compact scale; the visual baseline captures each one in both themes,
 * so this list is the one both read.
 */
export const densitySectionNames = [
  'sizes',
  'form',
  'toolbar',
  'menu',
  'tree',
  'table',
  'tabs',
  'navigation',
  'desktop',
  'layouts',
] as const;

export type DensitySection = (typeof densitySectionNames)[number];

/** The app scales each section shows, in order. */
export const densityScales = ['comfortable', 'compact'] as const;

/** The control sizes the sizes section lines up. */
export const controlSizes = ['sm', 'md', 'lg'] as const;
