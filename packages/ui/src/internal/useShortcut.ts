'use client';

import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';

/**
 * Keyboard shortcuts that work across the window, such as Mod+B or Mod+K: parsing, matching and
 * display, and a registry that gives each key combination to one handler.
 *
 * A shortcut is written as its modifiers and its key joined by `+`, case-insensitively:
 * `mod+b`, `mod+shift+p`, `alt+arrowup`, `escape`, `mod++`. `mod` is Meta (⌘) on Apple platforms
 * and Control elsewhere; `ctrl`, `meta`, `alt` and `shift` are the keys themselves. The key is a
 * KeyboardEvent.key value, such as a letter, a digit, `enter` or `arrowdown`, or one of the
 * aliases `esc`, `space`, `del`, `return`, `up`, `down`, `left`, `right` and `plus`.
 */
export interface Shortcut {
  /** The key, lowercase, as KeyboardEvent.key names it: `b`, `+`, `enter`, `arrowdown`, ` `. */
  key: string;
  /** Meta on Apple platforms, Control elsewhere. */
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

type Modifier = Exclude<keyof Shortcut, 'key'>;

const modifierNames: Record<string, Modifier> = {
  mod: 'mod',
  ctrl: 'ctrl',
  control: 'ctrl',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  alt: 'alt',
  option: 'alt',
  shift: 'shift',
};

const keyAliases: Record<string, string> = {
  esc: 'escape',
  space: ' ',
  spacebar: ' ',
  del: 'delete',
  return: 'enter',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
};

/** Parses a shortcut such as `mod+shift+k`; throws on an unknown modifier or a missing key. */
export function parseShortcut(shortcut: string): Shortcut {
  // A + that ends the text is the key itself, as in `mod++`.
  const parts = shortcut
    .trim()
    .toLowerCase()
    .split(/\+(?=.)/);
  const key = parts.pop();
  if (!key) throw new Error(`The shortcut "${shortcut}" names no key.`);
  const parsed: Shortcut = {
    key: keyAliases[key] ?? key,
    mod: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  };
  for (const part of parts) {
    const modifier = modifierNames[part];
    if (!modifier) throw new Error(`The shortcut "${shortcut}" has an unknown modifier "${part}".`);
    parsed[modifier] = true;
  }
  return parsed;
}

const parsedShortcuts = new Map<string, Shortcut>();
const parsedOnce = (shortcut: string | Shortcut) => {
  if (typeof shortcut !== 'string') return shortcut;
  let parsed = parsedShortcuts.get(shortcut);
  if (!parsed) parsedShortcuts.set(shortcut, (parsed = parseShortcut(shortcut)));
  return parsed;
};

/** Whether the browser runs on an Apple platform, where `mod` is ⌘; false outside a browser. */
export function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  const { userAgentData } = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /mac|iphone|ipad|ipod/i.test(userAgentData?.platform || navigator.platform || '');
}

const noSubscription = () => () => {};
const notApple = () => false;

/**
 * isApplePlatform() for rendering: false on the server and while hydrating, so the markup matches,
 * then the browser's answer.
 */
export function useApplePlatform() {
  return useSyncExternalStore(noSubscription, isApplePlatform, notApple);
}

