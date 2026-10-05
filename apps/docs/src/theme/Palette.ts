export type PaletteTheme = 'light' | 'dark';
export type PaletteChanges = Record<string, string>;
export type ThemePalettes = Record<PaletteTheme, PaletteChanges>;

export const colorGroups: [string, [string, string][]][] = [
  [
    'Page & surfaces',
    [
      ['canvas', 'Page background'],
      ['pane', 'Pane surfaces · dialogs & menus'],
      ['surface-muted', 'Filled surfaces · cards & tab rails'],
      ['surface', 'Alternate surfaces'],
    ],
  ],
  [
    'Text & focus',
    [
      ['text-primary', 'Main text'],
      ['text-muted', 'Supporting text'],
      ['text-quiet', 'Captions'],
      ['disabled-text', 'Disabled labels'],
      ['link', 'Text buttons & inline links'],
      ['focus-ring', 'Focus rings'],
      ['border-strong', 'General borders'],
    ],
  ],
  ['Cards', [['action-strip', 'Card action strip']]],
  [
    'Rows',
    [
      ['row', 'Row background'],
      ['row-alternate', 'Contrast row background'],
      ['row-text', 'Row text'],
      ['row-detail', 'Row details'],
    ],
  ],
  [
    'Buttons',
    [
      ['primary-action', 'Primary button background'],
      ['on-primary-action', 'Primary button label'],
      ['secondary-action', 'Secondary button background'],
      ['on-secondary-action', 'Secondary button label'],
      ['subtle-action', 'Outlined button background'],
      ['on-subtle-action', 'Outlined button label'],
      ['subtle-action-border', 'Outlined button border'],
      ['accent', 'Important button background'],
      ['on-accent', 'Important button label'],
      ['destructive-action', 'Destructive button background'],
      ['on-destructive-action', 'Destructive button label'],
    ],
  ],
  [
    'Navigation',
    [
      ['navigation-text', 'Navigation label'],
      ['navigation-icon', 'Navigation icon'],
      ['navigation-quiet', 'Navigation interaction base'],
      ['navigation-selected', 'Selected navigation background'],
      ['on-navigation-selected', 'Selected navigation label'],
    ],
  ],
  [
    'Direction links',
    [
      ['direction-link', 'Direction link background'],
      ['direction-link-text', 'Direction link title'],
      ['direction-link-label', 'Direction link caption'],
      ['direction-link-icon', 'Direction link icon'],
      ['direction-link-border', 'Direction link border'],
    ],
  ],
  [
    'Text fields',
    [
      ['field', 'Field background'],
      ['field-text', 'Field text'],
      ['field-label', 'Field label'],
      ['field-hint', 'Field hint'],
      ['field-placeholder', 'Field placeholder'],
      ['field-border', 'Field border'],
      ['field-active', 'Field active border'],
      ['field-error', 'Field validation error'],
    ],
  ],
  [
    'Select options',
    [
      ['select-option', 'Select option background'],
      ['select-option-text', 'Select option label'],
      ['select-selected', 'Selected option background'],
      ['on-select-selected', 'Selected option label'],
    ],
  ],
  [
    'Radio',
    [
      ['radio', 'Radio selection'],
      ['radio-row', 'Radio row background'],
      ['radio-text', 'Radio label'],
      ['radio-detail', 'Radio details'],
    ],
  ],
  [
    'Checkboxes',
    [
      ['checkbox', 'Checked checkbox background'],
      ['on-checkbox', 'Checkbox mark'],
      ['checkbox-border', 'Unchecked checkbox border'],
      ['checkbox-text', 'Checkbox label'],
    ],
  ],
  [
    'Switches',
    [
      ['switch-off', 'Switch off background'],
      ['switch-on', 'Switch on background'],
      ['switch-thumb', 'Switch off thumb'],
      ['switch-thumb-on', 'Switch on thumb'],
      ['switch-text', 'Switch label'],
    ],
  ],
  [
    'Feedback',
    [
      ['chip', 'Info chip background'],
      ['chip-text', 'Info chip label'],
      ['disclosure-text', 'Disclosure text'],
      ['toast-neutral', 'Neutral toast background'],
      ['toast-success', 'Success toast background'],
      ['toast-info', 'Info toast background'],
      ['toast-error', 'Error toast background'],
      ['on-toast', 'Toast text'],
      ['dialog-overlay', 'Dialog backdrop'],
    ],
  ],
  [
    'Content & loading',
    [
      ['markdown-border', 'Markdown rules and table borders'],
      ['skeleton-base', 'Loading placeholders'],
    ],
  ],
];

/** Each editable row targets a primitive role shared by its compositions. */
export function colorVariable(token: string) {
  return `--color-${token}`;
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
