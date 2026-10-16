/**
 * The contrast gate's pair registry: every foreground envUI paints on a background, with the kind
 * of contrast WCAG 2.x asks of it, and every pair of state fills that must look different.
 * tests/browser/Contrast.spec.ts resolves each pair in every theme of Themes.ts, in a real browser,
 * and fails on any pair below the theme's minimum for its kind that Exceptions.json doesn't list.
 *
 * - `fg` and each `bg` layer name a custom property: a semantic role (`--color-{bg|fg|border}-…`),
 *   or a component token where the component takes a different role per theme (`--color-row`,
 *   `--color-checkbox`…). The few colors a component still composes where it paints, because they
 *   depend on something no token can name, are listed in `derived` below and measured like tokens.
 * - `bg` lists what the foreground sits on, nearest first. A translucent layer is composited over
 *   the next one, and the last over the theme's page. A translucent foreground is composited over
 *   its background before it is measured.
 * - `kind`: text (WCAG 1.4.3); non-text (1.4.11: icons, borders that are a control's only boundary,
 *   state indicators); focus (2.4.13: the ring against what it is drawn on, which is the surface
 *   behind an offset ring and the element's own fill behind an inset one); and two kinds measured
 *   as their OKLab distance, ΔEOK, rather than a ratio: difference (a state fill against its own
 *   rest or the surface it borders, such as a hovered row against its table) and distinct (two
 *   states of different items that mean different things, such as the selection and another item
 *   under the pointer, or two labels). Themes.ts sets the minimum of each kind and says why: 4.5, 3
 *   and 3 at standard contrast and 7, 4.5 and 4.5 at high contrast for the ratios, ΔEOK 0.02 for a
 *   difference, and ΔEOK 0.03, 0.04 at high contrast, for a distinct pair.
 * - A pair that departs from those rules says why in its `rationale`: `contrast: 'high'` measures it
 *   only in the high-contrast themes, and `minimum` lowers its minimum at standard or high contrast. Pairs the gate no
 *   longer measures are listed in `dropped`, and pairs it measures under a new name in `renamed`,
 *   each with the reason, rather than disappearing. DeclaredPairs.json records what each pair is
 *   held to, and the gate fails on a pair held to less than it records unless `relaxed` lists the
 *   change with its rationale (Snapshot.ts).
 * - Disabled states are exempt from 1.4.3 and 1.4.11, so none is listed.
 *
 * A pair is named `<fg> on <bg> over <next layer>`, which is also how Exceptions.json refers to it.
 */

export type ContrastKind = 'text' | 'non-text' | 'focus' | 'difference' | 'distinct';

export interface ContrastPair {
  fg: string;
  bg: readonly string[];
  kind: ContrastKind;
  /** Measured only in the themes of this contrast; both when absent. */
  contrast?: 'high';
  /** Minimums below the kind's, per contrast, for what WCAG doesn't require of this pair. */
  minimum?: { readonly standard?: number; readonly high?: number };
  /** Why the pair is scoped to one contrast or held to a lower minimum. */
  rationale?: string;
  note?: string;
}

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const alertTones = ['accent', 'success', 'warning', 'danger'] as const;

/** The text color of each status tone; the neutral tone is muted text. */
const toneText = (tone: (typeof tones)[number]) =>
  tone === 'neutral' ? '--color-fg-muted' : `--color-fg-${tone}`;

// Surfaces, by role.
const page = '--color-bg-page'; // the app frame, title bars, Surface background="page"
const surface = '--color-bg-default'; // Surface's default, sidebars, standard menus
const muted = '--color-bg-muted'; // Surface background="muted", cards, radio rows
const raised = '--color-bg-raised'; // Surface background="raised", dialogs, tables, rows on a contrasting surface
const popup = '--color-bg-popup'; // Select lists, popovers, compact menus, menu rows, the composer
const field = '--color-bg-field';
const overlay = '--color-bg-overlay'; // the scrim behind dialogs
const selected = '--color-bg-selected';
const selectedHover = '--color-bg-selected-hover';
const selectedPressed = '--color-bg-selected-pressed';
const popupHover = '--color-bg-popup-hover';
const popupPressed = '--color-bg-popup-pressed';
const fill = '--color-bg-neutral-muted'; // the translucent fill of tab rails, chips, secondary buttons
const layerHover = '--color-bg-neutral-subtle-hover';
const layerPressed = '--color-bg-neutral-subtle-pressed';
const navigationHover = '--color-bg-navigation-hover';
const navigationPressed = '--color-bg-navigation-pressed';
// Component tokens that take a different role per theme.
const row = '--color-row'; // List rows: the default surface in light, the muted one in dark
const rowHover = '--color-row-hover';
const rowPressed = '--color-row-pressed';
const actionStrip = '--color-action-strip';

