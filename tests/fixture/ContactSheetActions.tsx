import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button,
  ButtonGroup,
  CommandPalette,
  ConfirmButton,
  ContextMenu,
  CopyButton,
  IconButton,
  Kbd,
  Link,
  Menu,
  Menubar,
  ThemeMenuRadioGroup,
  ThemePreferenceProvider,
  ThemeToggle,
  Toolbar,
  type CommandPaletteItem,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { IconFormatBold } from '@envsemble/envui/icons/FormatBold';
import { IconFormatItalic } from '@envsemble/envui/icons/FormatItalic';
import { IconFormatUnderlined } from '@envsemble/envui/icons/FormatUnderlined';
import { IconHelp } from '@envsemble/envui/icons/Help';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconShare } from '@envsemble/envui/icons/Share';
import { Cell, Section, Stage, Strip, interactionStates } from './ContactSheetParts.js';

const variants = ['primary', 'secondary', 'outline', 'ghost', 'text'] as const;
const sizes = ['sm', 'md', 'lg'] as const;
/** The tones each variant takes: secondary is always neutral, and accent is for primary only. */
const tonesOf = (variant: (typeof variants)[number]) =>
  variant === 'primary'
    ? (['neutral', 'accent', 'danger'] as const)
    : variant === 'secondary'
      ? (['neutral'] as const)
      : (['neutral', 'danger'] as const);

/**
 * A variant and tone from the loops: Button's props only take the pairs that exist, which the
 * loops keep to, so they pass as one of them.
 */
const look = (variant: (typeof variants)[number], tone: 'neutral' | 'accent' | 'danger') =>
  ({ variant, tone }) as unknown as { variant: 'primary'; tone: 'neutral' };

function Buttons() {
  return (
    <Section name="Button">
      {variants.flatMap((variant) =>
        tonesOf(variant).map((tone) => (
          <Strip key={`${variant}-${tone}`} label={`${variant} · ${tone}`}>
            {interactionStates.map(({ caption, force }) => (
              <Cell key={caption} caption={caption} force={force}>
                <Button {...look(variant, tone)}>Save changes</Button>
              </Cell>
            ))}
            <Cell caption="Disabled">
              <Button {...look(variant, tone)} disabled>
                Save changes
              </Button>
            </Cell>
            <Cell caption="Pending">
              <Button {...look(variant, tone)} pending>
                Save changes
              </Button>
            </Cell>
          </Strip>
        )),
      )}
      <Strip label="Sizes">
        {variants.flatMap((variant) =>
          sizes.map((size) => (
            <Cell key={`${variant}-${size}`} caption={`${variant} ${size}`}>
              <Button variant={variant} size={size}>
                Button
              </Button>
            </Cell>
          )),
        )}
      </Strip>
      <Strip label="Content">
        <Cell caption="Start icon">
          <Button startIcon={<IconAdd />}>New project</Button>
        </Cell>
        <Cell caption="End icon">
          <Button variant="secondary" endIcon={<IconDownload />}>
            Export
          </Button>
        </Cell>
        <Cell caption="End: shortcut">
          <Button variant="outline" end={<Kbd keys={['Ctrl', 'S']} />}>
            Save
          </Button>
        </Cell>
        <Cell caption="Text, underline">
          <Button variant="text" underline>
            Learn more
          </Button>
        </Cell>
        <Cell caption="Link (href)">
          <Button href="#docs" variant="outline">
            Open docs
          </Button>
        </Cell>
        <Cell caption="Full width" width="16rem">
          <Button fullWidth>Continue</Button>
        </Cell>
      </Strip>
    </Section>
  );
}

function IconButtons() {
  return (
    <Section name="IconButton">
      {variants.flatMap((variant) =>
        tonesOf(variant).map((tone) => (
          <Strip key={`${variant}-${tone}`} label={`${variant} · ${tone}`}>
            {interactionStates.map(({ caption, force }) => (
              <Cell key={caption} caption={caption} force={force}>
                <IconButton
                  {...look(variant, tone)}
                  icon={tone === 'danger' ? <IconDelete /> : <IconSettings />}
                  aria-label="Settings"
                />
              </Cell>
            ))}
            <Cell caption="Disabled">
              <IconButton
                {...look(variant, tone)}
                icon={<IconSettings />}
                aria-label="Settings"
                disabled
              />
            </Cell>
            <Cell caption="Pending">
              <IconButton
                {...look(variant, tone)}
                icon={<IconSettings />}
                aria-label="Settings"
                pending
              />
            </Cell>
            {sizes.map((size) => (
              <Cell key={size} caption={size}>
                <IconButton
                  {...look(variant, tone)}
                  size={size}
                  icon={<IconSettings />}
                  aria-label="Settings"
                />
              </Cell>
            ))}
          </Strip>
        )),
      )}
    </Section>
  );
}

