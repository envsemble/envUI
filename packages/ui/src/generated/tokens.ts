// Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.
// Internal for now: the package neither exports nor ships it yet.

/** The themes Tokens.css builds: each color scheme at standard and high contrast. */
export const themes = ['light', 'dark', 'light-high-contrast', 'dark-high-contrast'] as const;
export type ThemeName = (typeof themes)[number];

/** A token's CSS value: one value, or a value per part of a composite token such as typography. */
export type TokenValue = string | Readonly<Record<string, string>>;

export interface TokenDefinition {
  /** The CSS custom property that carries the token. */
  cssVariable: `--${string}`;
  /** The DTCG type. */
  type: string;
  /**
   * The value Tokens.css gives in each theme, with aliases resolved. Conditions that
   * TokensHandwritten.css adds, such as the touch sizes under a coarse pointer, are not in it.
   */
  values: Readonly<Record<ThemeName, TokenValue>>;
}

/** Every token, by its DTCG path. */
export const tokens = {
  'body.font-weight': {
    cssVariable: '--body-font-weight',
    type: 'fontWeight',
    values: {
      light: '400',
      dark: '400',
      'light-high-contrast': '400',
      'dark-high-contrast': '400',
    },
  },
  'color.accent': {
    cssVariable: '--color-accent',
    type: 'color',
    values: {
      light: '#9948b6',
      dark: '#9948b6',
      'light-high-contrast': '#6d1888',
      'dark-high-contrast': '#6d1888',
    },
  },
  'color.accent-hover': {
    cssVariable: '--color-accent-hover',
    type: 'color',
    values: {
      light: '#83319f',
      dark: '#83319f',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#63047d',
    },
  },
  'color.accent-pressed': {
    cssVariable: '--color-accent-pressed',
    type: 'color',
    values: {
      light: '#6d1888',
      dark: '#6d1888',
      'light-high-contrast': '#57006e',
      'dark-high-contrast': '#57006e',
    },
  },
  'color.action-strip': {
    cssVariable: '--color-action-strip',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#343638',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#343638',
    },
  },
  'color.avatar': {
    cssVariable: '--color-avatar',
    type: 'color',
    values: {
      light: '#9fc1f8',
      dark: '#9fc1f8',
      'light-high-contrast': '#9fc1f8',
      'dark-high-contrast': '#9fc1f8',
    },
  },
  'color.avatar-figure': {
    cssVariable: '--color-avatar-figure',
    type: 'color',
    values: {
      light: '#347eea',
      dark: '#347eea',
      'light-high-contrast': '#347eea',
      'dark-high-contrast': '#347eea',
    },
  },
  /** A solid accent fill, such as a solid accent badge; paired with fg.on-emphasis. */
  'color.bg.accent.emphasis': {
    cssVariable: '--color-bg-accent-emphasis',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** The translucent accent tint of badges and info alerts. */
  'color.bg.accent.muted': {
    cssVariable: '--color-bg-accent-muted',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.12)',
      dark: 'rgb(159 193 248 / 0.14)',
      'light-high-contrast': 'rgb(0 55 124 / 0.08)',
      'dark-high-contrast': 'rgb(205 222 252 / 0.1)',
    },
  },
  /** The brand fill of primary actions, chosen radios and the chosen calendar day; paired with fg.on-emphasis. */
  'color.bg.brand.emphasis': {
    cssVariable: '--color-bg-brand-emphasis',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** A primary action under the pointer. */
  'color.bg.brand.emphasis.hover': {
    cssVariable: '--color-bg-brand-emphasis-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** A primary action while pressed. */
  'color.bg.brand.emphasis.pressed': {
    cssVariable: '--color-bg-brand-emphasis-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The saturated brand fill of checked checkboxes, switches that are on, sliders, meters and spinners; paired with fg.on-strong. */
  'color.bg.brand.strong': {
    cssVariable: '--color-bg-brand-strong',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#4b8bec',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#00408f',
    },
  },
  /** A checked control under the pointer. */
  'color.bg.brand.strong.hover': {
    cssVariable: '--color-bg-brand-strong-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#347eea',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#00377c',
    },
  },
  /** A checked control while pressed. */
  'color.bg.brand.strong.pressed': {
    cssVariable: '--color-bg-brand-strong-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#1872e7',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#002f6d',
    },
  },
  /** A solid danger fill; paired with fg.on-emphasis. */
  'color.bg.danger.emphasis': {
    cssVariable: '--color-bg-danger-emphasis',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffd3cf',
    },
  },
  /** The translucent danger tint of badges and alerts. */
  'color.bg.danger.muted': {
    cssVariable: '--color-bg-danger-muted',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.12)',
      dark: 'rgb(248 172 166 / 0.14)',
      'light-high-contrast': 'rgb(122 2 0 / 0.08)',
      'dark-high-contrast': 'rgb(255 211 207 / 0.1)',
    },
  },
  /** The danger fill of destructive actions and error toasts in both themes; paired with fg.on-strong. */
  'color.bg.danger.strong': {
    cssVariable: '--color-bg-danger-strong',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#b72b20',
      'light-high-contrast': '#8d0200',
      'dark-high-contrast': '#8d0200',
    },
  },
  /** A destructive action under the pointer. */
  'color.bg.danger.strong.hover': {
    cssVariable: '--color-bg-danger-strong-hover',
    type: 'color',
    values: {
      light: '#bf3e33',
      dark: '#bf3e33',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#7a0200',
    },
  },
  /** A destructive action while pressed. */
  'color.bg.danger.strong.pressed': {
    cssVariable: '--color-bg-danger-strong-pressed',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#c64e43',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#6b0100',
    },
  },
  /** The default surface: Surface, sidebars, standard menus. */
  'color.bg.default': {
    cssVariable: '--color-bg-default',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#28292b',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive default surface, such as a card or a navigation item, under the pointer. */
  'color.bg.default.hover': {
    cssVariable: '--color-bg-default-hover',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#383a3d',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#303234',
    },
  },
  /** An interactive default surface while pressed. */
  'color.bg.default.pressed': {
    cssVariable: '--color-bg-default-pressed',
    type: 'color',
    values: {
      light: '#ccced2',
      dark: '#424447',
      'light-high-contrast': '#dbdde1',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A solid done fill; paired with fg.on-emphasis. */
  'color.bg.done.emphasis': {
    cssVariable: '--color-bg-done-emphasis',
    type: 'color',
    values: {
      light: '#7a3fc8',
      dark: '#d2b2f7',
      'light-high-contrast': '#53009a',
      'dark-high-contrast': '#e8d6ff',
    },
  },
  /** The translucent done tint of badges. */
  'color.bg.done.muted': {
    cssVariable: '--color-bg-done-muted',
    type: 'color',
    values: {
      light: 'rgb(122 63 200 / 0.12)',
      dark: 'rgb(210 178 247 / 0.14)',
      'light-high-contrast': 'rgb(83 0 154 / 0.08)',
      'dark-high-contrast': 'rgb(232 214 255 / 0.1)',
    },
  },
  /** Text fields and other inputs. */
  'color.bg.field': {
    cssVariable: '--color-bg-field',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#1e1f21',
    },
  },
  /** The accent purple of important actions in both themes; paired with fg.on-strong. */
  'color.bg.important.strong': {
    cssVariable: '--color-bg-important-strong',
    type: 'color',
    values: {
      light: '#9948b6',
      dark: '#9948b6',
      'light-high-contrast': '#6d1888',
      'dark-high-contrast': '#6d1888',
    },
  },
  /** An important action under the pointer. */
  'color.bg.important.strong.hover': {
    cssVariable: '--color-bg-important-strong-hover',
    type: 'color',
    values: {
      light: '#83319f',
      dark: '#83319f',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#63047d',
    },
  },
  /** An important action while pressed. */
  'color.bg.important.strong.pressed': {
    cssVariable: '--color-bg-important-strong-pressed',
    type: 'color',
    values: {
      light: '#6d1888',
      dark: '#6d1888',
      'light-high-contrast': '#57006e',
      'dark-high-contrast': '#57006e',
    },
  },
  /** The information fill of toasts in both themes; paired with fg.on-strong. */
  'color.bg.info.strong': {
    cssVariable: '--color-bg-info-strong',
    type: 'color',
    values: {
      light: '#2c61a6',
      dark: '#2c61a6',
      'light-high-contrast': '#094285',
      'dark-high-contrast': '#094285',
    },
  },
  /** A control on the information toast under the pointer. */
  'color.bg.info.strong.hover': {
    cssVariable: '--color-bg-info-strong-hover',
    type: 'color',
    values: {
      light: '#4177be',
      dark: '#4177be',
      'light-high-contrast': '#003878',
      'dark-high-contrast': '#003878',
    },
  },
  /** A control on the information toast while pressed. */
  'color.bg.info.strong.pressed': {
    cssVariable: '--color-bg-info-strong-pressed',
    type: 'color',
    values: {
      light: '#578dd6',
      dark: '#578dd6',
      'light-high-contrast': '#003068',
      'dark-high-contrast': '#003068',
    },
  },
  /** The muted surface: Surface background="muted", radio rows. Lighter than the default surface in both themes. */
  'color.bg.muted': {
    cssVariable: '--color-bg-muted',
    type: 'color',
    values: {
      light: '#f6f8fc',
      dark: '#343638',
      'light-high-contrast': '#f6f8fc',
      'dark-high-contrast': '#343638',
    },
  },
  /** An interactive muted surface under the pointer. */
  'color.bg.muted.hover': {
    cssVariable: '--color-bg-muted-hover',
    type: 'color',
    values: {
      light: '#e8eaee',
      dark: '#424447',
      'light-high-contrast': '#e8eaee',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** An interactive muted surface while pressed. */
  'color.bg.muted.pressed': {
    cssVariable: '--color-bg-muted-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#4b4d51',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#424447',
    },
  },
  /** A solid neutral fill, such as a solid neutral badge; paired with fg.on-emphasis. */
  'color.bg.neutral.emphasis': {
    cssVariable: '--color-bg-neutral-emphasis',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#383a3d',
      'dark-high-contrast': '#dbdde1',
    },
  },
  /** The translucent neutral fill of secondary buttons, tab rails, chips, switch tracks, meter tracks and skeletons: a layer of the text color, so it keeps its tone on every surface. */
  'color.bg.neutral.muted': {
    cssVariable: '--color-bg-neutral-muted',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The neutral fill under the pointer. */
  'color.bg.neutral.muted.hover': {
    cssVariable: '--color-bg-neutral-muted-hover',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.17)',
      dark: 'rgb(232 234 238 / 0.2)',
      'light-high-contrast': 'rgb(30 31 33 / 0.12)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.12)',
    },
  },
  /** The neutral fill while pressed. */
  'color.bg.neutral.muted.pressed': {
    cssVariable: '--color-bg-neutral-muted-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.29)',
      dark: 'rgb(232 234 238 / 0.28)',
      'light-high-contrast': 'rgb(30 31 33 / 0.18)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.15)',
    },
  },
  /** The dark neutral fill of tooltips and neutral toasts in both themes; paired with fg.on-strong. */
  'color.bg.neutral.strong': {
    cssVariable: '--color-bg-neutral-strong',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#424447',
      'light-high-contrast': '#424447',
      'dark-high-contrast': '#424447',
    },
  },
  /** A control on the strong neutral fill under the pointer. */
  'color.bg.neutral.strong.hover': {
    cssVariable: '--color-bg-neutral-strong-hover',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#5d6166',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#303234',
    },
  },
  /** A control on the strong neutral fill while pressed. */
  'color.bg.neutral.strong.pressed': {
    cssVariable: '--color-bg-neutral-strong-pressed',
    type: 'color',
    values: {
      light: '#72767b',
      dark: '#72767b',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#28292b',
    },
  },
  /** Controls without a fill at rest, such as quiet buttons, inactive tabs and menubar triggers. */
  'color.bg.neutral.subtle': {
    cssVariable: '--color-bg-neutral-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer over a control without a fill, under the pointer. */
  'color.bg.neutral.subtle.hover': {
    cssVariable: '--color-bg-neutral-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.08)',
      dark: 'rgb(232 234 238 / 0.08)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.06)',
    },
  },
  /** The state layer over a control without a fill, while pressed. */
  'color.bg.neutral.subtle.pressed': {
    cssVariable: '--color-bg-neutral-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.1)',
      dark: 'rgb(232 234 238 / 0.1)',
      'light-high-contrast': 'rgb(30 31 33 / 0.08)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The scrim behind dialogs, drawn translucent by the component. */
  'color.bg.overlay': {
    cssVariable: '--color-bg-overlay',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#1e1f21',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#1e1f21',
    },
  },
  /** The page behind all content: the app frame, title bars and Surface background="page". */
  'color.bg.page': {
    cssVariable: '--color-bg-page',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#1e1f21',
    },
  },
  /** An interactive page-colored surface under the pointer. */
  'color.bg.page.hover': {
    cssVariable: '--color-bg-page-hover',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#2c2d30',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive page-colored surface while pressed. */
  'color.bg.page.pressed': {
    cssVariable: '--color-bg-page-pressed',
    type: 'color',
    values: {
      light: '#e2e4e8',
      dark: '#383a3d',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#303234',
    },
  },
  /** Popups over the page: menus, Select lists, popovers, the composer. They take elevation 2. */
  'color.bg.popup': {
    cssVariable: '--color-bg-popup',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  /** A highlighted row in a popup. */
  'color.bg.popup.hover': {
    cssVariable: '--color-bg-popup-hover',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#424447',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A pressed row in a popup. */
  'color.bg.popup.pressed': {
    cssVariable: '--color-bg-popup-pressed',
    type: 'color',
    values: {
      light: '#e2e4e8',
      dark: '#4b4d51',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#424447',
    },
  },
  /** A raised surface: Surface background="raised", dialogs, rows on a contrasting surface, outlined buttons. */
  'color.bg.raised': {
    cssVariable: '--color-bg-raised',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive raised surface under the pointer. */
  'color.bg.raised.hover': {
    cssVariable: '--color-bg-raised-hover',
    type: 'color',
    values: {
      light: '#e8eaee',
      dark: '#383a3d',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#303234',
    },
  },
  /** An interactive raised surface while pressed. */
  'color.bg.raised.pressed': {
    cssVariable: '--color-bg-raised-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** Selected navigation items, tabs, tree and table rows, and Select options; paired with fg.on-selected. */
  'color.bg.selected': {
    cssVariable: '--color-bg-selected',
    type: 'color',
    values: {
      light: '#eaf2ff',
      dark: '#383a3d',
      'light-high-contrast': '#eaf2ff',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A selected item under the pointer. */
  'color.bg.selected.hover': {
    cssVariable: '--color-bg-selected-hover',
    type: 'color',
    values: {
      light: '#cddefc',
      dark: '#424447',
      'light-high-contrast': '#d7e5fd',
      'dark-high-contrast': '#424447',
    },
  },
  /** A selected item while pressed. */
  'color.bg.selected.pressed': {
    cssVariable: '--color-bg-selected-pressed',
    type: 'color',
    values: {
      light: '#b5cffb',
      dark: '#4b4d51',
      'light-high-contrast': '#cddefc',
      'dark-high-contrast': '#424447',
    },
  },
  /** A solid success fill; paired with fg.on-emphasis. */
  'color.bg.success.emphasis': {
    cssVariable: '--color-bg-success-emphasis',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#7ad197',
      'light-high-contrast': '#00441a',
      'dark-high-contrast': '#98f0b5',
    },
  },
  /** The translucent success tint of badges and alerts. */
  'color.bg.success.muted': {
    cssVariable: '--color-bg-success-muted',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.12)',
      dark: 'rgb(122 209 151 / 0.14)',
      'light-high-contrast': 'rgb(0 68 26 / 0.08)',
      'dark-high-contrast': 'rgb(152 240 181 / 0.1)',
    },
  },
  /** The success fill of toasts in both themes; paired with fg.on-strong. */
  'color.bg.success.strong': {
    cssVariable: '--color-bg-success-strong',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#176f35',
      'light-high-contrast': '#004f1f',
      'dark-high-contrast': '#004f1f',
    },
  },
  /** A control on the success toast under the pointer. */
  'color.bg.success.strong.hover': {
    cssVariable: '--color-bg-success-strong-hover',
    type: 'color',
    values: {
      light: '#30854a',
      dark: '#30854a',
      'light-high-contrast': '#00441a',
      'dark-high-contrast': '#00441a',
    },
  },
  /** A control on the success toast while pressed. */
  'color.bg.success.strong.pressed': {
    cssVariable: '--color-bg-success-strong-pressed',
    type: 'color',
    values: {
      light: '#3c9056',
      dark: '#3c9056',
      'light-high-contrast': '#003b15',
      'dark-high-contrast': '#003b15',
    },
  },
  /** A solid warning fill; paired with fg.on-emphasis. */
  'color.bg.warning.emphasis': {
    cssVariable: '--color-bg-warning-emphasis',
    type: 'color',
    values: {
      light: '#8a5504',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffd890',
    },
  },
  /** The translucent warning tint of badges and alerts. */
  'color.bg.warning.muted': {
    cssVariable: '--color-bg-warning-muted',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.12)',
      dark: 'rgb(235 183 80 / 0.14)',
      'light-high-contrast': 'rgb(85 50 0 / 0.08)',
      'dark-high-contrast': 'rgb(255 216 144 / 0.1)',
    },
  },
  'color.border-hover': {
    cssVariable: '--color-border-hover',
    type: 'color',
    values: {
      light: '#bdbfc3',
      dark: '#7d8185',
      'light-high-contrast': '#5d6166',
      'dark-high-contrast': '#afb1b6',
    },
  },
  'color.border-strong': {
    cssVariable: '--color-border-strong',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** The active border and label of a focused field, and today’s ring in a calendar. */
  'color.border.accent': {
    cssVariable: '--color-border-accent',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** An active field border under the pointer. */
  'color.border.accent.hover': {
    cssVariable: '--color-border-accent-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** An active field border while pressed. */
  'color.border.accent.pressed': {
    cssVariable: '--color-border-accent-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The border of an invalid field. */
  'color.border.danger': {
    cssVariable: '--color-border-danger',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  /** An invalid field border under the pointer. */
  'color.border.danger.hover': {
    cssVariable: '--color-border-danger-hover',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#e68c84',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#ffedeb',
    },
  },
  /** An invalid field border while pressed. */
  'color.border.danger.pressed': {
    cssVariable: '--color-border-danger-pressed',
    type: 'color',
    values: {
      light: '#d66d63',
      dark: '#d66d63',
      'light-high-contrast': '#5a0100',
      'dark-high-contrast': '#fff6f5',
    },
  },
  /** The boundary of a control that has no other edge: outlined fields and buttons, the track of a switch that is off. At least 3:1 on every surface. */
  'color.border.default': {
    cssVariable: '--color-border-default',
    type: 'color',
    values: {
      light: '#7d8185',
      dark: '#898c91',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A control boundary under the pointer. */
  'color.border.default.hover': {
    cssVariable: '--color-border-default-hover',
    type: 'color',
    values: {
      light: '#72767b',
      dark: '#95989c',
      'light-high-contrast': '#5d6166',
      'dark-high-contrast': '#afb1b6',
    },
  },
  /** A control boundary while pressed. */
  'color.border.default.pressed': {
    cssVariable: '--color-border-default-pressed',
    type: 'color',
    values: {
      light: '#686b70',
      dark: '#a1a4a9',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  /** Focus rings: at least 3:1 against what they are drawn on. */
  'color.border.focus': {
    cssVariable: '--color-border-focus',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#0053b5',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** Decorative dividers and outlines that are not a control’s only boundary: table lines, title bars, Markdown rules, popup edges with elevation. */
  'color.border.muted': {
    cssVariable: '--color-border-muted',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative outline under the pointer, such as a resize handle or a pager link. */
  'color.border.muted.hover': {
    cssVariable: '--color-border-muted-hover',
    type: 'color',
    values: {
      light: '#bdbfc3',
      dark: '#7d8185',
      'light-high-contrast': '#5d6166',
      'dark-high-contrast': '#afb1b6',
    },
  },
  /** A decorative outline while pressed. */
  'color.border.muted.pressed': {
    cssVariable: '--color-border-muted-pressed',
    type: 'color',
    values: {
      light: '#a1a4a9',
      dark: '#95989c',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  'color.calendar-selected': {
    cssVariable: '--color-calendar-selected',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.calendar-today': {
    cssVariable: '--color-calendar-today',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.canvas': {
    cssVariable: '--color-canvas',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#1e1f21',
    },
  },
  'color.canvas-dark': {
    cssVariable: '--color-canvas-dark',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#1e1f21',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#1e1f21',
    },
  },
  'color.checkbox': {
    cssVariable: '--color-checkbox',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#4b8bec',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.checkbox-border': {
    cssVariable: '--color-checkbox-border',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.checkbox-hover': {
    cssVariable: '--color-checkbox-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#347eea',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  'color.checkbox-pressed': {
    cssVariable: '--color-checkbox-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#1872e7',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.checkbox-ring-hover': {
    cssVariable: '--color-checkbox-ring-hover',
    type: 'color',
    values: {
      light: '#54575c',
      dark: '#ccced2',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.checkbox-ring-pressed': {
    cssVariable: '--color-checkbox-ring-pressed',
    type: 'color',
    values: {
      light: '#4b4d51',
      dark: '#dbdde1',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.checkbox-text': {
    cssVariable: '--color-checkbox-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.chip': {
    cssVariable: '--color-chip',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.chip-text': {
    cssVariable: '--color-chip-text',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.control-blue': {
    cssVariable: '--color-control-blue',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#4b8bec',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.destructive-action': {
    cssVariable: '--color-destructive-action',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#b72b20',
      'light-high-contrast': '#8d0200',
      'dark-high-contrast': '#8d0200',
    },
  },
  'color.destructive-action-hover': {
    cssVariable: '--color-destructive-action-hover',
    type: 'color',
    values: {
      light: '#bf3e33',
      dark: '#bf3e33',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#7a0200',
    },
  },
  'color.destructive-action-pressed': {
    cssVariable: '--color-destructive-action-pressed',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#c64e43',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#6b0100',
    },
  },
  'color.dialog': {
    cssVariable: '--color-dialog',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.dialog-overlay': {
    cssVariable: '--color-dialog-overlay',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#1e1f21',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#1e1f21',
    },
  },
  'color.direction-link': {
    cssVariable: '--color-direction-link',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.direction-link-border': {
    cssVariable: '--color-direction-link-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'color.direction-link-border-hover': {
    cssVariable: '--color-direction-link-border-hover',
    type: 'color',
    values: {
      light: '#bdbfc3',
      dark: '#7d8185',
      'light-high-contrast': '#5d6166',
      'dark-high-contrast': '#afb1b6',
    },
  },
  'color.direction-link-border-pressed': {
    cssVariable: '--color-direction-link-border-pressed',
    type: 'color',
    values: {
      light: '#a1a4a9',
      dark: '#95989c',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  'color.direction-link-icon': {
    cssVariable: '--color-direction-link-icon',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.direction-link-label': {
    cssVariable: '--color-direction-link-label',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.direction-link-text': {
    cssVariable: '--color-direction-link-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.disabled-text': {
    cssVariable: '--color-disabled-text',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.disclosure-text': {
    cssVariable: '--color-disclosure-text',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  /** Accent text and icons: the accent tone, outlined button labels, chips, the icon of a pager link. */
  'color.fg.accent': {
    cssVariable: '--color-fg-accent',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The labels of navigation items, secondary buttons and Select options, the values of meters and sliders, and the thumb of a switch that is off. */
  'color.fg.control': {
    cssVariable: '--color-fg-control',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  /** Danger text and icons, and field errors. */
  'color.fg.danger': {
    cssVariable: '--color-fg-danger',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  /** Body text and the labels of rows, fields and choice controls. */
  'color.fg.default': {
    cssVariable: '--color-fg-default',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  /** Done text and icons. */
  'color.fg.done': {
    cssVariable: '--color-fg-done',
    type: 'color',
    values: {
      light: '#7a3fc8',
      dark: '#d2b2f7',
      'light-high-contrast': '#53009a',
      'dark-high-contrast': '#f1e6ff',
    },
  },
  /** Links and text buttons: at least 4.5:1 on every surface and row. */
  'color.fg.link': {
    cssVariable: '--color-fg-link',
    type: 'color',
    values: {
      light: '#0366da',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** A link under the pointer. */
  'color.fg.link.hover': {
    cssVariable: '--color-fg-link-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#8ab3f5',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  /** A link while pressed. */
  'color.fg.link.pressed': {
    cssVariable: '--color-fg-link-pressed',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#75a5f2',
      'light-high-contrast': '#00275c',
      'dark-high-contrast': '#f4f8ff',
    },
  },
  /** Supporting text, icons, field labels, descriptions and placeholders, row details, unchecked checkbox rings: every former synonym (muted, quiet, icon, field label, hint, placeholder, row detail). */
  'color.fg.muted': {
    cssVariable: '--color-fg-muted',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  /** Muted text that responds to the pointer, such as a Disclosure summary, gains contrast. */
  'color.fg.muted.hover': {
    cssVariable: '--color-fg-muted-hover',
    type: 'color',
    values: {
      light: '#54575c',
      dark: '#ccced2',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  /** Muted text while pressed. */
  'color.fg.muted.pressed': {
    cssVariable: '--color-fg-muted-pressed',
    type: 'color',
    values: {
      light: '#4b4d51',
      dark: '#dbdde1',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  /** Text and icons on the emphasis fills: white in light, dark in dark. */
  'color.fg.on-emphasis': {
    cssVariable: '--color-fg-on-emphasis',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  /** Text and indicators on bg.selected and its states. */
  'color.fg.on-selected': {
    cssVariable: '--color-fg-on-selected',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  /** Text and icons on the strong fills: white in both themes. */
  'color.fg.on-strong': {
    cssVariable: '--color-fg-on-strong',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  /** Success text and icons. */
  'color.fg.success': {
    cssVariable: '--color-fg-success',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#7ad197',
      'light-high-contrast': '#00441a',
      'dark-high-contrast': '#a5fdc1',
    },
  },
  /** Warning text and icons. */
  'color.fg.warning': {
    cssVariable: '--color-fg-warning',
    type: 'color',
    values: {
      light: '#8a5504',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffe8be',
    },
  },
  'color.field': {
    cssVariable: '--color-field',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#1e1f21',
    },
  },
  'color.field-active': {
    cssVariable: '--color-field-active',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.field-border': {
    cssVariable: '--color-field-border',
    type: 'color',
    values: {
      light: '#7d8185',
      dark: '#898c91',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'color.field-error': {
    cssVariable: '--color-field-error',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  'color.field-hint': {
    cssVariable: '--color-field-hint',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.field-label': {
    cssVariable: '--color-field-label',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.field-placeholder': {
    cssVariable: '--color-field-placeholder',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.field-text': {
    cssVariable: '--color-field-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.fill': {
    cssVariable: '--color-fill',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.focus-ring': {
    cssVariable: '--color-focus-ring',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#0053b5',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.icon': {
    cssVariable: '--color-icon',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.link': {
    cssVariable: '--color-link',
    type: 'color',
    values: {
      light: '#0366da',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.link-hover': {
    cssVariable: '--color-link-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#8ab3f5',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  'color.link-pressed': {
    cssVariable: '--color-link-pressed',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#75a5f2',
      'light-high-contrast': '#00275c',
      'dark-high-contrast': '#f4f8ff',
    },
  },
  'color.markdown-border': {
    cssVariable: '--color-markdown-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'color.menu-row': {
    cssVariable: '--color-menu-row',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  'color.navigation-hover': {
    cssVariable: '--color-navigation-hover',
    type: 'color',
    values: {
      light: '#cddefc',
      dark: '#424447',
      'light-high-contrast': '#d7e5fd',
      'dark-high-contrast': '#424447',
    },
  },
  'color.navigation-icon': {
    cssVariable: '--color-navigation-icon',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.navigation-pressed': {
    cssVariable: '--color-navigation-pressed',
    type: 'color',
    values: {
      light: '#b5cffb',
      dark: '#4b4d51',
      'light-high-contrast': '#cddefc',
      'dark-high-contrast': '#424447',
    },
  },
  'color.navigation-quiet': {
    cssVariable: '--color-navigation-quiet',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#343638',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#343638',
    },
  },
  'color.navigation-quiet-hover': {
    cssVariable: '--color-navigation-quiet-hover',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.navigation-quiet-pressed': {
    cssVariable: '--color-navigation-quiet-pressed',
    type: 'color',
    values: {
      light: '#ccced2',
      dark: '#4b4d51',
      'light-high-contrast': '#dbdde1',
      'dark-high-contrast': '#424447',
    },
  },
  'color.navigation-selected': {
    cssVariable: '--color-navigation-selected',
    type: 'color',
    values: {
      light: '#eaf2ff',
      dark: '#383a3d',
      'light-high-contrast': '#eaf2ff',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.navigation-text': {
    cssVariable: '--color-navigation-text',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.on-accent': {
    cssVariable: '--color-on-accent',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  'color.on-avatar': {
    cssVariable: '--color-on-avatar',
    type: 'color',
    values: {
      light: '#004aa2',
      dark: '#004aa2',
      'light-high-contrast': '#001d49',
      'dark-high-contrast': '#001d49',
    },
  },
  'color.on-calendar-selected': {
    cssVariable: '--color-on-calendar-selected',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  'color.on-checkbox': {
    cssVariable: '--color-on-checkbox',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  'color.on-destructive-action': {
    cssVariable: '--color-on-destructive-action',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  'color.on-navigation-selected': {
    cssVariable: '--color-on-navigation-selected',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  'color.on-primary-action': {
    cssVariable: '--color-on-primary-action',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  'color.on-secondary-action': {
    cssVariable: '--color-on-secondary-action',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.on-select-selected': {
    cssVariable: '--color-on-select-selected',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  'color.on-subtle-action': {
    cssVariable: '--color-on-subtle-action',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.on-toast': {
    cssVariable: '--color-on-toast',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  'color.on-tone': {
    cssVariable: '--color-on-tone',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#1e1f21',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  'color.outlined-focus': {
    cssVariable: '--color-outlined-focus',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#0053b5',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.pane': {
    cssVariable: '--color-pane',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#28292b',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.popup': {
    cssVariable: '--color-popup',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  'color.popup-border': {
    cssVariable: '--color-popup-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'color.primary-action': {
    cssVariable: '--color-primary-action',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.primary-action-hover': {
    cssVariable: '--color-primary-action-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  'color.primary-action-pressed': {
    cssVariable: '--color-primary-action-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.quiet-label-hover': {
    cssVariable: '--color-quiet-label-hover',
    type: 'color',
    values: {
      light: '#54575c',
      dark: '#ccced2',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.quiet-label-pressed': {
    cssVariable: '--color-quiet-label-pressed',
    type: 'color',
    values: {
      light: '#4b4d51',
      dark: '#dbdde1',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.radio': {
    cssVariable: '--color-radio',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.radio-detail': {
    cssVariable: '--color-radio-detail',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.radio-hover': {
    cssVariable: '--color-radio-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  'color.radio-pressed': {
    cssVariable: '--color-radio-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.radio-row': {
    cssVariable: '--color-radio-row',
    type: 'color',
    values: {
      light: '#f6f8fc',
      dark: '#343638',
      'light-high-contrast': '#f6f8fc',
      'dark-high-contrast': '#343638',
    },
  },
  'color.radio-row-hover': {
    cssVariable: '--color-radio-row-hover',
    type: 'color',
    values: {
      light: '#e8eaee',
      dark: '#424447',
      'light-high-contrast': '#e8eaee',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.radio-row-pressed': {
    cssVariable: '--color-radio-row-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#4b4d51',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#424447',
    },
  },
  'color.radio-text': {
    cssVariable: '--color-radio-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.row': {
    cssVariable: '--color-row',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#343638',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#343638',
    },
  },
  'color.row-alternate': {
    cssVariable: '--color-row-alternate',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.row-detail': {
    cssVariable: '--color-row-detail',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.row-hover': {
    cssVariable: '--color-row-hover',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.row-pressed': {
    cssVariable: '--color-row-pressed',
    type: 'color',
    values: {
      light: '#ccced2',
      dark: '#4b4d51',
      'light-high-contrast': '#dbdde1',
      'dark-high-contrast': '#424447',
    },
  },
  'color.row-selected-hover': {
    cssVariable: '--color-row-selected-hover',
    type: 'color',
    values: {
      light: '#cddefc',
      dark: '#424447',
      'light-high-contrast': '#d7e5fd',
      'dark-high-contrast': '#424447',
    },
  },
  'color.row-selected-pressed': {
    cssVariable: '--color-row-selected-pressed',
    type: 'color',
    values: {
      light: '#b5cffb',
      dark: '#4b4d51',
      'light-high-contrast': '#cddefc',
      'dark-high-contrast': '#424447',
    },
  },
  'color.row-text': {
    cssVariable: '--color-row-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.secondary-action': {
    cssVariable: '--color-secondary-action',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.secondary-action-hover': {
    cssVariable: '--color-secondary-action-hover',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.17)',
      dark: 'rgb(232 234 238 / 0.2)',
      'light-high-contrast': 'rgb(30 31 33 / 0.12)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.12)',
    },
  },
  'color.secondary-action-pressed': {
    cssVariable: '--color-secondary-action-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.29)',
      dark: 'rgb(232 234 238 / 0.28)',
      'light-high-contrast': 'rgb(30 31 33 / 0.18)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.15)',
    },
  },
  'color.select-option': {
    cssVariable: '--color-select-option',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  'color.select-option-hover': {
    cssVariable: '--color-select-option-hover',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#424447',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.select-option-pressed': {
    cssVariable: '--color-select-option-pressed',
    type: 'color',
    values: {
      light: '#e2e4e8',
      dark: '#4b4d51',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#424447',
    },
  },
  'color.select-option-text': {
    cssVariable: '--color-select-option-text',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.select-selected': {
    cssVariable: '--color-select-selected',
    type: 'color',
    values: {
      light: '#eaf2ff',
      dark: '#383a3d',
      'light-high-contrast': '#eaf2ff',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.select-selected-hover': {
    cssVariable: '--color-select-selected-hover',
    type: 'color',
    values: {
      light: '#cddefc',
      dark: '#424447',
      'light-high-contrast': '#d7e5fd',
      'dark-high-contrast': '#424447',
    },
  },
  'color.select-selected-pressed': {
    cssVariable: '--color-select-selected-pressed',
    type: 'color',
    values: {
      light: '#b5cffb',
      dark: '#4b4d51',
      'light-high-contrast': '#cddefc',
      'dark-high-contrast': '#424447',
    },
  },
  'color.skeleton-base': {
    cssVariable: '--color-skeleton-base',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.skeleton-highlight': {
    cssVariable: '--color-skeleton-highlight',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.17)',
      dark: 'rgb(232 234 238 / 0.2)',
      'light-high-contrast': 'rgb(30 31 33 / 0.12)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.12)',
    },
  },
  'color.state-layer': {
    cssVariable: '--color-state-layer',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.state-layer-hover': {
    cssVariable: '--color-state-layer-hover',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.08)',
      dark: 'rgb(232 234 238 / 0.08)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.06)',
    },
  },
  'color.state-layer-pressed': {
    cssVariable: '--color-state-layer-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.1)',
      dark: 'rgb(232 234 238 / 0.1)',
      'light-high-contrast': 'rgb(30 31 33 / 0.08)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.subtle-action': {
    cssVariable: '--color-subtle-action',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.subtle-action-border': {
    cssVariable: '--color-subtle-action-border',
    type: 'color',
    values: {
      light: '#7d8185',
      dark: '#898c91',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'color.subtle-action-border-hover': {
    cssVariable: '--color-subtle-action-border-hover',
    type: 'color',
    values: {
      light: '#72767b',
      dark: '#95989c',
      'light-high-contrast': '#5d6166',
      'dark-high-contrast': '#afb1b6',
    },
  },
  'color.subtle-action-border-pressed': {
    cssVariable: '--color-subtle-action-border-pressed',
    type: 'color',
    values: {
      light: '#686b70',
      dark: '#a1a4a9',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  'color.subtle-action-hover': {
    cssVariable: '--color-subtle-action-hover',
    type: 'color',
    values: {
      light: '#e8eaee',
      dark: '#383a3d',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#303234',
    },
  },
  'color.subtle-action-pressed': {
    cssVariable: '--color-subtle-action-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  'color.surface': {
    cssVariable: '--color-surface',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#28292b',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#28292b',
    },
  },
  'color.surface-muted': {
    cssVariable: '--color-surface-muted',
    type: 'color',
    values: {
      light: '#f6f8fc',
      dark: '#343638',
      'light-high-contrast': '#f6f8fc',
      'dark-high-contrast': '#343638',
    },
  },
  'color.switch-off': {
    cssVariable: '--color-switch-off',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.06)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  'color.switch-off-hover': {
    cssVariable: '--color-switch-off-hover',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.17)',
      dark: 'rgb(232 234 238 / 0.2)',
      'light-high-contrast': 'rgb(30 31 33 / 0.12)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.12)',
    },
  },
  'color.switch-off-pressed': {
    cssVariable: '--color-switch-off-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.29)',
      dark: 'rgb(232 234 238 / 0.28)',
      'light-high-contrast': 'rgb(30 31 33 / 0.18)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.15)',
    },
  },
  'color.switch-on': {
    cssVariable: '--color-switch-on',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#4b8bec',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  'color.switch-on-hover': {
    cssVariable: '--color-switch-on-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#347eea',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  'color.switch-on-pressed': {
    cssVariable: '--color-switch-on-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#1872e7',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.switch-text': {
    cssVariable: '--color-switch-text',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.switch-thumb': {
    cssVariable: '--color-switch-thumb',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.switch-thumb-on': {
    cssVariable: '--color-switch-thumb-on',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#121315',
    },
  },
  'color.text-muted': {
    cssVariable: '--color-text-muted',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.text-primary': {
    cssVariable: '--color-text-primary',
    type: 'color',
    values: {
      light: '#1e1f21',
      dark: '#e8eaee',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  'color.text-quiet': {
    cssVariable: '--color-text-quiet',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.text-strong': {
    cssVariable: '--color-text-strong',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#e8eaee',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  'color.toast-error': {
    cssVariable: '--color-toast-error',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#b72b20',
      'light-high-contrast': '#8d0200',
      'dark-high-contrast': '#8d0200',
    },
  },
  'color.toast-info': {
    cssVariable: '--color-toast-info',
    type: 'color',
    values: {
      light: '#2c61a6',
      dark: '#2c61a6',
      'light-high-contrast': '#094285',
      'dark-high-contrast': '#094285',
    },
  },
  'color.toast-neutral': {
    cssVariable: '--color-toast-neutral',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#424447',
      'light-high-contrast': '#424447',
      'dark-high-contrast': '#424447',
    },
  },
  'color.toast-success': {
    cssVariable: '--color-toast-success',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#176f35',
      'light-high-contrast': '#004f1f',
      'dark-high-contrast': '#004f1f',
    },
  },
  'color.tone.accent': {
    cssVariable: '--color-tone-accent',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  'color.tone.danger': {
    cssVariable: '--color-tone-danger',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  'color.tone.done': {
    cssVariable: '--color-tone-done',
    type: 'color',
    values: {
      light: '#7a3fc8',
      dark: '#d2b2f7',
      'light-high-contrast': '#53009a',
      'dark-high-contrast': '#f1e6ff',
    },
  },
  'color.tone.neutral': {
    cssVariable: '--color-tone-neutral',
    type: 'color',
    values: {
      light: '#5d6166',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  'color.tone.success': {
    cssVariable: '--color-tone-success',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#7ad197',
      'light-high-contrast': '#00441a',
      'dark-high-contrast': '#a5fdc1',
    },
  },
  'color.tone.warning': {
    cssVariable: '--color-tone-warning',
    type: 'color',
    values: {
      light: '#8a5504',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffe8be',
    },
  },
  'color.white': {
    cssVariable: '--color-white',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  'control.font-size': {
    cssVariable: '--control-font-size',
    type: 'dimension',
    values: {
      light: '0.9375rem',
      dark: '0.9375rem',
      'light-high-contrast': '0.9375rem',
      'dark-high-contrast': '0.9375rem',
    },
  },
  'control.height': {
    cssVariable: '--control-height',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  'control.height-compact': {
    cssVariable: '--control-height-compact',
    type: 'dimension',
    values: {
      light: '2rem',
      dark: '2rem',
      'light-high-contrast': '2rem',
      'dark-high-contrast': '2rem',
    },
  },
  'control.height-small': {
    cssVariable: '--control-height-small',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  'control.height-touch': {
    cssVariable: '--control-height-touch',
    type: 'dimension',
    values: {
      light: '2.75rem',
      dark: '2.75rem',
      'light-high-contrast': '2.75rem',
      'dark-high-contrast': '2.75rem',
    },
  },
  'control.icon-size': {
    cssVariable: '--control-icon-size',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  'elevation.0.border': {
    cssVariable: '--elevation-0-border',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  'elevation.0.shadow': {
    cssVariable: '--elevation-0-shadow',
    type: 'shadow',
    values: {
      light: '0 0 0 0 transparent',
      dark: '0 0 0 0 transparent',
      'light-high-contrast': '0 0 0 0 transparent',
      'dark-high-contrast': '0 0 0 0 transparent',
    },
  },
  'elevation.1.border': {
    cssVariable: '--elevation-1-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.1.shadow': {
    cssVariable: '--elevation-1-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 1px 3px 1px rgb(66 68 71 / 0.15)',
      dark: '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 1px 3px 1px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 1px 3px 1px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 1px 3px 1px rgb(0 0 0 / 0.3)',
    },
  },
  'elevation.2.border': {
    cssVariable: '--elevation-2-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.2.shadow': {
    cssVariable: '--elevation-2-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 2px 6px 2px rgb(66 68 71 / 0.15)',
      dark: '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 2px 6px 2px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 2px 6px 2px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 2px 6px 2px rgb(0 0 0 / 0.3)',
    },
  },
  'elevation.3.border': {
    cssVariable: '--elevation-3-border',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.3.shadow': {
    cssVariable: '--elevation-3-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 3px 0 rgb(66 68 71 / 0.3), 0 4px 8px 3px rgb(66 68 71 / 0.15)',
      dark: '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 4px 8px 3px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 3px 0 rgb(66 68 71 / 0.3), 0 4px 8px 3px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 4px 8px 3px rgb(0 0 0 / 0.3)',
    },
  },
  'font.family': {
    cssVariable: '--font-family',
    type: 'fontFamily',
    values: {
      light: "'envUI Inter', sans-serif",
      dark: "'envUI Inter', sans-serif",
      'light-high-contrast': "'envUI Inter', sans-serif",
      'dark-high-contrast': "'envUI Inter', sans-serif",
    },
  },
  'font.size.body': {
    cssVariable: '--font-size-body',
    type: 'dimension',
    values: {
      light: '0.9375rem',
      dark: '0.9375rem',
      'light-high-contrast': '0.9375rem',
      'dark-high-contrast': '0.9375rem',
    },
  },
  'font.size.body-small': {
    cssVariable: '--font-size-body-small',
    type: 'dimension',
    values: {
      light: '0.875rem',
      dark: '0.875rem',
      'light-high-contrast': '0.875rem',
      'dark-high-contrast': '0.875rem',
    },
  },
  'font.size.heading': {
    cssVariable: '--font-size-heading',
    type: 'dimension',
    values: {
      light: '1.125rem',
      dark: '1.125rem',
      'light-high-contrast': '1.125rem',
      'dark-high-contrast': '1.125rem',
    },
  },
  'font.size.heading-small': {
    cssVariable: '--font-size-heading-small',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  'icon-button.size': {
    cssVariable: '--icon-button-size',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  'md.sys.shape.corner.extra-large': {
    cssVariable: '--md-sys-shape-corner-extra-large',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  'md.sys.shape.corner.extra-small': {
    cssVariable: '--md-sys-shape-corner-extra-small',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
  },
  'md.sys.shape.corner.large': {
    cssVariable: '--md-sys-shape-corner-large',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  'md.sys.shape.corner.medium': {
    cssVariable: '--md-sys-shape-corner-medium',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
  },
  'md.sys.shape.corner.none': {
    cssVariable: '--md-sys-shape-corner-none',
    type: 'dimension',
    values: { light: '0', dark: '0', 'light-high-contrast': '0', 'dark-high-contrast': '0' },
  },
  'md.sys.shape.corner.small': {
    cssVariable: '--md-sys-shape-corner-small',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
  },
  'motion.duration.fast': {
    cssVariable: '--motion-duration-fast',
    type: 'duration',
    values: {
      light: '0.12s',
      dark: '0.12s',
      'light-high-contrast': '0.12s',
      'dark-high-contrast': '0.12s',
    },
  },
  'motion.duration.medium': {
    cssVariable: '--motion-duration-medium',
    type: 'duration',
    values: {
      light: '0.16s',
      dark: '0.16s',
      'light-high-contrast': '0.16s',
      'dark-high-contrast': '0.16s',
    },
  },
  'motion.duration.slow': {
    cssVariable: '--motion-duration-slow',
    type: 'duration',
    values: {
      light: '0.24s',
      dark: '0.24s',
      'light-high-contrast': '0.24s',
      'dark-high-contrast': '0.24s',
    },
  },
  'motion.ease': {
    cssVariable: '--motion-ease',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.45, 0, 0.2, 1)',
      dark: 'cubic-bezier(0.45, 0, 0.2, 1)',
      'light-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
      'dark-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
    },
  },
  /** Elements entering decelerate into place. */
  'motion.ease-enter': {
    cssVariable: '--motion-ease-enter',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      dark: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      'light-high-contrast': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
      'dark-high-contrast': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    },
  },
  /** Leaving elements accelerate away. */
  'motion.ease-exit': {
    cssVariable: '--motion-ease-exit',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      dark: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      'light-high-contrast': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      'dark-high-contrast': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    },
  },
  'motion.ease-standard': {
    cssVariable: '--motion-ease-standard',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.45, 0, 0.2, 1)',
      dark: 'cubic-bezier(0.45, 0, 0.2, 1)',
      'light-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
      'dark-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
    },
  },
  'radius.row-inner': {
    cssVariable: '--radius-row-inner',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
  },
  'radius.row-outer': {
    cssVariable: '--radius-row-outer',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  'radius.row-single': {
    cssVariable: '--radius-row-single',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  'radius.standard': {
    cssVariable: '--radius-standard',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
  },
  'radius.surface': {
    cssVariable: '--radius-surface',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  /** Text in rows keeps clear of the large outer corners, whether a row stands alone or is connected. */
  'row.padding-inline': {
    cssVariable: '--row-padding-inline',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
  },
  'space.1': {
    cssVariable: '--space-1',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
  },
  'space.2': {
    cssVariable: '--space-2',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
  },
  'space.3': {
    cssVariable: '--space-3',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
  },
  'space.4': {
    cssVariable: '--space-4',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  'space.5': {
    cssVariable: '--space-5',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
  },
  'space.6': {
    cssVariable: '--space-6',
    type: 'dimension',
    values: {
      light: '2rem',
      dark: '2rem',
      'light-high-contrast': '2rem',
      'dark-high-contrast': '2rem',
    },
  },
  'space.7': {
    cssVariable: '--space-7',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  'space.8': {
    cssVariable: '--space-8',
    type: 'dimension',
    values: {
      light: '3rem',
      dark: '3rem',
      'light-high-contrast': '3rem',
      'dark-high-contrast': '3rem',
    },
  },
  'space.9': {
    cssVariable: '--space-9',
    type: 'dimension',
    values: {
      light: '4rem',
      dark: '4rem',
      'light-high-contrast': '4rem',
      'dark-high-contrast': '4rem',
    },
  },
  /** The opacity of the scrim (color.bg.overlay) behind a dialog. */
  'state.dialog-overlay-opacity': {
    cssVariable: '--state-dialog-overlay-opacity',
    type: 'number',
    values: {
      light: '0.55',
      dark: '0.55',
      'light-high-contrast': '0.55',
      'dark-high-contrast': '0.55',
    },
  },
  'state.disabled-opacity': {
    cssVariable: '--state-disabled-opacity',
    type: 'number',
    values: {
      light: '0.48',
      dark: '0.48',
      'light-high-contrast': '0.48',
      'dark-high-contrast': '0.48',
    },
  },
  /** The weight of the text color in the fill of an avatar group’s overflow count, which mixes it into the surrounding ring color. */
  'state.fill-opacity': {
    cssVariable: '--state-fill-opacity',
    type: 'number',
    values: {
      light: '6%',
      dark: '12.5%',
      'light-high-contrast': '6%',
      'dark-high-contrast': '12.5%',
    },
  },
  /** A window title bar drawn by the application, which keeps compact controls. */
  'title-bar.height': {
    cssVariable: '--title-bar-height',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  'topbar.height': {
    cssVariable: '--topbar-height',
    type: 'dimension',
    values: {
      light: '3.25rem',
      dark: '3.25rem',
      'light-high-contrast': '3.25rem',
      'dark-high-contrast': '3.25rem',
    },
  },
} as const satisfies Record<string, TokenDefinition>;

export type TokenId = keyof typeof tokens;
export type TokenCssVariable = (typeof tokens)[TokenId]['cssVariable'];