type Background = string | readonly string[];

function on(
  kind: ContrastKind,
  fg: string,
  backgrounds: readonly Background[],
  note?: string,
  extra: Pick<ContrastPair, 'contrast' | 'minimum' | 'rationale'> = {},
): ContrastPair[] {
  return backgrounds.map((bg) => ({
    fg,
    bg: typeof bg === 'string' ? [bg] : bg,
    kind,
    ...extra,
    ...(note ? { note } : {}),
  }));
}

const text = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('text', fg, backgrounds, note);
const nonText = (
  fg: string,
  backgrounds: readonly Background[],
  note?: string,
  extra?: Pick<ContrastPair, 'contrast' | 'minimum' | 'rationale'>,
) => on('non-text', fg, backgrounds, note, extra);
const focus = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('focus', fg, backgrounds, note);
/** `fill` must look different from each background: a state from its own rest or its surface. */
const different = (fill: string, backgrounds: readonly Background[], note?: string) =>
  on('difference', fill, backgrounds, note);
/** `fill` must not be mistaken for each background: states of different items, or two labels. */
const distinct = (fill: string, backgrounds: readonly Background[], note?: string) =>
  on('distinct', fill, backgrounds, note);

/**
 * The hairline edge of an elevated surface at standard contrast: below 3:1 by design. WCAG 1.4.11
 * asks 3:1 of what is needed to identify a component; a popup is identified by its elevation shadow
 * and its content, so its edge is decorative there. Raising the edge to 3:1 would outline every
 * menu, list and popover in mid gray, which changes the identity (Decision 7). The gate still
 * measures the edge, so it can't fade into its surface: at least 1.2:1. It is the boundary in high
 * contrast (4.5:1, measured below) and under forced colors, where the shadow is gone.
 */
const popupEdge = {
  minimum: { standard: 1.2 },
  rationale:
    'Decorative at standard contrast: the elevation shadow and the content identify the popup, as WCAG 1.4.11 allows, and a 3:1 edge would outline every popup in mid gray. Held to 1.2:1 so it stays visible; the boundary in high contrast and under forced colors.',
} as const;

/**
 * The edge of an outlined badge, or the ring of a message that failed to send, in a tone: its text
 * color at 55%, in every theme and contrast. Decorative: the badge's text in the tone, measured at
 * 4.5:1 above, and the message's status identify them. Held to 1.5:1, and 3:1 in high contrast, as
 * the outline of a badge on a button is.
 */
const toneOutline = {
  minimum: { standard: 1.5, high: 3 },
  rationale:
    'Decorative: the badge’s text in its tone, measured at 4.5:1, and the failed message’s status identify them; the edge only groups. Held to 1.5:1, and 3:1 in high contrast, as a badge outline on a button is.',
} as const;

/**
 * The faint edge of an alert, its tone's text color at 28%. Decorative: the tint, the icon and the
 * text identify the alert, which takes no input. Held to 1.2:1, as a popup's edge is, and 1.5:1 in
 * high contrast, so it stays visible.
 */
