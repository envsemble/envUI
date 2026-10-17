import { createElement, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  AppShell,
  Button,
  EnvUIProvider,
  IconButton,
  LinkProvider,
  LoadingState,
  Menu,
  Menubar,
  NavList,
  Sidebar,
  SidebarTrigger,
  useAppShell,
  useSidebar,
  type LinkComponentProps,
} from '@envsemble/envui';
import { Category } from '@envsemble/envui/icons/Category';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

/** Stands in for a router link: it records client navigation instead of loading a page. */
function RecordingLink({ href, onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        document.body.dataset.navigatedTo = href;
      }}
    />
  );
}

/** The application's mark, a letter in a circle. */
function Mark({ letter = 'B' }: { letter?: string }) {
  return (
    <svg viewBox="0 0 24 24" data-testid="mark">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <text x="12" y="16" fontSize="12" textAnchor="middle" fill="white">
        {letter}
      </text>
    </svg>
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

/** Reads useAppShell().getStickyTop() and useSidebar() for the specs. */
function FrameProbe() {
  const { getStickyTop } = useAppShell();
  const sidebar = useSidebar();
  const [top, setTop] = useState('');
  return (
    <div className="fixture-actions">
      <button type="button" onClick={() => setTop(String(getStickyTop()))}>
        Read the sticky top
      </button>
      <output data-testid="sticky-top">{top}</output>
      <output data-testid="sidebar-state">
        {sidebar.state} {sidebar.isRail ? 'rail' : 'labels'} {sidebar.isMobile ? 'mobile' : ''}
      </output>
      <button type="button" onClick={() => sidebar.toggle()}>
        Toggle from the page
      </button>
    </div>
  );
}

const params = () => new URLSearchParams(location.search);

/**
 * A full frame, mounted with ?fixture=app-shell: skip links, a start sidebar with a trigger and
 * the mark, a context button, navigation and a group, a header with a title and actions, and a
 * long page. ?span=full puts the header across the window, ?scroll=main scrolls Main,
 * ?collapsible=offcanvas or none, ?persist=cookie keeps the state in a cookie, ?dir=rtl mirrors
 * it, ?landmarks=off renders no landmarks and ?shortcut=mod+b adds the shortcut.
 */
export function AppShellFixture() {
  const query = params();
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);
  const collapsible = (query.get('collapsible') ?? 'rail') as 'rail' | 'offcanvas' | 'none';
  const cookie = query.get('persist') === 'cookie';
  const frame = (
    <LinkProvider component={RecordingLink}>
      <AppShell.Root
        headerSpan={query.get('span') === 'full' ? 'full' : 'main'}
        scroll={query.get('scroll') === 'main' ? 'main' : 'document'}
        landmarks={query.get('landmarks') !== 'off'}
        persist={cookie ? { key: 'fixture-frame', storage: 'cookie' } : 'fixture-frame'}
        shortcut={query.get('shortcut') ?? false}
        loading={loading}
        onSidebarOpenChange={(open, { side, reason }) =>
          setChanges((current) => [...current, `${side} ${open ? 'open' : 'closed'} ${reason}`])
        }
        className="fixture-app-shell"
      >
        <AppShell.SkipLinks />
        <Sidebar.Root label="Primary" collapsible={collapsible} resizable={query.has('resizable')}>
          <Sidebar.Header>
            <SidebarTrigger mark={<Mark />} />
            <button type="button" aria-expanded="false" data-testid="context-trigger">
              Organization
            </button>
          </Sidebar.Header>
          <Sidebar.Content>
            <NavList.Root>
              <NavList.Item
                href="/"
                icon={<Home />}
                selected={page === 'home'}
                onClick={() => setPage('home')}
              >
                Home
              </NavList.Item>
              <NavList.Item
                href="/products"
                icon={<Category />}
                selected={page === 'products'}
                onClick={() => setPage('products')}
              >
                Products
              </NavList.Item>
            </NavList.Root>
            <Sidebar.Group label="Administration">
              <NavList.Root>
                <NavList.Item href="/settings" icon={<Settings />}>
                  Settings
                </NavList.Item>
              </NavList.Root>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Content fill>
            <ul className="fixture-sidebar-list" data-testid="sidebar-list" aria-label="Files">
              {Array.from({ length: 80 }, (_, index) => (
                <li key={index}>Document {index + 1}.md</li>
              ))}
            </ul>
          </Sidebar.Content>
        </Sidebar.Root>
        <AppShell.Header
          start={<SidebarTrigger data-testid="header-trigger" />}
          end={<IconButton icon={<Search />} aria-label="Search" data-testid="action" />}
        >
          {page === 'home' ? 'Home' : 'Products'}
        </AppShell.Header>
        <AppShell.Main>
          <header className="fixture-sticky-header" data-testid="sticky-header">
            Sticky document header
          </header>
          <p data-testid="shell-content">Content</p>
          <FrameProbe />
          <ScrollProbe />
          <MountProbe />
          <FirstScrollProbe />
          <div className="fixture-actions">
            <button type="button" onClick={() => setLoading((value) => !value)}>
              Toggle page loading
            </button>
            <button type="button">Page action</button>
          </div>
          <output data-testid="open-changes">{changes.join(',')}</output>
          <div className="fixture-tall-page">
            {Array.from({ length: 60 }, (_, index) => (
              <p key={index}>Paragraph {index + 1}</p>
            ))}
          </div>
        </AppShell.Main>
      </AppShell.Root>
    </LinkProvider>
  );
  if (query.get('dir') !== 'rtl') return frame;
  return (
    <EnvUIProvider dir="rtl">
      <div dir="rtl">{frame}</div>
    </EnvUIProvider>
  );
}

/**
 * Two frames on one page, the second with a taller header that can be hidden or removed, mounted
 * with ?fixture=two-app-shells.
 */
export function TwoAppShellsFixture() {
  const [first, setFirst] = useState(true);
  const [second, setSecond] = useState<'shown' | 'hidden' | 'gone'>('shown');
  return (
    <>
      <div hidden={!first}>
        <AppShell.Root>
          <Sidebar.Root label="First navigation">
            <Sidebar.Content>
              <NavList.Root>
                <NavList.Item href="/" icon={<Home />}>
                  Home
                </NavList.Item>
              </NavList.Root>
            </Sidebar.Content>
          </Sidebar.Root>
          <AppShell.Header>First</AppShell.Header>
          <AppShell.Main id="first-main">
            <div className="fixture-two-shells-actions">
              <button type="button" onClick={() => setSecond('hidden')}>
                Hide the second shell
              </button>
              <button type="button" onClick={() => setSecond('shown')}>
                Show the second shell
              </button>
              <button type="button" onClick={() => setSecond('gone')}>
                Remove the second shell
              </button>
              <button type="button" onClick={() => setFirst(false)}>
                Hide the first shell
              </button>
            </div>
          </AppShell.Main>
        </AppShell.Root>
      </div>
      {second !== 'gone' && (
        <div
          hidden={second === 'hidden'}
          style={{ '--env-app-shell-header-height': '5rem' } as CSSProperties}
        >
          <AppShell.Root>
            <AppShell.Header>Second</AppShell.Header>
            <AppShell.Main id="second-main">
              <p>Second content</p>
            </AppShell.Main>
          </AppShell.Root>
        </div>
      )}
    </>
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

/** A frame rendered into the document of an iframe, mounted with ?fixture=framed-app-shell. */
export function FramedAppShellFixture() {
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
          <AppShell.Root>
            <AppShell.Header>Framed</AppShell.Header>
            <AppShell.Main>
              <FrameScrollProbe />
            </AppShell.Main>
          </AppShell.Root>,
          body,
        )}
    </>
  );
}

