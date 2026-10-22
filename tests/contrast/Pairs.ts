/**
 * The contrast gate's pair registry: every foreground envUI paints on a background, with the kind
 * of contrast WCAG 2.x asks of it, and every pair of state fills that must look different.
 * tests/browser/Contrast.spec.ts resolves each pair in every theme of Themes.ts, in a real browser,
 * and fails on any pair below the theme's minimum for its kind that Exceptions.json doesn't list.
 *
 * - `fg` and each `bg` layer name a custom property: a semantic role (`--env-color-{bg|fg|border}-…`),
 *   or a component token where the component takes a different role per theme (`--env-color-list-item-bg`,
 *   `--env-color-bg-brand-emphasis`…). The few colors a component still composes where it paints, because they
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
  tone === 'neutral' ? '--env-color-fg-muted' : `--env-color-fg-${tone}`;

/** The tint of a soft badge: the tone's muted fill, and for the accent a tint of its own. */
const badgeTint = (tone: (typeof tones)[number]) =>
  tone === 'accent' ? '--env-color-bg-accent-badge' : `--env-color-bg-${tone}-muted`;

// Surfaces, by role.
const page = '--env-color-bg-page'; // the app frame, title bars, Surface background="page"
const surface = '--env-color-bg-default'; // Surface's default, sidebars, standard menus
const muted = '--env-color-bg-muted'; // Surface background="muted", cards, radio rows
const raised = '--env-color-bg-raised'; // Surface background="raised", dialogs, tables, rows on a contrasting surface
const popup = '--env-color-bg-popup'; // Select lists, popovers, compact menus, menu rows, the composer
const field = '--env-color-bg-field';
const overlay = '--env-color-bg-overlay'; // the scrim behind dialogs
const selected = '--env-color-bg-selected';
const selectedHover = '--env-color-bg-selected-hover';
const selectedPressed = '--env-color-bg-selected-pressed';
const popupHover = '--env-color-bg-popup-hover';
const popupPressed = '--env-color-bg-popup-pressed';
const fill = '--env-color-bg-neutral-muted'; // the translucent fill of tab rails, chips, secondary buttons
const layerHover = '--env-color-bg-neutral-subtle-hover';
const layerPressed = '--env-color-bg-neutral-subtle-pressed';
const navigationHover = '--env-color-bg-navigation-hover';
const navigationPressed = '--env-color-bg-navigation-pressed';
// Component tokens that take a different role per theme.
const row = '--env-color-list-item-bg'; // List rows: the muted surface in both themes
const rowHover = '--env-color-list-item-bg-hover';
const rowPressed = '--env-color-list-item-bg-pressed';

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
 * The edge of an elevated surface at standard contrast. envUI draws no shadows, so a popup is set
 * apart by its fill and this edge alone, and a modal by its scrim as well: the edge must be clearly
 * visible, about 2:1 against the popup's own fill and the page, and at least 1.6:1 against every
 * surface it floats over. It stays below 3:1 by design: WCAG 1.4.11 asks 3:1 of what is needed to
 * identify a component, and a popup is identified by its fill and its content; a 3:1 edge would
 * outline every menu, list and popover in mid gray, which changes the identity (Decision 7). It is
 * the boundary in high contrast (4.5:1, measured below) and under forced colors.
 */
