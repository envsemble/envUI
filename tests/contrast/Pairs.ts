/**
 * The contrast gate's pair registry: every foreground envUI paints on a background, with the
 * minimum WCAG 2.x ratio between them. tests/browser/Contrast.spec.ts resolves each pair in every
 * theme of Themes.ts, in a real browser, and fails on any pair below its minimum that
 * Exceptions.json doesn't list.
 *
 * - `fg` and each `bg` layer name a token (`--color-…`) or a color from `derived`.
 * - `bg` lists what the foreground sits on, nearest first. A translucent layer is composited over
 *   the next one, and the last over the theme's canvas. A translucent foreground is composited over
 *   its background before it is measured.
 * - `kind`: text needs 4.5:1 (WCAG 1.4.3); non-text needs 3:1 (1.4.11: icons, borders that are a
 *   control's only boundary, state indicators); focus needs 3:1 (2.4.13: the ring against what it
 *   is drawn on, which is the surface behind an offset ring and the element's own fill behind an
 *   inset one).
 * - Disabled states are exempt from 1.4.3 and 1.4.11, so none is listed.
 *
 * A pair is named `<fg> on <bg> over <next layer>`, which is also how Exceptions.json refers to it.
 * When tokens are renamed or become precomputed, update the names here and in Exceptions.json.
 */

export type ContrastKind = 'text' | 'non-text' | 'focus';

export interface ContrastPair {
  fg: string;
  bg: readonly string[];
  kind: ContrastKind;
  min: number;
  note?: string;
}

export const minimums: Readonly<Record<ContrastKind, number>> = {
  text: 4.5,
  'non-text': 3,
  focus: 3,
};

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const toastTones = ['neutral', 'success', 'info', 'error'] as const;

/**
 * Colors the CSS composes from tokens where they are painted, which have no token of their own
 * yet. Each name stands for the CSS color it lists, resolved inside the theme.
 */
export const derived: Readonly<Record<string, string>> = {
  // Menu.css: highlighted and pressed menu rows, and rows of a compact menu on the popup.
  'menu-row-hover': 'hsl(from var(--color-menu-row) h s var(--state-surface-hover-lightness))',
  'menu-row-pressed': 'hsl(from var(--color-menu-row) h s var(--state-surface-pressed-lightness))',
  'popup-hover': 'hsl(from var(--color-popup) h s var(--state-surface-hover-lightness))',
  'popup-pressed': 'hsl(from var(--color-popup) h s var(--state-surface-pressed-lightness))',
  // Pager.css: the link's fill on hover and press.
  'direction-link-hover': 'hsl(from var(--color-direction-link) h s var(--state-hover-lightness))',
  'direction-link-pressed':
    'hsl(from var(--color-direction-link) h s var(--state-pressed-lightness))',
  // Badge.css and Alert.css: the subtle fill of each tone.
  ...Object.fromEntries(
    tones.map((tone) => [
      `tone-${tone}-subtle`,
      `color-mix(in srgb, var(--color-tone-${tone}) var(--state-tone-subtle-opacity), transparent)`,
    ]),
  ),
  // Toast.css: the dismiss button's fill on hover.
  ...Object.fromEntries(
    toastTones.map((tone) => [
      `toast-${tone}-hover`,
      `hsl(from var(--color-toast-${tone}) h s var(--state-hover-lightness))`,
    ]),
  ),
};

// Surfaces, by role.
const canvas = '--color-canvas'; // the page, the app frame, title bars
const pane = '--color-pane'; // Surface's default, sidebars, the standard menu
const rowSurface = '--color-surface-muted'; // Surface tone="row"
const alternate = '--color-surface'; // Surface tone="alternate", a table's region
const row = '--color-row'; // List
const rowAlternate = '--color-row-alternate'; // rows on a contrasting pane
const menuRow = '--color-menu-row';
const popup = '--color-popup'; // popovers, Select lists, compact menus, the composer
const dialog = '--color-dialog'; // dialogs, the command palette, docked panels
const field = '--color-field';
const fill = '--color-fill'; // the translucent fill of tab rails, chips, segmented controls

type Background = string | readonly string[];

function on(
  kind: ContrastKind,
  fg: string,
  backgrounds: readonly Background[],
  note?: string,
): ContrastPair[] {
  return backgrounds.map((bg) => ({
    fg,
    bg: typeof bg === 'string' ? [bg] : bg,
    kind,
    min: minimums[kind],
    ...(note ? { note } : {}),
  }));
}

