import { useState } from 'react';
import {
  AppShell,
  AppShellSkeleton,
  AvatarButton,
  Button,
  IconButton,
  Kbd,
  Menu,
  Menubar,
  NavigationItem,
  OrganizationSwitcher,
  Select,
  Skeleton,
  Stack,
  Text,
  TitleBar,
  WindowFrame,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { Category } from '@envsemble/envui/icons/Category';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';
import { Search } from '@envsemble/envui/icons/Search';
import { Description } from '@envsemble/envui/icons/Description';
import { History } from '@envsemble/envui/icons/History';
import { Minimize } from '@envsemble/envui/icons/Minimize';
import { CropSquare } from '@envsemble/envui/icons/CropSquare';
import { Close } from '@envsemble/envui/icons/Close';
import { Example } from './Example';
import { Preview } from './Preview';

const organizations = [
  { id: 'northwind', name: 'Northwind Labs', detail: 'Admin' },
  { id: 'contoso', name: 'Contoso', detail: 'Member' },
];

const pages = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'products', label: 'Products', icon: <Category /> },
  { id: 'members', label: 'Members', icon: <ManageAccounts /> },
] as const;

/** The shell is fixed to the viewport, so the specimen frame contains it with a transform. */
export function AppShellPreview() {
  const [page, setPage] = useState<(typeof pages)[number]['id']>('home');
  const [dividers, setDividers] = useState(true);
  const [organizationId, setOrganizationId] = useState('northwind');
  const current = pages.find((candidate) => candidate.id === page) ?? pages[0];
  return (
    <Preview>
      <Example
        title="Application shell"
        size="wide"
        caption={
          <>
            Hover the sidebar or the area above it, collapse it with the logo, and narrow the window
            to see the overlay sidebar. Drag the sidebar&rsquo;s edge to resize it, or focus the
            edge and press <Kbd>←</Kbd> or <Kbd>→</Kbd>.
          </>
        }
        actions={
          <Button variant="secondary" onClick={() => setDividers((value) => !value)}>
            {dividers ? 'Hide dividers' : 'Show dividers'}
          </Button>
        }
      >
        <div className="docs-shell-frame">
          <AppShell
            brand={<Apps />}
            context={
              <OrganizationSwitcher
                organizations={organizations}
                currentOrganizationId={organizationId}
                onSelect={setOrganizationId}
                onCreate={() => undefined}
              />
            }
            title={current.label}
            actions={
              <Menu.Root
                aria-label="Account"
                trigger={
                  <AvatarButton
                    name="Alex Morgan"
                    detail="alex@example.com"
                    aria-label="Open account menu"
                  />
                }
              >
                <Menu.Item icon={<ManageAccounts />}>Account settings</Menu.Item>
                <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
              </Menu.Root>
            }
            navigationLabel="Sample navigation"
            navigation={pages.map((candidate) => (
              <NavigationItem
                key={candidate.id}
                icon={candidate.icon}
                selected={candidate.id === page}
                onClick={() => setPage(candidate.id)}
              >
                {candidate.label}
              </NavigationItem>
            ))}
            dividers={dividers}
            resizable
            storageKey="envui-catalogue-shell-collapsed"
          >
            <Stack gap={3} className="docs-shell-page">
              <Text as="h2" variant="display">
                {current.label}
              </Text>
              <Text tone="muted">Page content scrolls inside the shell.</Text>
            </Stack>
          </AppShell>
        </div>
      </Example>
      <TitleBarExamples />
      <Example title="Loading frame" size="wide">
        <div className="docs-shell-frame">
          <AppShellSkeleton brand={<Apps />} label="Loading sample">
            <Stack gap={3} className="docs-shell-page">
              <Skeleton width="12rem" height="2rem" />
              <Skeleton width="100%" height="5rem" />
            </Stack>
          </AppShellSkeleton>
        </div>
      </Example>
    </Preview>
  );
}

const recentDocuments = [
  'Quarterly report',
  'Meeting notes',
  'Budget',
  'Roadmap',
  'Release checklist',
  'Interview notes',
  'Design review',
  'Team retrospective',
];

const workspaces = [
  { value: 'tokens', label: 'design-system/tokens' },
  { value: 'reports', label: 'finance/quarterly-reports' },
  { value: 'notes', label: 'team/meeting-notes' },
];

const documentPages = [
  { id: 'documents', label: 'Documents', icon: <Description /> },
  { id: 'recent', label: 'Recent', icon: <History /> },
  { id: 'search', label: 'Search', icon: <Search /> },
] as const;

/** Stand-ins for the window controls that the system draws in an installed application. */
function WindowControls() {
  return (
    <span className="docs-window-controls" aria-hidden="true">
      {[<Minimize key="minimize" />, <CropSquare key="maximize" />, <Close key="close" />].map(
        (icon) => (
          <span key={icon.key} className="docs-window-control">
            <span className="env-symbol">{icon}</span>
          </span>
        ),
      )}
    </span>
  );
}

