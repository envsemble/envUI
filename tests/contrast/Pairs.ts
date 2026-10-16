/**
 * The contrast gate's pair registry: every foreground envUI paints on a background, with the kind
 * of contrast WCAG 2.x asks of it. tests/browser/Contrast.spec.ts resolves each pair in every theme
 * of Themes.ts, in a real browser, and fails on any pair below the theme's minimum for its kind
 * that Exceptions.json doesn't list.
 *
 * - `fg` and each `bg` layer name a custom property: a semantic role (`--color-{bg|fg|border}-…`),
 *   or a component token where the component takes a different role per theme (`--color-row`,
 *   `--color-checkbox`…). Every color the gate measures is a token; nothing is composed at runtime.
 * - `bg` lists what the foreground sits on, nearest first. A translucent layer is composited over
 *   the next one, and the last over the theme's page. A translucent foreground is composited over
 *   its background before it is measured.
 * - `kind`: text (WCAG 1.4.3); non-text (1.4.11: icons, borders that are a control's only boundary,
 *   state indicators); focus (2.4.13: the ring against what it is drawn on, which is the surface
 *   behind an offset ring and the element's own fill behind an inset one). Themes.ts sets the
 *   minimum of each kind: 4.5, 3 and 3 at standard contrast, 7, 4.5 and 4.5 at high contrast.
 * - `contrast: 'high'` measures a pair only in the high-contrast themes, for boundaries that are
 *   decorative at standard contrast, such as dividers and the edges of elevated popups.
 * - Disabled states are exempt from 1.4.3 and 1.4.11, so none is listed.
 *
 * A pair is named `<fg> on <bg> over <next layer>`, which is also how Exceptions.json refers to it.
 */

export type ContrastKind = 'text' | 'non-text' | 'focus';

export interface ContrastPair {
  fg: string;
  bg: readonly string[];
  kind: ContrastKind;
  /** Measured only in the themes of this contrast; both when absent. */
  contrast?: 'high';
  note?: string;
}

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const;

/** The text color of each status tone; the neutral tone is muted text. */
const toneText = (tone: (typeof tones)[number]) =>
  tone === 'neutral'
    ? '--color-fg-muted'
    : tone === 'accent'
      ? '--color-fg-accent'
      : `--color-fg-${tone}`;

// Surfaces, by role.
const page = '--color-bg-page'; // the app frame, title bars, Surface background="page"
const surface = '--color-bg-default'; // Surface's default, sidebars, standard menus
const muted = '--color-bg-muted'; // Surface background="muted", radio rows
const raised = '--color-bg-raised'; // Surface background="raised", dialogs, rows on a contrasting surface
const popup = '--color-bg-popup'; // menus, Select lists, popovers, the composer
const field = '--color-bg-field';
const selected = '--color-bg-selected';
const fill = '--color-bg-neutral-muted'; // the translucent fill of tab rails, chips, secondary buttons
const layerHover = '--color-bg-neutral-subtle-hover';
const layerPressed = '--color-bg-neutral-subtle-pressed';
// Component tokens that take a different role per theme.
const row = '--color-row'; // List rows: the default surface in light, the muted one in dark
const actionStrip = '--color-action-strip';
// Navigation items: the default surface's states in light, the muted surface's in dark.
const navigationHover = '--color-navigation-quiet-hover';
const navigationPressed = '--color-navigation-quiet-pressed';

type Background = string | readonly string[];

function on(
  kind: ContrastKind,
  fg: string,
  backgrounds: readonly Background[],
  note?: string,
  contrast?: 'high',
): ContrastPair[] {
  return backgrounds.map((bg) => ({
    fg,
    bg: typeof bg === 'string' ? [bg] : bg,
    kind,
    ...(contrast ? { contrast } : {}),
    ...(note ? { note } : {}),
  }));
}

const text = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('text', fg, backgrounds, note);
const nonText = (
  fg: string,
  backgrounds: readonly Background[],
  note?: string,
  contrast?: 'high',
) => on('non-text', fg, backgrounds, note, contrast);
const focus = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('focus', fg, backgrounds, note);

