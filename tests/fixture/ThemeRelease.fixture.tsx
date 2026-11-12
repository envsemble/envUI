import { useState } from 'react';
import { Button, ThemePreferenceProvider } from '@envsemble/envui';

export const mount = 'root';

/**
 * A provider at high contrast and the compact scale, which the application stops applying to the
 * document, or unmounts.
 */
export default function ThemeReleaseFixture() {
  const [mounted, setMounted] = useState(true);
  const [applies, setApplies] = useState(true);
  return (
    <>
      <Button onClick={() => setApplies(false)}>Stop applying to the document</Button>
      <Button onClick={() => setMounted(false)}>Unmount the provider</Button>
      {mounted && (
        <ThemePreferenceProvider
          storageKey="fixture-release-theme"
          contrast="high"
          scale="compact"
          applyToDocument={applies}
          className="fixture-main"
        >
          <p>Provider content</p>
        </ThemePreferenceProvider>
      )}
    </>
  );
}
