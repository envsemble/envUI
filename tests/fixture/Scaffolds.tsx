import { createElement, useState, type CSSProperties } from 'react';
import { IconButton, Menu, Menubar, Scaffold, TopBar, type ScaffoldForms } from '@envsemble/envui';
import { Menu as MenuIcon } from '@envsemble/envui/icons/Menu';
import { Search } from '@envsemble/envui/icons/Search';
import { Settings } from '@envsemble/envui/icons/Settings';

const params = () => new URLSearchParams(location.search);

/** A stand-in for a navigation form: a named nav with its destinations as buttons. */
function Destinations({ form }: { form: string }) {
  return (
    <nav aria-label={`Main ${form}`} data-testid={`${form}-form`} className="fixture-destinations">
      <button type="button">Inbox</button>
      <button type="button">Settings</button>
    </nav>
  );
}

const navigation = {
  bar: <Destinations form="bar" />,
  rail: <Destinations form="rail" />,
  drawer: <Destinations form="drawer" />,
};

/** A page long enough to scroll its body. */
function TallPage({ paragraphs = 200 }: { paragraphs?: number }) {
  return (
    <div className="fixture-tall-page">
      <p tabIndex={-1} data-testid="page-start">
        Start of the page
      </p>
      {Array.from({ length: paragraphs }, (_, index) => (
        <p key={index}>Paragraph {index + 1}</p>
      ))}
    </div>
  );
}

/**
 * A Scaffold in a frame whose width the test sets, mounted with ?fixture=scaffold: a TopBar,
 * stand-ins for the three navigation forms and a long body. ?forms= takes the forms per window
 * class as JSON, ?only= gives only the forms it lists, comma-separated, ?span=full puts the top bar
 * across the width, ?landmarks=off renders no landmarks and ?dir=rtl mirrors it.
 */
export function ScaffoldFixture() {
  const query = params();
  const [width, setWidth] = useState(query.get('width') ?? '80rem');
  const forms = query.get('forms') ? (JSON.parse(query.get('forms')!) as ScaffoldForms) : undefined;
  const only = query.get('only')?.split(',');
  const given = only
    ? Object.fromEntries(Object.entries(navigation).filter(([form]) => only.includes(form)))
    : navigation;
  return (
    <div dir={query.get('dir') ?? undefined}>
      <div className="fixture-actions" data-testid="widths">
        {['30rem', '45rem', '60rem', '80rem'].map((value) => (
          <button key={value} type="button" onClick={() => setWidth(value)}>
            Width {value}
          </button>
        ))}
      </div>
      <div
        className="fixture-scaffold-frame"
        data-testid="frame"
        style={{ inlineSize: width } as CSSProperties}
      >
        <Scaffold
          className="fixture-scaffold"
          name="app"
          topBarSpan={query.get('span') === 'full' ? 'full' : 'body'}
          landmarks={query.get('landmarks') !== 'off'}
          forms={forms}
          navigation={given}
          topBar={
            <TopBar
              start={<IconButton icon={<MenuIcon />} aria-label="Open navigation" />}
              title="Inbox"
              actions={
                <>
                  <IconButton icon={<Search />} aria-label="Search" />
                  <IconButton icon={<Settings />} aria-label="Settings" />
                </>
              }
            />
          }
        >
          <TallPage />
        </Scaffold>
      </div>
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

/** A menubar in the title bar, whose triggers use the arrow keys. */
function NotesMenubar() {
  return (
    <Menubar.Root aria-label="Notes">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New note</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

/**
 * A Scaffold that fills the window, for the scrolling keys, mounted with ?fixture=scroll-keys: a
 * title bar across the width with a menubar, fields in open and closed shadow roots and media
 * controls; a drawer stand-in with a button, a link and a list that scrolls without taking focus;
 * and a long body.
 */
export function ScrollKeysFixture() {
  return (
    <Scaffold
      topBarSpan="full"
      forms={{ compact: 'drawer', medium: 'drawer' }}
      navigation={{
        drawer: (
          <nav aria-label="Keys navigation" className="fixture-keys-navigation">
            <button type="button">Inbox</button>
            <a href="#settings">Settings</a>
            <ul className="fixture-sidebar-list" data-testid="sidebar-notes" aria-label="Notes">
              {Array.from({ length: 80 }, (_, index) => (
                <li key={index}>Note {index + 1}</li>
              ))}
            </ul>
          </nav>
        ),
      }}
      topBar={
        <TopBar
          titleBar
          start={<NotesMenubar />}
          title="Scroll keys"
          actions={
            <>
              {createElement('fixture-field')}
              {createElement('fixture-closed-field')}
              <span ref={attachPlainField} data-testid="plain-closed-field" />
              <audio controls tabIndex={0} aria-label="Recording" className="fixture-recording" />
            </>
          }
        />
      }
    >
      <TallPage paragraphs={400} />
    </Scaffold>
  );
}
