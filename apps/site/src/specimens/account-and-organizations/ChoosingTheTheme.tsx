import { useState } from 'react';
import {
  Avatar,
  AvatarButton,
  Column,
  Menu,
  Page,
  PageHeader,
  Scaffold,
  Text,
  Theme,
  ThemeMenuRadioGroup,
  TopBar,
  useTheme,
  type ColorScheme,
} from '@envsemble/envui';
import { IconLogout } from '@envsemble/envui/icons/Logout';
import { IconManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { IconPalette } from '@envsemble/envui/icons/Palette';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const user = { name: 'Alex Morgan', email: 'alex.morgan@example.com' };

/** The theme's choice in its submenu: System, Light and Dark, in that order. */
const choice = (theme: ColorScheme) =>
  `[role="menuitemradio"]:nth-child(${theme === 'light' ? 2 : 3} of [role="menuitemradio"])`;

/*
 * The pointer opens the account menu, then Theme, and picks the other theme: the window takes it
 * at once while the menu stays open. It picks the first theme again, and the menu closes.
 */
const scriptFrom = (first: ColorScheme): PointerStep[] => {
  const other = first === 'dark' ? 'light' : 'dark';
  return [
    { wait: 500 },
    { to: '.env-avatar-button', x: 0.55, y: 0.6 },
    { wait: 400 },
    { click: true },
    { wait: 700 },
    { to: '.env-menu-submenu-trigger', x: 0.4, duration: 450 },
    { wait: 600 },
    { to: '.env-menu-submenu-trigger', x: 0.9, duration: 200 },
    { to: choice(other), x: 0.35, duration: 350 },
    { wait: 300 },
    { click: true },
    { wait: 1600 },
    { to: choice(first), x: 0.35, duration: 300 },
    { wait: 300 },
    { click: true },
    { wait: 1200 },
    { key: 'Escape', on: choice(first) },
    { wait: 250 },
    { key: 'Escape', on: '.env-menu-submenu-trigger' },
    { wait: 300 },
    { leave: true },
    { wait: 900 },
  ];
};

function Choosing() {
  const site = useTheme();
  const [theme, setTheme] = useState<ColorScheme>(site.theme);
  const [script] = useState(() => scriptFrom(site.theme));
  usePointer(script);
  return (
    // The window at the top, with room below it for the menu, in the theme the person chose: it
    // changes at once, with the menu still open. The window and the Theme submenu beside it are
    // centred together, so the submenu and its shadow stay clear of the stage's edge and its
    // pause button.
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', blockSize: '22rem' }}
    >
      <Theme
        {...site}
        theme={theme}
        style={{
          inlineSize: 'min(100%, 22rem)',
          marginInlineEnd: 'clamp(0px, 100% - 22rem, 12rem)',
        }}
      >
        <Scaffold
          scroll="body"
          landmarks={false}
          style={{ blockSize: '17rem' }}
          topBar={
            <TopBar
              title="Northwind"
              actions={
                <Menu.Root
                  aria-label="Account"
                  align="end"
                  trigger={<AvatarButton name={user.name} description={user.email} />}
                >
                  <Menu.Header>
                    <Column align="center" gap={1} padding={2} style={{ textAlign: 'center' }}>
                      <Avatar name={user.name} size="lg" />
                      <Text>{user.name}</Text>
                      <Text variant="body-sm" emphasis="muted">
                        {user.email}
                      </Text>
                    </Column>
                  </Menu.Header>
                  <Menu.Item href="/account" icon={<IconManageAccounts />}>
                    Account settings
                  </Menu.Item>
                  <Menu.Submenu label="Theme" icon={<IconPalette />}>
                    <ThemeMenuRadioGroup
                      value={theme}
                      onValueChange={(next) => setTheme(next === 'dark' ? 'dark' : 'light')}
                    />
                  </Menu.Submenu>
                  <Menu.Separator />
                  <Menu.Item icon={<IconLogout />}>Sign out</Menu.Item>
                </Menu.Root>
              }
            />
          }
        >
          <Page header={<PageHeader title="Home" headingLevel={4} />}>
            <Text emphasis="muted">Three projects changed since yesterday.</Text>
          </Page>
        </Scaffold>
      </Theme>
    </div>
  );
}

/** The account menu's Theme submenu, used by a pointer no one sees: the window changes at once. */
export default function ChoosingTheTheme() {
  return (
    // A whole window, on the shaded stage, as the App frame figures are.
    <MotionStage label="the theme changing from the account menu" stage="shaded">
      <Choosing />
    </MotionStage>
  );
}
