export type PaletteTheme = 'light' | 'dark';
type PaletteChanges = Record<string, string>;
export type ThemePalettes = Record<PaletteTheme, PaletteChanges>;

export const colorGroups: [string, [string, string][]][] = [
  [
    'Page & surfaces',
    [
      ['bg-page', 'Page background'],
      ['bg-recessed', 'Recessed surfaces · preview stages'],
      ['bg-default', 'Pane surfaces · navigation & sheets'],
      ['bg-popup', 'Popup surfaces · menus & dialogs'],
      ['bg-muted', 'Filled surfaces · cards & tab rails'],
      ['bg-raised', 'Alternate surfaces'],
    ],
  ],
  [
    'Text & focus',
    [
      ['fg-default', 'Main text'],
      ['fg-muted', 'Supporting text'],
      ['fg-muted', 'Captions'],
      ['fg-muted', 'Disabled labels'],
      ['fg-link', 'Text buttons & inline links'],
      ['border-focus', 'Focus rings'],
      ['border-muted', 'General borders'],
    ],
  ],
  ['Cards', [['bg-default', 'Card action strip']]],
  [
    'Rows',
    [
      ['bg-list-item', 'Row background'],
      ['bg-raised', 'Contrast row background'],
      ['fg-default', 'Row text'],
      ['fg-muted', 'Row details'],
    ],
  ],
  [
    'Buttons',
    [
      ['bg-primary-emphasis', 'Primary button background'],
      ['fg-on-emphasis', 'Primary button label'],
      ['bg-neutral-muted', 'Secondary button background'],
      ['fg-control', 'Secondary button label'],
      ['bg-raised', 'Outlined button background'],
      ['fg-primary', 'Outlined button label'],
      ['border-default', 'Outlined button border'],
      ['bg-accent-strong', 'Accent button background'],
      ['fg-on-strong', 'Important button label'],
      ['bg-danger-strong', 'Destructive button background'],
      ['fg-on-strong', 'Destructive button label'],
    ],
  ],
  [
    'Navigation',
    [
      ['fg-control', 'Navigation label'],
      ['fg-muted', 'Navigation icon'],
      ['bg-selected', 'Selected navigation background'],
      ['fg-on-selected', 'Selected navigation label'],
    ],
  ],
  [
    'Direction links',
    [
      ['bg-raised', 'Direction link background'],
      ['fg-default', 'Direction link title'],
      ['fg-muted', 'Direction link caption'],
      ['fg-primary', 'Direction link icon'],
      ['border-muted', 'Direction link border'],
    ],
  ],
  [
    'Text fields',
    [
      ['bg-field', 'Field background'],
      ['fg-default', 'Field text'],
      ['fg-muted', 'Field label'],
      ['fg-muted', 'Field hint'],
      ['fg-muted', 'Field placeholder'],
      ['border-default', 'Field border'],
      ['border-primary-emphasis', 'Field active border'],
      ['fg-danger', 'Field validation error'],
    ],
  ],
  [
    'Select options',
    [
      ['bg-popup', 'Select option background'],
      ['fg-control', 'Select option label'],
      ['bg-selected', 'Selected option background'],
      ['fg-on-selected', 'Selected option label'],
    ],
  ],
  [
    'Radio',
    [
      ['bg-primary-emphasis', 'Radio selection'],
      ['bg-muted', 'Radio row background'],
      ['fg-default', 'Radio label'],
      ['fg-muted', 'Radio details'],
    ],
  ],
  [
    'Checkboxes',
    [
      ['bg-primary-emphasis', 'Checked checkbox background'],
      ['fg-on-emphasis', 'Checkbox mark'],
      ['fg-muted', 'Unchecked checkbox border'],
      ['fg-default', 'Checkbox label'],
    ],
  ],
  [
    'Switches',
    [
      ['bg-neutral-muted', 'Switch off background'],
      ['bg-primary-emphasis', 'Switch on background'],
      ['fg-control', 'Switch off thumb'],
      ['fg-on-emphasis', 'Switch on thumb'],
      ['fg-default', 'Switch label'],
    ],
  ],
  [
    'Feedback',
    [
      ['bg-neutral-muted', 'Info chip background'],
      ['fg-primary', 'Info chip label'],
      ['fg-muted', 'Disclosure text'],
      ['bg-neutral-strong', 'Toast background'],
      ['fg-success-on-strong', 'Success toast icon'],
      ['fg-info-on-strong', 'Info toast icon'],
      ['fg-danger-on-strong', 'Error toast icon'],
      ['fg-on-strong', 'Toast text'],
      ['bg-backdrop', 'Dialog backdrop'],
    ],
  ],
  [
    'Content & loading',
    [
      ['border-muted', 'Table, Markdown and menu hairlines'],
      ['bg-neutral-muted', 'Loading placeholders'],
    ],
  ],
];

/** Each editable row targets the semantic role, or the system token named for a component, that the part paints. */
export function colorVariable(token: string) {
  return `--env-color-${token}`;
}

const colorVariables = new Set(
  colorGroups.flatMap(([, colors]) => colors.map(([token]) => colorVariable(token))),
);

export function isPaletteValue(token: string, value: string) {
  return colorVariables.has(token) && /^#[0-9a-f]{6}$/i.test(value);
}

export function paletteCSS(theme: PaletteTheme, changes: PaletteChanges) {
  const declarations = Object.entries(changes).map(([token, value]) => `  ${token}: ${value};`);
  return declarations.length
    ? `.env-theme[data-env-theme='${theme}'] {\n${declarations.join('\n')}\n}`
    : '';
}