/**
 * Arms the ConfirmButton inside by a press that takes no focus, so a later click elsewhere on the
 * sheet, which moves focus and would disarm a focused one, leaves it armed.
 */
function Armed({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const button = ref.current?.querySelector<HTMLButtonElement>('.env-confirm-button');
    if (button && !button.hasAttribute('data-armed')) button.click();
  }, []);
  return <div ref={ref}>{children}</div>;
}

function ConfirmAndCopy() {
  return (
    <>
      <Section name="ConfirmButton">
        <Strip label="Danger">
          {interactionStates.map(({ caption, force }) => (
            <Cell key={caption} caption={caption} force={force}>
              <ConfirmButton tone="danger" confirmLabel="Delete for good" onConfirm={() => {}}>
                Delete
              </ConfirmButton>
            </Cell>
          ))}
          <Cell caption="Armed (after a press)">
            <Armed>
              <ConfirmButton
                tone="danger"
                confirmLabel="Delete for good"
                armedDuration={3_600_000}
                onConfirm={() => {}}
              >
                Delete
              </ConfirmButton>
            </Armed>
          </Cell>
          <Cell caption="Pending">
            <ConfirmButton
              tone="danger"
              confirmLabel="Delete for good"
              pending
              onConfirm={() => {}}
            >
              Delete
            </ConfirmButton>
          </Cell>
          <Cell caption="Disabled">
            <ConfirmButton
              tone="danger"
              confirmLabel="Delete for good"
              disabled
              onConfirm={() => {}}
            >
              Delete
            </ConfirmButton>
          </Cell>
        </Strip>
        <Strip label="Other variants">
          {(['secondary', 'outline', 'ghost', 'text'] as const).map((variant) => (
            <Cell key={variant} caption={variant}>
              <ConfirmButton variant={variant} confirmLabel="Discard draft" onConfirm={() => {}}>
                Discard
              </ConfirmButton>
            </Cell>
          ))}
          <Cell caption="Icon only, armed">
            <Armed>
              <ConfirmButton
                variant="ghost"
                tone="danger"
                icon={<IconDelete />}
                aria-label="Delete"
                confirmLabel="Delete"
                armedDuration={3_600_000}
                onConfirm={() => {}}
              />
            </Armed>
          </Cell>
        </Strip>
      </Section>
      <Section name="CopyButton">
        <Strip label="Icon only">
          {interactionStates.map(({ caption, force }) => (
            <Cell key={caption} caption={caption} force={force}>
              <CopyButton
                aria-label="Copy the command"
                value="npm i @envsemble/envui"
                write={async () => {}}
              />
            </Cell>
          ))}
          <Cell caption="Copied (after a click)" click="left">
            <CopyButton
              aria-label="Copy the command"
              value="npm i @envsemble/envui"
              write={async () => {}}
            />
          </Cell>
          <Cell caption="Failed (after a click)" click="left">
            <CopyButton
              aria-label="Copy the command"
              value="npm i @envsemble/envui"
              write={() => Promise.reject(new Error('Blocked'))}
            />
          </Cell>
          <Cell caption="Disabled">
            <CopyButton aria-label="Copy the command" value="npm i @envsemble/envui" disabled />
          </Cell>
        </Strip>
        <Strip label="Labelled, sizes">
          {sizes.map((size) => (
            <Cell key={size} caption={`label ${size}`}>
              <CopyButton
                aria-label="Copy the token"
                value="token"
                size={size}
                variant="outline"
                write={async () => {}}
              >
                {true}
              </CopyButton>
            </Cell>
          ))}
          <Cell caption="Labelled, copied" click="left">
            <CopyButton
              aria-label="Copy the token"
              value="token"
              variant="outline"
              write={async () => {}}
            >
              {true}
            </CopyButton>
          </Cell>
        </Strip>
      </Section>
    </>
  );
}

