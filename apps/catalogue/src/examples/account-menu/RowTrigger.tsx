import { useState } from 'react';
import { AccountMenu, Menu, Column, Text, type ThemePreference } from '@envsemble/envui';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function RowTrigger() {
  // The application stores the theme itself, such as in the person's account settings.
  const [theme, setTheme] = useState<ThemePreference>('system');
  return (
    // A sidebar's width, which an application's frame sets.
    <Column gap={2} style={{ inlineSize: '16rem' }}>
      <AccountMenu.Root trigger="row" name="Priya Shah" description="priya@example.com">
        <Menu.Item icon={<Settings />}>Preferences</Menu.Item>
        <AccountMenu.ThemeSubmenu value={theme} onValueChange={setTheme} closeOnClick />
        <Menu.Separator />
        <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
      </AccountMenu.Root>
      <Text variant="caption" emphasis="muted">
        Theme: {theme}
      </Text>
    </Column>
  );
}
