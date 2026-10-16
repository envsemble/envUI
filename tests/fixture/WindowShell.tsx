import { createElement, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AppShell,
  AppShellSkeleton,
  Button,
  IconButton,
  Menu,
  Menubar,
  NavigationItem,
  TitleBar,
  WindowFrame,
  useAppShell,
} from '@envsemble/envui';
import { ArrowBack } from '@envsemble/envui/icons/ArrowBack';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

function NotesMenubar() {
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New note</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item shortcut="Ctrl+C">Copy</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="View">
        <Menu.Item>Zoom in</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Help">
        <Menu.Item>About</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
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

/** Keeps the first getScrollElement it gets, as a listener registered once would, and calls it. */
export function FirstScrollProbe() {
  const { getScrollElement } = useAppShell();
  const [first] = useState(() => getScrollElement);
  const [seen, setSeen] = useState('');
  return (
    <div className="fixture-actions">
      <button type="button" onClick={() => setSeen(first()?.tagName.toLowerCase() ?? 'none')}>
        Read the first scroll element
      </button>
      <output data-testid="first-scroll-element">{seen}</output>
    </div>
  );
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

/** A field in a closed shadow root, out of the page's sight; focusing the element focuses it. */
class ClosedField extends HTMLElement {
  #field = document.createElement('input');
  constructor() {
    super();
    this.#field.setAttribute('aria-label', 'Closed note');
    this.#field.size = 12;
    this.attachShadow({ mode: 'closed', delegatesFocus: true }).append(this.#field);
  }
  get value() {
    return this.#field.value;
  }
}
if (!customElements.get('fixture-closed-field'))
  customElements.define('fixture-closed-field', ClosedField);

/** The same in an ordinary element, which cannot take focus itself. */
function attachPlainField(host: HTMLSpanElement | null) {
  if (!host || 'value' in host) return;
  const field = document.createElement('input');
  field.setAttribute('aria-label', 'Plain note');
  field.size = 12;
  host.attachShadow({ mode: 'closed', delegatesFocus: true }).append(field);
  Object.defineProperty(host, 'value', { get: () => field.value });
}

/**
 * A title-bar shell for the scrolling keys, mounted with ?fixture=scroll-keys: a button and a link
 * in the navigation, fields in open and closed shadow roots, media controls, a list that scrolls
 * without taking focus and a long page.
 */
export function ScrollKeysFixture() {
  return (
    <AppShell
      topbar="full"
      titleBar
      brand={<span>B</span>}
      title="Scroll keys"
      actions={
        <>
          {createElement('fixture-field')}
          {createElement('fixture-closed-field')}
          <span ref={attachPlainField} data-testid="plain-closed-field" />
          <audio controls tabIndex={0} aria-label="Recording" className="fixture-recording" />
        </>
      }
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

/** Whether getScrollElement returned the scrolling element of the frame's own document. */
function describeScroller(element: Element | null, frame: Document) {
  return element === frame.scrollingElement ? 'frame' : element ? 'other' : 'none';
}

/**
 * Records what each getScrollElement function returns to a layout effect inside a frame, once per
 * function, so that strict mode running the effect again does not count, and reads it when asked.
 */
function FrameScrollProbe() {
  const { getScrollElement } = useAppShell();
  const record = useRef<HTMLOutputElement>(null);
  const recorded = useRef<typeof getScrollElement>(null);
  const [mounted, setMounted] = useState<string[]>([]);
  const [seen, setSeen] = useState('');
  useLayoutEffect(() => {
    const frame = record.current?.ownerDocument;
    if (!frame || recorded.current === getScrollElement) return;
    recorded.current = getScrollElement;
    setMounted((current) => [...current, describeScroller(getScrollElement(), frame)]);
  }, [getScrollElement]);
  return (
    <div className="fixture-actions">
      <output ref={record} data-testid="framed-mount-scroll-element">
        {mounted.join(' ')}
      </output>
      <button
        type="button"
        onClick={(event) =>
          setSeen(describeScroller(getScrollElement(), event.currentTarget.ownerDocument))
        }
      >
        Read the scroll element
      </button>
      <output data-testid="framed-scroll-element">{seen}</output>
    </div>
  );
}

/** A shell rendered into the document of a frame, mounted with ?fixture=framed-shell. */
export function FramedShellFixture() {
  const [body, setBody] = useState<HTMLElement | null>(null);
  return (
    <>
      <iframe
        title="Framed shell"
        srcDoc="<!doctype html><title>Framed shell</title><body></body>"
        style={{ inlineSize: '40rem', blockSize: '20rem' }}
        onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
      />
      {body &&
        createPortal(
          <AppShell
            brand={<span>B</span>}
            title="Framed"
            navigationLabel="Framed navigation"
            navigation={null}
          >
            <FrameScrollProbe />
          </AppShell>,
          body,
        )}
    </>
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
      <FirstScrollProbe />
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
              <IconButton variant="text" icon={<ArrowBack />} aria-label="Back" />
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
