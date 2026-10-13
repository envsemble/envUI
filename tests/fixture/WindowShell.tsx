import { createElement, useLayoutEffect, useRef, useState } from 'react';
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
  WindowFrame,
  useAppShell,
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

/** Restores a scroll position on the element that scrolls the page content. */
export function ScrollProbe() {
  const { getScrollElement } = useAppShell();
  const [scroller, setScroller] = useState('');
  return (
    <div className="fixture-actions">
      <button
        type="button"
        onClick={() => {
          const element = getScrollElement();
          element?.scrollTo(0, 300);
          setScroller(element?.tagName.toLowerCase() ?? 'none');
        }}
      >
        Restore scroll position
      </button>
      <output data-testid="scroll-element">{scroller}</output>
    </div>
  );
}

/** Records what getScrollElement returns to a layout effect as the page content mounts. */
export function MountProbe() {
  const { getScrollElement } = useAppShell();
  const [seen, setSeen] = useState<string[]>([]);
  useLayoutEffect(() => {
    const element = getScrollElement();
    setSeen((current) => [...current, element?.tagName.toLowerCase() ?? 'none']);
  }, [getScrollElement]);
  return <output data-testid="mount-scroll-element">{seen.join(' ')}</output>;
}

/** A field inside a web component, whose keys reach the page from its shadow root. */
class ShadowField extends HTMLElement {
  constructor() {
    super();
    const field = document.createElement('input');
    field.setAttribute('aria-label', 'Quick note');
    field.size = 12;
    this.attachShadow({ mode: 'open' }).append(field);
  }
}
if (!customElements.get('fixture-field')) customElements.define('fixture-field', ShadowField);

/**
 * A title-bar shell for the scrolling keys, mounted with ?fixture=scroll-keys: a button and a link
 * in the navigation, a field in a web component, a list that scrolls without taking focus and a
 * long page.
 */
export function ScrollKeysFixture() {
  return (
    <AppShell
      topbar="full"
      titleBar
      brand={<span>B</span>}
      title="Scroll keys"
      actions={createElement('fixture-field')}
      navigationLabel="Keys navigation"
      navigation={
        <>
          <NavigationItem icon={<Home />} selected>
            Inbox
          </NavigationItem>
          <NavigationItem icon={<Settings />} href="#settings">
            Settings
          </NavigationItem>
        </>
      }
      sidebarContent={
        <ul className="fixture-sidebar-list" data-testid="sidebar-notes" aria-label="Notes">
          {Array.from({ length: 80 }, (_, index) => (
            <li key={index}>Note {index + 1}</li>
          ))}
        </ul>
      }
      className="fixture-full-shell"
    >
      <div className="fixture-tall-page">
        <p tabIndex={-1} data-testid="page-start">
          Start of the page
        </p>
        {Array.from({ length: 400 }, (_, index) => (
          <p key={index}>Paragraph {index + 1}</p>
        ))}
      </div>
    </AppShell>
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
  const [fullView, setFullView] = useState(false);
  const [short, setShort] = useState(false);
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
      sidebarContent={
        <ul className="fixture-sidebar-list" data-testid="sidebar-list" tabIndex={0}>
          {Array.from({ length: 80 }, (_, index) => (
            <li key={index}>Note {index + 1}</li>
          ))}
        </ul>
      }
      resizable
      className="fixture-full-shell"
    >
      <header className="fixture-sticky-header" data-testid="sticky-header">
        Sticky document header
      </header>
      <ScrollProbe />
      <MountProbe />
      <div className="fixture-actions">
        <button type="button" onClick={() => setFullView(true)}>
          Show full view
        </button>
        <button type="button" onClick={() => setShort((value) => !value)}>
          {short ? 'Lengthen page' : 'Shorten page'}
        </button>
      </div>
      {fullView && (
        // A full-window view inside the page content, such as a canvas shown on its own.
        <div className="fixture-full-view" data-testid="full-view">
          <button type="button" onClick={() => setFullView(false)}>
            Close full view
          </button>
        </div>
      )}
      <div className="fixture-tall-page">
        {Array.from({ length: short ? 2 : 150 }, (_, index) => (
          <p key={index}>Paragraph {index + 1}</p>
        ))}
      </div>
    </AppShell>
  );
}

/**
 * A title bar without the shell, as on a start page, in a window frame whose content scrolls below
 * it, mounted with ?fixture=title-bar.
 */
export function TitleBarFixture() {
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <WindowFrame
      className="fixture-title-bar-page"
      data-testid="window-frame"
      scrollRef={scroller}
      titleBar={
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
      }
    >
      <div className="fixture-tall-page">
        <p>Start page content</p>
        <button type="button" onClick={() => scroller.current?.scrollTo(0, 200)}>
          Restore start page scroll
        </button>
        {Array.from({ length: 60 }, (_, index) => (
          <p key={index}>Recent document {index + 1}</p>
        ))}
      </div>
    </WindowFrame>
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