/** Whether a key event presses a shortcut: exactly its modifiers, and its key. */
export function matchesShortcut(
  event: Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
  shortcut: string | Shortcut,
  apple = isApplePlatform(),
) {
  const { key, mod, ctrl, meta, alt, shift } = parsedOnce(shortcut);
  if (event.ctrlKey !== (ctrl || (mod && !apple))) return false;
  if (event.metaKey !== (meta || (mod && apple))) return false;
  if (event.altKey !== alt) return false;
  const pressed = event.key.toLowerCase();
  // A symbol takes Shift on some layouts and not on others, such as ? or +, so Shift is free there.
  const symbol = key.length === 1 && !/[\p{L}\p{N} ]/u.test(key);
  if (event.shiftKey !== shift && !symbol) return false;
  if (pressed === key) return true;
  // Option on a Mac and non-Latin layouts type another character; the physical key of a letter or
  // a digit still names it. A Latin layout, such as Dvorak, keeps its own letters.
  if (/^[a-z]$/.test(pressed)) return false;
  if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`;
  if (/^\d$/.test(key)) return event.code === `Digit${key}`;
  return false;
}

const textInputTypes = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'time',
  'week',
]);

/**
 * Whether an event target takes typing: a text input, a textarea or editable content. A checkbox,
 * a button or a select does not, so a shortcut still works while one of them has focus.
 */
export function isEditableTarget(target: EventTarget | null | undefined) {
  if (!target || typeof (target as Element).closest !== 'function') return false;
  const element = target as HTMLElement;
  if (element.tagName === 'TEXTAREA') return true;
  if (element.tagName === 'INPUT') return textInputTypes.has((element as HTMLInputElement).type);
  return (
    element.isContentEditable === true ||
    element.closest('[contenteditable]:not([contenteditable="false"])') !== null
  );
}

const appleKeys: Record<Modifier, string> = {
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
  meta: '⌘',
  mod: '⌘',
};
const otherKeys: Record<Modifier, string> = {
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  mod: 'Ctrl',
};
const ariaModifiers: Record<Modifier, string> = {
  ctrl: 'Control',
  alt: 'Alt',
  shift: 'Shift',
  meta: 'Meta',
  mod: 'Control',
};
const keyLabels: Record<string, string> = {
  ' ': 'Space',
  escape: 'Esc',
  enter: 'Enter',
  delete: 'Del',
  backspace: 'Backspace',
  tab: 'Tab',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};
const ariaKeys: Record<string, string> = { ' ': 'Space', '+': 'Plus' };

/** A named key as KeyboardEvent.key spells it: `arrowup` as ArrowUp, `pagedown` as PageDown. */
function keyName(key: string) {
  return key
    .replace(/^(arrow|page)(\w)/, (_, word: string, letter: string) => word + letter.toUpperCase())
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export interface ShortcutDisplay {
  /** Each key as it is shown, modifiers first: `['⌘', 'K']`, `['Ctrl', 'Shift', 'P']`. */
  keys: string[];
  /** The keys as one label: `⌘K` on Apple platforms, `Ctrl+K` elsewhere. */
  label: string;
  /** The value of aria-keyshortcuts: `Meta+K`, `Control+Shift+P`. */
  ariaKeyShortcuts: string;
}

/**
 * How a shortcut is shown and announced on a platform: ⌃⌥⇧⌘ in Apple's order on Apple platforms,
 * Ctrl, Alt and Shift joined by + elsewhere.
 */
export function formatShortcut(
  shortcut: string | Shortcut,
  apple = isApplePlatform(),
): ShortcutDisplay {
  const parsed = parsedOnce(shortcut);
  const order: Modifier[] = apple
    ? ['ctrl', 'alt', 'shift', 'meta']
    : ['ctrl', 'meta', 'alt', 'shift'];
  const modifiers = order.filter(
    (modifier) => parsed[modifier] || (parsed.mod && modifier === (apple ? 'meta' : 'ctrl')),
  );
  const single = parsed.key.length === 1;
  const keys = [
    ...modifiers.map((modifier) => (apple ? appleKeys : otherKeys)[modifier]),
    keyLabels[parsed.key] ?? (single ? parsed.key.toUpperCase() : keyName(parsed.key)),
  ];
  return {
    keys,
    label: keys.join(apple ? '' : '+'),
    ariaKeyShortcuts: [
      ...modifiers.map((modifier) => ariaModifiers[modifier]),
      ariaKeys[parsed.key] ?? (single ? parsed.key.toUpperCase() : keyName(parsed.key)),
    ].join('+'),
  };
}

export interface ShortcutOptions {
  /** False leaves the shortcut unregistered, so the key does what it would without it. Default true. */
  enabled?: boolean;
  /** Also while typing in a text field, a textarea or editable content. Default false. */
  allowInEditable?: boolean;
  /** Also for the repeats of a held key. Default false. */
  allowRepeat?: boolean;
  /**
   * The element the shortcut belongs to, such as the button it presses: while that element is
   * missing, hidden (checkVisibility()), or behind a modal dialog (inert or aria-hidden), the
   * shortcut gives the key to the one registered before it for the same combination.
   */
  element?: RefObject<Element | null>;
}

interface Registration {
  shortcut: Shortcut;
  handler: (event: KeyboardEvent) => void;
  options: ShortcutOptions;
}

const registrations: Registration[] = [];

/**
 * Marks of content people can't reach: inert, and the aria-hidden and data-base-ui-inert that a
 * modal dialog puts on the rest of the page instead of inert.
 */
const unreachable = '[inert],[aria-hidden="true"],[data-base-ui-inert]';

/**
 * Whether a registration can take its key now: it has no element, or one that is rendered,
 * visible and not behind a modal dialog.
 */
function available({ options }: Registration) {
  if (!options.element) return true;
  const element = options.element.current;
  if (!element || !element.isConnected) return false;
  if (typeof element.closest === 'function' && element.closest(unreachable)) return false;
  return typeof element.checkVisibility === 'function'
    ? element.checkVisibility({ visibilityProperty: true })
    : true;
}

/**
 * Hands a key event to the shortcut registered for its combination: the most recently registered
 * one that is available. That one alone decides; when it skips the event, because the event comes
 * from an editable target or repeats, nothing else gets it. An event that something already
 * handled (defaultPrevented) or that composes text is left alone. Returns whether a handler ran.
 */
export function dispatchShortcut(event: KeyboardEvent, apple = isApplePlatform()) {
  if (event.defaultPrevented || event.isComposing) return false;
  let registration: Registration | undefined;
  for (let index = registrations.length - 1; index >= 0; index--) {
    const candidate = registrations[index]!;
    if (matchesShortcut(event, candidate.shortcut, apple) && available(candidate)) {
      registration = candidate;
      break;
    }
  }
  if (!registration) return false;
  if (event.repeat && !registration.options.allowRepeat) return false;
  const target = event.composedPath?.()[0] ?? event.target;
  if (!registration.options.allowInEditable && isEditableTarget(target)) return false;
  event.preventDefault();
  registration.handler(event);
  return true;
}

const onKeyDown = (event: KeyboardEvent) => {
  dispatchShortcut(event);
};

/**
 * Registers a handler for a shortcut until the returned function is called. The window listens
 * while anything is registered, in the bubbling phase, so a handler of the focused element that
 * prevents the default, as an editor's own Mod+B does, takes the key first.
 */
export function registerShortcut(
  shortcut: string | Shortcut,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  const registration: Registration = { shortcut: parsedOnce(shortcut), handler, options };
  registrations.push(registration);
  if (registrations.length === 1 && typeof window !== 'undefined')
    window.addEventListener('keydown', onKeyDown);
  return () => {
    const index = registrations.indexOf(registration);
    if (index === -1) return;
    registrations.splice(index, 1);
    if (registrations.length === 0 && typeof window !== 'undefined')
      window.removeEventListener('keydown', onKeyDown);
  };
}

/**
 * Calls `handler` when the shortcut is pressed anywhere in the window, while the component is
 * mounted. With several components registering one combination, the most recently mounted one
 * that is available gets it. `false` or no shortcut registers nothing. The handler and the options
 * are read when the key is pressed, so they can change on every render.
 */
export function useShortcut(
  shortcut: string | false | null | undefined,
  handler: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {},
) {
  const latest = useRef({ handler, options });
  useEffect(() => {
    latest.current = { handler, options };
  });
  const enabled = options.enabled ?? true;
  useEffect(() => {
    if (!shortcut || !enabled) return;
    const live: ShortcutOptions = {
      get allowInEditable() {
        return latest.current.options.allowInEditable;
      },
      get allowRepeat() {
        return latest.current.options.allowRepeat;
      },
      get element() {
        return latest.current.options.element;
      },
    };
    return registerShortcut(shortcut, (event) => latest.current.handler(event), live);
  }, [shortcut, enabled]);
}
