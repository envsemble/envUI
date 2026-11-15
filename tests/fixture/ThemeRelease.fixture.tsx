import { useState } from 'react';
import { Button, ThemePreferenceProvider, defineTheme } from '@envsemble/envui';

export const mount = 'root';

const theme = defineTheme({
  storageKey: 'fixture-release-theme',
  contrast: 'high',
  scale: 'compact',
  surface: 'filled',
  selection: 'accent',
  corners: 'sharp',
});

/**
 * A provider at high contrast and the compact scale, filled, with the accent selection and sharp
 * corners, which the application stops applying to the document, or unmounts.
 */
export default function ThemeReleaseFixture() {
  const [mounted, setMounted] = useState(true);
  const [applies, setApplies] = useState(true);
  return (
    <>
      <Button onClick={() => setApplies(false)}>Stop applying to the document</Button>
      <Button onClick={() => setMounted(false)}>Unmount the provider</Button>
      {mounted && (
        <ThemePreferenceProvider theme={theme} applyToDocument={applies} className="fixture-main">
          <p>Provider content</p>
        </ThemePreferenceProvider>
      )}
    </>
  );
}
