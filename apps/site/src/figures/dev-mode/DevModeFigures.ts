import type { FoundationFigureEntry } from '../foundations/FoundationFigures';
import { TryDevMode } from './TryDevMode';
import {
  DevModeButtonPicture,
  DevModeFramePicture,
  DevModeInspectorPicture,
  DevModeProblemsPicture,
  DevModeSpacingPicture,
  DevModeToolbarPicture,
  DevModeWholePicture,
} from './DevModePictures';

/**
 * The dev mode guide's figures, which docs/dev-mode.md places by name (```tsx figure=Name```).
 * Only Try dev mode loads `@envsemble/envui/dev`, once it is pressed: scripts/site/SiteDevMode.ts
 * checks the hosted build for it.
 */
export const devModeFigures: Record<string, FoundationFigureEntry> = {
  TryDevMode: { render: TryDevMode },
  DevModeButtonPicture: { render: DevModeButtonPicture },
  DevModeWholePicture: { render: DevModeWholePicture },
  DevModeToolbarPicture: { render: DevModeToolbarPicture },
  DevModeSpacingPicture: { render: DevModeSpacingPicture },
  DevModeFramePicture: { render: DevModeFramePicture },
  DevModeInspectorPicture: { render: DevModeInspectorPicture },
  DevModeProblemsPicture: { render: DevModeProblemsPicture },
};
