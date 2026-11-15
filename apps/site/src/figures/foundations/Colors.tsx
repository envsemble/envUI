import type { FoundationFigureEntry } from './FoundationFigures';
import { RolesFigure } from './ColorRoles';
import { SwatchesFigure } from './ColorSwatches';
import { ThemesFigure } from './ColorThemes';
import { StatusFigure } from './StatusColors';
import { OwnColorsFigure } from './OwnColors';

export const colorsFigures: Record<string, FoundationFigureEntry> = {
  Roles: { render: RolesFigure, wide: true },
  Swatches: { render: SwatchesFigure, wide: true },
  Themes: { render: ThemesFigure },
  Status: { render: StatusFigure, wide: true },
  OwnColors: { render: OwnColorsFigure, wide: true },
};