function NotesMenubar() {
  return (
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New note</Menu.Item>
      </Menubar.Menu>
      <Menubar.Menu label="Edit">
        <Menu.Item shortcut="Ctrl+C">Copy</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
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
 * A frame whose Main scrolls, for the scrolling keys, mounted with ?fixture=scroll-keys: a button
 * and a link in the navigation, fields in open and closed shadow roots, media controls, a list
 * that scrolls without taking focus and a long page. ?titleBar makes its header the title bar.
 */
export function ScrollKeysFixture() {
  return (
    <AppShell.Root headerSpan="full" scroll="main" className="fixture-full-shell">
      <Sidebar.Root label="Keys navigation">
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item icon={<Home />} selected>
              Inbox
            </NavList.Item>
            <NavList.Item icon={<Settings />} href="#settings">
              Settings
            </NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
        <Sidebar.Content fill>
          <ul className="fixture-sidebar-list" data-testid="sidebar-notes" aria-label="Notes">
            {Array.from({ length: 80 }, (_, index) => (
              <li key={index}>Note {index + 1}</li>
            ))}
          </ul>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header
        start={<SidebarTrigger mark={<Mark />} />}
        end={
          <>
            {createElement('fixture-field')}
            {createElement('fixture-closed-field')}
            <span ref={attachPlainField} data-testid="plain-closed-field" />
            <audio controls tabIndex={0} aria-label="Recording" className="fixture-recording" />
          </>
        }
      >
        Scroll keys
      </AppShell.Header>
      <AppShell.Main>
        <div className="fixture-tall-page">
          <p tabIndex={-1} data-testid="page-start">
            Start of the page
          </p>
          {Array.from({ length: 400 }, (_, index) => (
            <p key={index}>Paragraph {index + 1}</p>
          ))}
        </div>
      </AppShell.Main>
    </AppShell.Root>
  );
}

/**
 * A frame whose header runs across the window and whose Main scrolls, mounted with
 * ?fixture=full-shell: a menubar and a picker beside the trigger, a resizable sidebar with a list
 * that fills it, actions, a sticky page header and a full-window view inside the page.
 */
export function FullShellFixture() {
  const [page, setPage] = useState('notes');
  const [fullView, setFullView] = useState(false);
  const [short, setShort] = useState(false);
  return (
    <AppShell.Root headerSpan="full" scroll="main" className="fixture-full-shell">
      <Sidebar.Root label="Notes navigation" resizable>
        <Sidebar.Content>
          <NavList.Root>
            <NavList.Item
              icon={<Home />}
              selected={page === 'notes'}
              onClick={() => setPage('notes')}
            >
              Notes
            </NavList.Item>
            <NavList.Item
              icon={<Search />}
              selected={page === 'search'}
              onClick={() => setPage('search')}
            >
              Search
            </NavList.Item>
          </NavList.Root>
        </Sidebar.Content>
        <Sidebar.Content fill>
          <ul className="fixture-sidebar-list" data-testid="sidebar-list" tabIndex={0}>
            {Array.from({ length: 80 }, (_, index) => (
              <li key={index}>Note {index + 1}</li>
            ))}
          </ul>
        </Sidebar.Content>
      </Sidebar.Root>
      <AppShell.Header
        start={
          <>
            <SidebarTrigger mark={<Mark />} />
            <NotesMenubar />
            <Button variant="secondary" data-testid="context-picker">
              design-system/tokens
            </Button>
          </>
        }
        end={
          <>
            <IconButton icon={<Search />} aria-label="Search" data-testid="action" />
            <IconButton icon={<Settings />} aria-label="Settings" />
          </>
        }
      >
        Quarterly report
      </AppShell.Header>
      <AppShell.Main>
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
      </AppShell.Main>
    </AppShell.Root>
  );
}

/**
 * The frame's loading state beside the frame it stands for, mounted with ?fixture=loading-frame:
 * the same parts with NavList.Skeleton, marked busy and named by a LoadingState. ?real shows the
 * frame itself, for comparing their boxes.
 */
export function LoadingFrameFixture() {
  const real = params().has('real');
  const sidebar = (
    <Sidebar.Root label="Primary">
      <Sidebar.Header>
        <SidebarTrigger mark={<Mark />} />
      </Sidebar.Header>
      <Sidebar.Content>
        {real ? (
          <NavList.Root>
            <NavList.Item href="/" icon={<Home />}>
              Home
            </NavList.Item>
            <NavList.Item href="/products" icon={<Category />}>
              Products
            </NavList.Item>
            <NavList.Item href="/settings" icon={<Settings />}>
              Settings
            </NavList.Item>
          </NavList.Root>
        ) : (
          <NavList.Skeleton items={3} />
        )}
      </Sidebar.Content>
    </Sidebar.Root>
  );
  const frame = (
    <AppShell.Root persist="fixture-loading-frame" aria-busy={real ? undefined : true}>
      {sidebar}
      <AppShell.Header>{real ? 'Home' : ''}</AppShell.Header>
      <AppShell.Main>
        <p>Page</p>
      </AppShell.Main>
    </AppShell.Root>
  );
  return real ? frame : <LoadingState label="Loading workspace">{frame}</LoadingState>;
}
