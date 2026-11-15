import { createContext, use } from 'react';
import type { ThemeContrast, ThemeScale } from '@envsemble/envui';

export interface DisplaySettingsValue {
  contrast: ThemeContrast;
  scale: ThemeScale;
  motionPaused: boolean;
  setContrast: (contrast: ThemeContrast) => void;
  setScale: (scale: ThemeScale) => void;
  setMotionPaused: (paused: boolean) => void;
}

export const DisplaySettingsContext = createContext<DisplaySettingsValue | null>(null);

export function useDisplaySettings() {
  const value = use(DisplaySettingsContext);
  if (!value) throw new Error('useDisplaySettings needs a DisplaySettingsProvider around it.');
  return value;
}
