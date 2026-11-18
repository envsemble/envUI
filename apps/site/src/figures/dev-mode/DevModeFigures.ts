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
