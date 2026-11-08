/**
 * The contrast gate's pair registry: every foreground envUI paints on a background, with the kind
 * of contrast WCAG 2.x asks of it, and every pair of state fills that must look different.
 * tests/browser/library/Contrast.spec.ts resolves each pair in every theme of Themes.ts, in a real browser,
 * and fails on any pair below the theme's minimum for its kind that Exceptions.json doesn't list.
 *
 * - `fg` and each `bg` layer name a custom property: a semantic role (`--env-color-{bg|fg|border}-…`),
 *   or a component token where the component takes a different role per theme (`--env-color-bg-list-item`,
 *   `--env-color-bg-primary-emphasis`…). The few colors a component still composes where it paints, because they
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
 *   under the pointer, or two labels). Themes.ts sets the minimum of each kind in each theme and
 *   says why.
 * - A pair that departs from those rules says why in its `rationale`: `contrast: 'high'` measures it
 *   only in the high-contrast themes, `contrast: 'standard'` only outside them, and `minimum` lowers its minimum at standard or high contrast. Pairs the gate no
 *   longer measures are listed in `dropped`, and pairs it measures under a new name in `renamed`,
 *   each with the reason, rather than disappearing. DeclaredPairs.json records what each pair is
 *   held to, and the gate fails on a pair held to less than it records unless `relaxed` lists the
 *   change with its rationale (Snapshot.ts).
 * - Disabled states are exempt from 1.4.3 and 1.4.11, so none is listed.
 *
 * A pair is named `<fg> on <bg> over <next layer>`, which is also how Exceptions.json refers to it.
 */
import { readFileSync } from 'node:fs';

export type ContrastKind = 'text' | 'non-text' | 'focus' | 'difference' | 'distinct';

export interface ContrastPair {
  fg: string;
  bg: readonly string[];
  kind: ContrastKind;
  /** Measured only in the themes of this contrast; both when absent. */
  contrast?: 'standard' | 'high';
  /** Minimums below the kind's, per contrast, for what WCAG doesn't require of this pair. */
  minimum?: { readonly standard?: number; readonly high?: number };
  /** Why the pair is scoped to one contrast or held to a lower minimum. */
  rationale?: string;
  note?: string;
}

