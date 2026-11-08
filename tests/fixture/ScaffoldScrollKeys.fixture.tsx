import { createElement } from 'react';
import { Menu, Menubar, Scaffold, TopBar } from '@envsemble/envui';
import { TallPage } from './Scaffold.fixture.js';

export const mount = 'standalone';

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
 * A Scaffold that fills the window, for the scrolling keys: a title bar across the width with a
 * menubar, fields in open and closed shadow roots and media controls; a drawer stand-in with a
 * button, a link and a list that scrolls without taking focus; and a long body.
 */
export default function ScaffoldScrollKeysFixture() {
  return (
    <Scaffold
      scroll="body"
      topBarSpan="full"
      navigationForms={{ compact: 'drawer', medium: 'drawer' }}
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
