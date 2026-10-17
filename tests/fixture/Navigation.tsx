import { useState } from 'react';
import {
  Badge,
  CounterBadge,
  Theme,
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
      <Stack direction="row" wrap align="center" gap={4}>
        <Home data-testid="home-outline" />
        <Home filled data-testid="home-filled" />
        <Settings data-testid="settings-outline" />
        <Settings filled data-testid="settings-filled" />
      </Stack>
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
      <Stack direction="row" wrap align="center" gap={4}>
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
      </Stack>
      <Stack direction="row" wrap align="center" gap={4} data-testid="named-end-navigation">
        <NavList.Item
          iconOnly
          icon={<Home />}
          aria-label="Count"
          end={<CounterBadge value={3} />}
        />
        <NavList.Item iconOnly icon={<Home />} aria-label="Number" end={7} />
        <NavList.Item
          iconOnly
          icon={<Home />}
          aria-label="Unread"
          end={<CounterBadge value={4} aria-label="4 unread" />}
        />
        <NavList.Item iconOnly icon={<Home />} aria-label="Labs" end={<Badge>Beta</Badge>} />
        <NavList.Item iconOnly icon={<Home />} aria-label="Inbox" end="New" />
        <NavList.Item
          icon={<Home />}
          aria-label="Reports"
          end={<Badge aria-label="Recently updated">Updated</Badge>}
        >
          Reports
        </NavList.Item>
      </Stack>
    </Theme>
  );
}