const alertEdge = {
  minimum: { standard: 1.2, high: 1.5 },
  rationale:
    'Decorative: the tint, the icon and the text identify the alert, which takes no input, and WCAG 1.4.11 asks nothing of the edge. Held to 1.2:1, as a popup’s edge is, and 1.5:1 in high contrast, so it stays visible.',
} as const;

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
  ...text('--color-fg-default', [row, rowHover, rowPressed], 'List rows'),
  ...text('--color-fg-muted', [row, rowHover, rowPressed], 'List row details'),
  ...text(
    '--color-fg-default',
    [popupHover, popupPressed],
    'Menu items and Select and Combobox options, highlighted and pressed',
  ),
  ...text('--color-fg-muted', [popupHover], 'Menu item descriptions'),

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
    '--color-fg-danger',
    [muted],
    'The message of an invalid field on a muted surface; the tone pairs below measure the others',
  ),
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
    [field, page, surface, muted, raised, popup],
    'The only boundary of outlined fields, the composer, outlined buttons, Select triggers and the track of a switch that is off; DropZone and the empty stars of a Rating take it too',
  ),
  ...nonText(
    '--color-border-accent',
    [page, surface, popup],
    'The border of a focused field and of the composer, and today’s ring in a calendar',
  ),
  ...nonText('--color-border-danger', [field, page, surface], 'The border of an invalid field'),
  ...nonText(
    '--color-border-muted',
    [page, surface, muted],
    'Dividers: table lines, title bars, Markdown rules, menu separators',
    {
      contrast: 'high',
      rationale:
        'Decorative at standard contrast: a divider separates content that its spacing already groups, and WCAG 1.4.11 asks nothing of decorative edges. High contrast makes dividers boundaries, so they are measured there.',
    },
  ),

  // Elevated surfaces: the edge of every popup, at standard and at high contrast.
  ...nonText(
    '--elevation-2-border',
    [popup, surface, page, muted, raised],
    'The edge of menus, Select and Combobox lists, popovers, hover cards, the date picker, rich text suggestions and docked panels, against the popup and what it floats over',
    popupEdge,
  ),
  // Tooltips and toasts are strong fills. Their edge is the fill a step darker in light, so it doesn't
  // ring a dark fill on a light page like a halo, and the popup edge in dark: held, as every popup
  // edge, against what the popup floats over, and against its own fill, which it must set apart
  // from a surface of that color.
  ...(
    [
      ['neutral', 'Tooltips and neutral toasts'],
      ['success', 'Success toasts'],
      ['info', 'Information toasts'],
      ['danger', 'Error toasts'],
    ] as const
  ).flatMap(([tone, owners]) => [
    ...nonText(
      `--color-border-${tone}-strong`,
      [page, surface, muted, raised, popup],
      `The edge of ${owners.toLowerCase()}, against what they float over`,
      popupEdge,
    ),
    ...different(
      `--color-border-${tone}-strong`,
      [`--color-bg-${tone}-strong`],
      `${owners}: the edge against the fill, so it sets the fill apart from a surface of its color`,
    ),
  ]),
  ...nonText(
    '--elevation-3-border',
    [raised, [overlay, page]],
    'The edge of dialogs and the command palette, against the dialog and the scrim',
    popupEdge,
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
    [
      page,
      surface,
      muted,
      '--color-bg-muted-hover',
      popup,
      popupHover,
      selected,
      selectedHover,
      selectedPressed,
    ],
    'A chosen radio, also in a chosen row; check marks in menus and options, also on a selected option under the pointer; the chosen calendar day',
  ),
  ...nonText(
    '--color-checkbox',
    [page, surface, muted, raised, row, selected, selectedHover],
    'A checked checkbox, also in a list row and a selected table row',
  ),
  // The marks of checked controls are held to the text minimum, 4.5:1 and 7:1 at high contrast,
  // though WCAG asks 3:1 of them: a check reads as a symbol, as a glyph does.
  ...text(
    '--color-on-checkbox',
    ['--color-checkbox', '--color-checkbox-hover', '--color-checkbox-pressed'],
    'The check of a checked checkbox',
  ),
  ...nonText(
    '--color-switch-on',
    [page, surface, muted, raised, row, selected],
    'The track of a switch that is on',
  ),
  ...text(
    '--color-switch-thumb-on',
    ['--color-switch-on', '--color-switch-on-hover', '--color-switch-on-pressed'],
    'The thumb of a switch that is on',
  ),
  ...nonText(
    '--color-fg-on-strong',
    ['--color-bg-brand-strong', '--color-bg-brand-strong-hover', '--color-bg-brand-strong-pressed'],
    'White marks on the brand’s strong fill, which light checkboxes and switches take; dark and high contrast move them to the emphasis fill with dark marks. Not text: in dark the fill keeps 3:1 against the surfaces, which puts white text below 4.5:1',
  ),

  // Selection: menus, Select, tabs, navigation, trees, tables.
  ...text(
    '--color-fg-control',
    [popup, popupHover, popupPressed, raised],
    'Select options; the command palette lists them on a dialog',
  ),
  ...text(
    '--color-fg-on-selected',
    [selected, selectedHover, selectedPressed],
    'Selected navigation items, tabs, tree rows and Select options, and the bar at the start of a selected table row',
  ),
  ...text(
    '--color-fg-default',
    [selected, selectedHover, selectedPressed],
    'Selected table and tree rows',
  ),
  ...text(
    '--color-fg-muted',
    [selected, selectedHover, selectedPressed],
    'Details of selected tree rows and captions in selected table rows',
  ),
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
  ...nonText(
    '--color-fg-muted',
    [navigationHover, navigationPressed],
    'Navigation icons on hover and press',
  ),
  ...nonText('--color-fg-on-selected', [[fill, page]], 'The bar of the active document tab'),

  // Selection must not be mistaken for the other items around it, at rest or under the pointer, and
  // must stay selected while it is under the pointer itself: a selected row next to a hovered one,
  // a hovered selected row against a hovered unselected one. Every state also differs from its rest.
  ...distinct(
    selected,
    [popup, popupHover, surface, page, raised, [layerHover, surface], [layerHover, raised]],
    'The selection against the other items, at rest and under the pointer: Select options, tree and table rows',
  ),
  ...distinct(selected, [navigationHover], 'A selected navigation item next to a hovered one'),
  ...distinct(selected, [navigationPressed], 'A selected navigation item next to a pressed one'),
  ...distinct(
    selectedHover,
    [navigationHover, popupHover, [layerHover, surface], [layerHover, raised]],
    'A selected item under the pointer against an unselected one under the pointer: navigation items, Select options, tree and table rows',
  ),
  ...different(selectedHover, [selected], 'A selected item under the pointer'),
  ...different(popupHover, [popup], 'A highlighted option or menu item'),
  ...different(
    navigationHover,
    [surface, page],
    'A navigation item under the pointer, on a sidebar and on the page',
  ),
  ...different(layerHover, [surface, page, raised], 'A tree or table row under the pointer'),
  ...distinct(
    '--color-fg-on-selected',
    ['--color-fg-control', '--color-fg-default'],
    'The label of a selected item against the labels of the others',
  ),
  ...different(
    actionStrip,
    [muted],
    'The action strip of a card against the card, on its default muted surface',
  ),

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
  ...alertTones.flatMap((tone) => [
    ...text('--color-fg-default', [[`--color-bg-${tone}-muted`, page]], `Alert tone="${tone}"`),
    ...nonText(
      toneText(tone),
      [
        [`--color-bg-${tone}-subtle-hover`, `--color-bg-${tone}-muted`, page],
        [`--color-bg-${tone}-subtle-pressed`, `--color-bg-${tone}-muted`, page],
      ],
      'The dismiss icon of an alert on hover and press',
    ),
  ]),
  ...tones.flatMap((tone) =>
    nonText(
      `--color-border-${tone}-emphasis`,
      [page, surface, row],
      'The edge of an outlined badge',
      toneOutline,
    ),
  ),
  ...alertTones.flatMap((tone) =>
    nonText(
      `--color-border-${tone}-muted`,
      [page, surface],
      `The edge of an alert, tone="${tone === 'danger' ? 'error' : tone}"`,
      alertEdge,
    ),
  ),
  ...nonText(
    '--color-border-danger-emphasis',
    [
      [fill, page],
      [fill, surface],
    ],
    'The ring of an own message that failed to send, on its bubble',
    toneOutline,
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
      '--color-bg-neutral-strong-pressed',
      '--color-bg-success-strong-hover',
      '--color-bg-success-strong-pressed',
      '--color-bg-info-strong-hover',
      '--color-bg-info-strong-pressed',
    ],
    'A toast’s dismiss icon on hover and press; the error toast’s states are the destructive button’s, measured as text above',
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
    [page, surface, muted, raised, [fill, page], [fill, surface]],
    'Spinners, slider thumbs and indicators, and meter indicators on their track',
  ),
  ...distinct(
    'heatmap-accent-lowest',
    [[fill, page]],
    'The lightest step of a calendar heatmap against an empty day',
  ),
  ...nonText(
    'badge-outline-primary',
    ['--color-bg-brand-emphasis'],
    'The outline of a badge or counter on a primary button',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the primary button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),
  ...nonText(
    'badge-outline-important',
    ['--color-bg-important-strong'],
    'The outline of a badge or counter on an important button',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the important button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),

  // Focus rings, against what they are drawn on.
  ...focus(
    '--color-border-focus',
    [page, surface, muted, raised, row, popup, field],
    'Offset rings sit on the surface around the control',
  ),
  ...focus(
    '--color-border-focus',
    [
      popupHover,
      selected,
      selectedHover,
      selectedPressed,
      navigationHover,
      navigationPressed,
      rowPressed,
      [layerHover, surface],
      [layerPressed, surface],
      '--color-bg-muted-hover',
      [fill, raised],
      [fill, fill, page],
    ],
    'Inset rings sit on the focused element: menu and Select options, navigation items, tree rows, list rows, row radios, the command palette search and tabs, also while pressed',
  ),
  // An inset ring on a solid fill of its own blue adds an inner ring in the label's color, which
  // the label pairs of the primary, important and destructive fills measure, as text.
];

