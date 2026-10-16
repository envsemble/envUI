// Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.
// Internal for now: the package does not export it yet.

/** The contexts of the colorScheme modifier; the first is the default. */
export const colorSchemes = ['light', 'dark'] as const;
export type ColorScheme = (typeof colorSchemes)[number];

export interface TokenDefinition {
  /** The CSS custom property that carries the token. */
  cssVariable: `--${string}`;
  /** The DTCG type. */
  type: string;
  /** The CSS value in each color scheme, with aliases resolved. */
  values: Readonly<Record<ColorScheme, string>>;
}

/** Every token, by its DTCG path. */
export const tokens = {
  'body.font-weight': {
    cssVariable: '--body-font-weight',
    type: 'fontWeight',
    values: { light: '400', dark: '400' },
  },
  'color.accent': {
    cssVariable: '--color-accent',
    type: 'color',
    values: { light: 'hsl(284.182 43.651% 50.588%)', dark: 'hsl(284.182 43.651% 50.588%)' },
  },
  'color.action-strip': {
    cssVariable: '--color-action-strip',
    type: 'color',
    values: { light: 'hsl(200 12% 95.098039%)', dark: 'hsl(218.107956 3.957044% 18.3337%)' },
  },
  /** The envsemble avatar: the default person picture and initials share it in both themes. */
  'color.avatar': {
    cssVariable: '--color-avatar',
    type: 'color',
    values: { light: 'hsl(217.9 100% 81.4%)', dark: 'hsl(217.9 100% 81.4%)' },
  },
  'color.avatar-figure': {
    cssVariable: '--color-avatar-figure',
    type: 'color',
    values: { light: 'hsl(221.3 71.7% 57.1%)', dark: 'hsl(221.3 71.7% 57.1%)' },
  },
  'color.border-strong': {
    cssVariable: '--color-border-strong',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(213.333 4.523% 39.02%)' },
  },
  /** Calendars: the chosen day is a solid blue circle with white text (4.5:1), today a blue ring. */
  'color.calendar-selected': {
    cssVariable: '--color-calendar-selected',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.calendar-today': {
    cssVariable: '--color-calendar-today',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.canvas': {
    cssVariable: '--color-canvas',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.canvas-dark': {
    cssVariable: '--color-canvas-dark',
    type: 'color',
    values: { light: 'hsl(0 0% 12.157%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.checkbox': {
    cssVariable: '--color-checkbox',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(212.087 100% 45.098%)' },
  },
  'color.checkbox-border': {
    cssVariable: '--color-checkbox-border',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 11.712% 78.235%)' },
  },
  'color.checkbox-text': {
    cssVariable: '--color-checkbox-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.chip-text': {
    cssVariable: '--color-chip-text',
    type: 'color',
    values: { light: 'hsl(216.852792 89.954338% 42.941176%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.control-blue': {
    cssVariable: '--color-control-blue',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(212.087 100% 45.098%)' },
  },
  'color.control-text': {
    cssVariable: '--color-control-text',
    type: 'color',
    values: { light: 'hsl(205.714286 5.511811% 24.901961%)', dark: 'hsl(213.333 10.843% 83.725%)' },
  },
  'color.destructive-action': {
    cssVariable: '--color-destructive-action',
    type: 'color',
    values: { light: 'hsl(4.231 76.471% 40%)', dark: 'hsl(4.231 76.471% 40%)' },
  },
  /** Dialogs and the command palette: the popup surface, which in the dark theme stays the pane color so rows and fields inside keep their contrast. */
  'color.dialog': {
    cssVariable: '--color-dialog',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.dialog-overlay': {
    cssVariable: '--color-dialog-overlay',
    type: 'color',
    values: { light: 'hsl(0 0% 12.157%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.direction-link': {
    cssVariable: '--color-direction-link',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.direction-link-border': {
    cssVariable: '--color-direction-link-border',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(213.333 4.523% 39.02%)' },
  },
  'color.direction-link-icon': {
    cssVariable: '--color-direction-link-icon',
    type: 'color',
    values: { light: 'hsl(216.852792 89.954338% 42.941176%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.direction-link-label': {
    cssVariable: '--color-direction-link-label',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.direction-link-text': {
    cssVariable: '--color-direction-link-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.disabled-text': {
    cssVariable: '--color-disabled-text',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 8.725% 70.784%)' },
  },
  'color.disclosure-text': {
    cssVariable: '--color-disclosure-text',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.field': {
    cssVariable: '--color-field',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.field-active': {
    cssVariable: '--color-field-active',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.field-border': {
    cssVariable: '--color-field-border',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(213.333 4.523% 39.02%)' },
  },
  'color.field-error': {
    cssVariable: '--color-field-error',
    type: 'color',
    values: { light: 'hsl(4.231 76.471% 40%)', dark: 'hsl(4.231 76.471% 75%)' },
  },
  'color.field-hint': {
    cssVariable: '--color-field-hint',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.field-label': {
    cssVariable: '--color-field-label',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.field-placeholder': {
    cssVariable: '--color-field-placeholder',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 8.725% 70.784%)' },
  },
  'color.field-text': {
    cssVariable: '--color-field-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.focus-ring': {
    cssVariable: '--color-focus-ring',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.icon': {
    cssVariable: '--color-icon',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 11.712% 78.235%)' },
  },
  'color.link': {
    cssVariable: '--color-link',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.markdown-border': {
    cssVariable: '--color-markdown-border',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(213.333 4.523% 39.02%)' },
  },
  /** Rows on a menu pane: white in light, raised from the pane in dark. */
  'color.menu-row': {
    cssVariable: '--color-menu-row',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.navigation-icon': {
    cssVariable: '--color-navigation-icon',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 8.725% 70.784%)' },
  },
  'color.navigation-quiet': {
    cssVariable: '--color-navigation-quiet',
    type: 'color',
    values: { light: 'hsl(213.333333 42.857143% 95.882353%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.navigation-selected': {
    cssVariable: '--color-navigation-selected',
    type: 'color',
    values: {
      light: 'hsl(218.181818 91.666667% 95.294118%)',
      dark: 'hsl(217.84467 10.485441% 24.81418%)',
    },
  },
  'color.navigation-text': {
    cssVariable: '--color-navigation-text',
    type: 'color',
    values: { light: 'hsl(205.714286 5.511811% 24.901961%)', dark: 'hsl(216 9.091% 89.216%)' },
  },
  'color.neutral-fill': {
    cssVariable: '--color-neutral-fill',
    type: 'color',
    values: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 28%)' },
  },
  'color.on-accent': {
    cssVariable: '--color-on-accent',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  /** Initials use a deeper shade of the figure blue: 5:1 on the avatar fill. */
  'color.on-avatar': {
    cssVariable: '--color-on-avatar',
    type: 'color',
    values: { light: 'hsl(221.3 71.7% 36%)', dark: 'hsl(221.3 71.7% 36%)' },
  },
  'color.on-calendar-selected': {
    cssVariable: '--color-on-calendar-selected',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.on-checkbox': {
    cssVariable: '--color-on-checkbox',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  'color.on-destructive-action': {
    cssVariable: '--color-on-destructive-action',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  'color.on-navigation-selected': {
    cssVariable: '--color-on-navigation-selected',
    type: 'color',
    values: { light: 'hsl(216.852792 89.954338% 39%)', dark: 'hsl(217.317 89.13% 85%)' },
  },
  'color.on-primary-action': {
    cssVariable: '--color-on-primary-action',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 12.157%)' },
  },
  /** Labels on action and navigation fills keep 4.5:1 on their hover shades too, also on a tab rail: outlined and selected navigation labels are a deeper blue than links. */
  'color.on-secondary-action': {
    cssVariable: '--color-on-secondary-action',
    type: 'color',
    values: { light: 'hsl(205.714286 5.511811% 24.901961%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.on-select-selected': {
    cssVariable: '--color-on-select-selected',
    type: 'color',
    values: { light: 'hsl(216.852792 89.954338% 42.941176%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.on-subtle-action': {
    cssVariable: '--color-on-subtle-action',
    type: 'color',
    values: { light: 'hsl(216.852792 89.954338% 42.941176%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.on-toast': {
    cssVariable: '--color-on-toast',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  'color.on-tone': {
    cssVariable: '--color-on-tone',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 12.157%)' },
  },
  'color.outlined-focus': {
    cssVariable: '--color-outlined-focus',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.pane': {
    cssVariable: '--color-pane',
    type: 'color',
    values: { light: 'hsl(213.333333 42.857143% 95.882353%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  /** Popups raised over the page, such as the open list of a Select. */
  'color.popup': {
    cssVariable: '--color-popup',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.popup-border': {
    cssVariable: '--color-popup-border',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(216 4.425% 30%)' },
  },
  'color.primary-action': {
    cssVariable: '--color-primary-action',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.radio': {
    cssVariable: '--color-radio',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.radio-detail': {
    cssVariable: '--color-radio-detail',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.radio-row': {
    cssVariable: '--color-radio-row',
    type: 'color',
    values: { light: 'hsl(210 16.666667% 97.647059%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.radio-text': {
    cssVariable: '--color-radio-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.row': {
    cssVariable: '--color-row',
    type: 'color',
    values: { light: 'hsl(200 12% 95.098039%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.row-alternate': {
    cssVariable: '--color-row-alternate',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.row-detail': {
    cssVariable: '--color-row-detail',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.row-text': {
    cssVariable: '--color-row-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.select-option': {
    cssVariable: '--color-select-option',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.select-option-text': {
    cssVariable: '--color-select-option-text',
    type: 'color',
    values: { light: 'hsl(213.333 9.333% 29.412%)', dark: 'hsl(213.333 10.843% 83.725%)' },
  },
  'color.select-selected': {
    cssVariable: '--color-select-selected',
    type: 'color',
    values: { light: 'hsl(218.181818 91.666667% 95.294118%)', dark: 'hsl(216 30% 30%)' },
  },
  /** The content color that fills and state layers mix with transparency, in TokensHandwritten.css. */
  'color.state-layer': {
    cssVariable: '--color-state-layer',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.subtle-action': {
    cssVariable: '--color-subtle-action',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.subtle-action-border': {
    cssVariable: '--color-subtle-action-border',
    type: 'color',
    values: { light: 'hsl(220 8.823529% 86.666667%)', dark: 'hsl(213.333 4.523% 39.02%)' },
  },
  'color.surface': {
    cssVariable: '--color-surface',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.surface-base': {
    cssVariable: '--color-surface-base',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.surface-muted': {
    cssVariable: '--color-surface-muted',
    type: 'color',
    values: { light: 'hsl(210 16.666667% 97.647059%)', dark: 'hsl(216 4.425% 22.157%)' },
  },
  'color.surface-raised': {
    cssVariable: '--color-surface-raised',
    type: 'color',
    values: { light: 'hsl(220 0% 100%)', dark: 'hsl(220 3.614% 16.275%)' },
  },
  'color.switch-on': {
    cssVariable: '--color-switch-on',
    type: 'color',
    values: { light: 'hsl(214.07767 81.746032% 50.588235%)', dark: 'hsl(212.087 100% 45.098%)' },
  },
  'color.switch-text': {
    cssVariable: '--color-switch-text',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.switch-thumb': {
    cssVariable: '--color-switch-thumb',
    type: 'color',
    values: { light: 'hsl(205.714286 5.511811% 24.901961%)', dark: 'hsl(213.333 10.843% 83.725%)' },
  },
  'color.switch-thumb-on': {
    cssVariable: '--color-switch-thumb-on',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  'color.text-muted': {
    cssVariable: '--color-text-muted',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.text-primary': {
    cssVariable: '--color-text-primary',
    type: 'color',
    values: { light: 'hsl(225 5.882353% 13.333333%)', dark: 'hsl(216 12.195% 91.961%)' },
  },
  'color.text-quiet': {
    cssVariable: '--color-text-quiet',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 8.725% 70.784%)' },
  },
  'color.text-strong': {
    cssVariable: '--color-text-strong',
    type: 'color',
    values: { light: 'hsl(205.714286 5.511811% 24.901961%)', dark: 'hsl(216 9.091% 89.216%)' },
  },
  'color.text-subtle': {
    cssVariable: '--color-text-subtle',
    type: 'color',
    values: { light: 'hsl(213.333333 4.522613% 39.019608%)', dark: 'hsl(212.308 8.725% 70.784%)' },
  },
  'color.toast-error': {
    cssVariable: '--color-toast-error',
    type: 'color',
    values: { light: 'hsl(4.231 76.471% 40%)', dark: 'hsl(4.231 76.471% 40%)' },
  },
  'color.toast-info': {
    cssVariable: '--color-toast-info',
    type: 'color',
    values: { light: 'hsl(214 60% 40%)', dark: 'hsl(214 60% 40%)' },
  },
  'color.toast-neutral': {
    cssVariable: '--color-toast-neutral',
    type: 'color',
    values: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 28%)' },
  },
  'color.toast-success': {
    cssVariable: '--color-toast-success',
    type: 'color',
    values: { light: 'hsl(158 48% 30%)', dark: 'hsl(158 48% 30%)' },
  },
  'color.tone.accent': {
    cssVariable: '--color-tone-accent',
    type: 'color',
    values: { light: 'hsl(216.853 89.954% 42.941%)', dark: 'hsl(217.317 89.13% 81.961%)' },
  },
  'color.tone.danger': {
    cssVariable: '--color-tone-danger',
    type: 'color',
    values: { light: 'hsl(4.231 76.471% 40%)', dark: 'hsl(4.231 80% 80%)' },
  },
  /** Completed work, such as a merged or closed-as-done item. */
  'color.tone.done': {
    cssVariable: '--color-tone-done',
    type: 'color',
    values: { light: 'hsl(266 55% 50%)', dark: 'hsl(268 80% 83%)' },
  },
  'color.tone.neutral': {
    cssVariable: '--color-tone-neutral',
    type: 'color',
    values: { light: 'hsl(213.333 4.523% 39.02%)', dark: 'hsl(213.333 7.317% 75.882%)' },
  },
  'color.tone.success': {
    cssVariable: '--color-tone-success',
    type: 'color',
    values: { light: 'hsl(140 64% 27%)', dark: 'hsl(140 50% 66%)' },
  },
  'color.tone.warning': {
    cssVariable: '--color-tone-warning',
    type: 'color',
    values: { light: 'hsl(36 100% 26%)', dark: 'hsl(40 85% 64%)' },
  },
  'color.white': {
    cssVariable: '--color-white',
    type: 'color',
    values: { light: 'hsl(0 0% 100%)', dark: 'hsl(0 0% 100%)' },
  },
  'control.font-size': {
    cssVariable: '--control-font-size',
    type: 'dimension',
    values: { light: '0.9375rem', dark: '0.9375rem' },
  },
  'control.height': {
    cssVariable: '--control-height',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'control.height-compact': {
    cssVariable: '--control-height-compact',
    type: 'dimension',
    values: { light: '2rem', dark: '2rem' },
  },
  'control.height-small': {
    cssVariable: '--control-height-small',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'control.height-touch': {
    cssVariable: '--control-height-touch',
    type: 'dimension',
    values: { light: '2.75rem', dark: '2.75rem' },
  },
  'control.icon-size': {
    cssVariable: '--control-icon-size',
    type: 'dimension',
    values: { light: '1rem', dark: '1rem' },
  },
  'font.family': {
    cssVariable: '--font-family',
    type: 'fontFamily',
    values: { light: "'envUI Inter', sans-serif", dark: "'envUI Inter', sans-serif" },
  },
  'font.size.body': {
    cssVariable: '--font-size-body',
    type: 'dimension',
    values: { light: '0.9375rem', dark: '0.9375rem' },
  },
  'font.size.body-small': {
    cssVariable: '--font-size-body-small',
    type: 'dimension',
    values: { light: '0.875rem', dark: '0.875rem' },
  },
  'font.size.heading': {
    cssVariable: '--font-size-heading',
    type: 'dimension',
    values: { light: '1.125rem', dark: '1.125rem' },
  },
  'font.size.heading-small': {
    cssVariable: '--font-size-heading-small',
    type: 'dimension',
    values: { light: '1rem', dark: '1rem' },
  },
  'icon-button.size': {
    cssVariable: '--icon-button-size',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'md.sys.shape.corner.extra-large': {
    cssVariable: '--md-sys-shape-corner-extra-large',
    type: 'dimension',
    values: { light: '1.75rem', dark: '1.75rem' },
  },
  'md.sys.shape.corner.extra-small': {
    cssVariable: '--md-sys-shape-corner-extra-small',
    type: 'dimension',
    values: { light: '0.25rem', dark: '0.25rem' },
  },
  'md.sys.shape.corner.large': {
    cssVariable: '--md-sys-shape-corner-large',
    type: 'dimension',
    values: { light: '1rem', dark: '1rem' },
  },
  'md.sys.shape.corner.medium': {
    cssVariable: '--md-sys-shape-corner-medium',
    type: 'dimension',
    values: { light: '0.75rem', dark: '0.75rem' },
  },
  'md.sys.shape.corner.none': {
    cssVariable: '--md-sys-shape-corner-none',
    type: 'dimension',
    values: { light: '0', dark: '0' },
  },
  'md.sys.shape.corner.small': {
    cssVariable: '--md-sys-shape-corner-small',
    type: 'dimension',
    values: { light: '0.5rem', dark: '0.5rem' },
  },
  'member-identity.avatar-size': {
    cssVariable: '--member-identity-avatar-size',
    type: 'dimension',
    values: { light: '2rem', dark: '2rem' },
  },
  'member-identity.copy-height': {
    cssVariable: '--member-identity-copy-height',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'member-identity.email-line-height': {
    cssVariable: '--member-identity-email-line-height',
    type: 'dimension',
    values: { light: '1.25rem', dark: '1.25rem' },
  },
  'member-identity.email-size': {
    cssVariable: '--member-identity-email-size',
    type: 'dimension',
    values: { light: '0.875rem', dark: '0.875rem' },
  },
  'member-identity.gap': {
    cssVariable: '--member-identity-gap',
    type: 'dimension',
    values: { light: '0.75rem', dark: '0.75rem' },
  },
  'member-identity.name-line-height': {
    cssVariable: '--member-identity-name-line-height',
    type: 'dimension',
    values: { light: '1.25rem', dark: '1.25rem' },
  },
  'member-identity.name-size': {
    cssVariable: '--member-identity-name-size',
    type: 'dimension',
    values: { light: '0.9375rem', dark: '0.9375rem' },
  },
  'motion.duration.fast': {
    cssVariable: '--motion-duration-fast',
    type: 'duration',
    values: { light: '0.12s', dark: '0.12s' },
  },
  'motion.duration.medium': {
    cssVariable: '--motion-duration-medium',
    type: 'duration',
    values: { light: '0.16s', dark: '0.16s' },
  },
  'motion.duration.slow': {
    cssVariable: '--motion-duration-slow',
    type: 'duration',
    values: { light: '0.24s', dark: '0.24s' },
  },
  'motion.ease': {
    cssVariable: '--motion-ease',
    type: 'cubicBezier',
    values: { light: 'cubic-bezier(0.45, 0, 0.2, 1)', dark: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  },
  /** Elements entering decelerate into place. */
  'motion.ease-enter': {
    cssVariable: '--motion-ease-enter',
    type: 'cubicBezier',
    values: { light: 'cubic-bezier(0.05, 0.7, 0.1, 1)', dark: 'cubic-bezier(0.05, 0.7, 0.1, 1)' },
  },
  /** Leaving elements accelerate away. */
  'motion.ease-exit': {
    cssVariable: '--motion-ease-exit',
    type: 'cubicBezier',
    values: { light: 'cubic-bezier(0.3, 0, 0.8, 0.15)', dark: 'cubic-bezier(0.3, 0, 0.8, 0.15)' },
  },
  'motion.ease-standard': {
    cssVariable: '--motion-ease-standard',
    type: 'cubicBezier',
    values: { light: 'cubic-bezier(0.45, 0, 0.2, 1)', dark: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  },
  'radius.row-inner': {
    cssVariable: '--radius-row-inner',
    type: 'dimension',
    values: { light: '0.5rem', dark: '0.5rem' },
  },
  'radius.row-outer': {
    cssVariable: '--radius-row-outer',
    type: 'dimension',
    values: { light: '1.75rem', dark: '1.75rem' },
  },
  'radius.row-single': {
    cssVariable: '--radius-row-single',
    type: 'dimension',
    values: { light: '1.75rem', dark: '1.75rem' },
  },
  'radius.standard': {
    cssVariable: '--radius-standard',
    type: 'dimension',
    values: { light: '0.5rem', dark: '0.5rem' },
  },
  'radius.surface': {
    cssVariable: '--radius-surface',
    type: 'dimension',
    values: { light: '1.75rem', dark: '1.75rem' },
  },
  /** Text in rows keeps clear of the large outer corners, whether a row stands alone or is connected. */
  'row.padding-inline': {
    cssVariable: '--row-padding-inline',
    type: 'dimension',
    values: { light: '1.5rem', dark: '1.5rem' },
  },
  'space.1': {
    cssVariable: '--space-1',
    type: 'dimension',
    values: { light: '0.25rem', dark: '0.25rem' },
  },
  'space.2': {
    cssVariable: '--space-2',
    type: 'dimension',
    values: { light: '0.5rem', dark: '0.5rem' },
  },
  'space.3': {
    cssVariable: '--space-3',
    type: 'dimension',
    values: { light: '0.75rem', dark: '0.75rem' },
  },
  'space.4': {
    cssVariable: '--space-4',
    type: 'dimension',
    values: { light: '1rem', dark: '1rem' },
  },
  'space.5': {
    cssVariable: '--space-5',
    type: 'dimension',
    values: { light: '1.5rem', dark: '1.5rem' },
  },
  'space.6': {
    cssVariable: '--space-6',
    type: 'dimension',
    values: { light: '2rem', dark: '2rem' },
  },
  'space.7': {
    cssVariable: '--space-7',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'space.8': {
    cssVariable: '--space-8',
    type: 'dimension',
    values: { light: '3rem', dark: '3rem' },
  },
  'space.9': {
    cssVariable: '--space-9',
    type: 'dimension',
    values: { light: '4rem', dark: '4rem' },
  },
  'state.card-strip-weight': {
    cssVariable: '--state-card-strip-weight',
    type: 'number',
    values: { light: '35%', dark: '35%' },
  },
  'state.dialog-overlay-opacity': {
    cssVariable: '--state-dialog-overlay-opacity',
    type: 'number',
    values: { light: '0.55', dark: '0.55' },
  },
  'state.disabled-opacity': {
    cssVariable: '--state-disabled-opacity',
    type: 'number',
    values: { light: '0.48', dark: '0.48' },
  },
  'state.fill-hover-opacity': {
    cssVariable: '--state-fill-hover-opacity',
    type: 'number',
    values: { light: '17%', dark: '25%' },
  },
  'state.fill-opacity': {
    cssVariable: '--state-fill-opacity',
    type: 'number',
    values: { light: '6%', dark: '12.5%' },
  },
  'state.fill-pressed-opacity': {
    cssVariable: '--state-fill-pressed-opacity',
    type: 'number',
    values: { light: '29%', dark: '37.5%' },
  },
  'state.hover-shift': {
    cssVariable: '--state-hover-shift',
    type: 'number',
    values: { light: '10', dark: '10' },
  },
  'state.layer-hover-opacity': {
    cssVariable: '--state-layer-hover-opacity',
    type: 'number',
    values: { light: '8%', dark: '8%' },
  },
  'state.layer-pressed-opacity': {
    cssVariable: '--state-layer-pressed-opacity',
    type: 'number',
    values: { light: '12%', dark: '12%' },
  },
  'state.lightness-threshold': {
    cssVariable: '--state-lightness-threshold',
    type: 'number',
    values: { light: '50', dark: '50' },
  },
  'state.pressed-shift': {
    cssVariable: '--state-pressed-shift',
    type: 'number',
    values: { light: '20', dark: '20' },
  },
  'state.selected-base-weight': {
    cssVariable: '--state-selected-base-weight',
    type: 'number',
    values: { light: '13%', dark: '13%' },
  },
  'state.surface-hover-shift': {
    cssVariable: '--state-surface-hover-shift',
    type: 'number',
    values: { light: '6', dark: '6' },
  },
  'state.surface-pressed-shift': {
    cssVariable: '--state-surface-pressed-shift',
    type: 'number',
    values: { light: '10', dark: '10' },
  },
  'state.tone-subtle-opacity': {
    cssVariable: '--state-tone-subtle-opacity',
    type: 'number',
    values: { light: '12%', dark: '14%' },
  },
  /** A window title bar drawn by the application, which keeps compact controls. */
  'title-bar.height': {
    cssVariable: '--title-bar-height',
    type: 'dimension',
    values: { light: '2.5rem', dark: '2.5rem' },
  },
  'topbar.height': {
    cssVariable: '--topbar-height',
    type: 'dimension',
    values: { light: '3.25rem', dark: '3.25rem' },
  },
} as const satisfies Record<string, TokenDefinition>;

export type TokenId = keyof typeof tokens;
export type TokenCssVariable = (typeof tokens)[TokenId]['cssVariable'];
