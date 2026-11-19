import { useState } from 'react';
import { Button, ThemePreferenceProvider, defineTheme } from '@envsemble/envui';

export const mount = 'root';

const theme = defineTheme({
  contrast: 'high',
  scale: 'compact',
  selection: 'accent',
  corners: 'sharp',
});

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
