import { useState } from 'react';
import {
  Button,
  Menu,
  Theme,
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
    <ThemePreferenceProvider>
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

export function ThemeRenderFixture() {
  const [presses, setPresses] = useState<string[]>([]);
  const [refs, setRefs] = useState<string[]>([]);
  return (
    <>
      <Theme
        theme="dark"
        style={{ paddingInline: '1px' }}
        onClick={() => setPresses((list) => [...list, 'theme'])}
        ref={(node) => {
          if (node) setRefs((list) => (list.includes('theme') ? list : [...list, 'theme']));
        }}
        render={
          <section
            aria-label="Dark region"
            className="fixture-region"
            style={{ paddingBlock: '2px' }}
            onClick={() => setPresses((list) => [...list, 'section'])}
            ref={(node) => {
              if (node) setRefs((list) => (list.includes('section') ? list : [...list, 'section']));
            }}
          />
        }
      >
        <Button>Inside</Button>
      </Theme>
      <output data-testid="presses">{presses.join(' ')}</output>
      <output data-testid="refs">{refs.join(' ')}</output>
    </>
  );
}
