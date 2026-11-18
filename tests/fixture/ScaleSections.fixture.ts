export const densitySectionNames = [
  'sizes',
  'form',
  'toolbar',
  'menu',
  'tree',
  'table',
  'navigation',
  'desktop',
  'layouts',
] as const;

export type DensitySection = (typeof densitySectionNames)[number];

export const densityScales = ['comfortable', 'compact'] as const;

export const controlSizes = ['sm', 'md', 'lg'] as const;