const popupEdge = {
  minimum: { standard: 1.6 },
  rationale:
    'No shadows: the edge and the fill set a popup apart, so the edge is clearly visible at 1.6:1 or more against every surface it floats over. Below 3:1 by design, as WCAG 1.4.11 allows: the fill and the content identify the popup, and a 3:1 edge would outline every popup in mid gray. The boundary in high contrast and under forced colors.',
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

/**
 * The pairs, with a pair that several components paint listed once: its notes joined. Components
 * that share a role, such as checked controls, spinners and chosen radios on the brand's emphasis
 * fill, declare the same pair; they must hold it to the same requirement.
 */
function merged(list: readonly ContrastPair[]): ContrastPair[] {
  const byName = new Map<string, ContrastPair>();
  for (const pair of list) {
    const name = pairName(pair);
    const earlier = byName.get(name);
    if (!earlier) {
      byName.set(name, pair);
      continue;
    }
    const requirement = ({ kind, contrast, minimum }: ContrastPair) =>
      JSON.stringify({ kind, contrast, minimum });
    if (requirement(earlier) !== requirement(pair))
      throw new Error(`${name} is declared twice with different requirements.`);
    const notes = [earlier.note, pair.note].filter(Boolean);
    byName.set(name, { ...earlier, ...(notes.length > 0 && { note: notes.join('; ') }) });
  }
  return [...byName.values()];
}

export const pairs: readonly ContrastPair[] = merged([
  // Text on every surface role.
  ...text('--env-color-fg-default', [page, surface, muted, raised, popup]),
  ...text(
    '--env-color-fg-muted',
    [page, surface, muted, raised, popup],
    'Supporting text, icons, field descriptions, unchecked checkbox rings',
  ),
  ...text(
    '--env-color-fg-control',
    [page, surface],
    'Navigation labels, meter and slider values, the thumb of a switch that is off',
  ),
  ...text('--env-color-fg-default', [row, rowHover, rowPressed], 'List rows'),
  ...text('--env-color-fg-muted', [row, rowHover, rowPressed], 'List row details'),
  ...text(
    '--env-color-fg-default',
    [popupHover, popupPressed],
    'Menu items and Select and Combobox options, highlighted and pressed',
  ),
  ...text('--env-color-fg-muted', [popupHover], 'Menu item descriptions'),

  // Links and text buttons on every surface, and in their states.
  ...text(
    '--env-color-fg-link',
    [page, surface, muted, raised, popup, row],
    'Links and text buttons, also on the action strip of a card, which is the default surface',
  ),
  ...text('--env-color-fg-link-hover', [page, surface, muted]),
  ...text('--env-color-fg-link-pressed', [page, surface, muted]),
  // Where a tint lowers the link blue below 4.5:1 in the light theme, links and text buttons take
  // the link colors for a tint: alerts and rows under the pointer or pressed point fg.link at them,
  // and applications put them on the brand's muted tint.
  ...text(
    '--env-color-fg-link-on-tint',
    [
      [layerHover, raised],
      [layerHover, surface],
      rowHover,
      rowPressed,
      ['--env-color-bg-brand-muted', page],
      ['--env-color-bg-brand-muted', surface],
    ],
    'Links and text buttons in an interactive table row under the pointer or holding focus, in a list row under the pointer or pressed, and on the brand’s muted tint',
  ),
  ...text(
    '--env-color-fg-link-on-tint-hover',
    [
      [layerHover, raised],
      [layerHover, surface],
      rowHover,
      ['--env-color-bg-brand-muted', page],
      ['--env-color-bg-brand-muted', surface],
    ],
    'A link under the pointer in a row under the pointer, and on the brand’s muted tint',
  ),
  ...text(
    '--env-color-fg-link-on-tint-pressed',
    [
      [layerHover, raised],
      [layerHover, surface],
      rowPressed,
      ['--env-color-bg-brand-muted', page],
      ['--env-color-bg-brand-muted', surface],
    ],
    'A pressed link in a row, and on the brand’s muted tint',
  ),
  ...alertTones.flatMap((tone) =>
    [
      '--env-color-fg-link-on-tint',
      '--env-color-fg-link-on-tint-hover',
      '--env-color-fg-link-on-tint-pressed',
    ].flatMap((link) =>
      text(
        link,
        [
          [`--env-color-bg-${tone}-muted`, page],
          [`--env-color-bg-${tone}-muted`, surface],
        ],
        `Links and text buttons in an alert, tone="${tone === 'danger' ? 'error' : tone}", at rest, hovered and pressed`,
      ),
    ),
  ),
  ...text(
    '--env-color-fg-muted-hover',
    [page, surface],
    'Disclosure summaries and checkbox rings on hover',
  ),
  ...text('--env-color-fg-muted-pressed', [page, surface], 'Disclosure summaries on press'),

  // Actions: labels on their fills, at rest, hovered and pressed. The marks of checked controls on
  // the same fill are held to the text minimum too, 4.5:1 and 7:1 at high contrast, though WCAG
  // asks 3:1 of them: a check reads as a symbol, as a glyph does.
  ...text(
    '--env-color-fg-on-emphasis',
    [
      '--env-color-bg-brand-emphasis',
      '--env-color-bg-brand-emphasis-hover',
      '--env-color-bg-brand-emphasis-pressed',
    ],
    'Primary buttons, the chosen calendar day, the check of a checked checkbox and the thumb of a switch that is on',
  ),
  ...text(
    '--env-color-fg-control',
    [
      [fill, page],
      ['--env-color-bg-neutral-muted-hover', page],
      ['--env-color-bg-neutral-muted-pressed', page],
      [fill, surface],
      ['--env-color-bg-neutral-muted-hover', surface],
      ['--env-color-bg-neutral-muted-pressed', surface],
      [fill, muted],
      ['--env-color-bg-neutral-muted-hover', muted],
      ['--env-color-bg-neutral-muted-pressed', muted],
      [fill, raised],
      ['--env-color-bg-neutral-muted-hover', raised],
      ['--env-color-bg-neutral-muted-pressed', raised],
    ],
    'Secondary buttons, and the thumb of a switch that is off on its track: the fill is translucent, so it is measured on each surface it sits on',
  ),
  ...text(
    '--env-color-fg-accent',
    [raised, '--env-color-bg-raised-hover', '--env-color-bg-raised-pressed'],
    'Outlined buttons and the icon of a pager link',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-danger-strong',
      '--env-color-bg-danger-strong-hover',
      '--env-color-bg-danger-strong-pressed',
    ],
    'Destructive buttons and error toasts',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-important-strong',
      '--env-color-bg-important-strong-hover',
      '--env-color-bg-important-strong-pressed',
    ],
    'Button variant="important"',
  ),
  ...text(
    '--env-color-fg-default',
    [
      [layerHover, page],
      [layerPressed, page],
      [layerHover, surface],
      [layerPressed, surface],
      [layerHover, fill, page],
    ],
    'Quiet buttons, menubar triggers and document tabs on hover and press, and hovered segments',
  ),
  ...text(
    '--env-color-fg-danger',
    [
      raised,
      '--env-color-bg-raised-hover',
      '--env-color-bg-raised-pressed',
      [layerHover, page],
      [layerPressed, page],
      [layerHover, surface],
      [layerPressed, surface],
    ],
    'Outline, ghost and text buttons in the danger tone: the label on the raised fill of an outline button, at rest, hovered and pressed, and on the state layer of a ghost button on hover and press',
  ),

  // Fields.
  ...text('--env-color-fg-default', [field]),
  ...text(
    '--env-color-fg-muted',
    [field],
    'Labels, prefixes, suffixes, placeholders and icons in the field',
  ),
  ...text('--env-color-border-accent-emphasis', [field], 'The label of a focused field'),
  ...text('--env-color-fg-danger', [field], 'The label and message of an invalid field'),
  ...text(
    '--env-color-fg-danger',
    [muted],
    'The message of an invalid field on a muted surface; the tone pairs below measure the others',
  ),
  ...text(
    '--env-color-fg-default',
    [
      [fill, page],
      [fill, surface],
      [fill, raised],
    ],
    'Quiet fields while focused, the command palette search, active document tabs, keyboard keys, counters and own messages',
  ),
  ...text(
    '--env-color-fg-muted',
    [
      [fill, page],
      [fill, surface],
      [fill, muted],
      [fill, popup],
      [fill, raised],
    ],
    'Unselected tabs, segments and their counts on their rail, keyboard keys in compact menus, table header cells and the command palette placeholder',
  ),
  ...nonText(
    '--env-color-border-default',
    [field, page, surface, muted, raised, popup],
    'The only boundary of outlined fields, the composer, outlined buttons, Select triggers, the track of a switch that is off and the tracks of Progress and Meter; DropZone and the empty stars of a Rating take it too',
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [raised],
    'The edge of an outline button in the danger tone',
  ),
  ...nonText('--env-color-border-danger-emphasis-hover', [raised]),
  ...nonText('--env-color-border-danger-emphasis-pressed', [raised]),
  ...nonText(
    '--env-color-border-accent-emphasis',
    [page, surface, popup],
    'The border of a focused field and of the composer, and today’s ring in a calendar',
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [field, page, surface],
    'The border of an invalid field',
  ),
  ...nonText(
    '--env-color-border-muted',
    [page, surface, muted],
    'Hairlines between list items: table rows, Markdown rules, menu separators, accordion items',
    {
      contrast: 'high',
      rationale:
        'Decorative at standard contrast: a divider separates content that its spacing already groups, and WCAG 1.4.11 asks nothing of decorative edges. High contrast makes dividers boundaries, so they are measured there.',
    },
  ),

  // Elevated surfaces: the edge of every popup, at standard and at high contrast.
  ...nonText(
    '--env-elevation-2-border',
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
      `--env-color-border-${tone}-strong`,
      [page, surface, muted, raised, popup],
      `The edge of ${owners.toLowerCase()}, against what they float over`,
      popupEdge,
    ),
    ...different(
      `--env-color-border-${tone}-strong`,
      [`--env-color-bg-${tone}-strong`],
      `${owners}: the edge against the fill, so it sets the fill apart from a surface of its color`,
    ),
  ]),
  ...nonText(
    '--env-elevation-3-border',
    [raised, [overlay, page]],
    'The edge of dialogs and the command palette, against the dialog and the scrim',
    popupEdge,
  ),

  // Choice controls.
  ...text(
    '--env-color-fg-default',
    ['--env-color-bg-muted-hover', '--env-color-bg-muted-pressed'],
    'Radio rows',
  ),
  ...text('--env-color-fg-muted', ['--env-color-bg-muted-hover'], 'Radio row details'),
  ...nonText(
    '--env-color-bg-brand-emphasis',
    [
      page,
      surface,
      muted,
      '--env-color-bg-muted-hover',
      popup,
      popupHover,
      selected,
      selectedHover,
      selectedPressed,
      raised,
      row,
    ],
    'A chosen radio, also in a chosen row; a checked checkbox and the track of a switch that is on, also in a list item and a selected table row; check marks in menus and options, also on a selected option under the pointer; the chosen calendar day',
  ),
  ...nonText(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-brand-strong',
      '--env-color-bg-brand-strong-hover',
      '--env-color-bg-brand-strong-pressed',
    ],
    'White marks on the brand’s strong fill, for applications: envUI’s checked controls take the emphasis fill, which has the same color in light. Not text: in dark the fill keeps 3:1 against the surfaces, which puts white text below 4.5:1',
  ),

  // Selection: menus, Select, tabs, navigation, trees, tables.
  ...text(
    '--env-color-fg-control',
    [popup, popupHover, popupPressed, raised],
    'Select options; the command palette lists them on a dialog',
  ),
  ...text(
    '--env-color-fg-on-selected',
    [selected, selectedHover, selectedPressed],
    'Selected navigation items, tabs, tree rows and Select options, the bar at the start of a selected table row, and links and text buttons in a selected table row, at rest, on hover and on press',
  ),
  ...text(
    '--env-color-fg-danger',
    [selected, selectedHover, selectedPressed],
    'Danger text buttons in a selected table row, which keep the danger color, at rest, under the pointer or holding focus, and pressed',
  ),
  ...text(
    '--env-color-fg-default',
    [selected, selectedHover, selectedPressed],
    'Selected table and tree rows',
  ),
  ...text(
    '--env-color-fg-muted',
    [selected, selectedHover, selectedPressed],
    'Details of selected tree rows and captions in selected table rows',
  ),
  ...text(
    '--env-color-fg-muted',
    [
      [layerHover, fill, page],
      [layerPressed, fill, page],
    ],
    'Unselected tabs on hover and press',
  ),
  ...text(
    '--env-color-fg-control',
    [
      [fill, fill, page],
      ['--env-color-bg-neutral-muted-hover', fill, page],
      [fill, fill, surface],
    ],
    'The active tab of a secondary tab rail',
  ),
  ...text(
    '--env-color-fg-control',
    [navigationHover, navigationPressed, [layerHover, page], [layerHover, surface]],
    'Navigation labels on hover and press',
  ),
  ...nonText(
    '--env-color-fg-muted',
    [navigationHover, navigationPressed],
    'Navigation icons on hover and press',
  ),
  ...nonText('--env-color-fg-on-selected', [[fill, page]], 'The bar of the active document tab'),

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
    '--env-color-fg-on-selected',
    ['--env-color-fg-control', '--env-color-fg-default'],
    'The label of a selected item against the labels of the others',
  ),
  ...different(
    surface,
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
          [`--env-color-bg-${tone}-muted`, page],
          [`--env-color-bg-${tone}-muted`, surface],
        ])),
    // A soft badge's text over its tint wherever a badge sits: list rows, muted and raised
    // surfaces, and popups. The accent badge takes a tint of its own, bg.accent.badge, fainter in
    // light than the info alert's, so the blue keeps 4.5:1 over it on a light row; it is measured on
    // the page and default surface too, which the tone's tint pairs above measure for the others.
    ...(tone === 'neutral'
      ? []
      : text(
          toneText(tone),
          [
            ...(tone === 'accent'
              ? [
                  [badgeTint(tone), page],
                  [badgeTint(tone), surface],
                ]
              : []),
            [badgeTint(tone), row],
            [badgeTint(tone), muted],
            [badgeTint(tone), raised],
            [badgeTint(tone), popup],
          ],
          'A soft badge on a row, a muted or raised surface or a popup',
        )),
    ...text(
      '--env-color-fg-on-emphasis',
      [`--env-color-bg-${tone}-emphasis`],
      'Solid badges and counters',
    ),
  ]),
  // A diff stat's additions and deletions over its neutral fill, wherever it sits.
  ...['--env-color-fg-success', '--env-color-fg-danger'].flatMap((fg) =>
    text(
      fg,
      [
        [fill, page],
        [fill, surface],
        [fill, row],
        [fill, muted],
        [fill, raised],
        [fill, popup],
      ],
      'A diff stat’s additions and deletions on its fill',
    ),
  ),
  ...alertTones.flatMap((tone) => [
    ...text(
      '--env-color-fg-default',
      [[`--env-color-bg-${tone}-muted`, page]],
      `Alert tone="${tone}"`,
    ),
    ...nonText(
      toneText(tone),
      [
        [`--env-color-bg-${tone}-subtle-hover`, `--env-color-bg-${tone}-muted`, page],
        [`--env-color-bg-${tone}-subtle-pressed`, `--env-color-bg-${tone}-muted`, page],
      ],
      'The dismiss icon of an alert on hover and press',
    ),
  ]),
  ...tones.flatMap((tone) =>
    nonText(
      `--env-color-border-${tone}`,
      [page, surface, row],
      'The edge of an outlined badge',
      toneOutline,
    ),
  ),
  ...alertTones.flatMap((tone) =>
    nonText(
      `--env-color-border-${tone}-muted`,
      [page, surface],
      `The edge of an alert, tone="${tone === 'danger' ? 'error' : tone}"`,
      alertEdge,
    ),
  ),
  ...nonText(
    '--env-color-border-danger',
    [
      [fill, page],
      [fill, surface],
    ],
    'The ring of an own message that failed to send, on its bubble',
    toneOutline,
  ),
  ...text(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-neutral-strong',
      '--env-color-bg-success-strong',
      '--env-color-bg-info-strong',
    ],
    'Toasts and tooltips, and the focus ring of a toast’s dismiss button',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-neutral-strong-hover',
      '--env-color-bg-neutral-strong-pressed',
      '--env-color-bg-success-strong-hover',
      '--env-color-bg-success-strong-pressed',
      '--env-color-bg-info-strong-hover',
      '--env-color-bg-info-strong-pressed',
    ],
    'A toast’s dismiss icon, and a label on the toast’s fill, on hover and press, held to the text minimum as the toast’s message is; the error toast’s states are the destructive button’s, measured as text above',
  ),

  // Content.
  ...text(
    '--env-color-fg-accent',
    [
      [fill, page],
      [fill, surface],
    ],
    'Chips',
  ),
  ...text('--env-color-fg-default', [[fill, field]], 'Combobox chips'),
  ...text(
    '--env-color-avatar-fg',
    [
      '--env-color-avatar-bg',
      ...['teal', 'green', 'amber', 'red', 'violet', 'purple', 'slate'].map(
        (hue) => `--env-color-avatar-bg-${hue}`,
      ),
    ],
    'Avatar initials on every hue',
  ),
  ...text(
    '--env-color-fg-default',
    ['--env-color-bg-raised-hover', '--env-color-bg-raised-pressed'],
    'Pager links and rows on a contrasting surface, hovered and pressed',
  ),
  ...text('--env-color-fg-muted', ['--env-color-bg-raised-hover'], 'Pager link captions on hover'),
  ...nonText(
    '--env-color-bg-brand-emphasis',
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
    ['--env-color-bg-brand-emphasis'],
    'The outline of a badge or counter on a primary button',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the primary button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),
  ...nonText(
    'badge-outline-important',
    ['--env-color-bg-important-strong'],
    'The outline of a badge or counter on an important button',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the important button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),

  // Focus rings, against what they are drawn on.
  ...focus(
    '--env-color-border-focus',
    [page, surface, muted, raised, row, popup, field],
    'Offset rings sit on the surface around the control',
  ),
  ...focus(
    '--env-color-border-focus',
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
      '--env-color-bg-muted-hover',
      [fill, raised],
      [fill, fill, page],
    ],
    'Inset rings sit on the focused element: menu and Select options, navigation items, tree rows, list rows, row radios, the command palette search and tabs, also while pressed',
  ),
  // An inset ring on a solid fill of its own blue adds an inner ring in the label's color, which
  // the label pairs of the primary, important and destructive fills measure, as text.
]);

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
 * The pairs renamed when every token took the --env- prefix, in the CSS-architecture step of 1.0,
 * from the name DeclaredPairs.json recorded to the name the gate measures now. Each keeps what its
 * old name was held to.
 */
