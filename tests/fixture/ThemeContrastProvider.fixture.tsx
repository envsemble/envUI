import { useState } from 'react';
import { Button, ThemePreferenceProvider, type ThemeContrast } from '@envsemble/envui';
import { Popups } from './ThemeContrast.fixture.js';

export const mount = 'root';

export default function ThemeContrastProviderFixture() {
  const [contrast, setContrast] = useState<ThemeContrast>('high');
  return (
    <ThemePreferenceProvider
      theme={{ contrast: contrast }}
      defaultPreference="dark"
      className="fixture-main"
    >
      <div data-testid="contrast-provider">
        <Popups name="provider" />
        <Button onClick={() => setContrast('system')}>Follow the system contrast</Button>
      </div>
    </ThemePreferenceProvider>
  );
}
