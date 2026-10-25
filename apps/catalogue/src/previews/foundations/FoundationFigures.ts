import type { ComponentType } from 'react';
import type { LegendEntry } from './Topic';
import { spacingFigures } from './Spacing';

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
  spacing: spacingFigures,
};

/** A foundation page's figure, by the page's id and the figure's name. */
export const foundationFigure = (page: string, name: string): FoundationFigure | undefined =>
  figures[page]?.[name];
