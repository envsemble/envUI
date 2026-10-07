import { createContext, useContext, useState, type ReactNode } from 'react';
import { isPaletteValue, paletteCSS, type PaletteTheme, type ThemePalettes } from './Palette';

interface PaletteCustomization {
  palettes: ThemePalettes;
  setValue: (theme: PaletteTheme, token: string, value: string) => void;
}

const PaletteContext = createContext<PaletteCustomization | null>(null);

export function PaletteCustomizationProvider({ children }: { children: ReactNode }) {
  const [palettes, setPalettes] = useState<ThemePalettes>({ light: {}, dark: {} });

  function setValue(theme: PaletteTheme, token: string, value: string) {
    if (!isPaletteValue(token, value)) return;
    setPalettes((current) => ({
      ...current,
      [theme]: { ...current[theme], [token]: value.trim() },
    }));
  }

  return (
    <PaletteContext value={{ palettes, setValue }}>
      {/* Every explicit theme boundary, including portals, receives the same edited roles. */}
      <style data-docs-palette>
        {paletteCSS('light', palettes.light) + '\n' + paletteCSS('dark', palettes.dark)}
      </style>
      {children}
    </PaletteContext>
  );
}

export function usePaletteCustomization() {
  const context = useContext(PaletteContext);
  if (!context) throw new Error('Palette customization requires its documentation provider.');
  return context;
}
