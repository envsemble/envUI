import { createContext, use } from 'react';
import type { ThemeContrast, ThemeScale } from '@envsemble/envui';

export interface DisplaySettingsValue {
  contrast: ThemeContrast;
  scale: ThemeScale;
  /** Whether every animation of the site is paused, the tiles' and the figures'. */
  motionPaused: boolean;
  setContrast: (contrast: ThemeContrast) => void;
  setScale: (scale: ThemeScale) => void;
  setMotionPaused: (paused: boolean) => void;
}

/**
 * The display settings DisplaySettingsProvider gives (DisplaySettings.tsx). It is in a module of
 * its own, which imports nothing that changes while developing, so the context is made once:
 * DisplaySettings.tsx runs again after an edit to the library it imports, and a context made there
 * each time would leave the provider and the parts that read it holding different ones after a hot
 * update.
 */
export const DisplaySettingsContext = createContext<DisplaySettingsValue | null>(null);

export function useDisplaySettings() {
  const value = use(DisplaySettingsContext);
  if (!value) throw new Error('useDisplaySettings needs a DisplaySettingsProvider around it.');
  return value;
}