function Groups() {
  return (
    <Section name="ButtonGroup">
      <Strip>
        <Cell caption="Horizontal">
          <ButtonGroup>
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </ButtonGroup>
        </Cell>
        <Cell caption="Split button">
          <ButtonGroup>
            <Button>Publish</Button>
            <IconButton
              variant="primary"
              icon={<IconExpandMore />}
              aria-label="More publish options"
            />
          </ButtonGroup>
        </Cell>
        <Cell caption="Secondary, one hovered" force="hover" target="button:nth-of-type(2)">
          <ButtonGroup>
            <Button variant="secondary">Undo</Button>
            <Button variant="secondary">Redo</Button>
          </ButtonGroup>
        </Cell>
        <Cell caption="Vertical">
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
        </Cell>
        <Cell caption="Full width" width="20rem">
          <ButtonGroup fullWidth>
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </ButtonGroup>
        </Cell>
      </Strip>
    </Section>
  );
}

function ThemeToggles() {
  // The toggle shows a provider's preference: one that starts at the sheet's theme and scale.
  const params = new URLSearchParams(location.search);
  return (
    <Section name="ThemeToggle">
      <ThemePreferenceProvider
        storageKey="contact-sheet-theme"
        defaultPreference={params.get('theme') === 'dark' ? 'dark' : 'light'}
        scale={params.get('scale') === 'system' ? 'system' : 'comfortable'}
      >
        <Strip>
          {interactionStates.map(({ caption, force }) => (
            <Cell key={caption} caption={caption} force={force}>
              <ThemeToggle />
            </Cell>
          ))}
          {sizes.map((size) => (
            <Cell key={size} caption={size}>
              <ThemeToggle size={size} variant="ghost" />
            </Cell>
          ))}
        </Strip>
      </ThemePreferenceProvider>
    </Section>
  );
}

function Links() {
  return (
    <Section name="Link">
      <Strip label="Standalone">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force}>
            <Link href="#pricing">See pricing</Link>
          </Cell>
        ))}
        <Cell caption="Underline">
          <Link href="#pricing" underline>
            See pricing
          </Link>
        </Cell>
        <Cell caption="Disabled">
          <Link href="#pricing" disabled>
            See pricing
          </Link>
        </Cell>
      </Strip>
      <Strip label="In text">
        <Cell caption="In a sentence" width="24rem">
          <p style={{ margin: 0 }}>
            Read the <Link href="#guide">setup guide</Link> before you invite your team.
          </p>
        </Cell>
      </Strip>
    </Section>
  );
}

function MenuItems() {
  const [view, setView] = useState('board');
  return (
    <>
      <Menu.Header>Project</Menu.Header>
      <Menu.Item icon={<IconEdit />} shortcut="F2">
        Rename
      </Menu.Item>
      <Menu.Item icon={<IconShare />} description="Anyone in the workspace">
        Share
      </Menu.Item>
      <Menu.Item disabled icon={<IconDownload />}>
        Export (disabled)
      </Menu.Item>
      <Menu.Separator />
      <Menu.Group label="Show">
        <Menu.CheckboxItem defaultChecked>Completed tasks</Menu.CheckboxItem>
        <Menu.CheckboxItem>Archived tasks</Menu.CheckboxItem>
      </Menu.Group>
      <Menu.RadioGroup label="View" value={view} onValueChange={(next) => setView(String(next))}>
        <Menu.RadioItem value="board">Board</Menu.RadioItem>
        <Menu.RadioItem value="list">List</Menu.RadioItem>
      </Menu.RadioGroup>
      <Menu.Submenu label="Move to">
        <Menu.Item>Marketing</Menu.Item>
      </Menu.Submenu>
      <Menu.Separator />
      <Menu.Item tone="danger" icon={<IconDelete />} shortcut="Del">
        Delete
      </Menu.Item>
    </>
  );
}

