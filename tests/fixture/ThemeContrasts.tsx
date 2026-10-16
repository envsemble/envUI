import { useState } from 'react';
import {
  Button,
  Combobox,
  CommandPalette,
  ContextMenu,
  DatePicker,
  Dialog,
  HoverCard,
  Link,
  Menu,
  Menubar,
  Popover,
  Select,
  Text,
  Theme,
  ThemePreferenceProvider,
  ThemeToggle,
  Toast,
  Tooltip,
  useToast,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];
const people = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];
const commands = [{ id: 'rename', label: 'Rename' }];

/**
 * One popup of each kind, named after the boundary it opens from: menus (standard, compact, context
 * and menubar), Select lists (standard and compact), a Combobox list, the date picker, a popover, a
 * hover card, a tooltip, dialogs (centered and at the edge), the command palette and a toast. Toasts
 * take the theme of their provider, so each boundary has one.
 */
function Popups({ name }: { name: string }) {
  return (
    <Toast.Provider>
      <PopupTriggers name={name} />
    </Toast.Provider>
  );
}

function PopupTriggers({ name }: { name: string }) {
  const toast = useToast();
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState('');
  return (
    <div className="fixture-actions">
      <Menu.Root
        aria-label={`Actions ${name}`}
        trigger={<Button variant="secondary">Menu {name}</Button>}
      >
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
      <Menu.Root
        aria-label={`Compact actions ${name}`}
        trigger={<Button variant="secondary">Compact menu {name}</Button>}
      >
        <Menu.Item>Rename</Menu.Item>
      </Menu.Root>
      <ContextMenu aria-label={`Context actions ${name}`} content={<Menu.Item>Copy</Menu.Item>}>
        <div className="fixture-context-area">Context {name}</div>
      </ContextMenu>
      <Menubar.Root aria-label={`Menubar ${name}`}>
        <Menubar.Menu label={`File ${name}`}>
          <Menu.Item>New</Menu.Item>
        </Menubar.Menu>
      </Menubar.Root>
      <Select label={`Sort ${name}`} size="sm" options={statusOptions} defaultValue="open" />
      <Combobox label={`Person ${name}`} items={people} />
      <DatePicker label={`Due ${name}`} defaultValue="2026-10-20" locale="en-GB" />
      <HoverCard trigger={<Link href="#card">Card {name}</Link>}>
        <Text>Card {name} details.</Text>
      </HoverCard>
      <Dialog
        placement="right"
        title={`Panel ${name}`}
        trigger={<Button variant="secondary">Panel {name}</Button>}
      >
        <Text>Panel content.</Text>
      </Dialog>
      <Button variant="secondary" onClick={() => setPalette(true)}>
        Palette {name}
      </Button>
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        aria-label={`Palette ${name}`}
        query={query}
        onQueryChange={setQuery}
        items={commands}
        onSelect={() => setPalette(false)}
      />
      <Button variant="secondary" onClick={() => toast.show({ message: `Toast ${name}` })}>
        Toast {name}
      </Button>
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

const users = [
  { id: 'first', contrast: 'high' },
  { id: 'second', contrast: 'system' },
] as const;

/**
 * A provider keyed by the signed-in user, whose stored contrast it applies, so switching users
 * mounts a new provider. Mounted with ?fixture=theme-contrast-remount.
 */
export function ThemeContrastRemountFixture() {
  const [user, setUser] = useState<(typeof users)[number]>(users[0]);
  return (
    <ThemePreferenceProvider
      key={user.id}
      storageKey="fixture-remount-theme"
      contrast={user.contrast}
      className="fixture-main"
    >
      <Button onClick={() => setUser(users[1])}>Switch to the second user</Button>
    </ThemePreferenceProvider>
  );
}

/**
 * Two providers that both apply to the document, against the advice to let one: an outer one at
 * high contrast and the compact scale, and an inner one at system contrast without a scale. Mounted with ?fixture=theme-contrast-nested.
 */
export function ThemeContrastNestedFixture() {
  return (
    <ThemePreferenceProvider storageKey="fixture-outer-theme" contrast="high" scale="compact">
      <ThemePreferenceProvider
        storageKey="fixture-inner-theme"
        contrast="system"
        className="fixture-main"
      >
        <ThemeToggle data-testid="inner-theme-toggle" />
      </ThemePreferenceProvider>
    </ThemePreferenceProvider>
  );
}

/**
 * A provider at high contrast and the compact scale, which the application stops applying to the
 * document, or unmounts. Mounted with ?fixture=theme-release.
 */
export function ThemeReleaseFixture() {
  const [mounted, setMounted] = useState(true);
  const [applies, setApplies] = useState(true);
  return (
    <>
      <Button onClick={() => setApplies(false)}>Stop applying to the document</Button>
      <Button onClick={() => setMounted(false)}>Unmount the provider</Button>
      {mounted && (
        <ThemePreferenceProvider
          storageKey="fixture-release-theme"
          contrast="high"
          scale="compact"
          applyToDocument={applies}
          className="fixture-main"
        >
          <p>Provider content</p>
        </ThemePreferenceProvider>
      )}
    </>
  );
}
