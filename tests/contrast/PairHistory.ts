/**
 * The contrast gate's record of the pairs that left the registry of Pairs.ts or were held to less:
 * `dropped`, `renamed` and `relaxed`, each with its reason. Entries stay once DeclaredPairs.json
 * records them (Snapshot.ts), so the reasons can't be removed later.
 */
import { onPage, onRecessed, pairName, pairs, type Relaxation } from './Pairs.ts';

/**
 * Pairs the gate measured once and no longer does, with the reason. A pair that leaves `pairs`
 * must be listed here or in `renamed`: tests/contrast/DeclaredPairs.json holds the names declared
 * when it was last updated, and tests/contrast/ContrastRegistry.test.mjs fails on a name that is gone from
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
 * tests/contrast/ContrastRegistry.test.mjs checks that each old name is not declared, and that each new one
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
    reviewed(
      `--env-color-bg-primary-emphasis on --env-color-bg-neutral-subtle-hover over ${ground}`,
    ).map((from) => ({
      from,
      to: `--env-color-bg-primary-emphasis on --env-color-bg-neutral-muted over ${ground === 'catalogue-canvas' ? '--env-color-bg-recessed' : ground}`,
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
  ...[
    '--env-color-bg-page',
    '--env-color-bg-default',
    '--env-color-bg-muted',
    '--env-color-bg-raised',
    '--env-color-bg-recessed',
  ].map((below) => ({
    from: `--env-color-fg-muted-hover on segmented-control-hover-layer over --env-color-bg-neutral-muted over ${below}`,
    to: `--env-color-fg-default on --env-color-bg-neutral-muted over ${below}`,
    rationale:
      'A hovered segment of a SegmentedControl lays no state layer, which read as a second selection beside the thumb, and its label takes the text color on the track.',
  })),
  {
    from: `--env-color-fg-muted-hover on segmented-control-hover-layer over --env-color-bg-neutral-muted over catalogue-canvas`,
    to: `--env-color-fg-muted-hover on segmented-control-hover-layer over --env-color-bg-neutral-muted over --env-color-bg-recessed`,
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
