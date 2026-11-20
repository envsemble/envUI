import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

export type ContrastKind = 'text' | 'non-text' | 'focus' | 'difference' | 'distinct';

export interface ContrastPair {
  fg: string;
  bg: readonly string[];
  kind: ContrastKind;
  contrast?: 'standard' | 'high';
  minimum?: { readonly standard?: number; readonly high?: number };
  rationale?: string;
  note?: string;
}

const tones = ['neutral', 'primary', 'accent', 'success', 'warning', 'danger', 'done'] as const;
const alertTones = ['primary', 'success', 'warning', 'danger'] as const;
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

const toneText = (tone: (typeof tones)[number]) =>
  tone === 'neutral' ? '--env-color-fg-muted' : `--env-color-fg-${tone}`;

const badgeTint = (tone: (typeof tones)[number]) =>
  tone === 'primary' || tone === 'accent'
    ? `--env-color-bg-${tone}-soft`
    : `--env-color-bg-${tone}-muted`;
const badgeFill = (tone: (typeof tones)[number]) =>
  tone === 'primary' || tone === 'accent'
    ? `--env-color-bg-${tone}-solid`
    : `--env-color-bg-${tone}-emphasis`;

const page = '--env-color-bg-page';
const recessed = '--env-color-bg-recessed';
const recessedHover = '--env-color-bg-recessed-hover';
const recessedPressed = '--env-color-bg-recessed-pressed';
const surface = '--env-color-bg-default';
const muted = '--env-color-bg-muted';
const raised = '--env-color-bg-raised';
const popup = '--env-color-bg-popup';
const field = '--env-color-bg-field';
const overlay = '--env-color-bg-backdrop';
const selected = '--env-color-bg-selected';
const selectedHover = '--env-color-bg-selected-hover';
const selectedPressed = '--env-color-bg-selected-pressed';
const selectedAccent = '--env-color-bg-selected-accent';
const selectedAccentHover = '--env-color-bg-selected-accent-hover';
const selectedAccentPressed = '--env-color-bg-selected-accent-pressed';
const selections = [
  selected,
  selectedHover,
  selectedPressed,
  selectedAccent,
  selectedAccentHover,
  selectedAccentPressed,
];
const popupHover = '--env-color-bg-popup-hover';
const popupPressed = '--env-color-bg-popup-pressed';
const fill = '--env-color-bg-neutral-muted';
const layerHover = '--env-color-bg-neutral-subtle-hover';
const layerPressed = '--env-color-bg-neutral-subtle-pressed';
const treeRowHover = '--env-color-bg-row-hover';
const treeRowPressed = '--env-color-bg-row-pressed';
const navigationHover = '--env-color-bg-navigation-hover';
const navigationPressed = '--env-color-bg-navigation-pressed';
const frosted = 'popup-frosted';
const rowHighlight = 'popup-row-highlight';
const sliderFill = 'slider-fill';
const segmentHoverLayer = 'segmented-control-hover';
const segmentPressedLayer = 'segmented-control-pressed-layer';
const segmentPressedStandard = {
  contrast: 'standard',
  rationale:
    'At high contrast a pressed segment takes the pressed state layer (SegmentedControl.css), measured there under the same pairs.',
} as const;
const segmentPressedAtHigh = {
  contrast: 'high',
  rationale:
    'A pressed segment at high contrast (SegmentedControl.css); segmented-control-pressed-layer is measured at standard contrast.',
} as const;
const sliderFillStandard = {
  contrast: 'standard',
  rationale:
    'At high contrast the slider fills with the pressed state layer (Slider.css), measured there under the same pairs.',
} as const;
const sliderFillAtHigh = {
  contrast: 'high',
  rationale:
    'The slider fill at high contrast (Slider.css); slider-fill is measured at standard contrast.',
} as const;
const menubarPressed = 'menubar-trigger-pressed';
const readOnlyFill = 'text-field-read-only';
const ghostFieldHover = 'text-field-ghost-hover';
const popupFill = 'popup-fill';
const worstBackdrop = 'popup-worst-backdrop';
const tooltipFrosted = 'tooltip-frosted';
const textFieldAffix = 'text-field-affix';
const segmentThumb = 'segmented-control-thumb';
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
const segmentTracks = [page, surface, muted, raised].map((below) => [fill, below] as const);
const meterTrack = 'meter-track';
const avatarGroupOverflow = 'avatar-group-overflow';
const badgeNeutralSoft = 'badge-neutral-soft';
const badgeNeutralSoftText = 'badge-neutral-soft-text';
const tooltipKey = 'tooltip-key';
const tooltipWorstBackdrop = 'tooltip-worst-backdrop';
const frostedOverWorst = [
  '--env-color-fg-default',
  '--env-color-fg-muted',
  '--env-color-fg-control',
  '--env-color-fg-link',
  '--env-color-fg-danger',
  '--env-color-fg-primary',
] as const;
const row = '--env-color-bg-list-item';
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
const buttonEndSeparator = (role: string, backgrounds: readonly Background[]) =>
  on(
    'non-text',
    `button-end-separator-${role}`,
    backgrounds,
    `The + between the keys in the end slot of a button whose label is --env-color-fg-${role}`,
  );