/**
 * Pairs the gate measured once and no longer does, with the reason. A pair that leaves `pairs`
 * must be listed here or in `renamed`: tests/contrast/DeclaredPairs.json holds the names declared
 * when it was last updated, and tests/browser/Contrast.spec.ts fails on a name that is gone from
 * `pairs` without an entry, and on a dropped pair that is still declared.
 */
export const dropped: readonly { pair: string; rationale: string }[] = [
  {
    pair: '--color-focus-ring on --color-primary-action',
    rationale:
      'The ring is the brand blue, so on a primary fill it measured 1:1. An inset ring on a solid fill draws an inner ring in the label color instead, which the label pairs on the primary, important and destructive fills measure as text, above the focus minimum.',
  },
  {
    pair: '--color-border-strong on --color-pane',
    rationale:
      'As --color-border-strong on --color-canvas: the empty stars of a Rating take --color-border-default.',
  },
  {
    pair: '--color-border-strong on --color-canvas',
    rationale:
      'The empty stars of a Rating, which this pair measured on the page and on panes, take the control boundary now, --color-border-default, measured at 3:1 on every surface. The 0.7 name only paints dividers, measured as --color-border-muted in high contrast.',
  },
];

/**
 * Pairs the gate still measures under another name, from the old name to the new, with the reason.
 * tests/browser/Contrast.spec.ts checks that each new name is declared and each old one is not.
 */
