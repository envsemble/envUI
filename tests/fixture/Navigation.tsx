import { useState } from 'react';
import {
  Theme,
  ActionGroup,
  Stack,
  NavList,
  Icon,
  Tooltip,
  type ThemeValue,
} from '@envsemble/envui';
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
        <NavList.Item
          data-testid="home-navigation"
          icon={<Home filled={false} />}
          selected={selected === 'home'}
          onClick={() => setSelected('home')}
        >
          Home destination
        </NavList.Item>
        <NavList.Item
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
        </NavList.Item>
        <NavList.Item
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
        </NavList.Item>
      </Stack>
      <ActionGroup>
        <NavList.Item
          iconOnly
          icon={<Home />}
          aria-label="Home overview"
          data-testid="icon-only-navigation"
          selected={selected === 'home'}
          onClick={() => setSelected('home')}
        />
        <NavList.Item
          iconOnly
          disabled
          icon={<Settings />}
          aria-label="Archive"
          data-testid="disabled-icon-only-navigation"
        />
        <Tooltip content="Settings and preferences">
          <NavList.Item
            iconOnly
            icon={<Settings />}
            aria-label="Settings"
            data-testid="described-navigation"
            onClick={() => setSelected('settings')}
          />
        </Tooltip>
      </ActionGroup>
    </Theme>
  );
}
