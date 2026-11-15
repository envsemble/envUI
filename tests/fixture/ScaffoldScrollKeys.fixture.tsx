import { createElement } from 'react';
import { Menu, Menubar, Scaffold, TopBar } from '@envsemble/envui';
import { TallPage } from './Scaffold.fixture.js';

export const mount = 'standalone';

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

function attachPlainField(host: HTMLSpanElement | null) {
  if (!host || 'value' in host) return;
  const field = document.createElement('input');
  field.setAttribute('aria-label', 'Plain note');
  field.size = 12;
  host.attachShadow({ mode: 'closed', delegatesFocus: true }).append(field);
  Object.defineProperty(host, 'value', { get: () => field.value });
}

function NotesMenubar() {
  return (
    <Menubar.Root aria-label="Notes">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New note</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  );
}

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
          end={
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
