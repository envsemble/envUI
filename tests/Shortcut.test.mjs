// internal/useShortcut: parsing, matching on Apple platforms and elsewhere, display, editable
// targets, and the registry that gives a combination to one handler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const repository = fileURLToPath(new URL('../', import.meta.url));
const output = join(repository, '.cache/unit/Shortcut.mjs');
await build({
  absWorkingDir: repository,
  entryPoints: [join(repository, 'packages/ui/src/internal/useShortcut.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: output,
  logLevel: 'error',
});
const {
  parseShortcut,
  matchesShortcut,
  formatShortcut,
  isEditableTarget,
  isApplePlatform,
  registerShortcut,
  dispatchShortcut,
} = await import(pathToFileURL(output).href);

/** A keydown event as the browser fires it, without modifiers unless given. */
function keydown(key, init = {}) {
  const event = {
    key,
    code: init.code ?? (/^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : ''),
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    isComposing: false,
    defaultPrevented: false,
    target: init.target ?? null,
    composedPath: () => (init.target ? [init.target] : []),
    preventDefault() {
      this.defaultPrevented = true;
    },
    ...init,
  };
  return event;
}

test('a shortcut parses into its modifiers and its key', () => {
  assert.deepEqual(parseShortcut('mod+b'), {
    key: 'b',
    mod: true,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  });
  assert.deepEqual(parseShortcut(' Ctrl+Shift+P '), {
    key: 'p',
    mod: false,
    ctrl: true,
    meta: false,
    alt: false,
    shift: true,
  });
  assert.equal(parseShortcut('mod++').key, '+');
  assert.equal(parseShortcut('+').key, '+');
  assert.equal(parseShortcut('esc').key, 'escape');
  assert.equal(parseShortcut('alt+up').key, 'arrowup');
  assert.equal(parseShortcut('space').key, ' ');
  assert.equal(parseShortcut('cmd+option+k').meta, true);
  assert.throws(() => parseShortcut('hyper+k'), /unknown modifier "hyper"/);
  assert.throws(() => parseShortcut(''), /names no key/);
});

test('mod is Meta on Apple platforms and Control elsewhere, and modifiers match exactly', () => {
  const apple = true;
  const other = false;
  assert.ok(matchesShortcut(keydown('b', { metaKey: true }), 'mod+b', apple));
  assert.ok(!matchesShortcut(keydown('b', { ctrlKey: true }), 'mod+b', apple));
  assert.ok(matchesShortcut(keydown('b', { ctrlKey: true }), 'mod+b', other));
  assert.ok(!matchesShortcut(keydown('b', { metaKey: true }), 'mod+b', other));
  // Extra modifiers are another shortcut.
  assert.ok(!matchesShortcut(keydown('B', { ctrlKey: true, shiftKey: true }), 'mod+b', other));
  assert.ok(matchesShortcut(keydown('B', { ctrlKey: true, shiftKey: true }), 'mod+shift+b', other));
  assert.ok(!matchesShortcut(keydown('b'), 'mod+b', other));
  assert.ok(matchesShortcut(keydown('Escape'), 'escape', other));
  assert.ok(matchesShortcut(keydown('ArrowUp', { altKey: true }), 'alt+up', other));
  // Shift is free for a symbol, which takes it on some layouts and not on others.
  assert.ok(matchesShortcut(keydown('?', { shiftKey: true }), '?', other));
  assert.ok(matchesShortcut(keydown('+', { ctrlKey: true, shiftKey: true }), 'mod++', other));
});

test('a key that types another character matches by its physical key, unless it types a Latin letter', () => {
  // Option+B types ∫ on a Mac; a Cyrillic layout types и on the B key.
  assert.ok(matchesShortcut(keydown('∫', { altKey: true, code: 'KeyB' }), 'alt+b', true));
  assert.ok(matchesShortcut(keydown('и', { ctrlKey: true, code: 'KeyB' }), 'mod+b', false));
  assert.ok(matchesShortcut(keydown('!', { ctrlKey: true, code: 'Digit1' }), 'mod+1', false));
  // Dvorak types x on the B key: Ctrl+X is cut, not Mod+B.
  assert.ok(!matchesShortcut(keydown('x', { ctrlKey: true, code: 'KeyB' }), 'mod+b', false));
});

test('a shortcut shows as the platform writes it and announces as aria-keyshortcuts', () => {
  assert.deepEqual(formatShortcut('mod+k', true), {
    keys: ['⌘', 'K'],
    label: '⌘K',
    ariaKeyShortcuts: 'Meta+K',
  });
  assert.deepEqual(formatShortcut('mod+k', false), {
    keys: ['Ctrl', 'K'],
    label: 'Ctrl+K',
    ariaKeyShortcuts: 'Control+K',
  });
  assert.deepEqual(formatShortcut('mod+shift+alt+p', true).keys, ['⌥', '⇧', '⌘', 'P']);
  assert.equal(formatShortcut('mod+shift+alt+p', false).label, 'Ctrl+Alt+Shift+P');
  assert.equal(formatShortcut('mod+shift+alt+p', false).ariaKeyShortcuts, 'Control+Alt+Shift+P');
  assert.equal(formatShortcut('alt+arrowdown', false).ariaKeyShortcuts, 'Alt+ArrowDown');
  assert.equal(formatShortcut('alt+arrowdown', false).label, 'Alt+↓');
  assert.equal(formatShortcut('shift+pagedown', false).ariaKeyShortcuts, 'Shift+PageDown');
  assert.equal(formatShortcut('mod++', false).ariaKeyShortcuts, 'Control+Plus');
  assert.equal(formatShortcut('escape', true).label, 'Esc');
});

test('outside a browser the platform is not Apple', () => {
  assert.equal(isApplePlatform(), false);
});

/** A stand-in for an element, as isEditableTarget and the registry read it. */
function element(tagName, { type, editable = false, inEditable = false, visible = true } = {}) {
  return {
    tagName,
    type,
    isContentEditable: editable || inEditable,
    isConnected: true,
    closest: () => (inEditable ? {} : null),
    checkVisibility: () => visible,
  };
}

test('text fields and editable content take typing; checkboxes and buttons do not', () => {
  assert.ok(isEditableTarget(element('INPUT', { type: 'text' })));
  assert.ok(isEditableTarget(element('INPUT', { type: 'search' })));
  assert.ok(isEditableTarget(element('TEXTAREA')));
  assert.ok(isEditableTarget(element('DIV', { editable: true })));
  assert.ok(isEditableTarget(element('P', { inEditable: true })));
  assert.ok(!isEditableTarget(element('INPUT', { type: 'checkbox' })));
  assert.ok(!isEditableTarget(element('BUTTON')));
  assert.ok(!isEditableTarget(null));
  assert.ok(!isEditableTarget({}));
});

test('the most recently registered available handler gets a combination, and only it', () => {
  const calls = [];
  const first = registerShortcut('mod+k', () => calls.push('first'));
  const hidden = { current: element('BUTTON', { visible: false }) };
  const second = registerShortcut('mod+k', () => calls.push('second'));
  const third = registerShortcut('mod+k', () => calls.push('third'), { element: hidden });
  const other = registerShortcut('mod+j', () => calls.push('other'));
  try {
    const event = keydown('k', { ctrlKey: true });
    assert.equal(dispatchShortcut(event, false), true);
    // The hidden one is skipped; the one before it takes the key and prevents the default.
    assert.deepEqual(calls, ['second']);
    assert.equal(event.defaultPrevented, true);
    second();
    dispatchShortcut(keydown('k', { ctrlKey: true }), false);
    assert.deepEqual(calls, ['second', 'first']);
    // An element that isn't rendered counts as hidden too.
    hidden.current = null;
    dispatchShortcut(keydown('k', { ctrlKey: true }), false);
    assert.deepEqual(calls, ['second', 'first', 'first']);
    hidden.current = element('BUTTON');
    dispatchShortcut(keydown('k', { ctrlKey: true }), false);
    assert.deepEqual(calls, ['second', 'first', 'first', 'third']);
  } finally {
    first();
    second();
    third();
    other();
  }
  assert.equal(dispatchShortcut(keydown('k', { ctrlKey: true }), false), false);
});

test('a shortcut skips handled events, repeats and typing unless asked', () => {
  const calls = [];
  const unregister = registerShortcut('mod+b', (event) => calls.push(event.key));
  const field = element('INPUT', { type: 'text' });
  try {
    const handled = keydown('b', { ctrlKey: true });
    handled.preventDefault();
    assert.equal(dispatchShortcut(handled, false), false);
    assert.equal(dispatchShortcut(keydown('b', { ctrlKey: true, repeat: true }), false), false);
    assert.equal(
      dispatchShortcut(keydown('b', { ctrlKey: true, isComposing: true }), false),
      false,
    );
    const typing = keydown('b', { ctrlKey: true, target: field });
    assert.equal(dispatchShortcut(typing, false), false);
    // The editor keeps its own Mod+B: the event's default stays.
    assert.equal(typing.defaultPrevented, false);
    assert.deepEqual(calls, []);
  } finally {
    unregister();
  }
  const anywhere = registerShortcut('mod+b', (event) => calls.push(event.key), {
    allowInEditable: true,
    allowRepeat: true,
  });
  try {
    assert.ok(dispatchShortcut(keydown('b', { ctrlKey: true, target: field }), false));
    assert.ok(dispatchShortcut(keydown('b', { ctrlKey: true, repeat: true }), false));
    assert.deepEqual(calls, ['b', 'b']);
  } finally {
    anywhere();
  }
});
