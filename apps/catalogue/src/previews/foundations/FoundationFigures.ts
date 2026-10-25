import type { ComponentType } from 'react';
import type { LegendEntry } from './Topic';
import { accessibilityFigures } from './Accessibility';
import { colorsFigures } from './Colors';
import { iconsFigures } from './Icons';
import { responsiveFigures } from './Responsive';
import { spacingFigures } from './Spacing';
import { typographyFigures } from './Typography';

/**
 * A foundation's figure for a page in the one-file structure: the picture alone, which the page's
 * Markdown places by name (```tsx figure=Name```) and gives its words, the legend that follows the
 * fence: each numbered mark's, or each picture's, name and what it means. `wide` keeps it across
 * the whole column rather than beside the text before it.
 */
export interface FoundationFigure {
  render: ComponentType<{ legend: readonly LegendEntry[]; caption?: string }>;
  wide?: boolean;
}

/** Each foundation's figures, by its page's id. */
const figures: Record<string, Record<string, FoundationFigure>> = {
  colors: colorsFigures,
  typography: typographyFigures,
  spacing: spacingFigures,
  responsive: responsiveFigures,
  icons: iconsFigures,
  accessibility: accessibilityFigures,
};

/** A foundation page's figure, by the page's id and the figure's name. */
export const foundationFigure = (page: string, name: string): FoundationFigure | undefined =>
  figures[page]?.[name];
