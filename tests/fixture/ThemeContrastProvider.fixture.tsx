import { useState } from 'react';
import { Button, ThemePreferenceProvider, type ThemeContrast } from '@envsemble/envui';
import { Popups } from './ThemeContrast.fixture.js';

export const mount = 'root';

/** A provider that sets the application's contrast. */
export default function ThemeContrastProviderFixture() {
  const [contrast, setContrast] = useState<ThemeContrast>('high');
  return (
    <ThemePreferenceProvider
      storageKey="fixture-contrast-theme"
      defaultPreference="dark"
      contrast={contrast}
      className="fixture-main"
    >
      <div data-testid="contrast-provider">
        <Popups name="provider" />
        <Button onClick={() => setContrast('system')}>Follow the system contrast</Button>
      </div>
    </ThemePreferenceProvider>
  );
}