export const pairs: readonly ContrastPair[] = [
  // Text on every surface role.
  ...text('--color-fg-default', [page, surface, muted, raised, popup]),
  ...text(
    '--color-fg-muted',
    [page, surface, muted, raised, popup],
    'Supporting text, icons, field descriptions, unchecked checkbox rings',
  ),
  ...text(
    '--color-fg-control',
    [page, surface],
    'Navigation labels, meter and slider values, the thumb of a switch that is off',
  ),
  ...text('--color-fg-default', [row, '--color-row-hover', '--color-row-pressed'], 'List rows'),
  ...text('--color-fg-muted', [row], 'List row details'),
  ...text(
    '--color-fg-default',
    ['--color-bg-popup-hover', '--color-bg-popup-pressed'],
    'Menu items and Select and Combobox options, highlighted and pressed',
  ),
  ...text('--color-fg-muted', ['--color-bg-popup-hover'], 'Menu item descriptions'),

  // Links and text buttons on every surface, and in their states.
  ...text('--color-fg-link', [page, surface, muted, raised, popup, row, actionStrip]),
  ...text('--color-fg-link-hover', [page, surface, muted]),
  ...text('--color-fg-link-pressed', [page, surface, muted]),
  ...text(
    '--color-fg-muted-hover',
    [page, surface],
    'Disclosure summaries and checkbox rings on hover',
  ),
  ...text('--color-fg-muted-pressed', [page, surface], 'Disclosure summaries on press'),

  // Actions: labels on their fills, at rest, hovered and pressed.
  ...text(
    '--color-fg-on-emphasis',
    [
      '--color-bg-brand-emphasis',
      '--color-bg-brand-emphasis-hover',
      '--color-bg-brand-emphasis-pressed',
    ],
    'Primary buttons and the chosen calendar day',
  ),
  ...text(
    '--color-fg-control',
    [
      [fill, page],
      ['--color-bg-neutral-muted-hover', page],
      ['--color-bg-neutral-muted-pressed', page],
      [fill, surface],
      ['--color-bg-neutral-muted-hover', surface],
      ['--color-bg-neutral-muted-pressed', surface],
      [fill, muted],
      ['--color-bg-neutral-muted-hover', muted],
      ['--color-bg-neutral-muted-pressed', muted],
      [fill, raised],
      ['--color-bg-neutral-muted-hover', raised],
      ['--color-bg-neutral-muted-pressed', raised],
      [fill, actionStrip],
    ],
    'Secondary buttons, and the thumb of a switch that is off on its track: the fill is translucent, so it is measured on each surface it sits on',
  ),
  ...text(
    '--color-fg-accent',
    [raised, '--color-bg-raised-hover', '--color-bg-raised-pressed'],
    'Outlined buttons and the icon of a pager link',
  ),
  ...text(
    '--color-fg-on-strong',
    [
      '--color-bg-danger-strong',
      '--color-bg-danger-strong-hover',
      '--color-bg-danger-strong-pressed',
    ],
    'Destructive buttons and error toasts',
  ),
  ...text(
    '--color-fg-on-strong',
    [
      '--color-bg-important-strong',
      '--color-bg-important-strong-hover',
      '--color-bg-important-strong-pressed',
    ],
    'Button variant="important"',
  ),
  ...text(
    '--color-fg-default',
    [
      [layerHover, page],
      [layerPressed, page],
      [layerHover, surface],
      [layerPressed, surface],
      [layerHover, fill, page],
    ],
    'Quiet buttons, menubar triggers and document tabs on hover and press, and hovered segments',
  ),

  // Fields.
  ...text('--color-fg-default', [field]),
  ...text(
    '--color-fg-muted',
    [field],
    'Labels, prefixes, suffixes, placeholders and icons in the field',
  ),
  ...text('--color-border-accent', [field], 'The label of a focused field'),
  ...text('--color-fg-danger', [field], 'The label and message of an invalid field'),
  ...text(
    '--color-fg-default',
    [
      [fill, page],
      [fill, surface],
      [fill, raised],
    ],
    'Quiet fields while focused, the command palette search, active document tabs, keyboard keys, counters and own messages',
  ),
  ...text(
    '--color-fg-muted',
    [
      [fill, page],
      [fill, surface],
      [fill, muted],
      [fill, popup],
      [fill, raised],
    ],
    'Unselected tabs and segments on their rail, keyboard keys in compact menus, table header cells and the command palette placeholder',
  ),
  ...nonText(
    '--color-border-default',
    [field, page, surface, muted, raised],
    'The only boundary of outlined fields, outlined buttons, Select triggers and the track of a switch that is off; DropZone and the empty stars of a Rating take it too',
  ),
  ...nonText(
    '--color-border-accent',
    [page, surface, popup],
    'The border of a focused field, and today’s ring in a calendar',
  ),
  ...nonText('--color-border-danger', [field, page, surface], 'The border of an invalid field'),
  ...nonText(
    '--color-border-muted',
    [page, surface, muted],
    'Dividers: decorative at standard contrast, boundaries at high contrast',
    'high',
  ),
  ...nonText(
    '--elevation-2-border',
    [popup, page, surface],
    'The edge of menus, Select lists and popovers: elevation separates them at standard contrast, the edge does at high contrast',
    'high',
  ),

  // Choice controls.
  ...text(
    '--color-fg-default',
    ['--color-bg-muted-hover', '--color-bg-muted-pressed'],
    'Radio rows',
  ),
  ...text('--color-fg-muted', ['--color-bg-muted-hover'], 'Radio row details'),
  ...nonText(
    '--color-bg-brand-emphasis',
    [page, surface, muted, '--color-bg-muted-hover', popup, '--color-bg-popup-hover', selected],
    'A chosen radio, also in a chosen row; check marks in menus and options; the chosen calendar day',
  ),
  ...nonText('--color-checkbox', [page, surface, muted], 'A checked checkbox'),
  ...nonText('--color-on-checkbox', [
    '--color-checkbox',
    '--color-checkbox-hover',
    '--color-checkbox-pressed',
  ]),
  ...nonText('--color-switch-on', [page, surface], 'The track of a switch that is on'),
  ...nonText('--color-switch-thumb-on', [
    '--color-switch-on',
    '--color-switch-on-hover',
    '--color-switch-on-pressed',
  ]),

  // Selection: menus, Select, the command palette, tabs, navigation, trees, tables.
  ...text(
    '--color-fg-control',
    [popup, '--color-bg-popup-hover', '--color-bg-popup-pressed', raised],
    'Select options; the command palette lists them on a dialog',
  ),
  ...text(
    '--color-fg-on-selected',
    [selected, '--color-bg-selected-hover', '--color-bg-selected-pressed'],
    'Selected navigation items, tabs, tree rows and Select options',
  ),
  ...text('--color-fg-default', [selected, '--color-bg-selected-hover'], 'Selected table rows'),
  ...text(
    '--color-fg-muted',
    [
      [layerHover, fill, page],
      [layerPressed, fill, page],
    ],
    'Unselected tabs on hover and press',
  ),
  ...text(
    '--color-fg-control',
    [
      [fill, fill, page],
      ['--color-bg-neutral-muted-hover', fill, page],
      [fill, fill, surface],
    ],
    'The active tab of a secondary tab rail',
  ),
  ...text(
    '--color-fg-control',
    [navigationHover, navigationPressed, [layerHover, page], [layerHover, surface]],
    'Navigation labels on hover and press',
  ),
  ...nonText('--color-fg-on-selected', [[fill, page]], 'The bar of the active document tab'),

  // Status tones as text, on their tints, and as fills for labels.
  // The neutral tone is muted text on the neutral fill, which the pairs above already measure.
  ...tones.flatMap((tone) => [
    ...(tone === 'neutral'
      ? []
      : text(toneText(tone), [
          page,
          surface,
          row,
          [`--color-bg-${tone}-muted`, page],
          [`--color-bg-${tone}-muted`, surface],
        ])),
    ...text('--color-fg-on-emphasis', [`--color-bg-${tone}-emphasis`], 'Solid badges and counters'),
  ]),
  ...(['accent', 'success', 'warning', 'danger'] as const).flatMap((tone) =>
    text('--color-fg-default', [[`--color-bg-${tone}-muted`, page]], `Alert tone="${tone}"`),
  ),
  ...text(
    '--color-fg-on-strong',
    ['--color-bg-neutral-strong', '--color-bg-success-strong', '--color-bg-info-strong'],
    'Toasts and tooltips, and the focus ring of a toast’s dismiss button',
  ),
  ...nonText(
    '--color-fg-on-strong',
    [
      '--color-bg-neutral-strong-hover',
      '--color-bg-success-strong-hover',
      '--color-bg-info-strong-hover',
    ],
    'A toast’s dismiss icon on hover',
  ),

  // Content.
  ...text(
    '--color-fg-accent',
    [
      [fill, page],
      [fill, surface],
    ],
    'Chips',
  ),
  ...text('--color-fg-default', [[fill, field]], 'Combobox chips'),
  ...text('--color-on-avatar', ['--color-avatar'], 'Avatar initials'),
  ...text(
    '--color-fg-default',
    ['--color-bg-raised-hover', '--color-bg-raised-pressed'],
    'Pager links and rows on a contrasting surface, hovered and pressed',
  ),
  ...text('--color-fg-muted', ['--color-bg-raised-hover'], 'Pager link captions on hover'),
  ...nonText(
    '--color-control-blue',
    [page, surface, [fill, page]],
    'Spinners, slider thumbs and indicators, and meter indicators on their track',
  ),

  // Focus rings, against what they are drawn on. Inset rings on solid fills add an inner ring in the
  // label's color, which the label pairs above measure.
  ...focus(
    '--color-border-focus',
    [page, surface, muted, raised, row, popup, field],
    'Offset rings sit on the surface around the control',
  ),
  ...focus(
    '--color-border-focus',
    [
      '--color-bg-popup-hover',
      selected,
      '--color-bg-selected-hover',
      navigationHover,
      '--color-bg-muted-hover',
      [fill, raised],
      [fill, fill, page],
    ],
    'Inset rings sit on the focused element: menu and Select options, navigation items, tree rows, row radios, the command palette search and tabs',
  ),
];

export function pairName(pair: Pick<ContrastPair, 'fg' | 'bg'>): string {
  return `${pair.fg} on ${pair.bg.join(' over ')}`;
}

/**
 * Colors the CSS composes from tokens where they are painted. None: every hover, pressed and
 * translucent color is a token of its own, so the gate measures what the browser paints. Keep it
 * empty; add a token instead.
 */
export const derived: Readonly<Record<string, string>> = {};

/** The CSS color a name in a pair stands for. */
export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