const text = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('text', fg, backgrounds, note);
const nonText = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('non-text', fg, backgrounds, note);
const focus = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('focus', fg, backgrounds, note);

export const pairs: readonly ContrastPair[] = [
  // Body text on every surface role.
  ...text('--color-text-primary', [canvas, pane, rowSurface, alternate, popup, dialog]),
  ...text('--color-text-muted', [canvas, pane, rowSurface, alternate, popup, dialog]),
  ...text('--color-text-quiet', [canvas, pane, rowSurface, alternate], 'Text tone="quiet"'),
  ...text('--color-text-strong', [canvas, pane], 'Meter and Slider values'),
  ...text('--color-row-text', [row, rowAlternate, '--color-row-hover', '--color-row-pressed']),
  ...text('--color-row-text', [menuRow, 'menu-row-hover', 'menu-row-pressed'], 'Menu items'),
  ...text('--color-row-detail', [row, rowAlternate, menuRow, 'menu-row-hover']),
  ...text(
    '--color-text-primary',
    ['popup-hover', 'popup-pressed', '--color-select-option-hover'],
    'Compact menus and Select lists, and Combobox options',
  ),
  ...text(
    '--color-icon',
    [canvas, pane, rowSurface],
    'Quiet buttons take the icon color for their labels too',
  ),
  ...nonText('--color-icon', [menuRow, popup, dialog], 'Icons in menus, chips and docked panels'),

  // Links and text buttons on every surface, and in their states.
  ...text('--color-link', [canvas, pane, rowSurface, alternate, row, rowAlternate, menuRow]),
  ...text('--color-link', [popup, dialog, '--color-action-strip']),
  ...text('--color-link-hover', [canvas, pane, rowSurface]),
  ...text('--color-link-pressed', [canvas, pane, rowSurface]),
  ...text('--color-disclosure-text', [canvas, pane], 'Disclosure'),
  ...text('--color-quiet-label-hover', [canvas, pane], 'Disclosure summary on hover'),
  ...text('--color-quiet-label-pressed', [canvas, pane], 'Disclosure summary on press'),

  // Actions: labels on their fills, at rest, hovered and pressed.
  ...text('--color-on-primary-action', [
    '--color-primary-action',
    '--color-primary-action-hover',
    '--color-primary-action-pressed',
  ]),
  ...text(
    '--color-on-secondary-action',
    [
      ['--color-secondary-action', canvas],
      ['--color-secondary-action-hover', canvas],
      ['--color-secondary-action-pressed', canvas],
      ['--color-secondary-action', pane],
      ['--color-secondary-action-hover', pane],
      ['--color-secondary-action-pressed', pane],
      ['--color-secondary-action', rowSurface],
      ['--color-secondary-action-hover', rowSurface],
      ['--color-secondary-action-pressed', rowSurface],
      ['--color-secondary-action', dialog],
      ['--color-secondary-action-hover', dialog],
      ['--color-secondary-action-pressed', dialog],
      ['--color-secondary-action', '--color-action-strip'],
    ],
    'The secondary fill is translucent, so it is measured on each surface it sits on',
  ),
  ...text('--color-on-subtle-action', [
    '--color-subtle-action',
    '--color-subtle-action-hover',
    '--color-subtle-action-pressed',
  ]),
  ...text('--color-on-destructive-action', [
    '--color-destructive-action',
    '--color-destructive-action-hover',
    '--color-destructive-action-pressed',
  ]),
  ...text(
    '--color-on-accent',
    ['--color-accent', '--color-accent-hover', '--color-accent-pressed'],
    'Button variant="important"',
  ),
  ...text(
    '--color-text-primary',
    [
      ['--color-state-layer-hover', canvas],
      ['--color-state-layer-pressed', canvas],
      ['--color-state-layer-hover', pane],
      ['--color-state-layer-pressed', pane],
    ],
    'Quiet buttons, menubar triggers and document tabs on hover and press',
  ),

  // Fields.
  ...text('--color-field-text', [field]),
  ...text('--color-field-label', [field], 'Labels, prefixes, suffixes and icons in the field'),
  ...text('--color-field-placeholder', [field]),
  ...text('--color-field-active', [field], 'The label of a focused field'),
  ...text('--color-field-hint', [canvas, pane, rowSurface], 'Hints sit below the field'),
  ...text('--color-field-error', [field, canvas, pane, rowSurface], 'Error messages'),
  ...text(
    '--color-field-text',
    [
      [fill, canvas],
      [fill, pane],
      [fill, dialog],
    ],
    'Quiet fields while focused, and the command palette search',
  ),
  ...text('--color-field-placeholder', [[fill, dialog]], 'The command palette search'),
  ...nonText(
    '--color-field-border',
    [field, canvas, pane, rowSurface],
    "The border is an outlined field's boundary; DropZone uses it too",
  ),
  // The focused and invalid borders on the field itself are held to 4.5 above, as label and message.
  ...nonText('--color-field-active', [canvas, pane], 'The border of a focused field'),

  // Outlined controls and popups: the border is the boundary.
  ...nonText(
    '--color-subtle-action-border',
    ['--color-subtle-action', canvas, pane],
    'Outlined buttons and Select triggers',
  ),
  ...nonText(
    '--color-popup-border',
    [popup, canvas, pane],
    'Menus, Select lists, popovers and the composer',
  ),

  // Choice controls.
  ...text('--color-radio-text', [
    canvas,
    pane,
    '--color-radio-row',
    '--color-radio-row-hover',
    '--color-radio-row-pressed',
  ]),
  ...text('--color-radio-detail', ['--color-radio-row', '--color-radio-row-hover']),
  ...text('--color-checkbox-text', [canvas, pane]),
  ...text('--color-switch-text', [canvas, pane]),
  ...nonText(
    '--color-radio',
    [canvas, pane, '--color-radio-row', '--color-radio-row-hover'],
    'A chosen radio; the chosen row of a row radio group takes the hover fill',
  ),
  ...nonText('--color-checkbox-border', [canvas, pane, rowSurface, menuRow]),
  ...nonText('--color-checkbox', [canvas, pane, rowSurface], 'A checked checkbox'),
  ...nonText('--color-on-checkbox', [
    '--color-checkbox',
    '--color-checkbox-hover',
    '--color-checkbox-pressed',
  ]),
  ...nonText('--color-switch-off', [canvas, pane], 'The track of a switch that is off'),
  ...nonText(
    '--color-switch-thumb',
    [
      ['--color-switch-off', canvas],
      ['--color-switch-off', pane],
    ],
    'The thumb of a switch that is off',
  ),
  ...nonText('--color-switch-on', [canvas, pane], 'The track of a switch that is on'),
  ...nonText('--color-switch-thumb-on', [
    '--color-switch-on',
    '--color-switch-on-hover',
    '--color-switch-on-pressed',
  ]),

  // Selection: menus, Select, the command palette, tabs, navigation, trees, tables, calendars.
  ...text('--color-select-option-text', [
    '--color-select-option',
    '--color-select-option-hover',
    '--color-select-option-pressed',
    dialog,
  ]),
  ...text(
    '--color-on-select-selected',
    ['--color-select-selected', '--color-select-selected-hover', '--color-select-selected-pressed'],
    'Selected Select options and the highlighted command palette option',
  ),
  ...nonText(
    '--color-radio',
    [menuRow, 'menu-row-hover', popup, '--color-select-selected'],
    'Check marks in menus, Select and Combobox options',
  ),
  ...text(
    '--color-text-muted',
    [
      [fill, canvas],
      [fill, pane],
      [fill, rowSurface],
      [fill, popup],
    ],
    'Unselected tabs and segments on their rail, and keyboard keys in compact menus',
  ),
  ...text(
    '--color-text-muted',
    [
      ['--color-state-layer-hover', fill, canvas],
      ['--color-state-layer-pressed', fill, canvas],
    ],
    'Unselected tabs on hover and press',
  ),
  ...text(
    '--color-text-primary',
    [
      [fill, canvas],
      [fill, pane],
      ['--color-state-layer-hover', fill, canvas],
    ],
    'Active document tabs, keyboard keys, counters, own messages and hovered segments',
  ),
  ...text(
    '--color-on-secondary-action',
    [
      ['--color-secondary-action', fill, canvas],
      ['--color-secondary-action-hover', fill, canvas],
      ['--color-secondary-action', fill, pane],
    ],
    'The active tab of a secondary tab rail',
  ),
  ...text('--color-navigation-text', [
    canvas,
    pane,
    '--color-navigation-quiet-hover',
    '--color-navigation-quiet-pressed',
    ['--color-state-layer-hover', canvas],
    ['--color-state-layer-hover', pane],
  ]),
  ...nonText('--color-navigation-icon', [canvas, pane]),
  ...text(
    '--color-on-navigation-selected',
    [
      '--color-navigation-selected',
      '--color-navigation-hover',
      '--color-navigation-pressed',
      '--color-row-selected-hover',
      '--color-row-selected-pressed',
    ],
    'Selected navigation items, tabs and tree rows',
  ),
  ...text(
    '--color-text-primary',
    ['--color-navigation-selected', '--color-row-selected-hover'],
    'Selected table rows',
  ),
  ...nonText(
    '--color-on-navigation-selected',
    [[fill, canvas]],
    'The bar of the active document tab; a selected table row is held to 4.5 above',
  ),
  ...text('--color-text-muted', [[fill, alternate]], 'Table header cells'),
  ...text('--color-on-calendar-selected', ['--color-calendar-selected']),
  ...nonText(
    '--color-calendar-selected',
    [popup, canvas, pane],
    'The chosen day stands out from its surface',
  ),
  ...nonText('--color-calendar-today', [popup, canvas, pane], "Today's ring"),

  // Status tones as text, on their subtle fills, and as fills for on-tone labels.
  ...tones.flatMap((tone) => [
    ...text(`--color-tone-${tone}`, [
      canvas,
      pane,
      row,
      [`tone-${tone}-subtle`, canvas],
      [`tone-${tone}-subtle`, pane],
    ]),
    ...text('--color-on-tone', [`--color-tone-${tone}`], 'Solid badges and counters'),
  ]),
  ...(['accent', 'success', 'warning', 'danger'] as const).flatMap((tone) =>
    text(
      '--color-text-primary',
      [[`tone-${tone}-subtle`, canvas]],
      `Alert tone="${tone === 'danger' ? 'error' : tone === 'accent' ? 'info' : tone}"`,
    ),
  ),
  ...nonText(
    '--color-border-strong',
    [canvas, pane],
    'The empty stars of a Rating, which show its scale',
  ),
  ...toastTones.flatMap((tone) => [
    ...text(
      '--color-on-toast',
      [`--color-toast-${tone}`],
      'Toasts and the focus ring of their dismiss button; tooltips use the neutral one',
    ),
    ...nonText('--color-on-toast', [`toast-${tone}-hover`], 'A toast dismiss icon on hover'),
  ]),

  // Content.
  ...text('--color-chip-text', [
    ['--color-chip', canvas],
    ['--color-chip', pane],
  ]),
  ...text('--color-field-text', [['--color-chip', field]], 'Combobox chips'),
  ...text('--color-on-avatar', ['--color-avatar'], 'Avatar initials'),
  ...text('--color-direction-link-text', [
    '--color-direction-link',
    'direction-link-hover',
    'direction-link-pressed',
  ]),
  ...text('--color-direction-link-label', ['--color-direction-link', 'direction-link-hover']),
  ...nonText('--color-direction-link-icon', ['--color-direction-link', 'direction-link-hover']),
  ...nonText(
    '--color-control-blue',
    [canvas, pane, [fill, canvas]],
    'Spinners, Slider thumbs and indicators, and Meter indicators on their track',
  ),

  // Focus rings, against what they are drawn on.
  ...focus(
    '--color-focus-ring',
    [canvas, pane, rowSurface, alternate, row, popup, dialog, field],
    'Offset rings sit on the surface around the control',
  ),
  ...focus(
    '--color-focus-ring',
    [
      'menu-row-hover',
      '--color-select-option-hover',
      '--color-select-selected',
      '--color-navigation-selected',
      '--color-navigation-quiet-hover',
      '--color-radio-row-hover',
      [fill, dialog],
      ['--color-secondary-action', fill, canvas],
    ],
    'Inset rings sit on the focused element: menu and Select options, navigation items, tree rows, row radios, the command palette search and tabs',
  ),
  ...focus(
    '--color-focus-ring',
    ['--color-primary-action'],
    'Inset rings on an active primary tab and on a primary button in a ButtonGroup',
  ),
  ...focus('--color-outlined-focus', [canvas, pane], 'Outlined buttons'),
];

export function pairName(pair: Pick<ContrastPair, 'fg' | 'bg'>): string {
  return `${pair.fg} on ${pair.bg.join(' over ')}`;
}

/** The CSS color a name in a pair stands for. */
export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
