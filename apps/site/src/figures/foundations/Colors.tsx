import type { FoundationFigure } from './FoundationFigures';
import { RolesFigure } from './ColorRoles';
import { SwatchesFigure } from './ColorSwatches';
import { ThemesFigure } from './ColorThemes';
import { StatusFigure } from './StatusColors';
import { OwnColorsFigure } from './OwnColors';

/*
 * The figures of the Colors & themes foundation, each in a file of its own. Its words are in
 * docs/foundations/colors.md, the page's one source, which places each figure by name and gives it
 * its legend: the name of each numbered part, family, theme or tone, and what it means.
 */

/** The figures docs/foundations/colors.md places, by name. */
export const colorsFigures: Record<string, FoundationFigure> = {
  Roles: { render: RolesFigure, wide: true },
  Swatches: { render: SwatchesFigure, wide: true },
  Themes: { render: ThemesFigure },
  Status: { render: StatusFigure, wide: true },
  OwnColors: { render: OwnColorsFigure, wide: true },
};