/** Pairs whose tokens only took the prefix. */
const prefixedPairs: readonly (readonly [from: string, to: string])[] = [
  [
    '--color-bg-brand-emphasis on --color-bg-default',
    '--env-color-bg-brand-emphasis on --env-color-bg-default',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-muted',
    '--env-color-bg-brand-emphasis on --env-color-bg-muted',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-muted-hover',
    '--env-color-bg-brand-emphasis on --env-color-bg-muted-hover',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-page',
    '--env-color-bg-brand-emphasis on --env-color-bg-page',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-popup',
    '--env-color-bg-brand-emphasis on --env-color-bg-popup',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-popup-hover',
    '--env-color-bg-brand-emphasis on --env-color-bg-popup-hover',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-selected',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-selected-hover',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected-hover',
  ],
  [
    '--color-bg-brand-emphasis on --color-bg-selected-pressed',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected-pressed',
  ],
  [
    '--color-bg-navigation-hover on --color-bg-default',
    '--env-color-bg-navigation-hover on --env-color-bg-default',
  ],
  [
    '--color-bg-navigation-hover on --color-bg-page',
    '--env-color-bg-navigation-hover on --env-color-bg-page',
  ],
  [
    '--color-bg-neutral-subtle-hover on --color-bg-default',
    '--env-color-bg-neutral-subtle-hover on --env-color-bg-default',
  ],
  [
    '--color-bg-neutral-subtle-hover on --color-bg-page',
    '--env-color-bg-neutral-subtle-hover on --env-color-bg-page',
  ],
  [
    '--color-bg-neutral-subtle-hover on --color-bg-raised',
    '--env-color-bg-neutral-subtle-hover on --env-color-bg-raised',
  ],
  [
    '--color-bg-popup-hover on --color-bg-popup',
    '--env-color-bg-popup-hover on --env-color-bg-popup',
  ],
  [
    '--color-bg-selected on --color-bg-default',
    '--env-color-bg-selected on --env-color-bg-default',
  ],
  [
    '--color-bg-selected on --color-bg-navigation-hover',
    '--env-color-bg-selected on --env-color-bg-navigation-hover',
  ],
  [
    '--color-bg-selected on --color-bg-navigation-pressed',
    '--env-color-bg-selected on --env-color-bg-navigation-pressed',
  ],
  [
    '--color-bg-selected on --color-bg-neutral-subtle-hover over --color-bg-default',
    '--env-color-bg-selected on --env-color-bg-neutral-subtle-hover over --env-color-bg-default',
  ],
  [
    '--color-bg-selected on --color-bg-neutral-subtle-hover over --color-bg-raised',
    '--env-color-bg-selected on --env-color-bg-neutral-subtle-hover over --env-color-bg-raised',
  ],
  ['--color-bg-selected on --color-bg-page', '--env-color-bg-selected on --env-color-bg-page'],
  ['--color-bg-selected on --color-bg-popup', '--env-color-bg-selected on --env-color-bg-popup'],
  [
    '--color-bg-selected on --color-bg-popup-hover',
    '--env-color-bg-selected on --env-color-bg-popup-hover',
  ],
  ['--color-bg-selected on --color-bg-raised', '--env-color-bg-selected on --env-color-bg-raised'],
  [
    '--color-bg-selected-hover on --color-bg-navigation-hover',
    '--env-color-bg-selected-hover on --env-color-bg-navigation-hover',
  ],
  [
    '--color-bg-selected-hover on --color-bg-neutral-subtle-hover over --color-bg-default',
    '--env-color-bg-selected-hover on --env-color-bg-neutral-subtle-hover over --env-color-bg-default',
  ],
  [
    '--color-bg-selected-hover on --color-bg-neutral-subtle-hover over --color-bg-raised',
    '--env-color-bg-selected-hover on --env-color-bg-neutral-subtle-hover over --env-color-bg-raised',
  ],
  [
    '--color-bg-selected-hover on --color-bg-popup-hover',
    '--env-color-bg-selected-hover on --env-color-bg-popup-hover',
  ],
  [
    '--color-bg-selected-hover on --color-bg-selected',
    '--env-color-bg-selected-hover on --env-color-bg-selected',
  ],
  [
    '--color-border-accent-muted on --color-bg-default',
    '--env-color-border-accent-muted on --env-color-bg-default',
  ],
  [
    '--color-border-accent-muted on --color-bg-page',
    '--env-color-border-accent-muted on --env-color-bg-page',
  ],
  [
    '--color-border-danger-muted on --color-bg-default',
    '--env-color-border-danger-muted on --env-color-bg-default',
  ],
  [
    '--color-border-danger-muted on --color-bg-page',
    '--env-color-border-danger-muted on --env-color-bg-page',
  ],
  [
    '--color-border-danger-strong on --color-bg-danger-strong',
    '--env-color-border-danger-strong on --env-color-bg-danger-strong',
  ],
  [
    '--color-border-danger-strong on --color-bg-default',
    '--env-color-border-danger-strong on --env-color-bg-default',
  ],
  [
    '--color-border-danger-strong on --color-bg-muted',
    '--env-color-border-danger-strong on --env-color-bg-muted',
  ],
  [
    '--color-border-danger-strong on --color-bg-page',
    '--env-color-border-danger-strong on --env-color-bg-page',
  ],
  [
    '--color-border-danger-strong on --color-bg-popup',
    '--env-color-border-danger-strong on --env-color-bg-popup',
  ],
  [
    '--color-border-danger-strong on --color-bg-raised',
    '--env-color-border-danger-strong on --env-color-bg-raised',
  ],
  [
    '--color-border-default on --color-bg-default',
    '--env-color-border-default on --env-color-bg-default',
  ],
  [
    '--color-border-default on --color-bg-field',
    '--env-color-border-default on --env-color-bg-field',
  ],
  [
    '--color-border-default on --color-bg-muted',
    '--env-color-border-default on --env-color-bg-muted',
  ],
  [
    '--color-border-default on --color-bg-page',
    '--env-color-border-default on --env-color-bg-page',
  ],
  [
    '--color-border-default on --color-bg-popup',
    '--env-color-border-default on --env-color-bg-popup',
  ],
  [
    '--color-border-default on --color-bg-raised',
    '--env-color-border-default on --env-color-bg-raised',
  ],
  [
    '--color-border-focus on --color-bg-default',
    '--env-color-border-focus on --env-color-bg-default',
  ],
  ['--color-border-focus on --color-bg-field', '--env-color-border-focus on --env-color-bg-field'],
  ['--color-border-focus on --color-bg-muted', '--env-color-border-focus on --env-color-bg-muted'],
  [
    '--color-border-focus on --color-bg-muted-hover',
    '--env-color-border-focus on --env-color-bg-muted-hover',
  ],
  [
    '--color-border-focus on --color-bg-navigation-hover',
    '--env-color-border-focus on --env-color-bg-navigation-hover',
  ],
  [
    '--color-border-focus on --color-bg-navigation-pressed',
    '--env-color-border-focus on --env-color-bg-navigation-pressed',
  ],
  [
    '--color-border-focus on --color-bg-neutral-muted over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-border-focus on --env-color-bg-neutral-muted over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-border-focus on --color-bg-neutral-muted over --color-bg-raised',
    '--env-color-border-focus on --env-color-bg-neutral-muted over --env-color-bg-raised',
  ],
  [
    '--color-border-focus on --color-bg-neutral-subtle-hover over --color-bg-default',
    '--env-color-border-focus on --env-color-bg-neutral-subtle-hover over --env-color-bg-default',
  ],
  [
    '--color-border-focus on --color-bg-neutral-subtle-pressed over --color-bg-default',
    '--env-color-border-focus on --env-color-bg-neutral-subtle-pressed over --env-color-bg-default',
  ],
  ['--color-border-focus on --color-bg-page', '--env-color-border-focus on --env-color-bg-page'],
  ['--color-border-focus on --color-bg-popup', '--env-color-border-focus on --env-color-bg-popup'],
  [
    '--color-border-focus on --color-bg-popup-hover',
    '--env-color-border-focus on --env-color-bg-popup-hover',
  ],
  [
    '--color-border-focus on --color-bg-raised',
    '--env-color-border-focus on --env-color-bg-raised',
  ],
  [
    '--color-border-focus on --color-bg-selected',
    '--env-color-border-focus on --env-color-bg-selected',
  ],
  [
    '--color-border-focus on --color-bg-selected-hover',
    '--env-color-border-focus on --env-color-bg-selected-hover',
  ],
  [
    '--color-border-focus on --color-bg-selected-pressed',
    '--env-color-border-focus on --env-color-bg-selected-pressed',
  ],
  [
    '--color-border-info-strong on --color-bg-default',
    '--env-color-border-info-strong on --env-color-bg-default',
  ],
  [
    '--color-border-info-strong on --color-bg-info-strong',
    '--env-color-border-info-strong on --env-color-bg-info-strong',
  ],
  [
    '--color-border-info-strong on --color-bg-muted',
    '--env-color-border-info-strong on --env-color-bg-muted',
  ],
  [
    '--color-border-info-strong on --color-bg-page',
    '--env-color-border-info-strong on --env-color-bg-page',
  ],
  [
    '--color-border-info-strong on --color-bg-popup',
    '--env-color-border-info-strong on --env-color-bg-popup',
  ],
  [
    '--color-border-info-strong on --color-bg-raised',
    '--env-color-border-info-strong on --env-color-bg-raised',
  ],
  [
    '--color-border-muted on --color-bg-default',
    '--env-color-border-muted on --env-color-bg-default',
  ],
  ['--color-border-muted on --color-bg-muted', '--env-color-border-muted on --env-color-bg-muted'],
  ['--color-border-muted on --color-bg-page', '--env-color-border-muted on --env-color-bg-page'],
  [
    '--color-border-neutral-strong on --color-bg-default',
    '--env-color-border-neutral-strong on --env-color-bg-default',
  ],
  [
    '--color-border-neutral-strong on --color-bg-muted',
    '--env-color-border-neutral-strong on --env-color-bg-muted',
  ],
  [
    '--color-border-neutral-strong on --color-bg-neutral-strong',
    '--env-color-border-neutral-strong on --env-color-bg-neutral-strong',
  ],
  [
    '--color-border-neutral-strong on --color-bg-page',
    '--env-color-border-neutral-strong on --env-color-bg-page',
  ],
  [
    '--color-border-neutral-strong on --color-bg-popup',
    '--env-color-border-neutral-strong on --env-color-bg-popup',
  ],
  [
    '--color-border-neutral-strong on --color-bg-raised',
    '--env-color-border-neutral-strong on --env-color-bg-raised',
  ],
  [
    '--color-border-success-muted on --color-bg-default',
    '--env-color-border-success-muted on --env-color-bg-default',
  ],
  [
    '--color-border-success-muted on --color-bg-page',
    '--env-color-border-success-muted on --env-color-bg-page',
  ],
  [
    '--color-border-success-strong on --color-bg-default',
    '--env-color-border-success-strong on --env-color-bg-default',
  ],
  [
    '--color-border-success-strong on --color-bg-muted',
    '--env-color-border-success-strong on --env-color-bg-muted',
  ],
  [
    '--color-border-success-strong on --color-bg-page',
    '--env-color-border-success-strong on --env-color-bg-page',
  ],
  [
    '--color-border-success-strong on --color-bg-popup',
    '--env-color-border-success-strong on --env-color-bg-popup',
  ],
  [
    '--color-border-success-strong on --color-bg-raised',
    '--env-color-border-success-strong on --env-color-bg-raised',
  ],
  [
    '--color-border-success-strong on --color-bg-success-strong',
    '--env-color-border-success-strong on --env-color-bg-success-strong',
  ],
  [
    '--color-border-warning-muted on --color-bg-default',
    '--env-color-border-warning-muted on --env-color-bg-default',
  ],
  [
    '--color-border-warning-muted on --color-bg-page',
    '--env-color-border-warning-muted on --env-color-bg-page',
  ],
  [
    '--color-fg-accent on --color-bg-accent-muted over --color-bg-default',
    '--env-color-fg-accent on --env-color-bg-accent-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-accent on --color-bg-accent-muted over --color-bg-page',
    '--env-color-fg-accent on --env-color-bg-accent-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-accent on --color-bg-accent-subtle-hover over --color-bg-accent-muted over --color-bg-page',
    '--env-color-fg-accent on --env-color-bg-accent-subtle-hover over --env-color-bg-accent-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-accent on --color-bg-accent-subtle-pressed over --color-bg-accent-muted over --color-bg-page',
    '--env-color-fg-accent on --env-color-bg-accent-subtle-pressed over --env-color-bg-accent-muted over --env-color-bg-page',
  ],
  ['--color-fg-accent on --color-bg-default', '--env-color-fg-accent on --env-color-bg-default'],
  [
    '--color-fg-accent on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-fg-accent on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-accent on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-accent on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  ['--color-fg-accent on --color-bg-page', '--env-color-fg-accent on --env-color-bg-page'],
  ['--color-fg-accent on --color-bg-raised', '--env-color-fg-accent on --env-color-bg-raised'],
  [
    '--color-fg-accent on --color-bg-raised-hover',
    '--env-color-fg-accent on --env-color-bg-raised-hover',
  ],
  [
    '--color-fg-accent on --color-bg-raised-pressed',
    '--env-color-fg-accent on --env-color-bg-raised-pressed',
  ],
  ['--color-fg-control on --color-bg-default', '--env-color-fg-control on --env-color-bg-default'],
  [
    '--color-fg-control on --color-bg-navigation-hover',
    '--env-color-fg-control on --env-color-bg-navigation-hover',
  ],
  [
    '--color-fg-control on --color-bg-navigation-pressed',
    '--env-color-fg-control on --env-color-bg-navigation-pressed',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-muted',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-muted',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-neutral-muted over --color-bg-default',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-bg-raised',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-raised',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-hover over --color-bg-default',
    '--env-color-fg-control on --env-color-bg-neutral-muted-hover over --env-color-bg-default',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-hover over --color-bg-muted',
    '--env-color-fg-control on --env-color-bg-neutral-muted-hover over --env-color-bg-muted',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-hover over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-muted-hover over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-hover over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-muted-hover over --env-color-bg-page',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-hover over --color-bg-raised',
    '--env-color-fg-control on --env-color-bg-neutral-muted-hover over --env-color-bg-raised',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-pressed over --color-bg-default',
    '--env-color-fg-control on --env-color-bg-neutral-muted-pressed over --env-color-bg-default',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-pressed over --color-bg-muted',
    '--env-color-fg-control on --env-color-bg-neutral-muted-pressed over --env-color-bg-muted',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-pressed over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-muted-pressed over --env-color-bg-page',
  ],
  [
    '--color-fg-control on --color-bg-neutral-muted-pressed over --color-bg-raised',
    '--env-color-fg-control on --env-color-bg-neutral-muted-pressed over --env-color-bg-raised',
  ],
  [
    '--color-fg-control on --color-bg-neutral-subtle-hover over --color-bg-default',
    '--env-color-fg-control on --env-color-bg-neutral-subtle-hover over --env-color-bg-default',
  ],
  [
    '--color-fg-control on --color-bg-neutral-subtle-hover over --color-bg-page',
    '--env-color-fg-control on --env-color-bg-neutral-subtle-hover over --env-color-bg-page',
  ],
  ['--color-fg-control on --color-bg-page', '--env-color-fg-control on --env-color-bg-page'],
  ['--color-fg-control on --color-bg-popup', '--env-color-fg-control on --env-color-bg-popup'],
  [
    '--color-fg-control on --color-bg-popup-hover',
    '--env-color-fg-control on --env-color-bg-popup-hover',
  ],
  [
    '--color-fg-control on --color-bg-popup-pressed',
    '--env-color-fg-control on --env-color-bg-popup-pressed',
  ],
  ['--color-fg-control on --color-bg-raised', '--env-color-fg-control on --env-color-bg-raised'],
  [
    '--color-fg-danger on --color-bg-danger-muted over --color-bg-default',
    '--env-color-fg-danger on --env-color-bg-danger-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-danger on --color-bg-danger-muted over --color-bg-page',
    '--env-color-fg-danger on --env-color-bg-danger-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-danger on --color-bg-danger-subtle-hover over --color-bg-danger-muted over --color-bg-page',
    '--env-color-fg-danger on --env-color-bg-danger-subtle-hover over --env-color-bg-danger-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-danger on --color-bg-danger-subtle-pressed over --color-bg-danger-muted over --color-bg-page',
    '--env-color-fg-danger on --env-color-bg-danger-subtle-pressed over --env-color-bg-danger-muted over --env-color-bg-page',
  ],
  ['--color-fg-danger on --color-bg-default', '--env-color-fg-danger on --env-color-bg-default'],
  ['--color-fg-danger on --color-bg-field', '--env-color-fg-danger on --env-color-bg-field'],
  ['--color-fg-danger on --color-bg-muted', '--env-color-fg-danger on --env-color-bg-muted'],
  ['--color-fg-danger on --color-bg-page', '--env-color-fg-danger on --env-color-bg-page'],
  [
    '--color-fg-default on --color-bg-accent-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-accent-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-default on --color-bg-danger-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-danger-muted over --env-color-bg-page',
  ],
  ['--color-fg-default on --color-bg-default', '--env-color-fg-default on --env-color-bg-default'],
  ['--color-fg-default on --color-bg-field', '--env-color-fg-default on --env-color-bg-field'],
  ['--color-fg-default on --color-bg-muted', '--env-color-fg-default on --env-color-bg-muted'],
  [
    '--color-fg-default on --color-bg-muted-hover',
    '--env-color-fg-default on --env-color-bg-muted-hover',
  ],
  [
    '--color-fg-default on --color-bg-muted-pressed',
    '--env-color-fg-default on --env-color-bg-muted-pressed',
  ],
  [
    '--color-fg-default on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-fg-default on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-default on --color-bg-neutral-muted over --color-bg-field',
    '--env-color-fg-default on --env-color-bg-neutral-muted over --env-color-bg-field',
  ],
  [
    '--color-fg-default on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-default on --color-bg-neutral-muted over --color-bg-raised',
    '--env-color-fg-default on --env-color-bg-neutral-muted over --env-color-bg-raised',
  ],
  [
    '--color-fg-default on --color-bg-neutral-subtle-hover over --color-bg-default',
    '--env-color-fg-default on --env-color-bg-neutral-subtle-hover over --env-color-bg-default',
  ],
  [
    '--color-fg-default on --color-bg-neutral-subtle-hover over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-neutral-subtle-hover over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-default on --color-bg-neutral-subtle-hover over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-neutral-subtle-hover over --env-color-bg-page',
  ],
  [
    '--color-fg-default on --color-bg-neutral-subtle-pressed over --color-bg-default',
    '--env-color-fg-default on --env-color-bg-neutral-subtle-pressed over --env-color-bg-default',
  ],
  [
    '--color-fg-default on --color-bg-neutral-subtle-pressed over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-neutral-subtle-pressed over --env-color-bg-page',
  ],
  ['--color-fg-default on --color-bg-page', '--env-color-fg-default on --env-color-bg-page'],
  ['--color-fg-default on --color-bg-popup', '--env-color-fg-default on --env-color-bg-popup'],
  [
    '--color-fg-default on --color-bg-popup-hover',
    '--env-color-fg-default on --env-color-bg-popup-hover',
  ],
  [
    '--color-fg-default on --color-bg-popup-pressed',
    '--env-color-fg-default on --env-color-bg-popup-pressed',
  ],
  ['--color-fg-default on --color-bg-raised', '--env-color-fg-default on --env-color-bg-raised'],
  [
    '--color-fg-default on --color-bg-raised-hover',
    '--env-color-fg-default on --env-color-bg-raised-hover',
  ],
  [
    '--color-fg-default on --color-bg-raised-pressed',
    '--env-color-fg-default on --env-color-bg-raised-pressed',
  ],
  [
    '--color-fg-default on --color-bg-selected',
    '--env-color-fg-default on --env-color-bg-selected',
  ],
  [
    '--color-fg-default on --color-bg-selected-hover',
    '--env-color-fg-default on --env-color-bg-selected-hover',
  ],
  [
    '--color-fg-default on --color-bg-selected-pressed',
    '--env-color-fg-default on --env-color-bg-selected-pressed',
  ],
  [
    '--color-fg-default on --color-bg-success-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-success-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-default on --color-bg-warning-muted over --color-bg-page',
    '--env-color-fg-default on --env-color-bg-warning-muted over --env-color-bg-page',
  ],
  ['--color-fg-done on --color-bg-default', '--env-color-fg-done on --env-color-bg-default'],
  [
    '--color-fg-done on --color-bg-done-muted over --color-bg-default',
    '--env-color-fg-done on --env-color-bg-done-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-done on --color-bg-done-muted over --color-bg-page',
    '--env-color-fg-done on --env-color-bg-done-muted over --env-color-bg-page',
  ],
  ['--color-fg-done on --color-bg-page', '--env-color-fg-done on --env-color-bg-page'],
  ['--color-fg-link on --color-bg-default', '--env-color-fg-link on --env-color-bg-default'],
  ['--color-fg-link on --color-bg-muted', '--env-color-fg-link on --env-color-bg-muted'],
  ['--color-fg-link on --color-bg-page', '--env-color-fg-link on --env-color-bg-page'],
  ['--color-fg-link on --color-bg-popup', '--env-color-fg-link on --env-color-bg-popup'],
  ['--color-fg-link on --color-bg-raised', '--env-color-fg-link on --env-color-bg-raised'],
  [
    '--color-fg-link-hover on --color-bg-default',
    '--env-color-fg-link-hover on --env-color-bg-default',
  ],
  [
    '--color-fg-link-hover on --color-bg-muted',
    '--env-color-fg-link-hover on --env-color-bg-muted',
  ],
  ['--color-fg-link-hover on --color-bg-page', '--env-color-fg-link-hover on --env-color-bg-page'],
  [
    '--color-fg-link-pressed on --color-bg-default',
    '--env-color-fg-link-pressed on --env-color-bg-default',
  ],
  [
    '--color-fg-link-pressed on --color-bg-muted',
    '--env-color-fg-link-pressed on --env-color-bg-muted',
  ],
  [
    '--color-fg-link-pressed on --color-bg-page',
    '--env-color-fg-link-pressed on --env-color-bg-page',
  ],
  ['--color-fg-muted on --color-bg-default', '--env-color-fg-muted on --env-color-bg-default'],
  ['--color-fg-muted on --color-bg-field', '--env-color-fg-muted on --env-color-bg-field'],
  ['--color-fg-muted on --color-bg-muted', '--env-color-fg-muted on --env-color-bg-muted'],
  [
    '--color-fg-muted on --color-bg-muted-hover',
    '--env-color-fg-muted on --env-color-bg-muted-hover',
  ],
  [
    '--color-fg-muted on --color-bg-navigation-hover',
    '--env-color-fg-muted on --env-color-bg-navigation-hover',
  ],
  [
    '--color-fg-muted on --color-bg-navigation-pressed',
    '--env-color-fg-muted on --env-color-bg-navigation-pressed',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-fg-muted on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-muted over --color-bg-muted',
    '--env-color-fg-muted on --env-color-bg-neutral-muted over --env-color-bg-muted',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-muted on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-muted over --color-bg-popup',
    '--env-color-fg-muted on --env-color-bg-neutral-muted over --env-color-bg-popup',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-muted over --color-bg-raised',
    '--env-color-fg-muted on --env-color-bg-neutral-muted over --env-color-bg-raised',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-subtle-hover over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-muted on --env-color-bg-neutral-subtle-hover over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-muted on --color-bg-neutral-subtle-pressed over --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-muted on --env-color-bg-neutral-subtle-pressed over --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  ['--color-fg-muted on --color-bg-page', '--env-color-fg-muted on --env-color-bg-page'],
  ['--color-fg-muted on --color-bg-popup', '--env-color-fg-muted on --env-color-bg-popup'],
  [
    '--color-fg-muted on --color-bg-popup-hover',
    '--env-color-fg-muted on --env-color-bg-popup-hover',
  ],
  ['--color-fg-muted on --color-bg-raised', '--env-color-fg-muted on --env-color-bg-raised'],
  [
    '--color-fg-muted on --color-bg-raised-hover',
    '--env-color-fg-muted on --env-color-bg-raised-hover',
  ],
  ['--color-fg-muted on --color-bg-selected', '--env-color-fg-muted on --env-color-bg-selected'],
  [
    '--color-fg-muted on --color-bg-selected-hover',
    '--env-color-fg-muted on --env-color-bg-selected-hover',
  ],
  [
    '--color-fg-muted on --color-bg-selected-pressed',
    '--env-color-fg-muted on --env-color-bg-selected-pressed',
  ],
  [
    '--color-fg-muted-hover on --color-bg-default',
    '--env-color-fg-muted-hover on --env-color-bg-default',
  ],
  [
    '--color-fg-muted-hover on --color-bg-page',
    '--env-color-fg-muted-hover on --env-color-bg-page',
  ],
  [
    '--color-fg-muted-pressed on --color-bg-default',
    '--env-color-fg-muted-pressed on --env-color-bg-default',
  ],
  [
    '--color-fg-muted-pressed on --color-bg-page',
    '--env-color-fg-muted-pressed on --env-color-bg-page',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-accent-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-accent-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-brand-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-brand-emphasis-hover',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-hover',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-brand-emphasis-pressed',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-pressed',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-danger-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-danger-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-done-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-done-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-neutral-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-neutral-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-success-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-success-emphasis',
  ],
  [
    '--color-fg-on-emphasis on --color-bg-warning-emphasis',
    '--env-color-fg-on-emphasis on --env-color-bg-warning-emphasis',
  ],
  [
    '--color-fg-on-selected on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-fg-on-selected on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-on-selected on --color-bg-selected',
    '--env-color-fg-on-selected on --env-color-bg-selected',
  ],
  [
    '--color-fg-on-selected on --color-bg-selected-hover',
    '--env-color-fg-on-selected on --env-color-bg-selected-hover',
  ],
  [
    '--color-fg-on-selected on --color-bg-selected-pressed',
    '--env-color-fg-on-selected on --env-color-bg-selected-pressed',
  ],
  [
    '--color-fg-on-selected on --color-fg-control',
    '--env-color-fg-on-selected on --env-color-fg-control',
  ],
  [
    '--color-fg-on-selected on --color-fg-default',
    '--env-color-fg-on-selected on --env-color-fg-default',
  ],
  [
    '--color-fg-on-strong on --color-bg-brand-strong',
    '--env-color-fg-on-strong on --env-color-bg-brand-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-brand-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-brand-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-brand-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-brand-strong-pressed',
  ],
  [
    '--color-fg-on-strong on --color-bg-danger-strong',
    '--env-color-fg-on-strong on --env-color-bg-danger-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-danger-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-danger-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-danger-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-danger-strong-pressed',
  ],
  [
    '--color-fg-on-strong on --color-bg-important-strong',
    '--env-color-fg-on-strong on --env-color-bg-important-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-important-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-important-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-important-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-important-strong-pressed',
  ],
  [
    '--color-fg-on-strong on --color-bg-info-strong',
    '--env-color-fg-on-strong on --env-color-bg-info-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-info-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-info-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-info-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-info-strong-pressed',
  ],
  [
    '--color-fg-on-strong on --color-bg-neutral-strong',
    '--env-color-fg-on-strong on --env-color-bg-neutral-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-neutral-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-neutral-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-neutral-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-neutral-strong-pressed',
  ],
  [
    '--color-fg-on-strong on --color-bg-success-strong',
    '--env-color-fg-on-strong on --env-color-bg-success-strong',
  ],
  [
    '--color-fg-on-strong on --color-bg-success-strong-hover',
    '--env-color-fg-on-strong on --env-color-bg-success-strong-hover',
  ],
  [
    '--color-fg-on-strong on --color-bg-success-strong-pressed',
    '--env-color-fg-on-strong on --env-color-bg-success-strong-pressed',
  ],
  ['--color-fg-success on --color-bg-default', '--env-color-fg-success on --env-color-bg-default'],
  ['--color-fg-success on --color-bg-page', '--env-color-fg-success on --env-color-bg-page'],
  [
    '--color-fg-success on --color-bg-success-muted over --color-bg-default',
    '--env-color-fg-success on --env-color-bg-success-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-success on --color-bg-success-muted over --color-bg-page',
    '--env-color-fg-success on --env-color-bg-success-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-success on --color-bg-success-subtle-hover over --color-bg-success-muted over --color-bg-page',
    '--env-color-fg-success on --env-color-bg-success-subtle-hover over --env-color-bg-success-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-success on --color-bg-success-subtle-pressed over --color-bg-success-muted over --color-bg-page',
    '--env-color-fg-success on --env-color-bg-success-subtle-pressed over --env-color-bg-success-muted over --env-color-bg-page',
  ],
  ['--color-fg-warning on --color-bg-default', '--env-color-fg-warning on --env-color-bg-default'],
  ['--color-fg-warning on --color-bg-page', '--env-color-fg-warning on --env-color-bg-page'],
  [
    '--color-fg-warning on --color-bg-warning-muted over --color-bg-default',
    '--env-color-fg-warning on --env-color-bg-warning-muted over --env-color-bg-default',
  ],
  [
    '--color-fg-warning on --color-bg-warning-muted over --color-bg-page',
    '--env-color-fg-warning on --env-color-bg-warning-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-warning on --color-bg-warning-subtle-hover over --color-bg-warning-muted over --color-bg-page',
    '--env-color-fg-warning on --env-color-bg-warning-subtle-hover over --env-color-bg-warning-muted over --env-color-bg-page',
  ],
  [
    '--color-fg-warning on --color-bg-warning-subtle-pressed over --color-bg-warning-muted over --color-bg-page',
    '--env-color-fg-warning on --env-color-bg-warning-subtle-pressed over --env-color-bg-warning-muted over --env-color-bg-page',
  ],
  [
    '--elevation-2-border on --color-bg-default',
    '--env-elevation-2-border on --env-color-bg-default',
  ],
  ['--elevation-2-border on --color-bg-muted', '--env-elevation-2-border on --env-color-bg-muted'],
  ['--elevation-2-border on --color-bg-page', '--env-elevation-2-border on --env-color-bg-page'],
  ['--elevation-2-border on --color-bg-popup', '--env-elevation-2-border on --env-color-bg-popup'],
  [
    '--elevation-2-border on --color-bg-raised',
    '--env-elevation-2-border on --env-color-bg-raised',
  ],
  [
    '--elevation-3-border on --color-bg-overlay over --color-bg-page',
    '--env-elevation-3-border on --env-color-bg-overlay over --env-color-bg-page',
  ],
  [
    '--elevation-3-border on --color-bg-raised',
    '--env-elevation-3-border on --env-color-bg-raised',
  ],
  [
    'badge-outline-important on --color-bg-important-strong',
    'badge-outline-important on --env-color-bg-important-strong',
  ],
  [
    'badge-outline-primary on --color-bg-brand-emphasis',
    'badge-outline-primary on --env-color-bg-brand-emphasis',
  ],
  [
    'heatmap-accent-lowest on --color-bg-neutral-muted over --color-bg-page',
    'heatmap-accent-lowest on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
];
/** Pairs that named a 0.7 alias, measured on the token that replaces it: a checked checkbox, a switch that is on and a spinner on the brand’s emphasis fill, which light checkboxes and switches also took as the strong fill of the same color; a list row on the list item’s component token; an avatar on its own; the action strip of a card on the default surface. */
const aliasPairs: readonly (readonly [from: string, to: string])[] = [
  ['--color-action-strip on --color-bg-muted', '--env-color-bg-default on --env-color-bg-muted'],
  [
    '--color-border-accent-emphasis on --color-row',
    '--env-color-border-accent on --env-color-list-item-bg',
  ],
  [
    '--color-border-danger-emphasis on --color-row',
    '--env-color-border-danger on --env-color-list-item-bg',
  ],
  [
    '--color-border-done-emphasis on --color-row',
    '--env-color-border-done on --env-color-list-item-bg',
  ],
  ['--color-border-focus on --color-row', '--env-color-border-focus on --env-color-list-item-bg'],
  [
    '--color-border-focus on --color-row-pressed',
    '--env-color-border-focus on --env-color-list-item-bg-pressed',
  ],
  [
    '--color-border-neutral-emphasis on --color-row',
    '--env-color-border-neutral on --env-color-list-item-bg',
  ],
  [
    '--color-border-success-emphasis on --color-row',
    '--env-color-border-success on --env-color-list-item-bg',
  ],
  [
    '--color-border-warning-emphasis on --color-row',
    '--env-color-border-warning on --env-color-list-item-bg',
  ],
  [
    '--color-checkbox on --color-bg-default',
    '--env-color-bg-brand-emphasis on --env-color-bg-default',
  ],
  ['--color-checkbox on --color-bg-muted', '--env-color-bg-brand-emphasis on --env-color-bg-muted'],
  ['--color-checkbox on --color-bg-page', '--env-color-bg-brand-emphasis on --env-color-bg-page'],
  [
    '--color-checkbox on --color-bg-raised',
    '--env-color-bg-brand-emphasis on --env-color-bg-raised',
  ],
  [
    '--color-checkbox on --color-bg-selected',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected',
  ],
  [
    '--color-checkbox on --color-bg-selected-hover',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected-hover',
  ],
  ['--color-checkbox on --color-row', '--env-color-bg-brand-emphasis on --env-color-list-item-bg'],
  [
    '--color-control-blue on --color-bg-default',
    '--env-color-bg-brand-emphasis on --env-color-bg-default',
  ],
  [
    '--color-control-blue on --color-bg-muted',
    '--env-color-bg-brand-emphasis on --env-color-bg-muted',
  ],
  [
    '--color-control-blue on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-bg-brand-emphasis on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-control-blue on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-bg-brand-emphasis on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-control-blue on --color-bg-page',
    '--env-color-bg-brand-emphasis on --env-color-bg-page',
  ],
  [
    '--color-control-blue on --color-bg-raised',
    '--env-color-bg-brand-emphasis on --env-color-bg-raised',
  ],
  ['--color-fg-accent on --color-row', '--env-color-fg-accent on --env-color-list-item-bg'],
  [
    '--color-fg-control on --color-bg-neutral-muted over --color-action-strip',
    '--env-color-fg-control on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  ['--color-fg-danger on --color-row', '--env-color-fg-danger on --env-color-list-item-bg'],
  ['--color-fg-default on --color-row', '--env-color-fg-default on --env-color-list-item-bg'],
  [
    '--color-fg-default on --color-row-hover',
    '--env-color-fg-default on --env-color-list-item-bg-hover',
  ],
  [
    '--color-fg-default on --color-row-pressed',
    '--env-color-fg-default on --env-color-list-item-bg-pressed',
  ],
  ['--color-fg-done on --color-row', '--env-color-fg-done on --env-color-list-item-bg'],
  ['--color-fg-link on --color-action-strip', '--env-color-fg-link on --env-color-bg-default'],
  ['--color-fg-link on --color-row', '--env-color-fg-link on --env-color-list-item-bg'],
  ['--color-fg-muted on --color-row', '--env-color-fg-muted on --env-color-list-item-bg'],
  [
    '--color-fg-muted on --color-row-hover',
    '--env-color-fg-muted on --env-color-list-item-bg-hover',
  ],
  [
    '--color-fg-muted on --color-row-pressed',
    '--env-color-fg-muted on --env-color-list-item-bg-pressed',
  ],
  ['--color-fg-success on --color-row', '--env-color-fg-success on --env-color-list-item-bg'],
  ['--color-fg-warning on --color-row', '--env-color-fg-warning on --env-color-list-item-bg'],
  ['--color-on-avatar on --color-avatar', '--env-color-avatar-fg on --env-color-avatar-bg'],
  [
    '--color-on-checkbox on --color-checkbox',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis',
  ],
  [
    '--color-on-checkbox on --color-checkbox-hover',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-hover',
  ],
  [
    '--color-on-checkbox on --color-checkbox-pressed',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-pressed',
  ],
  [
    '--color-switch-on on --color-bg-default',
    '--env-color-bg-brand-emphasis on --env-color-bg-default',
  ],
  [
    '--color-switch-on on --color-bg-muted',
    '--env-color-bg-brand-emphasis on --env-color-bg-muted',
  ],
  ['--color-switch-on on --color-bg-page', '--env-color-bg-brand-emphasis on --env-color-bg-page'],
  [
    '--color-switch-on on --color-bg-raised',
    '--env-color-bg-brand-emphasis on --env-color-bg-raised',
  ],
  [
    '--color-switch-on on --color-bg-selected',
    '--env-color-bg-brand-emphasis on --env-color-bg-selected',
  ],
  ['--color-switch-on on --color-row', '--env-color-bg-brand-emphasis on --env-color-list-item-bg'],
  [
    '--color-switch-thumb-on on --color-switch-on',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis',
  ],
  [
    '--color-switch-thumb-on on --color-switch-on-hover',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-hover',
  ],
  [
    '--color-switch-thumb-on on --color-switch-on-pressed',
    '--env-color-fg-on-emphasis on --env-color-bg-brand-emphasis-pressed',
  ],
];
/** Pairs of tokens that changed beyond the prefix: border.{accent|danger} is the solid edge border.{accent|danger}.emphasis, and border.{tone}.emphasis the translucent edge border.{tone}. */
const renamedTokenPairs: readonly (readonly [from: string, to: string])[] = [
  [
    '--color-border-accent on --color-bg-default',
    '--env-color-border-accent-emphasis on --env-color-bg-default',
  ],
  [
    '--color-border-accent on --color-bg-field',
    '--env-color-border-accent-emphasis on --env-color-bg-field',
  ],
  [
    '--color-border-accent on --color-bg-page',
    '--env-color-border-accent-emphasis on --env-color-bg-page',
  ],
  [
    '--color-border-accent on --color-bg-popup',
    '--env-color-border-accent-emphasis on --env-color-bg-popup',
  ],
  [
    '--color-border-accent-emphasis on --color-bg-default',
    '--env-color-border-accent on --env-color-bg-default',
  ],
  [
    '--color-border-accent-emphasis on --color-bg-page',
    '--env-color-border-accent on --env-color-bg-page',
  ],
  [
    '--color-border-danger on --color-bg-default',
    '--env-color-border-danger-emphasis on --env-color-bg-default',
  ],
  [
    '--color-border-danger on --color-bg-field',
    '--env-color-border-danger-emphasis on --env-color-bg-field',
  ],
  [
    '--color-border-danger on --color-bg-page',
    '--env-color-border-danger-emphasis on --env-color-bg-page',
  ],
  [
    '--color-border-danger-emphasis on --color-bg-default',
    '--env-color-border-danger on --env-color-bg-default',
  ],
  [
    '--color-border-danger-emphasis on --color-bg-neutral-muted over --color-bg-default',
    '--env-color-border-danger on --env-color-bg-neutral-muted over --env-color-bg-default',
  ],
  [
    '--color-border-danger-emphasis on --color-bg-neutral-muted over --color-bg-page',
    '--env-color-border-danger on --env-color-bg-neutral-muted over --env-color-bg-page',
  ],
  [
    '--color-border-danger-emphasis on --color-bg-page',
    '--env-color-border-danger on --env-color-bg-page',
  ],
  [
    '--color-border-done-emphasis on --color-bg-default',
    '--env-color-border-done on --env-color-bg-default',
  ],
  [
    '--color-border-done-emphasis on --color-bg-page',
    '--env-color-border-done on --env-color-bg-page',
  ],
  [
    '--color-border-neutral-emphasis on --color-bg-default',
    '--env-color-border-neutral on --env-color-bg-default',
  ],
  [
    '--color-border-neutral-emphasis on --color-bg-page',
    '--env-color-border-neutral on --env-color-bg-page',
  ],
  [
    '--color-border-success-emphasis on --color-bg-default',
    '--env-color-border-success on --env-color-bg-default',
  ],
  [
    '--color-border-success-emphasis on --color-bg-page',
    '--env-color-border-success on --env-color-bg-page',
  ],
  [
    '--color-border-warning-emphasis on --color-bg-default',
    '--env-color-border-warning on --env-color-bg-default',
  ],
  [
    '--color-border-warning-emphasis on --color-bg-page',
    '--env-color-border-warning on --env-color-bg-page',
  ],
];

/**
 * Pairs the gate still measures under another name, from the old name to the new, with the reason.
 * tests/browser/Contrast.spec.ts checks that each old name is not declared, and that each new one
 * is, or has since been dropped or renamed onward in turn.
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
  ...(['raised', 'popup'] as const).map((layer) => ({
    from: `--env-color-fg-accent on --env-color-bg-accent-muted over --env-color-bg-${layer}`,
    to: `--env-color-fg-accent on --env-color-bg-accent-badge over --env-color-bg-${layer}`,
    rationale:
      'A soft accent badge takes a tint of its own, bg.accent.badge: fainter than bg.accent.muted in light, so the blue keeps 4.5:1 on a light row, and the same in dark and at high contrast.',
  })),
  ...prefixedPairs.map(([from, to]) => ({
    from,
    to,
    rationale: 'Every token takes the --env- prefix.',
  })),
  ...aliasPairs.map(([from, to]) => ({
    from,
    to,
    rationale:
      'The 0.7 aliases are gone with the --env- prefix: the pair is measured on the token that replaces the alias, of the same color in every theme.',
  })),
  ...renamedTokenPairs.map(([from, to]) => ({
    from,
    to,
    rationale:
      'Every token takes the --env- prefix, and the tone borders are named by emphasis: the solid edge is border.{tone}.emphasis, the translucent one border.{tone}.',
  })),
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
 *   color, `currentColor`, which only the button knows (Button.css sets Badge.css's hooks).
 * - Calendar heatmap steps mix the tone into the page by a share that depends on how many steps the
 *   data has, from 30% at the lightest to the full tone (CalendarHeatmap.tsx and .css). The
 *   lightest step of the default accent tone is measured.
 */
export const derived: Readonly<Record<string, string>> = {
  'badge-outline-primary': 'color-mix(in srgb, var(--env-color-fg-on-emphasis) 55%, transparent)',
  'badge-outline-important': 'color-mix(in srgb, var(--env-color-fg-on-strong) 55%, transparent)',
  'heatmap-accent-lowest':
    'color-mix(in srgb, var(--env-color-fg-accent) 30%, var(--env-color-bg-page))',
};

/** The CSS color a name in a pair stands for. */
export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
