import { useState } from 'react';
import {
  Button,
  Menu,
  ThemeMenuRadioGroup,
  ThemePreferenceProvider,
  ThemeToggle,
  type ThemePreference,
} from '@envsemble/envui';
import { IconContrast } from '@envsemble/envui/icons/Contrast';

export const mount = 'root';

export default function ThemeChoicesFixture() {
  const [preference, setPreference] = useState<ThemePreference>('light');
  return (
    <ThemePreferenceProvider theme={{ storageKey: 'fixture-theme-choices' }}>
      <ThemeToggle icon={<IconContrast data-testid="own-icon" />} data-testid="own-toggle" />
      <Menu.Root trigger={<Button>Appearance</Button>}>
        <ThemeMenuRadioGroup
          label="Theme"
          value={preference}
          onValueChange={setPreference}
          className="fixture-theme-group"
        >
          <Menu.RadioItem value="light">Light</Menu.RadioItem>
          <Menu.RadioItem value="dark">Dark, easier at night</Menu.RadioItem>
        </ThemeMenuRadioGroup>
      </Menu.Root>
      <output data-testid="preference">{preference}</output>
    </ThemePreferenceProvider>
  );
}