const focus = (fg: string, backgrounds: readonly Background[], note?: string) =>
  on('focus', fg, backgrounds, note);
const different = (fill: string, backgrounds: readonly Background[], note?: string) =>
  on('difference', fill, backgrounds, note);
const distinct = (fill: string, backgrounds: readonly Background[], note?: string) =>
  on('distinct', fill, backgrounds, note);

const popupEdge = {
  minimum: { standard: 1.6 },
  rationale:
    'No shadows: the edge and the fill set a popup apart, so the edge is clearly visible at 1.6:1 or more against every surface it floats over. Below 3:1 by design, as WCAG 1.4.11 allows: the fill and the content identify the popup, and a 3:1 edge would outline every popup in mid gray. The boundary in high contrast and under forced colors.',
} as const;

const toneOutline = {
  minimum: { standard: 1.5, high: 3 },
  rationale:
    'Decorative: the badge’s text in its tone, measured at 4.5:1, and the failed message’s status identify them; the edge only groups. Held to 1.5:1, and 3:1 in high contrast, as a badge outline on a button is.',
} as const;

const alertFill = (tone: (typeof alertTones)[number]) => `--env-color-bg-${tone}-subtle-hover`;
const alertRest = (tone: (typeof alertTones)[number]) => `--env-color-bg-${tone}-muted`;
const alertGrounds = [page, surface, muted] as const;
const tonal = {
  contrast: 'standard',
  rationale:
    'The tone’s stronger tint fills an alert and a soft badge only at standard contrast; at high contrast they take its softer tint, measured there.',
} as const;

