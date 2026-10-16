import { useState } from 'react';
import {
  Button,
  Dialog,
  Menu,
  Popover,
  Select,
  Text,
  Theme,
  ThemePreferenceProvider,
  Tooltip,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

/** One popup of each kind, named after the boundary it opens from. */
function Popups({ name }: { name: string }) {
  return (
    <div className="fixture-actions">
      <Menu.Root
        aria-label={`Actions ${name}`}
        trigger={<Button variant="secondary">Menu {name}</Button>}
      >
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
      <Popover
        title={`Details ${name}`}
        trigger={<Button variant="secondary">Popover {name}</Button>}
      >
        <Text>Last changed today.</Text>
      </Popover>
      <Select label={`Status ${name}`} options={statusOptions} defaultValue="open" />
      <Tooltip content={`Tooltip ${name}`}>
        <Button variant="secondary">Tooltip {name}</Button>
      </Tooltip>
      <Dialog title={`Dialog ${name}`} trigger={<Button variant="secondary">Dialog {name}</Button>}>
        <Text>Dialog content.</Text>
      </Dialog>
    </div>
  );
}

function Boundary({
  name,
  theme,
  contrast,
}: {
  name: string;
  theme: ThemeValue;
  contrast?: ThemeContrast;
}) {
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      data-testid={`contrast-${name.replaceAll(' ', '-')}`}
      className="fixture-section"
    >
      <Popups name={name} />
    </Theme>
  );
}

/**
 * Theme boundaries of each contrast, at the top of the page with no Theme around them, so the
 * boundaries without a contrast take the default. Mounted with ?fixture=theme-contrast.
 */
export function ThemeContrastFixture() {
  return (
    <>
      <Boundary name="high" theme="light" contrast="high" />
      <Boundary name="standard" theme="light" contrast="standard" />
      <Boundary name="system" theme="light" />
      <Boundary name="system dark" theme="dark" />
      <Theme theme="light" contrast="high">
        <Boundary name="nested high" theme="dark" />
      </Theme>
      <Theme theme="light" contrast="standard">
        <Boundary name="nested standard" theme="dark" />
      </Theme>
    </>
  );
}

/** A provider that sets the application's contrast. Mounted with ?fixture=theme-contrast-provider. */
export function ThemeContrastProviderFixture() {
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