function Menus() {
  return (
    <Section name="Menu">
      <Strip label="Trigger">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force}>
            <Menu.Root
              aria-label="Project actions"
              trigger={<Button variant="outline">Actions</Button>}
            >
              <Menu.Item>Rename</Menu.Item>
            </Menu.Root>
          </Cell>
        ))}
      </Strip>
      <Strip label="Open">
        <Cell
          caption="Open: header, icons, description, disabled, checkbox, radio, submenu, danger; cursor on Rename"
          highlight=".env-menu-item"
        >
          <Stage height="31rem" width="20rem">
            <Menu.Root
              aria-label="Project actions"
              defaultOpen
              align="start"
              trigger={<Button variant="outline">Actions</Button>}
            >
              <MenuItems />
            </Menu.Root>
          </Stage>
        </Cell>
        <Cell caption="Submenu open">
          <Stage height="14rem" width="26rem">
            <Menu.Root
              aria-label="Item actions"
              defaultOpen
              align="start"
              trigger={<IconButton icon={<IconMoreVert />} aria-label="More" variant="ghost" />}
            >
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Submenu label="Move to" defaultOpen>
                <Menu.Item>Marketing</Menu.Item>
                <Menu.Item>Engineering</Menu.Item>
              </Menu.Submenu>
              <Menu.Submenu label="Disabled submenu" disabled>
                <Menu.Item>Nothing</Menu.Item>
              </Menu.Submenu>
            </Menu.Root>
          </Stage>
        </Cell>
        <Cell caption="Theme radio group">
          <Stage height="14rem" width="16rem">
            <Menu.Root
              aria-label="Appearance"
              defaultOpen
              align="start"
              trigger={<Button variant="ghost">Appearance</Button>}
            >
              <ThemeMenuRadioGroup value="system" onValueChange={() => {}} />
            </Menu.Root>
          </Stage>
        </Cell>
        <Cell caption="Skeleton">
          <Stage height="12rem" width="16rem">
            <Menu.Root
              aria-label="Loading actions"
              defaultOpen
              skeleton
              align="start"
              trigger={<Button variant="outline">Actions</Button>}
            >
              <Menu.Item>Rename</Menu.Item>
              <Menu.Item>Share</Menu.Item>
              <Menu.Item>Delete</Menu.Item>
            </Menu.Root>
          </Stage>
        </Cell>
      </Strip>
      <Strip label="ContextMenu">
        <Cell
          caption="Open at the pointer (a right click)"
          click="right"
          target=".cs-context-target"
        >
          <Stage height="14rem" width="22rem">
            <ContextMenu
              aria-label="Row actions"
              content={
                <>
                  <Menu.Item icon={<IconEdit />}>Rename</Menu.Item>
                  <Menu.Item shortcut="Ctrl+D">Duplicate</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item tone="danger" icon={<IconDelete />}>
                    Delete
                  </Menu.Item>
                </>
              }
            >
              <div className="cs-context-target cs-block" style={{ blockSize: '3rem' }}>
                Right-click area
              </div>
            </ContextMenu>
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

