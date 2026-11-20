import { use, type ComponentType } from 'react';
import type { LegendEntry } from './FoundationFrame';
import { loadOnce } from '../../loading/LoadOnce';

export interface FoundationFigureEntry {
  render: ComponentType<{ legend: readonly LegendEntry[]; caption?: string }>;
  wide?: boolean;
}

type Figures = Record<string, FoundationFigureEntry>;

const loaders: Record<string, () => Promise<Figures>> = {
  colors: () => import('./Colors').then((module) => module.colorsFigures),
  typography: () => import('./Typography').then((module) => module.typographyFigures),
  spacing: () => import('./Spacing').then((module) => module.spacingFigures),
  responsive: () => import('./Responsive').then((module) => module.responsiveFigures),
  icons: () => import('./Icons').then((module) => module.iconsFigures),
  accessibility: () => import('./Accessibility').then((module) => module.accessibilityFigures),
};
const loads = new Map<string, Promise<Figures>>();

export function loadFoundationFigures(page: string): Promise<Figures> | undefined {
  const loader = loaders[page];
  return loader && loadOnce(loads, page, loader);
}

export function useFoundationFigures(page: string): Figures | undefined {
  const load = loadFoundationFigures(page);
  return load && use(load);
}
