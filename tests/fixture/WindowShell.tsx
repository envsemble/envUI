import { useState } from 'react';
import {
  AppShell,
  AppShellSkeleton,
  Button,
  IconButton,
  MenuItem,
  Menubar,
  MenubarMenu,
  NavigationItem,
  TitleBar,
} from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

function NotesMenubar() {
  return (
    <Menubar aria-label="Application menu">
      <MenubarMenu label="File">
        <MenuItem shortcut="Ctrl+N">New note</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit">
        <MenuItem shortcut="Ctrl+C">Copy</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <MenuItem>Zoom in</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Help">
        <MenuItem>About</MenuItem>
      </MenubarMenu>
    </Menubar>
  );
}

/**
 * A full-width topbar, as the window's title bar unless ?titleBar=off, mounted with
 * ?fixture=full-shell.
 */
export function FullShellFixture() {
  const titleBar = new URLSearchParams(location.search).get('titleBar') !== 'off';
  const [page, setPage] = useState('notes');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AppShell
      topbar="full"
      titleBar={titleBar}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      brand={<span data-testid="brand">B</span>}
      context={
        <>
          <NotesMenubar />
          <Button variant="secondary" data-testid="context-picker">
            design-system/tokens
          </Button>
        </>
      }
      title="Quarterly report"
      actions={
        <>
          <IconButton icon={<Search />} aria-label="Search" data-testid="action" />
          <IconButton icon={<Settings />} aria-label="Settings" />
        </>
      }
      navigationLabel="Notes navigation"
      navigation={
        <>
          <NavigationItem
            icon={<Home />}
            selected={page === 'notes'}
            onClick={() => setPage('notes')}
          >
            Notes
          </NavigationItem>
          <NavigationItem
            icon={<Search />}
            selected={page === 'search'}
            onClick={() => setPage('search')}
          >
            Search
          </NavigationItem>
        </>
      }
      className="fixture-full-shell"
    >
      <header className="fixture-sticky-header" data-testid="sticky-header">
        Sticky document header
      </header>
      <div className="fixture-tall-page">
        {Array.from({ length: 60 }, (_, index) => (
          <p key={index}>Paragraph {index + 1}</p>
        ))}
      </div>
    </AppShell>
  );
}

/** A title bar without the shell, as on a start page, mounted with ?fixture=title-bar. */
export function TitleBarFixture() {
  return (
    <div className="fixture-title-bar-page">
      <TitleBar
        data-testid="title-bar"
        start={
          <>
            <span data-testid="title-bar-mark">B</span>
            <NotesMenubar />
          </>
        }
        end={
          <>
            <Button variant="secondary">Share</Button>
            <IconButton icon={<Settings />} aria-label="Settings" />
          </>
        }
      >
        <span data-testid="title-bar-title">Quarterly report</span>
      </TitleBar>
      <p>Start page content</p>
    </div>
  );
}

/** The loading frame of a full topbar title bar shell, mounted with ?fixture=full-shell-skeleton. */
export function FullShellSkeletonFixture() {
  return (
    <AppShellSkeleton
      topbar="full"
      titleBar
      brand={<span>B</span>}
      label="Loading notes"
      className="fixture-full-shell"
    />
  );
}
