import { useState } from 'react';
import { Theme, ActionGroup, Stack, NavigationItem, Icon, type ThemeValue } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Settings } from '@envsemble/envui/icons/Settings';

export function NavigationFixture({ theme }: { theme: ThemeValue }) {
  const [selected, setSelected] = useState('home');
  return (
    <Theme theme={theme} data-testid={`navigation-icons-${theme}`} className="fixture-section">
      <ActionGroup>
        <Home data-testid="home-outline" />
        <Home filled data-testid="home-filled" />
        <Settings data-testid="settings-outline" />
        <Settings filled data-testid="settings-filled" />
      </ActionGroup>
      <Stack>
        <NavigationItem
          data-testid="home-navigation"
          icon={<Home filled={false} />}
          selected={selected === 'home'}
          onClick={() => setSelected('home')}
        >
          Home destination
        </NavigationItem>
        <NavigationItem
          data-testid="settings-navigation"
          icon={
            <span>
              <Settings filled />
            </span>
          }
          selected={selected === 'settings'}
          onClick={() => setSelected('settings')}
        >
          Settings destination
        </NavigationItem>
        <NavigationItem
          data-testid="custom-navigation"
          icon={
            <Icon viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
            </Icon>
          }
          selectedIcon={
            <Icon viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" />
            </Icon>
          }
          selected={selected === 'custom'}
          onClick={() => setSelected('custom')}
        >
          Custom destination
        </NavigationItem>
      </Stack>
    </Theme>
  );
}