function SampleMenubar({ label }: { label: string }) {
  return (
    <Menubar.Root aria-label={label}>
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
        <Menu.Submenu label="Open recent" icon={<History />}>
          <Menu.Item>Quarterly report</Menu.Item>
          <Menu.Item>Meeting notes</Menu.Item>
          <Menu.Item>Budget</Menu.Item>
        </Menu.Submenu>
        <Menu.Separator />
        <Menu.Item shortcut="Ctrl+S">Save</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item shortcut="Ctrl+Z">Undo</Menu.Item>
        <Menu.Separator />
        <Menu.Item shortcut="Ctrl+C">Copy</Menu.Item>
        <Menu.Item shortcut="Ctrl+V">Paste</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View">
        <Menu.Item shortcut="Ctrl++">Zoom in</Menu.Item>
        <Menu.Item shortcut="Ctrl+-">Zoom out</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Help">
        <Menu.Item>Keyboard shortcuts</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

/** A full-width topbar as the window's title bar, and the same title bar without the shell. */
function TitleBarExamples() {
  const [page, setPage] = useState<(typeof documentPages)[number]['id']>('documents');
  const [workspace, setWorkspace] = useState('tokens');
  const current = documentPages.find((candidate) => candidate.id === page) ?? documentPages[0];
  return (
    <>
      <Example
        title="Full-width title bar"
        size="wide"
        caption={
          <>
            One row across the window: the mark, a menubar, back and forward and a workspace picker,
            the title, and the actions, independent of the sidebar. As the title bar of an installed
            app, empty space drags the window, the controls are compact, icon-only text buttons take
            the quiet color of the window controls, and the bar leaves room for the window controls
            the system draws, shown here at the end.
          </>
        }
      >
        <div className="docs-shell-frame">
          <AppShell
            topbar="full"
            titleBar
            brand={<Apps />}
            context={
              <>
                <SampleMenubar label="Application menu" />
                <IconButton variant="text" icon={<ArrowBack />} aria-label="Back" />
                <IconButton variant="text" icon={<ArrowForward />} aria-label="Forward" disabled />
                <Select
                  aria-label="Workspace"
                  density="compact"
                  options={workspaces}
                  value={workspace}
                  onValueChange={(next) => next && setWorkspace(next)}
                />
              </>
            }
            title={current.label}
            actions={
              <>
                <IconButton icon={<Search />} aria-label="Search" />
                <Menu.Root
                  aria-label="Title bar account"
                  density="compact"
                  trigger={
                    <AvatarButton
                      size="small"
                      name="Alex Morgan"
                      detail="alex@example.com"
                      aria-label="Open title bar account menu"
                    />
                  }
                >
                  <Menu.Item icon={<ManageAccounts />}>Account settings</Menu.Item>
                  <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
                </Menu.Root>
                <WindowControls />
              </>
            }
            navigationLabel="Document navigation"
            navigation={documentPages.map((candidate) => (
              <NavigationItem
                key={candidate.id}
                icon={candidate.icon}
                selected={candidate.id === page}
                onClick={() => setPage(candidate.id)}
              >
                {candidate.label}
              </NavigationItem>
            ))}
            storageKey="envui-catalogue-title-bar-shell"
          >
            <Stack gap={3} className="docs-shell-page">
              <Text as="h2" variant="display">
                {current.label}
              </Text>
              <Text tone="muted">
                Collapse the sidebar with the mark: nothing in the title bar moves.
              </Text>
            </Stack>
          </AppShell>
        </div>
      </Example>
      <Example
        title="Title bar alone"
        size="wide"
        caption="TitleBar is the same title bar without the shell, for a start page or a simple window: content at the start, centered and at the end. WindowFrame fills the window with the title bar on top and the content scrolling below it."
      >
        <div className="docs-title-bar-frame">
          <WindowFrame
            titleBar={
              <TitleBar
                start={
                  <>
                    <span className="env-symbol docs-title-bar-mark" aria-hidden="true">
                      <Apps />
                    </span>
                    <SampleMenubar label="Start page menu" />
                  </>
                }
                end={
                  <>
                    <Button variant="secondary">Share</Button>
                    <WindowControls />
                  </>
                }
              >
                Quarterly report
              </TitleBar>
            }
          >
            <Stack gap={3} className="docs-shell-page">
              <Text as="h2" variant="page-heading">
                Recent documents
              </Text>
              {recentDocuments.map((name) => (
                <Text key={name} tone="muted">
                  {name}
                </Text>
              ))}
            </Stack>
          </WindowFrame>
        </div>
      </Example>
    </>
  );
}
