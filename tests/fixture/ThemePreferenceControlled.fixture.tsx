import { useState } from 'react';
import {
  Button,
  ThemePreferenceProvider,
  ThemeToggle,
  type ThemePreference,
} from '@envsemble/envui';

export const mount = 'root';

export default function ThemePreferenceControlledFixture() {
  const [preference, setPreference] = useState<ThemePreference>('dark');
  return (
    <ThemePreferenceProvider preference={preference} onPreferenceChange={setPreference}>
      <ThemeToggle data-testid="theme-toggle" />
      <Button onClick={() => setPreference('dark')}>Take the account&apos;s theme</Button>
      <output data-testid="preference">{preference}</output>
    </ThemePreferenceProvider>
  );
}