const neutralBadgeStandard = {
  contrast: 'standard',
  rationale:
    'At high contrast a soft neutral badge takes the neutral fill (Badge.css), measured there under the same text.',
} as const;
const neutralBadgeAtHigh = {
  contrast: 'high',
  rationale:
    'A soft neutral badge at high contrast (Badge.css); badge-neutral-soft is measured at standard contrast.',
} as const;

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

  ...text(
    '--env-color-fg-on-emphasis',
    [
      '--env-color-bg-primary-emphasis',
      '--env-color-bg-primary-emphasis-hover',
      '--env-color-bg-primary-emphasis-pressed',
    ],
    'The chosen calendar day and time, the check of a checked checkbox and the thumb of a switch that is on',
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
    '--env-color-fg-muted',
    [page, surface, muted, raised].map((ground) => [fill, ground]),
    'The placeholder and icons of a ghost field at rest',
  ),
  ...text(
    textFieldAffix,
    [page, surface, muted, raised].map((ground) => [fill, ground]),
    'A prefix or a suffix in a ghost field at rest',
  ),
  ...text(
    '--env-color-fg-muted-hover',
    [page, surface, muted, raised].map((ground) => [ghostFieldHover, ground]),
    'The placeholder, prefix, suffix and icons of a ghost field under the pointer',
  ),
  ...(
    [
      [
        '--env-color-fg-default',
        'The value of an outlined or ghost read-only field on its faint fill',
      ],
      ['--env-color-fg-muted', 'The placeholder and icons of an outlined or ghost read-only field'],
      [textFieldAffix, 'A prefix or a suffix in an outlined or ghost read-only field'],
    ] as const
  ).flatMap(([fg, note]) =>
    text(
      fg,
      [page, surface, muted, raised].map((ground) => [readOnlyFill, ground]),
      note,
    ),
  ),
  ...text(
    '--env-color-fg-muted',
    [page, surface, raised].flatMap((ground) => [ground, [layerHover, ground]]),
    'The icon of a pager link, at rest and hovered',
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
  ...text(
    '--env-color-fg-default',
    [page, surface, muted, raised, popup].flatMap((ground) => [
      ground,
      [layerHover, ground],
      [layerPressed, ground],
    ]),
    'The label of an outline button and of a Select trigger, on the page, a pane, a card, a raised surface or a popup, at rest, hovered and pressed',
  ),
  ...text(
    '--env-color-fg-default',
    [page, surface, muted, raised, recessed].flatMap((ground) => [
      [fill, ground],
      ['--env-color-bg-neutral-muted-hover', ground],
      ['--env-color-bg-neutral-muted-pressed', ground],
    ]),
    'The label of a secondary button on its translucent neutral fill, over the page, a pane, a card, a raised surface or a recessed one, at rest, hovered and pressed',
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
    'Primary buttons in the accent tone, at rest, hovered and pressed',
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
    '--env-color-fg-on-strong',
    [
      '--env-color-bg-primary-strong',
      '--env-color-bg-primary-strong-hover',
      '--env-color-bg-primary-strong-pressed',
    ],
    'Primary buttons, at rest, hovered and pressed, a saturated fill with a white label in every theme',
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
    'Quiet buttons on hover and press, and menubar triggers on hover',
  ),
  ...text(
    '--env-color-fg-default',
    [
      [menubarPressed, page],
      [menubarPressed, surface],
    ],
    'A menubar trigger pressed or with its menu open, on the hover layer doubled',
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

  ...text('--env-color-fg-default', [field]),
  ...text('--env-color-fg-muted', [field], 'Placeholders and icons in the field'),
  ...text(
    textFieldAffix,
    [field, page, surface, muted, raised],
    'A prefix or a suffix, quieter than the value, in a field and in a ghost field on any surface',
  ),
  ...text('--env-color-fg-danger', [field], 'The message of an invalid field'),
  ...nonText(
    '--env-color-border-primary-emphasis',
    [muted, raised],
    'The border of a focused field on a card or in a dialog',
  ),
  ...text(
    '--env-color-fg-danger',
    [page, surface, raised, popup],
    'The message of an invalid field, on the surface the field sits on',
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
    '--env-color-fg-muted',
    ['document-tabs-strip'],
    'An inactive document tab: the muted label on the strip, a step from the panel',
  ),
  ...text('--env-color-fg-default', ['document-tabs-strip'], 'Text on the document tab strip'),
  ...text(
    '--env-color-fg-default',
    [['--env-color-bg-neutral-subtle-pressed', 'document-tabs-strip']],
    'A pressed inactive document tab, on its layer over the strip; under the pointer it takes a fill halfway from the strip to the panel, where the text on the strip measures it',
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
    'Quiet fields while focused, the command palette search, keyboard keys, counters and own messages',
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
    'The only boundary of outlined fields, the composer, outlined buttons, Select triggers and the track of a switch that is off; DropZone takes it too',
  ),
  ...nonText(
    'composer-hover-edge',
    [page, surface, muted, raised, popup],
    'The only boundary of the composer under the pointer, 40% of the way from its rest edge to the default text color',
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [page, surface, muted, raised, popup],
    'The edge of an outline button in the danger tone, on the surface beneath it',
  ),
  ...nonText('--env-color-border-danger-emphasis-hover', [page, surface, muted, raised, popup]),
  ...nonText('--env-color-border-danger-emphasis-pressed', [page, surface, muted, raised, popup]),
  ...nonText(
    '--env-color-border-primary-emphasis',
    [page, surface, popup],
    'The border of a focused field, and today’s ring in a calendar',
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

  ...nonText(
    'toolbar-separator',
    [page, surface, muted, raised, popup],
    'Separators between a toolbar’s groups, on every surface a toolbar sits on',
    {
      contrast: 'standard',
      minimum: { standard: 1.4 },
      rationale:
        'Decorative at standard contrast, as list dividers are, but held to 1.4:1 on every surface, the recessed well too, where the muted hairline faded to 1.1:1: in light a tint of the text color, so it keeps its step from any ground. High contrast draws it in --env-color-border-muted, measured there.',
    },
  ),
  ...nonText(
    '--env-elevation-2-border',
    [popup, surface, page, muted, raised],
    'The edge of menus, Select and Combobox lists, popovers, hover cards, the date picker, rich text suggestions and docked panels, against the popup and what it floats over',
    popupEdge,
  ),
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

  ...frostedOverWorst.flatMap((fg) =>
    text(fg, [[frosted, worstBackdrop]], 'Text on a frosted popup, over the worst behind it'),
  ),
  ...nonText(
    '--env-color-bg-primary-emphasis',
    [[frosted, worstBackdrop]],
    'Check marks in a menu, on a frosted popup over the worst behind it',
  ),
  ...[page, surface, muted].flatMap((behind) => [
    ...text(
      '--env-color-fg-default',
      [[rowHighlight, frosted, behind]],
      'A highlighted row, a key chip',
    ),
    ...text(
      '--env-color-fg-muted',
      [[rowHighlight, frosted, behind]],
      'A highlighted row’s description and icon, and keys as chips at rest',
    ),
    ...text(
      '--env-color-fg-danger',
      [[rowHighlight, frosted, behind]],
      'A destructive menu item’s label and icon on its highlighted row',
    ),
    ...text(
      '--env-color-fg-default',
      [[fill, rowHighlight, frosted, behind]],
      'Key chips on a highlighted row',
    ),
    ...text('--env-color-fg-default', [['--env-color-bg-neutral-muted-pressed', frosted, behind]]),
    ...different(
      rowHighlight,
      [[frosted, behind]],
      'A highlighted option or menu item on a frosted popup',
    ),
    ...distinct(
      selectedAccent,
      [[rowHighlight, frosted, behind]],
      'The chosen option of the accent selection against a highlighted one on a frosted popup',
    ),
    ...focus(
      '--env-color-border-focus',
      [[rowHighlight, frosted, behind]],
      'The inset ring of a highlighted row on a frosted popup',
    ),
  ]),
  ...text(
    '--env-color-fg-on-strong',
    [[tooltipFrosted, tooltipWorstBackdrop]],
    'Text on a tooltip, frosted in light and at high contrast and a solid chip in dark, over the worst behind it',
  ),
  ...text(
    '--env-color-fg-on-strong',
    [[tooltipKey, tooltipFrosted, tooltipWorstBackdrop]],
    'A key chip in a tooltip, frosted in light and at high contrast and a solid chip in dark, over the worst behind it',
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

  ...nonText(
    '--env-color-bg-primary-emphasis',
    [page, surface, muted, popup, popupHover, ...selections, raised, row],
    'A chosen radio; a checked checkbox and the track of a switch that is on, also in a list item and a selected table row; check marks in menus and options, also on a selected option under the pointer; the chosen calendar day',
  ),

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
    '--env-color-fg-on-selected-accent',
    [selectedAccent, selectedAccentHover, selectedAccentPressed],
    'Selected navigation items, tabs, tree rows and Select options of the accent selection, at rest, on hover and on press',
  ),
  ...text(
    '--env-color-fg-danger',
    selections,
    'Danger text buttons in a selected table row, which keep the danger color, at rest, under the pointer or holding focus, and pressed',
  ),
  ...text('--env-color-fg-default', selections, 'Selected table and tree rows'),
  ...text(
    '--env-color-fg-muted',
    selections,
    'Details of selected tree rows and captions in selected table rows',
  ),
  ...text(
    '--env-color-fg-default',
    [
      [layerHover, fill, raised],
      [layerPressed, fill, raised],
    ],
    'A sortable header cell of a framed table under the pointer and pressed, on its band',
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
    '--env-color-fg-muted-hover',
    segmentTracks.map((track) => [segmentHoverLayer, ...track]),
    'The label of a segment not chosen under the pointer, on half the faint state layer',
  ),
  ...on(
    'text',
    '--env-color-fg-muted-pressed',
    segmentTracks.map((track) => [segmentPressedLayer, ...track]),
    'The label of a segment not chosen while pressed, on the faint state layer',
    segmentPressedStandard,
  ),
  ...on(
    'text',
    '--env-color-fg-muted-pressed',
    segmentTracks.map((track) => [layerPressed, ...track]),
    'The label of a segment not chosen while pressed, on the pressed state layer',
    segmentPressedAtHigh,
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
  ...['--env-color-fg-on-selected', '--env-color-fg-on-selected-accent'].flatMap((label) => [
    ...distinct(
      label,
      ['--env-color-fg-muted'],
      'The current item of a navigation drawer against its other items',
    ),
  ]),

  ...[selected, selectedAccent].flatMap((selection) =>
    distinct(
      selection,
      [popup, surface, page, raised],
      'The selection against the surfaces it lies on: Select options, navigation items, tree and table rows',
    ),
  ),
  ...distinct(
    selectedAccent,
    [popupHover, [treeRowHover, page], [treeRowHover, surface], [treeRowHover, raised]],
    'The accent selection against the other items under the pointer: Select options, tree and table rows',
  ),
  ...distinct(
    selectedAccent,
    [navigationHover],
    'A selected navigation item of the accent selection next to a hovered one',
  ),
  ...distinct(
    selectedAccent,
    [navigationPressed],
    'A selected navigation item of the accent selection next to a pressed one',
  ),
  ...distinct(
    selectedAccentHover,
    [
      navigationHover,
      popupHover,
      [treeRowHover, page],
      [treeRowHover, surface],
      [treeRowHover, raised],
    ],
    'An item of the accent selection under the pointer against an unselected one under the pointer: navigation items, Select options, tree and table rows',
  ),
  ...different(selectedHover, [selected], 'A selected item under the pointer'),
  ...[selectedHover, selectedPressed].flatMap((state) =>
    distinct(
      state,
      [popup, surface, page, raised, recessed],
      'A selected item under the pointer and pressed against the surfaces it lies on, the recessed well of a preview included',
    ),
  ),
  ...different(selectedAccentHover, [selectedAccent], 'An accent-selected item under the pointer'),
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
  ...text(
    '--env-color-fg-default',
    [treeRowHover, treeRowPressed].flatMap((layer) =>
      [page, surface, raised].map((ground) => [layer, ground]),
    ),
    'A tree row under the pointer and pressed, and a table row under the pointer',
  ),
  ...text(
    '--env-color-fg-muted',
    [treeRowHover, treeRowPressed].flatMap((layer) =>
      [page, surface, raised].map((ground) => [layer, ground]),
    ),
    'Details of a tree row and captions of a table row, under the pointer and pressed',
  ),
  ...distinct(
    '--env-color-fg-on-selected-accent',
    ['--env-color-fg-control', '--env-color-fg-default'],
    'The label of an item of the accent selection against the labels of the others',
  ),
  ...different(
    surface,
    [muted],
    'The action strip of a card against the card, on its default muted surface',
  ),
  ...different(recessed, [page], 'A recessed surface against the page around it'),
  ...text(
    '--env-color-fg-default',
    [recessedHover, recessedPressed],
    'An interactive recessed surface, hovered and pressed',
  ),
  ...text('--env-color-fg-muted', [recessedHover, recessedPressed]),
  ...different(recessedHover, [recessed], 'A recessed surface under the pointer'),
  ...different(recessedPressed, [recessedHover], 'A recessed surface pressed'),

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

  ...text(
    '--env-color-fg-primary',
    [
      [fill, page],
      [fill, surface],
    ],
    'Chips',
  ),
  ...text('--env-color-fg-default', [[fill, field]], 'Combobox chips'),
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
    [page, surface, muted, raised, [meterTrack, page], [meterTrack, surface]],
    'Spinners, and meter indicators on their track',
  ),
  ...on(
    'text',
    '--env-color-fg-default',
    [page, surface, muted, raised, popup].map((ground) => [sliderFill, fill, ground]),
    'The label, the value and the handle of a slider on its fill',
    sliderFillStandard,
  ),
  ...on(
    'text',
    '--env-color-fg-default',
    [page, surface, muted, popup].map((ground) => [layerPressed, fill, ground]),
    'The label, the value and the handle of a slider on its fill; over a raised surface, the sortable header cell’s pair measures it in both contrasts',
    sliderFillAtHigh,
  ),
  ...nonText(
    '--env-color-border-danger-emphasis',
    [page, surface, muted, raised, popup].map((ground) => [fill, ground]),
    'The inset edge of an invalid slider, on its track',
  ),
  ...on(
    'difference',
    sliderFill,
    [page, surface, muted, raised, popup].map((ground) => [fill, ground]),
    'The fill of a slider against its track',
    sliderFillStandard,
  ),
  ...on(
    'difference',
    layerPressed,
    [page, surface, muted, raised, popup].map((ground) => [fill, ground]),
    'The fill of a slider against its track',
    sliderFillAtHigh,
  ),
  ...nonText(
    '--env-color-bg-primary-emphasis',
    [page, surface, muted, raised, popup].map((ground) => [meterTrack, ground]),
    'The indicators of Meter and Progress on their track, the neutral fill’s hover grade with no outline, on every surface',
  ),
  ...text(
    '--env-color-fg-default',
    [page, surface, row, muted, raised, popup].map((ground) => [avatarGroupOverflow, ground]),
    'The count of an AvatarGroup’s overflow chip on its neutral fill',
  ),
  ...on(
    'text',
    badgeNeutralSoftText,
    [page, surface, row, muted, raised, popup].map((ground) => [badgeNeutralSoft, ground]),
    'A soft neutral badge on the page, a pane, a row, a muted or raised surface or a popup',
    neutralBadgeStandard,
  ),
  ...on(
    'text',
    badgeNeutralSoftText,
    [page, surface, row, muted, raised, popup].map((ground) => [fill, ground]),
    'A soft neutral badge at high contrast, on the page, a pane, a row, a muted or raised surface or a popup',
    neutralBadgeAtHigh,
  ),
  ...buttonEndSeparator('accent', [
    raised,
    '--env-color-bg-raised-hover',
    '--env-color-bg-raised-pressed',
  ]),
  ...buttonEndSeparator('on-strong', [
    '--env-color-bg-primary-strong',
    '--env-color-bg-primary-strong-hover',
    '--env-color-bg-primary-strong-pressed',
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
    page,
    surface,
    muted,
    raised,
    [layerHover, page],
    [layerPressed, page],
    [layerHover, surface],
    [layerPressed, surface],
    [layerHover, muted],
    [layerPressed, muted],
    [layerHover, raised],
    [layerPressed, raised],
  ]),
  ...buttonEndSeparator(
    'default',
    [page, surface, muted, raised, recessed].flatMap((ground) => [
      [fill, ground],
      ['--env-color-bg-neutral-muted-hover', ground],
      ['--env-color-bg-neutral-muted-pressed', ground],
    ]),
  ),
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

  ...focus(
    '--env-color-border-focus',
    [page, surface, muted, raised, row, popup, field],
    'Offset rings sit on the surface around the control',
  ),
  ...focus(
    '--env-color-border-focus',
    [
      popupHover,
      ...selections,
      navigationHover,
      navigationPressed,
      rowPressed,
      [layerHover, surface],
      [layerPressed, surface],
      '--env-color-bg-muted-hover',
      [fill, raised],
      [fill, fill, page],
    ],
    'Inset rings sit on the focused element: menu and Select options, navigation items, tree rows, list rows, the command palette search and tabs, also while pressed',
  ),
]);

export const onRecessed = (pair: ContrastPair): ContrastPair => ({
  ...pair,
  bg: [...pair.bg.slice(0, -1), recessed],
  note: `On the recessed surface${pair.note ? `: ${pair.note}` : ''}`,
});

export const onPage = registry.filter((pair) => pair.bg.at(-1) === page && pair.fg !== recessed);

export const pairs: readonly ContrastPair[] = merged([...registry, ...onPage.map(onRecessed)]);

export interface Requirement {
  kind: ContrastKind;
  minimum: { standard?: number; high?: number };
}

export interface Relaxation extends Requirement {
  pair: string;
  rationale: string;
}

export function pairName(pair: Pick<ContrastPair, 'fg' | 'bg'>): string {
  return `${pair.fg} on ${pair.bg.join(' over ')}`;
}

function markedColor(file: string, name: string): string {
  const css = readFileSync(join(repositoryRoot, file), 'utf8');
  const marker = css.indexOf(`/* contrast: ${name} */`);
  if (marker === -1) throw new Error(`${file} marks no declaration /* contrast: ${name} */.`);
  const declaration = css.slice(marker).match(/\*\/\s*[\w-]+\s*:\s*([^;]+);/);
  if (!declaration) throw new Error(`No declaration follows /* contrast: ${name} */ in ${file}.`);
  const value = declaration[1]!
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
  if (/^var\(--[\w-]+\)$/.test(value)) return value;
  const start = value.search(/\b(?:color-mix|light-dark|oklch|rgb|hsl)\(/);
  let depth = 0;
  for (let index = start; index < value.length; index++) {
    if (value[index] === '(') depth++;
    else if (value[index] === ')' && --depth === 0) return value.slice(start, index + 1);
  }
  throw new Error(`The declaration under /* contrast: ${name} */ in ${file} holds no color.`);
}

const ofLabel = (formula: string, token: string) =>
  formula.replace(/(^|[^\w-])currentColor(?![\w-])/g, `$1var(${token})`);

const separator = markedColor('packages/ui/src/styles/Button.css', 'button-end-separator');
const tooltipFill = markedColor('packages/ui/src/styles/Tooltip.css', 'tooltip-frosted');
const tooltipKeyFill = markedColor('packages/ui/src/styles/Tooltip.css', 'tooltip-key');

const derived: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    ['accent', 'on-strong', 'muted', 'default', 'link', 'danger'].map((label) => [
      `button-end-separator-${label}`,
      ofLabel(separator, `--env-color-fg-${label}`),
    ]),
  ),
  'document-tabs-strip':
    'color-mix(in srgb, var(--env-color-bg-page), var(--env-color-fg-default) 7%)',
  'popup-frosted': 'color-mix(in srgb, var(--_popup-fill) var(--env-popup-opacity), transparent)',
  'popup-fill': 'var(--_popup-fill)',
  'popup-row-highlight': 'var(--_popup-row-highlight)',
  'popup-worst-backdrop': 'light-dark(#000, #fff)',
  'tooltip-frosted': `var(--_tooltip-lifted-fill, ${tooltipFill})`,
  'tooltip-key': ofLabel(tooltipKeyFill, '--env-color-fg-on-strong'),
  'tooltip-worst-backdrop': '#fff',
  'composer-hover-edge': markedColor('packages/ui/src/styles/Composer.css', 'composer-hover-edge'),
  'toolbar-separator': markedColor('packages/ui/src/styles/Toolbar.css', 'toolbar-separator'),
  'text-field-affix': markedColor('packages/ui/src/styles/TextField.css', 'text-field-affix'),
  'segmented-control-thumb': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-thumb',
  ),
  'segmented-control-thumb-high': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-thumb-high',
  ),
  'segmented-control-hover': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-hover',
  ),
  'segmented-control-pressed-layer': markedColor(
    'packages/ui/src/styles/SegmentedControl.css',
    'segmented-control-pressed-layer',
  ),
  'slider-fill': markedColor('packages/ui/src/styles/Slider.css', 'slider-fill'),
  'meter-track': markedColor('packages/ui/src/styles/Meter.css', 'meter-track'),
  'avatar-group-overflow': markedColor(
    'packages/ui/src/styles/AvatarGroup.css',
    'avatar-group-overflow',
  ),
  'badge-neutral-soft': markedColor('packages/ui/src/styles/Badge.css', 'badge-neutral-soft'),
  'badge-neutral-soft-text': markedColor(
    'packages/ui/src/styles/Badge.css',
    'badge-neutral-soft-text',
  ),
  'menubar-trigger-pressed': markedColor(
    'packages/ui/src/styles/Menubar.css',
    'menubar-trigger-pressed',
  ),
  'text-field-read-only': markedColor(
    'packages/ui/src/styles/TextField.css',
    'text-field-read-only',
  ),
  'text-field-ghost-hover': markedColor(
    'packages/ui/src/styles/TextField.css',
    'text-field-ghost-hover',
  ),
};

export function cssColor(name: string): string {
  if (name.startsWith('--')) return `var(${name})`;
  const color = derived[name];
  if (color === undefined) throw new Error(`"${name}" is neither a token nor a derived color.`);
  return color;
}