const tones = ['neutral', 'primary', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const alertTones = ['primary', 'success', 'warning', 'danger'] as const;
/** The avatar hues, each a pair of its own; the unsuffixed tokens are the powder hue's. */
const avatarHues = [
  'powder',
  'seafoam',
  'sage',
  'butter',
  'blush',
  'periwinkle',
  'orchid',
  'oat',
] as const;

/** The text color of each status tone; the neutral tone is muted text. */
const toneText = (tone: (typeof tones)[number]) =>
  tone === 'neutral' ? '--env-color-fg-muted' : `--env-color-fg-${tone}`;

/** The tint of a soft badge: the tone's muted fill, and for the primary and accent a tint of its own. */
const badgeTint = (tone: (typeof tones)[number]) =>
  tone === 'primary' || tone === 'accent'
    ? `--env-color-bg-${tone}-soft`
    : `--env-color-bg-${tone}-muted`;
/** The fill of a solid badge: the tone's emphasis fill, and for the primary and accent a solid one. */
const badgeFill = (tone: (typeof tones)[number]) =>
  tone === 'primary' || tone === 'accent'
    ? `--env-color-bg-${tone}-solid`
    : `--env-color-bg-${tone}-emphasis`;

// Surfaces, by role.
const page = '--env-color-bg-page'; // the app frame, title bars, Surface background="page"
const recessed = '--env-color-bg-recessed'; // below the panes, a shade deeper than the page in dark: Surface background="recessed", the catalogue's canvas
const recessedHover = '--env-color-bg-recessed-hover';
const recessedPressed = '--env-color-bg-recessed-pressed';
const surface = '--env-color-bg-default'; // Surface's default, sidebars, standard menus
const muted = '--env-color-bg-muted'; // Surface background="muted", cards, radio rows
const raised = '--env-color-bg-raised'; // Surface background="raised", tables, docked panels, the pager
const popup = '--env-color-bg-popup'; // Select lists, popovers, compact menus, menu rows, the composer, solid dialogs
const field = '--env-color-bg-field';
const overlay = '--env-color-bg-backdrop'; // the backdrop behind dialogs
const selected = '--env-color-bg-selected';
const selectedHover = '--env-color-bg-selected-hover';
const selectedPressed = '--env-color-bg-selected-pressed';
const popupHover = '--env-color-bg-popup-hover';
const popupPressed = '--env-color-bg-popup-pressed';
const fill = '--env-color-bg-neutral-muted'; // the translucent fill of tab rails, chips, secondary buttons
const layerHover = '--env-color-bg-neutral-subtle-hover';
const layerPressed = '--env-color-bg-neutral-subtle-pressed';
// The state layer of tree and table rows: in light a step quieter than layerHover, under the selection.
const treeRowHover = '--env-color-bg-row-hover';
const treeRowPressed = '--env-color-bg-row-pressed';
const navigationHover = '--env-color-bg-navigation-hover';
const navigationPressed = '--env-color-bg-navigation-pressed';
// A frosted popup's fill, translucent (derived below), and the worst that can be behind it; and the
// fill itself, opaque: the popup color (Popup.css).
const frosted = 'popup-frosted';
const popupFill = 'popup-fill';
const worstBackdrop = 'popup-worst-backdrop';
// A tooltip's frosted fill, a key chip on it and the worst behind it (Tooltip.css).
const tooltipFrosted = 'tooltip-frosted';
// A text field's prefix and suffix (TextField.css).
const textFieldAffix = 'text-field-affix';
// A segmented control's thumb, the chosen segment on its track (SegmentedControl.css).
const segmentThumb = 'segmented-control-thumb';
// The thumb at high contrast, a layer of the neutral fill (SegmentedControl.css).
const segmentThumbHigh = 'segmented-control-thumb-high';
const segmentThumbStandard = {
  contrast: 'standard',
  rationale:
    'At high contrast the thumb is a layer of the neutral fill (SegmentedControl.css), segmented-control-thumb-high, measured under the same pairs.',
} as const;
const segmentThumbAtHigh = {
  contrast: 'high',
  rationale:
    'The thumb at high contrast (SegmentedControl.css); segmented-control-thumb is measured at standard contrast.',
} as const;
/** The surfaces a segmented control's track sits on, each with the track's fill over it. */
const segmentTracks = [page, surface, muted, raised].map((below) => [fill, below] as const);
const tooltipKey = 'tooltip-key';
const tooltipWorstBackdrop = 'tooltip-worst-backdrop';
const frostedOverWorst = [
  '--env-color-fg-default',
  '--env-color-fg-muted',
  '--env-color-fg-control',
  '--env-color-fg-link',
  '--env-color-fg-danger',
  // Today in a calendar and this month in a month picker.
  '--env-color-fg-primary',
] as const;
// Component tokens that take a different role per theme.
const row = '--env-color-bg-list-item'; // List rows: the muted surface in both themes
const rowHover = '--env-color-bg-list-item-hover';
const rowPressed = '--env-color-bg-list-item-pressed';

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
/** The + between keys in a button's end slot, in the button's content color `--env-color-fg-<role>`. */
const buttonEndSeparator = (role: string, backgrounds: readonly Background[]) =>
  on(
    'non-text',
    `button-end-separator-${role}`,
    backgrounds,
    `The + between the keys in the end slot of a button whose label is --env-color-fg-${role}`,
  );
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
 * apart by its fill and this edge alone, and a modal by its backdrop as well: the edge must be clearly
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
 * The tone's stronger tint, its subtle hover fill: an alert's hover layer and a soft badge's tint,
 * which alerts rested on until 1.0.0-prerelease.6. Their text stays measured on it at standard
 * contrast; an alert now rests on the tone's muted fill (alertRest) in every contrast.
 */
const alertFill = (tone: (typeof alertTones)[number]) => `--env-color-bg-${tone}-subtle-hover`;
/** An alert's fill: the tone's muted tint, at every contrast. */
const alertRest = (tone: (typeof alertTones)[number]) => `--env-color-bg-${tone}-muted`;
/** What an alert sits on: the page, a pane and a card. In light its tint lies over the raised surface,
 * white, which the card measures. */
const alertGrounds = [page, surface, muted] as const;
/** The stronger tint of an alert or a soft badge, which high contrast replaces with the softer one. */
const tonal = {
  contrast: 'standard',
  rationale:
    'The tone’s stronger tint fills an alert and a soft badge only at standard contrast; at high contrast they take its softer tint, measured there.',
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

const registry: readonly ContrastPair[] = merged([
  // Text on every surface role.
  ...text('--env-color-fg-default', [page, surface, muted, raised, popup]),
  ...text(
    '--env-color-fg-muted',
    [page, surface, muted, raised, popup],
    'Supporting text, icons, field descriptions, unchecked checkbox rings',
  ),
  ...text('--env-color-fg-control', [page, surface], 'Navigation labels and meter values'),
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
  ...text(
    '--env-color-fg-danger-hover',
    [page, surface, muted, raised, popup],
    'A danger text button under the pointer; in a selected table row it keeps the danger color',
  ),
  ...text(
    '--env-color-fg-danger-pressed',
    [page, surface, muted, raised, popup],
    'A danger text button while pressed; in a selected table row it keeps the danger color',
  ),
  // Where a tint lowers the link blue below 4.5:1 in the light theme, links and text buttons take
  // the link colors for a tint: alerts and rows under the pointer or pressed point fg.link at them,
  // and applications put them on the brand's muted tint.
  ...text(
    '--env-color-fg-link-on-muted',
    [
      [layerHover, raised],
      [layerHover, surface],
      [treeRowHover, raised],
      [treeRowHover, surface],
      [treeRowPressed, raised],
      [treeRowPressed, surface],
      rowHover,
      rowPressed,
      ['--env-color-bg-primary-muted', page],
      ['--env-color-bg-primary-muted', surface],
    ],
    'Links and text buttons in an interactive table row under the pointer or holding focus, in a list row under the pointer or pressed, and on the brand’s muted tint',
  ),
  ...text(
    '--env-color-fg-link-on-muted-hover',
    [
      [layerHover, raised],
      [layerHover, surface],
      [treeRowHover, raised],
      [treeRowHover, surface],
      rowHover,
      ['--env-color-bg-primary-muted', page],
      ['--env-color-bg-primary-muted', surface],
    ],
    'A link under the pointer in a row under the pointer, and on the brand’s muted tint',
  ),
  ...text(
    '--env-color-fg-link-on-muted-pressed',
    [
      [layerHover, raised],
      [layerHover, surface],
      [treeRowPressed, raised],
      [treeRowPressed, surface],
      rowPressed,
      ['--env-color-bg-primary-muted', page],
      ['--env-color-bg-primary-muted', surface],
    ],
    'A pressed link in a row, and on the brand’s muted tint',
  ),
  ...alertTones.flatMap((tone) =>
    [
      '--env-color-fg-link-on-muted',
      '--env-color-fg-link-on-muted-hover',
      '--env-color-fg-link-on-muted-pressed',
    ].flatMap((link) => [
      ...on(
        'text',
        link,
        alertGrounds.map((ground) => [alertFill(tone), ground]),
        `Links and text buttons in an alert, tone="${tone === 'primary' ? 'info' : tone}", at rest, hovered and pressed`,
        tonal,
      ),
      ...text(
        link,
        alertGrounds.map((ground) => [alertRest(tone), ground]),
        `Links and text buttons in an alert, tone="${tone === 'primary' ? 'info' : tone}", on its tint, at rest, hovered and pressed`,
      ),
    ]),
  ),
  ...text(
    '--env-color-fg-muted-hover',
    [page, surface, muted, raised, popup],
    'Disclosure summaries and checkbox rings on hover, and the labels of unselected tabs',
  ),
  ...text('--env-color-fg-muted-pressed', [page, surface], 'Disclosure summaries on press'),

  // Actions: labels on their fills, at rest, hovered and pressed. The marks of checked controls on
  // the same fill are held to the text minimum too, 4.5:1 and 7:1 at high contrast, though WCAG
  // asks 3:1 of them: a check reads as a symbol, as a glyph does.
  ...text(
    '--env-color-fg-on-emphasis',
    [
      '--env-color-bg-primary-emphasis',
      '--env-color-bg-primary-emphasis-hover',
      '--env-color-bg-primary-emphasis-pressed',
    ],
    'Primary buttons, the chosen calendar day and time, the check of a checked checkbox and the thumb of a switch that is on',
  ),
  ...nonText(
    '--env-color-border-default-pressed',
    [
      [fill, page],
      [fill, surface],
      [fill, muted],
      [fill, raised],
    ],
    'The thumb of a switch that is off on its track at rest: the fill is translucent, so it is measured on each surface it sits on',
  ),
  ...nonText(
    '--env-color-fg-muted',
    [
      ['--env-color-bg-neutral-muted-hover', page],
      ['--env-color-bg-neutral-muted-pressed', page],
      ['--env-color-bg-neutral-muted-hover', surface],
      ['--env-color-bg-neutral-muted-pressed', surface],
      ['--env-color-bg-neutral-muted-hover', muted],
      ['--env-color-bg-neutral-muted-pressed', muted],
      ['--env-color-bg-neutral-muted-hover', raised],
      ['--env-color-bg-neutral-muted-pressed', raised],
    ],
    'The thumb of a switch that is off on its track under the pointer and pressed',
  ),
  ...text(
    '--env-color-fg-default',
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
    'Secondary buttons: the fill is translucent, so it is measured on each surface it sits on',
  ),
  ...text(
    '--env-color-fg-primary',
    [raised, '--env-color-bg-raised-hover', '--env-color-bg-raised-pressed'],
    'The icon of a pager link',
  ),
  ...text(
    '--env-color-fg-primary',
    [page, surface, muted, raised, popup].flatMap((ground) => [
      ground,
      [layerHover, ground],
      [layerPressed, ground],
    ]),
    'Text in the brand’s text color, such as a selected tab’s label or today in a calendar, on the page, a pane, a card, a raised surface or a popup, at rest, hovered and pressed',
  ),
  // An outline button has no fill: its label, in the text color, sits on the surface beneath it,
  // and on hover and press on the state layer over that surface.
  ...text(
    '--env-color-fg-default',
    [page, surface, muted, raised, popup].flatMap((ground) => [
      ground,
      [layerHover, ground],
      [layerPressed, ground],
    ]),
    'The label of an outline button and an outline Select trigger, on the page, a pane, a card, a raised surface or a popup, at rest, hovered and pressed',
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
      '--env-color-bg-accent-strong',
      '--env-color-bg-accent-strong-hover',
      '--env-color-bg-accent-strong-pressed',
    ],
    'Button variant="important"',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-danger-emphasis',
      '--env-color-bg-danger-emphasis-hover',
      '--env-color-bg-danger-emphasis-pressed',
    ],
    'Primary buttons in the danger tone, at rest, hovered and pressed',
  ),
  ...text(
    '--env-color-fg-on-emphasis',
    [
      '--env-color-bg-accent-emphasis',
      '--env-color-bg-accent-emphasis-hover',
      '--env-color-bg-accent-emphasis-pressed',
    ],
    'Primary buttons in the accent tone, at rest, hovered and pressed',
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
    'Ghost and text buttons in the danger tone, on a raised surface and on the state layer of a ghost button on hover and press',
  ),
  ...text(
    '--env-color-fg-danger',
    [page, surface, muted, raised, popup].flatMap((ground) => [
      ground,
      [layerHover, ground],
      [layerPressed, ground],
    ]),
    'The label of an outline button in the danger tone, which has no fill: on the page, a pane, a card, a raised surface or a popup, at rest, hovered and pressed',
  ),
  // Ghost and outline buttons, and icon-only text buttons, in the danger tone lay the tone's own
  // tint on hover and press: on press the tone's hover layer, a soft danger badge's tint, which the
  // badge pairs measure under fg.danger on the page, a pane, a card, a raised surface and a popup;
  // on hover a lighter mix of it, which the label clears by more.

  // Fields.
  ...text('--env-color-fg-default', [field]),
  ...text('--env-color-fg-muted', [field], 'Labels, placeholders and icons in the field'),
  ...text(
    textFieldAffix,
    [field, page, surface, muted, raised],
    'A prefix or a suffix, quieter than the value, in a field and in a ghost field on any surface',
  ),
  ...text('--env-color-border-primary-emphasis', [field], 'The label of a focused field'),
  ...text('--env-color-fg-danger', [field], 'The label and message of an invalid field'),
  // A field has no fill of its own: its text, label and border sit on the surface beneath it.
  ...text(
    '--env-color-fg-primary',
    [page, surface, muted, raised, popup],
    'The label of a focused field, on the surface the field sits on',
  ),
  ...nonText(
    '--env-color-border-primary-emphasis',
    [muted, raised],
    'The border of a focused field on a card or in a dialog',
  ),
  ...text(
    '--env-color-fg-danger',
    [page, surface, raised, popup],
    'The label of an invalid field, on the surface the field sits on',
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [muted, popup],
    'The border of an invalid field on a card or in a popover',
  ),
  ...text(
    '--env-color-fg-default',
    [
      [fill, muted],
      [fill, popup],
    ],
    'Combobox chips in a field on a card or in a popover',
  ),
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
    'The only boundary of outlined fields, the composer, outlined buttons, Select triggers and the track of a switch that is off; DropZone and the empty stars of a Rating take it too',
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [page, surface, muted, raised, popup],
    'The edge of an outline button in the danger tone, on the surface beneath it',
  ),
  // Hovered and pressed, the edge is measured against the surface beside it, outside the button;
  // the state layer is inside.
  ...nonText('--env-color-border-danger-emphasis-hover', [page, surface, muted, raised, popup]),
  ...nonText('--env-color-border-danger-emphasis-pressed', [page, surface, muted, raised, popup]),
  ...nonText(
    '--env-color-border-primary-emphasis',
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
    [popup, raised, [overlay, page]],
    'The edge of dialogs and the command palette where they are solid, against their fill and the backdrop',
    popupEdge,
  ),
  ...nonText(
    '--env-elevation-3-border',
    [surface, page, muted],
    'The edge of a solid popup at high contrast, a modal’s, against what it floats over; against the popup and a raised surface it is measured above',
    {
      contrast: 'high',
      rationale:
        'Popups are frosted with no edge at standard contrast; at high contrast they are solid, bounded by the strongest elevation edge, measured as a boundary there.',
    },
  ),

  // Frosted popups: menus, Select and Combobox lists, popovers, hover cards, the pickers, rich text
  // suggestions and the command palette let a little of what is behind them through. Text on the
  // fill is held over the worst that can be behind, a black area in light and a white one in dark;
  // the highlight, the key chips and the palette's search are held over what popups float over.
  // At high contrast the fill is solid, so these measure the solid popup.
  ...frostedOverWorst.flatMap((fg) =>
    text(fg, [[frosted, worstBackdrop]], 'Text on a frosted popup, over the worst behind it'),
  ),
  ...nonText(
    '--env-color-bg-primary-emphasis',
    [[frosted, worstBackdrop]],
    'Check marks in a menu, on a frosted popup over the worst behind it',
  ),
  ...[page, surface, muted].flatMap((behind) => [
    ...text('--env-color-fg-default', [[fill, frosted, behind]], 'A highlighted row, a key chip'),
    ...text(
      '--env-color-fg-muted',
      [[fill, frosted, behind]],
      'A highlighted row’s description and icon, and keys as chips at rest',
    ),
    ...text(
      '--env-color-fg-danger',
      [[fill, frosted, behind]],
      'A destructive menu item’s label and icon on its highlighted row',
    ),
    ...text(
      '--env-color-fg-default',
      [[fill, fill, frosted, behind]],
      'Key chips on a highlighted row',
    ),
    ...text('--env-color-fg-default', [['--env-color-bg-neutral-muted-pressed', frosted, behind]]),
    ...different(fill, [[frosted, behind]], 'A highlighted option or menu item on a frosted popup'),
    ...distinct(
      selected,
      [[fill, frosted, behind]],
      'The chosen option against a highlighted one on a frosted popup',
    ),
    ...focus(
      '--env-color-border-focus',
      [[fill, frosted, behind]],
      'The inset ring of a highlighted row on a frosted popup',
    ),
  ]),
  // Frosted tooltips: their strong fill lets a little of what is behind through (Tooltip.css), so
  // their light text and its key chips are held over the worst behind, a white area, in every
  // theme. At high contrast the fill is solid.
  ...text(
    '--env-color-fg-on-strong',
    [[tooltipFrosted, tooltipWorstBackdrop]],
    'Text on a frosted tooltip, over the worst behind it',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [[tooltipKey, tooltipFrosted, tooltipWorstBackdrop]],
    'A key chip in a frosted tooltip, over the worst behind it',
  ),
  ...text(
    '--env-color-fg-muted',
    [[fill, popupFill]],
    'The command palette’s search placeholder, on its opaque pill',
  ),
  ...text(
    '--env-color-fg-default',
    [[fill, popupFill]],
    'Text typed in the command palette’s search',
  ),

  // Choice controls.
  ...text(
    '--env-color-fg-default',
    ['--env-color-bg-muted-hover', '--env-color-bg-muted-pressed'],
    'Radio rows',
  ),
  ...text('--env-color-fg-muted', ['--env-color-bg-muted-hover'], 'Radio row details'),
  ...nonText(
    '--env-color-bg-primary-emphasis',
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
      '--env-color-bg-primary-strong',
      '--env-color-bg-primary-strong-hover',
      '--env-color-bg-primary-strong-pressed',
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
  ...[
    [segmentThumb, segmentThumbStandard] as const,
    [segmentThumbHigh, segmentThumbAtHigh] as const,
  ].flatMap(([thumb, extra]) => [
    ...on(
      'text',
      '--env-color-fg-default',
      segmentTracks.map((track) => [thumb, ...track]),
      'The chosen segment’s label and count on its thumb',
      extra,
    ),
    ...on(
      'difference',
      thumb,
      segmentTracks,
      'The chosen segment’s thumb against its track',
      extra,
    ),
    ...on(
      'focus',
      '--env-color-border-focus',
      segmentTracks.map((track) => [thumb, ...track]),
      'The inset ring of the chosen segment, on its thumb',
      extra,
    ),
  ]),
  ...text(
    '--env-color-fg-default',
    segmentTracks,
    'The label of a segment not chosen under the pointer, on the track with no layer',
  ),
  ...text(
    '--env-color-fg-muted-pressed',
    segmentTracks.map((track) => [layerPressed, ...track]),
    'The label of a segment not chosen, on its state layer while pressed',
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
  ...text(
    '--env-color-fg-default',
    [surface, page],
    "A navigation drawer's group headings, on the drawer's fill and on the page",
  ),
  ...text(
    '--env-color-fg-muted',
    [surface, page],
    "A navigation drawer's items, under its headings, on the drawer's fill and on the page",
  ),
  ...text(
    '--env-color-fg-muted-hover',
    [navigationHover],
    "A navigation drawer's item under the pointer",
  ),
  ...text(
    '--env-color-fg-muted-pressed',
    [navigationPressed],
    "A navigation drawer's item pressed",
  ),
  ...distinct(
    '--env-color-fg-on-selected',
    ['--env-color-fg-muted'],
    'The current item of a navigation drawer against its other items',
  ),
  ...nonText('--env-color-fg-on-selected', [[fill, page]], 'The bar of the active document tab'),

  // Selection must not be mistaken for the other items around it, at rest or under the pointer, and
  // must stay selected while it is under the pointer itself: a selected row next to a hovered one,
  // a hovered selected row against a hovered unselected one. Every state also differs from its rest.
  ...distinct(
    selected,
    [
      popup,
      popupHover,
      surface,
      page,
      raised,
      [treeRowHover, page],
      [treeRowHover, surface],
      [treeRowHover, raised],
    ],
    'The selection against the other items, at rest and under the pointer: Select options, tree and table rows',
  ),
  ...distinct(selected, [navigationHover], 'A selected navigation item next to a hovered one'),
  ...distinct(selected, [navigationPressed], 'A selected navigation item next to a pressed one'),
  ...distinct(
    selectedHover,
    [
      navigationHover,
      popupHover,
      [treeRowHover, page],
      [treeRowHover, surface],
      [treeRowHover, raised],
    ],
    'A selected item under the pointer against an unselected one under the pointer: navigation items, Select options, tree and table rows',
  ),
  ...different(selectedHover, [selected], 'A selected item under the pointer'),
  ...different(popupHover, [popup], 'A highlighted option or menu item'),
  ...different(
    navigationHover,
    [surface, page],
    'A navigation item under the pointer, on a sidebar and on the page',
  ),
  ...different(
    layerHover,
    [surface, page, raised],
    'A control without a fill under the pointer, such as a ghost button',
  ),
  ...different(treeRowHover, [surface, page, raised], 'A tree or table row under the pointer'),
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
  // The recessed surface: a well a shade deeper than the page. Everything on the page is measured
  // on it too, below; here its edge against the page and its states.
  ...different(recessed, [page], 'A recessed surface against the page around it'),
  ...text(
    '--env-color-fg-default',
    [recessedHover, recessedPressed],
    'An interactive recessed surface, hovered and pressed',
  ),
  ...text('--env-color-fg-muted', [recessedHover, recessedPressed]),
  ...different(recessedHover, [recessed], 'A recessed surface under the pointer'),
  ...different(recessedPressed, [recessedHover], 'A recessed surface pressed'),

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
            ...(tone === 'primary' || tone === 'accent'
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
          'A soft badge at high contrast, on a row, a muted or raised surface or a popup',
        )),
    // A soft badge in a status tone takes the tone's stronger tint, its subtle hover fill, outside
    // high contrast, wherever a badge sits.
    ...(tone === 'neutral' || tone === 'done'
      ? []
      : on(
          'text',
          toneText(tone),
          [page, surface, row, muted, raised, popup].map((ground) => [
            `--env-color-bg-${tone}-subtle-hover`,
            ground,
          ]),
          'A soft badge on the page, a pane, a row, a muted or raised surface or a popup',
          tonal,
        )),
    ...text(
      tone === 'danger' ? '--env-color-fg-on-strong' : '--env-color-fg-on-emphasis',
      [badgeFill(tone)],
      'Solid badges and counters',
    ),
  ]),
  ...text(
    '--env-color-fg-on-emphasis',
    ['--env-color-bg-warning-emphasis'],
    "The catalogue's caution bar, a dark island in both themes: the dark themes' values are its",
  ),
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
  // An alert: its message in the text color, its title and icon in the tone's, on its fill on the
  // page, a pane and a card, and at high contrast on the tone's softer tint, which the tone's text
  // pairs above measure on the page and a pane.
  ...alertTones.flatMap((tone) => [
    ...on(
      'text',
      '--env-color-fg-default',
      alertGrounds.map((ground) => [alertFill(tone), ground]),
      `Alert tone="${tone}": the message`,
      tonal,
    ),
    ...on(
      'text',
      toneText(tone),
      alertGrounds.map((ground) => [alertFill(tone), ground]),
      `Alert tone="${tone}": the title, and the icon held to the text minimum`,
      tonal,
    ),
    ...text(
      '--env-color-fg-default',
      alertGrounds.map((ground) => [alertRest(tone), ground]),
      `Alert tone="${tone}" on its tint: the message`,
    ),
    ...text(
      toneText(tone),
      alertGrounds.map((ground) => [alertRest(tone), ground]),
      `Alert tone="${tone}" on its tint: the title, and the icon held to the text minimum`,
    ),
    ...nonText(
      toneText(tone),
      [
        [`--env-color-bg-${tone}-subtle-hover`, alertFill(tone), page],
        [`--env-color-bg-${tone}-subtle-pressed`, alertFill(tone), page],
        [`--env-color-bg-${tone}-subtle-hover`, `--env-color-bg-${tone}-muted`, page],
        [`--env-color-bg-${tone}-subtle-pressed`, `--env-color-bg-${tone}-muted`, page],
      ],
      'The dismiss icon of an alert on hover and press, on its fill and at high contrast on its softer tint',
    ),
    // The label of an outline or text button among an alert's actions, in the text color, over the
    // dismiss button's layers.
    ...on(
      'text',
      '--env-color-fg-default',
      [
        [`--env-color-bg-${tone}-subtle-hover`, alertFill(tone), page],
        [`--env-color-bg-${tone}-subtle-pressed`, alertFill(tone), page],
      ],
      `An outline or text button among the actions of an alert, tone="${tone}", on hover and press`,
      tonal,
    ),
    ...text(
      '--env-color-fg-default',
      [[`--env-color-bg-${tone}-subtle-hover`, `--env-color-bg-${tone}-muted`, page]],
      `An outline or text button among the actions of an alert, tone="${tone}", on hover over its tint`,
    ),
    ...on(
      'text',
      '--env-color-fg-default',
      [[`--env-color-bg-${tone}-subtle-pressed`, `--env-color-bg-${tone}-muted`, page]],
      `An outline or text button among the actions of an alert, tone="${tone}", while pressed over its tint`,
      {
        minimum: { high: 4.5 },
        rationale:
          'A press lasts a moment: the label keeps the text minimum of standard contrast under the tone’s pressed layer, as the dismiss button’s does there.',
      },
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
  ...(['success', 'info', 'danger'] as const).flatMap((tone) =>
    nonText(
      `--env-color-fg-${tone}-on-strong`,
      ['--env-color-bg-neutral-strong'],
      'A toast’s tone icon, on the toast’s neutral strong fill',
    ),
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
    '--env-color-fg-primary',
    [
      [fill, page],
      [fill, surface],
    ],
    'Chips',
  ),
  ...text('--env-color-fg-default', [[fill, field]], 'Combobox chips'),
  // Avatars are tonal pairs: each hue's initials, and its figure, a deep shade on its pastel fill.
  ...text('--env-color-fg-avatar', ['--env-color-bg-avatar'], 'Avatar initials on their hue'),
  ...avatarHues.flatMap((hue) =>
    text(
      `--env-color-fg-avatar-${hue}`,
      [`--env-color-bg-avatar-${hue}`],
      'Avatar initials on their hue',
    ),
  ),
  ...nonText(
    '--env-color-fg-avatar-figure',
    ['--env-color-bg-avatar'],
    'The avatar figure on its hue',
  ),
  ...avatarHues.flatMap((hue) =>
    nonText(
      `--env-color-fg-avatar-figure-${hue}`,
      [`--env-color-bg-avatar-${hue}`],
      'The avatar figure on its hue',
    ),
  ),
  ...text(
    '--env-color-fg-default',
    ['--env-color-bg-raised-hover', '--env-color-bg-raised-pressed'],
    'Pager links and rows on a contrasting surface, hovered and pressed',
  ),
  ...text('--env-color-fg-muted', ['--env-color-bg-raised-hover'], 'Pager link captions on hover'),
  ...nonText(
    '--env-color-bg-primary-emphasis',
    [page, surface, muted, raised, [fill, page], [fill, surface]],
    'Spinners, and meter indicators on their track',
  ),
  // Slider: a field whose track is the neutral fill, with a stronger fill from the start to the
  // value; the label, the value and the handle sit on both.
  ...text(
    '--env-color-fg-default',
    [
      ['--env-color-bg-neutral-subtle-pressed', fill, page],
      ['--env-color-bg-neutral-subtle-pressed', fill, surface],
      ['--env-color-bg-neutral-subtle-pressed', fill, muted],
      ['--env-color-bg-neutral-subtle-pressed', fill, raised],
      ['--env-color-bg-neutral-subtle-pressed', fill, popup],
    ],
    'The label, the value and the handle of a slider on its fill',
  ),
  ...different(
    '--env-color-bg-neutral-subtle-pressed',
    [
      [fill, page],
      [fill, surface],
      [fill, muted],
      [fill, raised],
      [fill, popup],
    ],
    'The fill of a slider against its track',
  ),
  ...nonText(
    '--env-color-bg-primary-emphasis',
    [
      [fill, page],
      [fill, surface],
      [fill, muted],
      [fill, raised],
      [fill, popup],
    ],
    'The indicators of Meter and Progress on their track, the neutral fill with no outline, on every surface',
  ),
  ...distinct(
    'heatmap-accent-lowest',
    [[fill, page]],
    'The lightest step of a calendar heatmap against an empty day',
  ),
  ...nonText(
    'badge-outline-primary',
    ['--env-color-bg-primary-emphasis', '--env-color-bg-accent-emphasis'],
    'The outline of a badge or counter on a primary button in the neutral or accent tone',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the primary button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),
  ...nonText(
    'badge-outline-important',
    ['--env-color-bg-accent-strong', '--env-color-bg-danger-emphasis'],
    'The outline of a badge or counter on an important button or a danger primary, on a white label',
    {
      minimum: { standard: 1.5, high: 3 },
      rationale:
        'Decorative: the pill’s text is the button’s label color, which the important button pairs measure at 4.5:1; the outline only groups it. Held to 1.5:1, and 3:1 in high contrast, so it stays visible.',
    },
  ),

  // The + between the keys in a button's end slot: the button's content color at 80%, decorative,
  // since the keys around it name the shortcut. The keys and any text in the slot are the label's
  // color on no fill of their own, which the button pairs above measure.
  ...buttonEndSeparator('on-emphasis', [
    '--env-color-bg-primary-emphasis',
    '--env-color-bg-primary-emphasis-hover',
    '--env-color-bg-primary-emphasis-pressed',
    '--env-color-bg-accent-emphasis',
    '--env-color-bg-accent-emphasis-hover',
    '--env-color-bg-accent-emphasis-pressed',
  ]),
  ...buttonEndSeparator('control', [
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
  ]),
  ...buttonEndSeparator('accent', [
    raised,
    '--env-color-bg-raised-hover',
    '--env-color-bg-raised-pressed',
  ]),
  ...buttonEndSeparator('on-strong', [
    '--env-color-bg-danger-emphasis',
    '--env-color-bg-danger-emphasis-hover',
    '--env-color-bg-danger-emphasis-pressed',
    '--env-color-bg-danger-strong',
    '--env-color-bg-danger-strong-hover',
    '--env-color-bg-danger-strong-pressed',
    '--env-color-bg-accent-strong',
    '--env-color-bg-accent-strong-hover',
    '--env-color-bg-accent-strong-pressed',
  ]),
  ...buttonEndSeparator('muted', [page, surface, muted, raised]),
  ...buttonEndSeparator('default', [
    [layerHover, page],
    [layerPressed, page],
    [layerHover, surface],
    [layerPressed, surface],
  ]),
  ...buttonEndSeparator('link', [page, surface, muted, raised]),
  ...buttonEndSeparator('danger', [
    raised,
    '--env-color-bg-raised-hover',
    '--env-color-bg-raised-pressed',
    [layerHover, page],
    [layerPressed, page],
    [layerHover, surface],
    [layerPressed, surface],
  ]),

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

/** A pair painted on the page, painted on the recessed surface instead. */
const onRecessed = (pair: ContrastPair): ContrastPair => ({
  ...pair,
  bg: [...pair.bg.slice(0, -1), recessed],
  note: `On the recessed surface${pair.note ? `: ${pair.note}` : ''}`,
});

/** The pairs painted on the page, which a recessed surface holds too: all but its own edge. */
const onPage = registry.filter((pair) => pair.bg.at(-1) === page && pair.fg !== recessed);

/**
 * What sits on the page can sit on a recessed surface, a shade deeper, such as the catalogue's
 * canvas, where it shows every example: every pair measured on the page is measured on the recessed
 * surface too, held to the same requirement.
 */
export const pairs: readonly ContrastPair[] = merged([...registry, ...onPage.map(onRecessed)]);

/**
 * Pairs the gate measured once and no longer does, with the reason. A pair that leaves `pairs`
 * must be listed here or in `renamed`: tests/contrast/DeclaredPairs.json holds the names declared
 * when it was last updated, and tests/browser/library/Contrast.spec.ts fails on a name that is gone from
 * `pairs` without an entry, and on a dropped pair that is still declared.
 */
export const dropped: readonly { pair: string; rationale: string }[] = [
  // A switch that is off has a muted thumb now, measured as a boundary at rest and in its states.
  ...['', '-hover', '-pressed'].flatMap((state) =>
    [
      '--env-color-bg-default',
      '--env-color-bg-muted',
      '--env-color-bg-page',
      '--env-color-bg-raised',
      '--env-color-bg-recessed',
    ].map((ground) => ({
      pair: `--env-color-fg-control on --env-color-bg-neutral-muted${state} over ${ground}`,
      rationale:
        'The thumb of a switch that is off is muted, so it no longer outweighs a switch that is on: --env-color-border-default-pressed at rest and --env-color-fg-muted under the pointer and pressed, each measured on the track at 3:1 as the control’s boundary.',
    })),
  ),
  // Alerts have no edge outside high contrast, where the border color bounds them, measured as a
  // boundary there.
  ...(['accent', 'success', 'warning', 'danger'] as const).flatMap((tone) =>
    ['--env-color-bg-page', '--env-color-bg-default', '--env-color-bg-recessed'].map((ground) => ({
      pair: `--env-color-border-${tone}-muted on ${ground}`,
      rationale:
        'Alerts have no edge: the tone’s stronger tint, the icon and the title set them apart. At high contrast an edge in the border color bounds them, measured as the border color is.',
    })),
  ),
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-teal',
    rationale:
      'Avatars are tonal pairs now: the teal fill carries its own deep initials, --env-color-avatar-fg-teal, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-green',
    rationale:
      'Avatars are tonal pairs now: the green fill carries its own deep initials, --env-color-avatar-fg-green, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-amber',
    rationale:
      'Avatars are tonal pairs now: the amber fill carries its own deep initials, --env-color-avatar-fg-amber, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-red',
    rationale:
      'Avatars are tonal pairs now: the red fill carries its own deep initials, --env-color-avatar-fg-red, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-violet',
    rationale:
      'Avatars are tonal pairs now: the violet fill carries its own deep initials, --env-color-avatar-fg-violet, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-purple',
    rationale:
      'Avatars are tonal pairs now: the purple fill carries its own deep initials, --env-color-avatar-fg-purple, measured on it as text, rather than the white initials every hue shared.',
  },
  {
    pair: '--env-color-avatar-fg on --env-color-avatar-bg-slate',
    rationale:
      'Avatars are tonal pairs now: the slate fill carries its own deep initials, --env-color-avatar-fg-slate, measured on it as text, rather than the white initials every hue shared.',
  },
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
  {
    pair: '--env-color-fg-default on catalogue-band',
    rationale:
      'The catalogue’s section band is gone: Rules sits on the page’s background like every other group, so nothing paints on the band’s fill, and the same text on the page stays measured.',
  },
  {
    pair: '--env-color-fg-default on --env-color-bg-neutral-muted over catalogue-band',
    rationale:
      'The catalogue’s section band is gone: Rules sits on the page’s background like every other group, so nothing paints on the band’s fill, and the same text on the page stays measured.',
  },
  {
    pair: '--env-color-fg-muted on catalogue-band',
    rationale:
      'The catalogue’s section band is gone: Rules sits on the page’s background like every other group, so nothing paints on the band’s fill, and the same text on the page stays measured.',
  },
  {
    pair: '--env-color-fg-link on catalogue-band',
    rationale:
      'The catalogue’s section band is gone: Rules sits on the page’s background like every other group, so nothing paints on the band’s fill, and the same text on the page stays measured.',
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
 * Tokens the 1.0 API review renamed, from the old custom property to the new, with the reason. Every
 * pair that names one is measured under its new name, as `renamed` records.
 */
const apiReviewTokens: readonly (readonly [from: string, to: string, rationale: string])[] = [
  [
    '--env-color-bg-overlay',
    '--env-color-bg-backdrop',
    'The layer behind a modal is the backdrop, as Base UI and the Colors page name it.',
  ],
  [
    '--env-color-bg-overlay-muted',
    '--env-color-bg-backdrop-muted',
    'The layer behind a modal is the backdrop, as Base UI and the Colors page name it.',
  ],
  [
    '--env-z-overlay',
    '--env-z-backdrop',
    'The layer behind a modal is the backdrop, as Base UI and the Colors page name it.',
  ],
  [
    '--env-color-avatar-bg',
    '--env-color-bg-avatar',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-blush',
    '--env-color-bg-avatar-blush',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-butter',
    '--env-color-bg-avatar-butter',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-oat',
    '--env-color-bg-avatar-oat',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-orchid',
    '--env-color-bg-avatar-orchid',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-periwinkle',
    '--env-color-bg-avatar-periwinkle',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-powder',
    '--env-color-bg-avatar-powder',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-sage',
    '--env-color-bg-avatar-sage',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-bg-seafoam',
    '--env-color-bg-avatar-seafoam',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg',
    '--env-color-fg-avatar',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-blush',
    '--env-color-fg-avatar-blush',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-butter',
    '--env-color-fg-avatar-butter',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-oat',
    '--env-color-fg-avatar-oat',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-orchid',
    '--env-color-fg-avatar-orchid',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-periwinkle',
    '--env-color-fg-avatar-periwinkle',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-powder',
    '--env-color-fg-avatar-powder',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-sage',
    '--env-color-fg-avatar-sage',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-fg-seafoam',
    '--env-color-fg-avatar-seafoam',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure',
    '--env-color-fg-avatar-figure',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-blush',
    '--env-color-fg-avatar-figure-blush',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-butter',
    '--env-color-fg-avatar-figure-butter',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-oat',
    '--env-color-fg-avatar-figure-oat',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-orchid',
    '--env-color-fg-avatar-figure-orchid',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-periwinkle',
    '--env-color-fg-avatar-figure-periwinkle',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-powder',
    '--env-color-fg-avatar-figure-powder',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-sage',
    '--env-color-fg-avatar-figure-sage',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-avatar-figure-seafoam',
    '--env-color-fg-avatar-figure-seafoam',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-fg-link-on-tint',
    '--env-color-fg-link-on-muted',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-fg-link-on-tint-hover',
    '--env-color-fg-link-on-muted-hover',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-fg-link-on-tint-pressed',
    '--env-color-fg-link-on-muted-pressed',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-list-item-bg',
    '--env-color-bg-list-item',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-list-item-bg-hover',
    '--env-color-bg-list-item-hover',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-list-item-bg-pressed',
    '--env-color-bg-list-item-pressed',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-rating-star',
    '--env-color-fg-rating-star',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-counter-badge-height',
    '--env-badge-count-height',
    'Color tokens follow one grammar, --env-color-{bg|fg|border}-{role}: a component that names a color is its role.',
  ],
  [
    '--env-color-bg-accent-badge',
    '--env-color-bg-primary-soft',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-accent-emphasis',
    '--env-color-bg-primary-solid',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-accent-muted',
    '--env-color-bg-primary-muted',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-accent-subtle',
    '--env-color-bg-primary-subtle',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-accent-subtle-hover',
    '--env-color-bg-primary-subtle-hover',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-accent-subtle-pressed',
    '--env-color-bg-primary-subtle-pressed',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-emphasis',
    '--env-color-bg-primary-emphasis',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-emphasis-hover',
    '--env-color-bg-primary-emphasis-hover',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-emphasis-pressed',
    '--env-color-bg-primary-emphasis-pressed',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-muted',
    '--env-color-bg-primary-muted',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-strong',
    '--env-color-bg-primary-strong',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-strong-hover',
    '--env-color-bg-primary-strong-hover',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-brand-strong-pressed',
    '--env-color-bg-primary-strong-pressed',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-important-strong',
    '--env-color-bg-accent-strong',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-important-strong-hover',
    '--env-color-bg-accent-strong-hover',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-bg-important-strong-pressed',
    '--env-color-bg-accent-strong-pressed',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-border-accent',
    '--env-color-border-primary',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-border-accent-emphasis',
    '--env-color-border-primary-emphasis',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-border-accent-emphasis-hover',
    '--env-color-border-primary-emphasis-hover',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-border-accent-emphasis-pressed',
    '--env-color-border-primary-emphasis-pressed',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-border-accent-muted',
    '--env-color-border-primary-muted',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
  [
    '--env-color-fg-accent',
    '--env-color-fg-primary',
    'The blue roles are primary, and the purple of accent actions is accent: one meaning for a tone on every component.',
  ],
];

/** The token names before the review, by their name now. */
/** The token names before the review, by their name now: two old names may share a new one. */
const beforeReview = new Map<string, { from: string[]; why: string }>();
for (const [from, to, why] of apiReviewTokens)
  beforeReview.set(to, { from: [...(beforeReview.get(to)?.from ?? []), from], why });

/**
 * A pair's names before the review, one for each name its tokens may have had: the name of each
 * token now, or one it had before the review, so a name recorded between two renames counts too.
 */
const reviewed = (name: string): string[] =>
  name
    .split(' ')
    .reduce<string[][]>(
      (names, word) =>
        names.flatMap((words) =>
          [word, ...(beforeReview.get(word)?.from ?? [])].map((before) => [...words, before]),
        ),
      [[]],
    )
    .map((words) => words.join(' '));

/**
 * The pairs `apiReviewTokens` renames: each current pair, from its names before the review. A name
 * the gate measures again for another color, such as an accent pair now purple, isn't renamed.
 */
function apiReviewRenames() {
  const current = new Set(pairs.map(pairName));
  return pairs.flatMap((pair) => {
    const to = pairName(pair);
    const why = [...new Set(to.split(' ').flatMap((word) => beforeReview.get(word)?.why ?? []))];
    return reviewed(to)
      .filter((from) => from !== to && !current.has(from))
      .map((from) => ({ from, to, rationale: why.join(' ') }));
  });
}

/**
 * Pairs the gate still measures under another name, from the old name to the new, with the reason.
 * tests/browser/library/Contrast.spec.ts checks that each old name is not declared, and that each new one
 * is, or has since been dropped or renamed onward in turn.
 */
export const renamed: readonly { from: string; to: string; rationale: string }[] = [
  // A toast's tone icon stands bare on the toast, without its disc.
  ...(['success', 'info', 'danger'] as const).map((tone) => ({
    from: `--env-color-fg-${tone}-on-strong on toast-icon-disc-${tone} over --env-color-bg-neutral-strong`,
    to: `--env-color-fg-${tone}-on-strong on --env-color-bg-neutral-strong`,
    rationale:
      'A toast’s tone icon is drawn bare, larger, level with the message’s first line, so it is measured on the toast’s neutral strong fill itself.',
  })),
  // Meter's and Progress's track is the neutral fill, as a Slider's track is.
  ...[
    '--env-color-bg-default',
    '--env-color-bg-muted',
    '--env-color-bg-page',
    '--env-color-bg-popup',
    '--env-color-bg-raised',
    '--env-color-bg-recessed',
    'catalogue-canvas',
  ].flatMap((ground) =>
    reviewed(`--env-color-bg-primary-emphasis on ${layerHover} over ${ground}`).map((from) => ({
      from,
      to: `--env-color-bg-primary-emphasis on ${fill} over ${ground === 'catalogue-canvas' ? '--env-color-bg-recessed' : ground}`,
      rationale:
        'The track of Meter and Progress is the neutral fill a Slider’s track takes, --env-color-bg-neutral-muted, rather than a state layer’s faint tint, so empty steps show on dark panels.',
    })),
  ),
  // Tree and table rows take a state layer of their own, a step quieter than a control's in light.
  ...(['--env-color-bg-selected', '--env-color-bg-selected-hover'] as const).flatMap((fill) =>
    ['--env-color-bg-default', '--env-color-bg-raised'].map((ground) => ({
      from: `${fill} on --env-color-bg-neutral-subtle-hover over ${ground}`,
      to: `${fill} on --env-color-bg-row-hover over ${ground}`,
      rationale:
        'Tree and table rows take their own state layer, --env-color-bg-row-hover, a step quieter than a control’s in light, so a hovered row never weighs as much as the selection on the gray page.',
    })),
  ),
  // The catalogue's canvas is the recessed surface, a token now rather than a formula of its own.
  ...onPage
    .flatMap((pair) => {
      const to = reviewed(pairName(onRecessed(pair)));
      return reviewed(pairName({ ...pair, bg: [...pair.bg.slice(0, -1), 'catalogue-canvas'] })).map(
        (from, index) => ({ from, to: to[index]! }),
      );
    })
    .map(({ from, to }) => ({
      from,
      to,
      rationale:
        'The catalogue’s canvas, a formula in its style sheet, is the recessed surface, --env-color-bg-recessed: the same shade deeper than the page, a token of the themes.',
    })),
  // The thumb of a switch that is off, since dropped, was renamed onto the recessed surface first.
  ...['', '-hover', '-pressed'].map((state) => ({
    from: `--env-color-fg-control on --env-color-bg-neutral-muted${state} over catalogue-canvas`,
    to: `--env-color-fg-control on --env-color-bg-neutral-muted${state} over --env-color-bg-recessed`,
    rationale:
      'The catalogue’s canvas, a formula in its style sheet, is the recessed surface, --env-color-bg-recessed: the same shade deeper than the page, a token of the themes.',
  })),
  // The alerts' edges, since dropped, were renamed onto the recessed surface first.
  ...(['accent', 'success', 'warning', 'danger'] as const).map((tone) => ({
    from: `--env-color-border-${tone}-muted on catalogue-canvas`,
    to: `--env-color-border-${tone}-muted on --env-color-bg-recessed`,
    rationale:
      'The catalogue’s canvas, a formula in its style sheet, is the recessed surface, --env-color-bg-recessed: the same shade deeper than the page, a token of the themes.',
  })),
  {
    from: '--env-color-avatar-fg-teal on --env-color-avatar-bg-teal',
    to: '--env-color-avatar-fg-seafoam on --env-color-avatar-bg-seafoam',
    rationale: 'The avatar hues are named for their colors: teal is seafoam.',
  },
  {
    from: '--env-color-avatar-fg-green on --env-color-avatar-bg-green',
    to: '--env-color-avatar-fg-sage on --env-color-avatar-bg-sage',
    rationale: 'The avatar hues are named for their colors: green is sage.',
  },
  {
    from: '--env-color-avatar-fg-amber on --env-color-avatar-bg-amber',
    to: '--env-color-avatar-fg-butter on --env-color-avatar-bg-butter',
    rationale: 'The avatar hues are named for their colors: amber is butter.',
  },
  {
    from: '--env-color-avatar-fg-red on --env-color-avatar-bg-red',
    to: '--env-color-avatar-fg-blush on --env-color-avatar-bg-blush',
    rationale: 'The avatar hues are named for their colors: red is blush.',
  },
  {
    from: '--env-color-avatar-fg-violet on --env-color-avatar-bg-violet',
    to: '--env-color-avatar-fg-periwinkle on --env-color-avatar-bg-periwinkle',
    rationale: 'The avatar hues are named for their colors: violet is periwinkle.',
  },
  {
    from: '--env-color-avatar-fg-purple on --env-color-avatar-bg-purple',
    to: '--env-color-avatar-fg-orchid on --env-color-avatar-bg-orchid',
    rationale: 'The avatar hues are named for their colors: purple is orchid.',
  },
  {
    from: '--env-color-avatar-fg-slate on --env-color-avatar-bg-slate',
    to: '--env-color-avatar-fg-oat on --env-color-avatar-bg-oat',
    rationale: 'The avatar hues are named for their colors: slate is oat.',
  },
  {
    from: '--env-color-avatar-figure-teal on --env-color-avatar-bg-teal',
    to: '--env-color-avatar-figure-seafoam on --env-color-avatar-bg-seafoam',
    rationale: 'The avatar hues are named for their colors: teal is seafoam.',
  },
  {
    from: '--env-color-avatar-figure-green on --env-color-avatar-bg-green',
    to: '--env-color-avatar-figure-sage on --env-color-avatar-bg-sage',
    rationale: 'The avatar hues are named for their colors: green is sage.',
  },
  {
    from: '--env-color-avatar-figure-amber on --env-color-avatar-bg-amber',
    to: '--env-color-avatar-figure-butter on --env-color-avatar-bg-butter',
    rationale: 'The avatar hues are named for their colors: amber is butter.',
  },
  {
    from: '--env-color-avatar-figure-red on --env-color-avatar-bg-red',
    to: '--env-color-avatar-figure-blush on --env-color-avatar-bg-blush',
    rationale: 'The avatar hues are named for their colors: red is blush.',
  },
  {
    from: '--env-color-avatar-figure-violet on --env-color-avatar-bg-violet',
    to: '--env-color-avatar-figure-periwinkle on --env-color-avatar-bg-periwinkle',
    rationale: 'The avatar hues are named for their colors: violet is periwinkle.',
  },
  {
    from: '--env-color-avatar-figure-purple on --env-color-avatar-bg-purple',
    to: '--env-color-avatar-figure-orchid on --env-color-avatar-bg-orchid',
    rationale: 'The avatar hues are named for their colors: purple is orchid.',
  },
  {
    from: '--env-color-avatar-figure-slate on --env-color-avatar-bg-slate',
    to: '--env-color-avatar-figure-oat on --env-color-avatar-bg-oat',
    rationale: 'The avatar hues are named for their colors: slate is oat.',
  },
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
  ...apiReviewRenames(),
  // The danger emphasis fill is a saturated red with a white label in every theme, so a destructive
  // primary outweighs the soft primary and accent fills in dark: its label, a solid danger badge's
  // and what an end slot or a count draws in it are --env-color-fg-on-strong.
  ...['', '-hover', '-pressed'].flatMap((state) =>
    ['--env-color-fg-on-emphasis', 'button-end-separator-on-emphasis'].map((label) => ({
      from: `${label} on --env-color-bg-danger-emphasis${state}`,
      to: `${label.replace('on-emphasis', 'on-strong')} on --env-color-bg-danger-emphasis${state}`,
      rationale:
        'The danger primary takes a white label, --env-color-fg-on-strong, on its saturated red in every theme, rather than a dark one on a soft coral in dark, so a destructive action outweighs the soft primary and accent fills beside it.',
    })),
  ),
  // A segment not chosen takes no layer under the pointer, only the text color on its label.
  ...[page, surface, muted, raised, recessed].map((below) => ({
    from: `--env-color-fg-muted-hover on segmented-control-hover-layer over ${fill} over ${below}`,
    to: `--env-color-fg-default on ${fill} over ${below}`,
    rationale:
      'A hovered segment of a SegmentedControl lays no state layer, which read as a second selection beside the thumb, and its label takes the text color on the track.',
  })),
  {
    from: `--env-color-fg-muted-hover on segmented-control-hover-layer over ${fill} over catalogue-canvas`,
    to: `--env-color-fg-muted-hover on segmented-control-hover-layer over ${fill} over ${recessed}`,
    rationale:
      'The catalogue’s canvas, a formula in its style sheet, is the recessed surface, --env-color-bg-recessed: the same shade deeper than the page, a token of the themes.',
  },
  {
    from: 'badge-outline-primary on --env-color-bg-danger-emphasis',
    to: 'badge-outline-important on --env-color-bg-danger-emphasis',
    rationale:
      'A count on a danger primary is outlined in its white label, as on an important button, now that the danger fill takes --env-color-fg-on-strong.',
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
const segmentThumbHighContrast =
  'At high contrast the thumb keeps a layer of the neutral fill, measured there as segmented-control-thumb-high under the same pairs; the thumb as drawn at standard contrast, the raised neutral grade in dark, is measured there.';
export const relaxed: readonly Relaxation[] = [
  ...[
    '--env-color-bg-default',
    '--env-color-bg-muted',
    '--env-color-bg-page',
    '--env-color-bg-raised',
    '--env-color-bg-recessed',
  ].flatMap((below): Relaxation[] => [
    {
      pair: `--env-color-fg-default on segmented-control-thumb over --env-color-bg-neutral-muted over ${below}`,
      kind: 'text',
      minimum: { standard: 4.5 },
      rationale: segmentThumbHighContrast,
    },
    {
      pair: `segmented-control-thumb on --env-color-bg-neutral-muted over ${below}`,
      kind: 'difference',
      minimum: { standard: 0.02 },
      rationale: segmentThumbHighContrast,
    },
    {
      pair: `--env-color-border-focus on segmented-control-thumb over --env-color-bg-neutral-muted over ${below}`,
      kind: 'focus',
      minimum: { standard: 3 },
      rationale: segmentThumbHighContrast,
    },
  ]),
];

export function pairName(pair: Pick<ContrastPair, 'fg' | 'bg'>): string {
  return `${pair.fg} on ${pair.bg.join(' over ')}`;
}

/**
 * Colors a component composes where it paints, because they depend on something no token can
 * name, measured as the browser resolves them. Every other hover, pressed and translucent color is
 * a token of its own; add a token rather than an entry here.
 *
 * - The + between the keys in a button's end slot is a share of the button's label color,
 *   `currentColor` (Button.css sets Kbd.css's hooks); each label color a variant, tone and state
 *   takes is measured.
 * - A badge or counter inside a primary or important button is outlined in a share of the button's
 *   label color, `currentColor`, which only the button knows (Button.css sets Badge.css's hooks).
 * - Calendar heatmap steps mix the tone into the page by a share that depends on how many steps the
 *   data has, from 30% at the lightest to the full tone (CalendarHeatmap.tsx and .css). The
 *   lightest step of the default accent tone is measured.
 * - The catalogue's recessed canvas its examples sit on, as apps/site/src/styles/Stage.css
 *   paints it.
 *
 * The CSS is the one source of a formula it holds: the declaration under a `/* contrast: name *\/`
 * comment, read by markedColor, with `currentColor` taking each label color the gate measures.
 */

/**
 * The color of the declaration a CSS file marks with `/* contrast: name *\/`: its value, or the
 * color function in it, such as the color-mix() of a border shorthand.
 */
function markedColor(file: string, name: string): string {
  const css = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
  const marker = css.indexOf(`/* contrast: ${name} */`);
  if (marker === -1) throw new Error(`${file} marks no declaration /* contrast: ${name} */.`);
  const declaration = css.slice(marker).match(/\*\/\s*[\w-]+\s*:\s*([^;]+);/);
  if (!declaration) throw new Error(`No declaration follows /* contrast: ${name} */ in ${file}.`);
  const value = declaration[1]!
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
  // A token alone is its own color.
  if (/^var\(--[\w-]+\)$/.test(value)) return value;
  const start = value.search(/\b(?:color-mix|light-dark|oklch|rgb|hsl)\(/);
  let depth = 0;
  for (let index = start; index < value.length; index++) {
    if (value[index] === '(') depth++;
    else if (value[index] === ')' && --depth === 0) return value.slice(start, index + 1);
  }
  throw new Error(`The declaration under /* contrast: ${name} */ in ${file} holds no color.`);
}

/** A formula of a label's color, `currentColor`, for one label color token. */
const ofLabel = (formula: string, token: string) =>
  formula.replace(/(^|[^\w-])currentColor(?![\w-])/g, `$1var(${token})`);

const separator = markedColor('packages/ui/src/styles/Button.css', 'button-end-separator');
const badgeOutline = markedColor('packages/ui/src/styles/Button.css', 'badge-outline');
const tooltipFill = markedColor('packages/ui/src/styles/Tooltip.css', 'tooltip-frosted');
const tooltipKeyFill = markedColor('packages/ui/src/styles/Tooltip.css', 'tooltip-key');

const derived: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    ['on-emphasis', 'control', 'accent', 'on-strong', 'muted', 'default', 'link', 'danger'].map(
      (label) => [`button-end-separator-${label}`, ofLabel(separator, `--env-color-fg-${label}`)],
    ),
  ),
  'badge-outline-primary': ofLabel(badgeOutline, '--env-color-fg-on-emphasis'),
  'badge-outline-important': ofLabel(badgeOutline, '--env-color-fg-on-strong'),
  'heatmap-accent-lowest':
    'color-mix(in srgb, var(--env-color-fg-primary) 30%, var(--env-color-bg-page))',
  // The frosted fill of popups (Popup.css), and the worst behind it: black under a light popup's
  // dark text, white under a dark popup's light text.
  'popup-frosted':
    'color-mix(in srgb, var(--env-popup-fill) var(--env-popup-opacity), transparent)',
  'popup-fill': 'var(--env-popup-fill)',
  'popup-worst-backdrop': 'light-dark(#000, #fff)',
  // A tooltip's frosted fill and a key chip on it, a share of its light text (Tooltip.css), and
  // the worst behind it: white under its light text, in light and in dark.
  'tooltip-frosted': tooltipFill,
  'tooltip-key': ofLabel(tooltipKeyFill, '--env-color-fg-on-strong'),
  'tooltip-worst-backdrop': '#fff',
  // A text field's prefix and suffix, a share of muted text (TextField.css).
  'text-field-affix': markedColor('packages/ui/src/styles/TextField.css', 'text-field-affix'),
  // A segmented control's thumb (SegmentedControl.css).
  'segmented-control-thumb': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-thumb',
  ),
  'segmented-control-thumb-high': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-thumb-high',
  ),
};

/** The CSS color a name in a pair stands for. */
export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