function Menubars() {
  return (
    <Section name="Menubar">
      <Strip>
        <Cell caption="File menu open">
          <Stage height="12rem" width="22rem">
            <Menubar.Root aria-label="Application">
              <Menubar.Menu label="File" defaultOpen>
                <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
                <Menu.Item shortcut="Ctrl+O">Open…</Menu.Item>
                <Menu.Separator />
                <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="Edit">
                <Menu.Item>Undo</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="View" disabled>
                <Menu.Item>Zoom in</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          </Stage>
        </Cell>
        {interactionStates.slice(1).map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`Edit: ${caption}`}
            force={force}
            target="[role=menuitem]:nth-of-type(2)"
          >
            <Menubar.Root aria-label="Application">
              <Menubar.Menu label="File">
                <Menu.Item>New</Menu.Item>
              </Menubar.Menu>
              <Menubar.Menu label="Edit">
                <Menu.Item>Undo</Menu.Item>
              </Menubar.Menu>
            </Menubar.Root>
          </Cell>
        ))}
        <Cell caption="Access keys">
          <Menubar.Root aria-label="Application" accessKeys>
            <Menubar.Menu label="File" accessKey="F">
              <Menu.Item>New</Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu label="Edit" accessKey="E">
              <Menu.Item>Undo</Menu.Item>
            </Menubar.Menu>
          </Menubar.Root>
        </Cell>
        <Cell caption="Disabled">
          <Menubar.Root aria-label="Application" disabled>
            <Menubar.Menu label="File">
              <Menu.Item>New</Menu.Item>
            </Menubar.Menu>
            <Menubar.Menu label="Edit">
              <Menu.Item>Undo</Menu.Item>
            </Menubar.Menu>
          </Menubar.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Toolbars() {
  const formatting = (pressed: boolean) => (
    <>
      <Toolbar.Group aria-label="Text style">
        <Toolbar.Button icon={<IconFormatBold />} label="Bold" pressed={pressed} />
        <Toolbar.Button icon={<IconFormatItalic />} label="Italic" pressed={false} />
        <Toolbar.Button icon={<IconFormatUnderlined />} label="Underline" pressed={false} />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button icon={<IconAdd />} label="Insert" />
      <Toolbar.Link href="#help" icon={<IconHelp />} label="Help" />
    </>
  );
  return (
    <Section name="Toolbar">
      <Strip label="Sizes">
        {sizes.map((size) => (
          <Cell key={size} caption={`${size}, Bold pressed`}>
            <Toolbar.Root aria-label="Formatting" size={size}>
              {formatting(true)}
            </Toolbar.Root>
          </Cell>
        ))}
      </Strip>
      <Strip label="States of Italic">
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force} target="button[aria-label=Italic]">
            <Toolbar.Root aria-label="Formatting">{formatting(true)}</Toolbar.Root>
          </Cell>
        ))}
        <Cell caption="Pressed and hovered" force="hover" target="button[aria-label=Bold]">
          <Toolbar.Root aria-label="Formatting">{formatting(true)}</Toolbar.Root>
        </Cell>
      </Strip>
      <Strip label="More">
        <Cell caption="Pending button">
          <Toolbar.Root aria-label="Sync">
            <Toolbar.Button icon={<IconDownload />} label="Download" pending />
            <Toolbar.Button icon={<IconShare />} label="Share" />
          </Toolbar.Root>
        </Cell>
        <Cell caption="Disabled group">
          <Toolbar.Root aria-label="Formatting">
            <Toolbar.Group aria-label="Text style" disabled>
              <Toolbar.Button icon={<IconFormatBold />} label="Bold" pressed />
              <Toolbar.Button icon={<IconFormatItalic />} label="Italic" pressed={false} />
            </Toolbar.Group>
            <Toolbar.Separator />
            <Toolbar.Button icon={<IconAdd />} label="Insert" />
          </Toolbar.Root>
        </Cell>
        <Cell caption="Disabled toolbar">
          <Toolbar.Root aria-label="Formatting" disabled>
            {formatting(true)}
          </Toolbar.Root>
        </Cell>
        <Cell caption="Vertical">
          <Toolbar.Root aria-label="Tools" orientation="vertical">
            {formatting(false)}
          </Toolbar.Root>
        </Cell>
        <Cell caption="With labelled buttons">
          <Toolbar.Root aria-label="Document">
            <Button variant="ghost" startIcon={<IconShare />}>
              Share
            </Button>
            <Button>Publish</Button>
          </Toolbar.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

const commands: CommandPaletteItem[] = [
  {
    id: 'new',
    label: 'New document',
    icon: <IconAdd />,
    end: <Kbd keys={['Ctrl', 'N']} />,
    group: 'Commands',
  },
  {
    id: 'share',
    label: 'Share',
    description: 'Invite people to this project',
    icon: <IconShare />,
    group: 'Commands',
  },
  {
    id: 'export',
    label: 'Export (disabled)',
    icon: <IconDownload />,
    group: 'Commands',
    disabled: true,
  },
  { id: 'settings', label: 'Open settings', icon: <IconSettings />, group: 'Navigation' },
];

function Palette({
  items,
  loading,
  query = '',
}: {
  items: CommandPaletteItem[];
  loading?: boolean;
  query?: string;
}) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState(query);
  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      aria-label="Run a command"
      placeholder="Search commands"
      inputValue={input}
      onInputValueChange={setInput}
      items={items}
      loading={loading}
      onAction={() => {}}
      hints={[
        { keys: ['Enter'], label: 'Run' },
        { keys: ['Esc'], label: 'Close' },
      ]}
    />
  );
}

function Palettes() {
  return (
    <Section name="CommandPalette">
      <Strip>
        <Cell caption="Open, cursor on New document" highlight="[role=option]">
          <Stage height="28rem" width="40rem">
            <Palette items={commands} />
          </Stage>
        </Cell>
        <Cell caption="Loading">
          <Stage height="28rem" width="40rem">
            <Palette items={[]} loading query="rep" />
          </Stage>
        </Cell>
        <Cell caption="No results">
          <Stage height="28rem" width="40rem">
            <Palette items={[]} query="zzz" />
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

export function ActionsSheet() {
  return (
    <>
      <Buttons />
      <IconButtons />
      <ConfirmAndCopy />
      <Groups />
      <ThemeToggles />
      <Links />
      <Menus />
      <Menubars />
      <Toolbars />
      <Palettes />
    </>
  );
}
