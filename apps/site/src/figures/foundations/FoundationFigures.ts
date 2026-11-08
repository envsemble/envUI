import { use, type ComponentType } from 'react';
import type { LegendEntry } from './Topic';
import { loadOnce } from '../../loading/LoadOnce';

/**
 * A foundation's figure: the picture alone, which the page's
 * Markdown places by name (```tsx figure=Name```) and gives its words, the legend that follows the
 * fence: each numbered mark's, or each picture's, name and what it means. `wide` keeps it across
 * the whole column rather than beside the text before it.
 */
export interface FoundationFigure {
  render: ComponentType<{ legend: readonly LegendEntry[]; caption?: string }>;
  wide?: boolean;
}

type Figures = Record<string, FoundationFigure>;

/** Each foundation's figures, by its page's id, which load with the page. */
const loaders: Record<string, () => Promise<Figures>> = {
  colors: () => import('./Colors').then((module) => module.colorsFigures),
  typography: () => import('./Typography').then((module) => module.typographyFigures),
  spacing: () => import('./Spacing').then((module) => module.spacingFigures),
  responsive: () => import('./Responsive').then((module) => module.responsiveFigures),
  icons: () => import('./Icons').then((module) => module.iconsFigures),
  accessibility: () => import('./Accessibility').then((module) => module.accessibilityFigures),
};
const loads = new Map<string, Promise<Figures>>();

/** A foundation page's figures, loaded once and kept (loadOnce); a page with none has none. */
export function loadFoundationFigures(page: string): Promise<Figures> | undefined {
  const loader = loaders[page];
  return loader && loadOnce(loads, page, loader);
}

/** A foundation page's figures, by the page's id, suspending until they have loaded. */
export function useFoundationFigures(page: string): Figures | undefined {
  const load = loadFoundationFigures(page);
  return load && use(load);
}