export const renamed: readonly { from: string; to: string; rationale: string }[] = [
  {
    from: '--color-fg-control on --color-navigation-quiet-hover',
    to: '--color-fg-control on --color-bg-navigation-hover',
    rationale:
      'Navigation items hover on a role of their own, bg.navigation; the 0.7 name is its alias.',
  },
  {
    from: '--color-fg-control on --color-navigation-quiet-pressed',
    to: '--color-fg-control on --color-bg-navigation-pressed',
    rationale:
      'Navigation items press on a role of their own, bg.navigation; the 0.7 name is its alias.',
  },
  {
    from: '--color-border-focus on --color-navigation-quiet-hover',
    to: '--color-border-focus on --color-bg-navigation-hover',
    rationale:
      'The inset ring of a hovered navigation item, on the bg.navigation role; the 0.7 name is its alias.',
  },
];

/** What a pair is held to: its kind, and its minimum at each contrast it is measured in. */
export interface Requirement {
  kind: ContrastKind;
  minimum: { standard?: number; high?: number };
}

/** A deliberate relaxation of a declared pair: what it is held to now, and why. */
export interface Relaxation extends Requirement {
  pair: string;
  rationale: string;
}

/**
 * Deliberate relaxations: pairs held to less than DeclaredPairs.json recorded, by a weaker kind
 * (distinct to difference, text to non-text), a switch between a ΔEOK distance and a ratio, a lower
 * minimum, or a contrast they are no longer measured in, also under a new name in `renamed`. Each
 * entry names the pair (its new name, if renamed), the requirement it is held to now, as the gate's
 * failure prints it (its kind, and its minimum at each contrast it is measured in, after any
 * `minimum` of its own), and the rationale. The gate accepts a looser pair only when a new entry
 * matches its new requirement exactly, and fails on a new entry that relaxes nothing. Each entry
 * approves one loosening: once `--update-snapshots` has recorded it, it is spent, so loosening the
 * pair again, even back to a requirement relaxed before, needs another entry with its own
 * rationale. Entries stay once recorded: they are the history of what was relaxed and why.
 */
export const relaxed: readonly Relaxation[] = [];

export function pairName(pair: Pick<ContrastPair, 'fg' | 'bg'>): string {
  return `${pair.fg} on ${pair.bg.join(' over ')}`;
}

/**
 * Colors a component composes where it paints, because they depend on something no token can
 * name, measured as the browser resolves them. Every other hover, pressed and translucent color is
 * a token of its own; add a token rather than an entry here.
 *
 * - A badge or counter inside a primary or important button is outlined in 55% of the button's label
 *   color, `currentColor`, which only the button knows (Badge.css).
 * - Calendar heatmap steps mix the tone into the page by a share that depends on how many steps the
 *   data has, from 30% at the lightest to the full tone (CalendarHeatmap.tsx and .css). The
 *   lightest step of the default accent tone is measured.
 */
export const derived: Readonly<Record<string, string>> = {
  'badge-outline-primary': 'color-mix(in srgb, var(--color-fg-on-emphasis) 55%, transparent)',
  'badge-outline-important': 'color-mix(in srgb, var(--color-fg-on-strong) 55%, transparent)',
  'heatmap-accent-lowest': 'color-mix(in srgb, var(--color-fg-accent) 30%, var(--color-bg-page))',
};

/** The CSS color a name in a pair stands for. */
export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
