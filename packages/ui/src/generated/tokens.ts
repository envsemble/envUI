// Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.
// Internal for now: the package neither exports nor ships it yet.

/** The themes Tokens.css builds: each color scheme at standard and high contrast. */
export const themes = ['light', 'dark', 'light-high-contrast', 'dark-high-contrast'] as const;
export type ThemeName = (typeof themes)[number];

/** The app scales: comfortable, the base values, and compact. */
export const scales = ['comfortable', 'compact'] as const;
export type ScaleName = (typeof scales)[number];

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
  /** The value under each scale that changes the token, such as compact; comfortable is values. */
  scales?: Readonly<Partial<Record<ScaleName, TokenValue>>>;
}

/** Every token, by its DTCG path. */
export const tokens = {
  /** The app frame's header bar, a single row that holds controls of the control height with space around them; sticky content and the sidebar headers line up with it. */
  'app-shell.header-height': {
    cssVariable: '--env-app-shell-header-height',
    type: 'dimension',
    values: {
      light: '3.25rem',
      dark: '3.25rem',
      'light-high-contrast': '3.25rem',
      'dark-high-contrast': '3.25rem',
    },
    scales: { compact: '2.625rem' },
  },
  'body.font-weight': {
    cssVariable: '--env-body-font-weight',
    type: 'fontWeight',
    values: {
      light: '400',
      dark: '400',
      'light-high-contrast': '400',
      'dark-high-contrast': '400',
    },
  },
  /** The blue fill, one of the hues an avatar takes from its name, and the fill of an avatar with hue="blue". */
  'color.avatar.bg': {
    cssVariable: '--env-color-avatar-bg',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#005cc8',
      'light-high-contrast': '#004aa2',
      'dark-high-contrast': '#004aa2',
    },
  },
  /** The amber fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.amber': {
    cssVariable: '--env-color-avatar-bg-amber',
    type: 'color',
    values: {
      light: '#8a5504',
      dark: '#8a5504',
      'light-high-contrast': '#704300',
      'dark-high-contrast': '#704300',
    },
  },
  /** The green fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.green': {
    cssVariable: '--env-color-avatar-bg-green',
    type: 'color',
    values: {
      light: '#176f35',
      dark: '#176f35',
      'light-high-contrast': '#005a25',
      'dark-high-contrast': '#005a25',
    },
  },
  /** The purple fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.purple': {
    cssVariable: '--env-color-avatar-bg-purple',
    type: 'color',
    values: {
      light: '#8e3caa',
      dark: '#8e3caa',
      'light-high-contrast': '#782594',
      'dark-high-contrast': '#782594',
    },
  },
  /** The red fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.red': {
    cssVariable: '--env-color-avatar-bg-red',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#b72b20',
      'light-high-contrast': '#9f0300',
      'dark-high-contrast': '#9f0300',
    },
  },
  /** The slate fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.slate': {
    cssVariable: '--env-color-avatar-bg-slate',
    type: 'color',
    values: {
      light: '#4e627e',
      dark: '#4e627e',
      'light-high-contrast': '#3c4e69',
      'dark-high-contrast': '#3c4e69',
    },
  },
  /** The teal fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.teal': {
    cssVariable: '--env-color-avatar-bg-teal',
    type: 'color',
    values: {
      light: '#236d52',
      dark: '#236d52',
      'light-high-contrast': '#03593f',
      'dark-high-contrast': '#03593f',
    },
  },
  /** The violet fill, one of the hues an avatar takes from its name. */
  'color.avatar.bg.violet': {
    cssVariable: '--env-color-avatar-bg-violet',
    type: 'color',
    values: {
      light: '#7a3fc8',
      dark: '#7a3fc8',
      'light-high-contrast': '#6725b4',
      'dark-high-contrast': '#6725b4',
    },
  },
  /** The initials of an avatar, at least 4.5:1 on every fill, and 7:1 at high contrast. */
  'color.avatar.fg': {
    cssVariable: '--env-color-avatar-fg',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  /** The default figure of an avatar without an image, on any of its fills. */
  'color.avatar.figure': {
    cssVariable: '--env-color-avatar-figure',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#ffffff',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#ffffff',
    },
  },
  /** A solid accent fill, such as a solid accent badge; paired with fg.on-emphasis. */
  'color.bg.accent.emphasis': {
    cssVariable: '--env-color-bg-accent-emphasis',
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
    cssVariable: '--env-color-bg-accent-muted',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.12)',
      dark: 'rgb(159 193 248 / 0.14)',
      'light-high-contrast': 'rgb(0 55 124 / 0.08)',
      'dark-high-contrast': 'rgb(205 222 252 / 0.1)',
    },
  },
  /** Controls in the accent tone without a fill at rest, such as an alert’s dismiss button: transparent, as color.bg.neutral.subtle is. */
  'color.bg.accent.subtle': {
    cssVariable: '--env-color-bg-accent-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer of a control without a fill in the accent tone, such as an info alert’s dismiss button, under the pointer: the accent text color at 14%, in every theme and at high contrast. */
  'color.bg.accent.subtle.hover': {
    cssVariable: '--env-color-bg-accent-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.14)',
      dark: 'rgb(159 193 248 / 0.14)',
      'light-high-contrast': 'rgb(0 55 124 / 0.14)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.14)',
    },
  },
  /** The accent state layer while pressed: the accent text color at 22%. */
  'color.bg.accent.subtle.pressed': {
    cssVariable: '--env-color-bg-accent-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.22)',
      dark: 'rgb(159 193 248 / 0.22)',
      'light-high-contrast': 'rgb(0 55 124 / 0.22)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.22)',
    },
  },
  /** The brand fill of primary actions, chosen radios and the chosen calendar day; paired with fg.on-emphasis. In dark and at high contrast, checked checkboxes, switches that are on, sliders, meters and spinners take it too: a soft blue with dark marks at 4.5:1. */
  'color.bg.brand.emphasis': {
    cssVariable: '--env-color-bg-brand-emphasis',
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
    cssVariable: '--env-color-bg-brand-emphasis-hover',
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
    cssVariable: '--env-color-bg-brand-emphasis-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The translucent halo of a slider thumb that is dragged: the blue of the thumb at 16%, in every theme and at high contrast. */
  'color.bg.brand.muted': {
    cssVariable: '--env-color-bg-brand-muted',
    type: 'color',
    values: {
      light: 'rgb(24 114 231 / 0.16)',
      dark: 'rgb(159 193 248 / 0.16)',
      'light-high-contrast': 'rgb(0 64 143 / 0.16)',
      'dark-high-contrast': 'rgb(181 207 251 / 0.16)',
    },
  },
  /** The saturated brand fill of checked checkboxes, switches that are on, sliders, meters and spinners in the light theme at standard contrast, with white marks, the check and the thumb, at 3:1. The dark theme and high contrast put those controls on the emphasis fill instead; in dark this fill, which keeps 3:1 against the surfaces, would put white text below 4.5:1. */
  'color.bg.brand.strong': {
    cssVariable: '--env-color-bg-brand-strong',
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
    cssVariable: '--env-color-bg-brand-strong-hover',
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
    cssVariable: '--env-color-bg-brand-strong-pressed',
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
    cssVariable: '--env-color-bg-danger-emphasis',
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
    cssVariable: '--env-color-bg-danger-muted',
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
    cssVariable: '--env-color-bg-danger-strong',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#b72b20',
      'light-high-contrast': '#8d0200',
      'dark-high-contrast': '#8d0200',
    },
  },
  /** A destructive action under the pointer: lighter, as in 0.7, at the lightest grade that keeps white labels at 4.5:1. */
  'color.bg.danger.strong.hover': {
    cssVariable: '--env-color-bg-danger-strong-hover',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#c64e43',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#7a0200',
    },
  },
  /** A destructive action while pressed. It can’t lighten further without its white label falling below 4.5:1, so it settles halfway back. */
  'color.bg.danger.strong.pressed': {
    cssVariable: '--env-color-bg-danger-strong-pressed',
    type: 'color',
    values: {
      light: '#bf3e33',
      dark: '#bf3e33',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#6b0100',
    },
  },
  /** Controls in the danger tone without a fill at rest, such as an alert’s dismiss button: transparent, as color.bg.neutral.subtle is. */
  'color.bg.danger.subtle': {
    cssVariable: '--env-color-bg-danger-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer of a control without a fill in the danger tone, such as an error alert’s dismiss button, under the pointer: the danger text color at 14%, in every theme and at high contrast. */
  'color.bg.danger.subtle.hover': {
    cssVariable: '--env-color-bg-danger-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.14)',
      dark: 'rgb(248 172 166 / 0.14)',
      'light-high-contrast': 'rgb(122 2 0 / 0.14)',
      'dark-high-contrast': 'rgb(255 228 226 / 0.14)',
    },
  },
  /** The danger state layer while pressed: the danger text color at 22%. */
  'color.bg.danger.subtle.pressed': {
    cssVariable: '--env-color-bg-danger-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.22)',
      dark: 'rgb(248 172 166 / 0.22)',
      'light-high-contrast': 'rgb(122 2 0 / 0.22)',
      'dark-high-contrast': 'rgb(255 228 226 / 0.22)',
    },
  },
  /** The default surface: Surface, sidebars, standard menus. */
  'color.bg.default': {
    cssVariable: '--env-color-bg-default',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#28292b',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive default surface, such as a card or a list row, under the pointer. */
  'color.bg.default.hover': {
    cssVariable: '--env-color-bg-default-hover',
    type: 'color',
    values: {
      light: '#e2e4e8',
      dark: '#383a3d',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#303234',
    },
  },
  /** An interactive default surface while pressed. Muted text and an inset focus ring keep their minimums on it. */
  'color.bg.default.pressed': {
    cssVariable: '--env-color-bg-default-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#dbdde1',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A solid done fill; paired with fg.on-emphasis. */
  'color.bg.done.emphasis': {
    cssVariable: '--env-color-bg-done-emphasis',
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
    cssVariable: '--env-color-bg-done-muted',
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
    cssVariable: '--env-color-bg-field',
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
    cssVariable: '--env-color-bg-important-strong',
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
    cssVariable: '--env-color-bg-important-strong-hover',
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
    cssVariable: '--env-color-bg-important-strong-pressed',
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
    cssVariable: '--env-color-bg-info-strong',
    type: 'color',
    values: {
      light: '#2c61a6',
      dark: '#2c61a6',
      'light-high-contrast': '#094285',
      'dark-high-contrast': '#094285',
    },
  },
  /** A control on the information toast under the pointer. Its white label keeps 4.5:1. */
  'color.bg.info.strong.hover': {
    cssVariable: '--env-color-bg-info-strong-hover',
    type: 'color',
    values: {
      light: '#376cb2',
      dark: '#376cb2',
      'light-high-contrast': '#003878',
      'dark-high-contrast': '#003878',
    },
  },
  /** A control on the information toast while pressed. Its white label keeps 4.5:1. */
  'color.bg.info.strong.pressed': {
    cssVariable: '--env-color-bg-info-strong-pressed',
    type: 'color',
    values: {
      light: '#4177be',
      dark: '#4177be',
      'light-high-contrast': '#003068',
      'dark-high-contrast': '#003068',
    },
  },
  /** The page color at half strength, which leans a pill on a button’s fill back toward the page instead of adding another fill, as a diff stat in a tab does. */
  'color.bg.inset': {
    cssVariable: '--env-color-bg-inset',
    type: 'color',
    values: {
      light: 'rgb(255 255 255 / 0.5)',
      dark: 'rgb(30 31 33 / 0.5)',
      'light-high-contrast': 'rgb(255 255 255 / 0.5)',
      'dark-high-contrast': 'rgb(30 31 33 / 0.5)',
    },
  },
  /** The muted surface: Surface background="muted", radio rows. Lighter than the default surface in both themes. */
  'color.bg.muted': {
    cssVariable: '--env-color-bg-muted',
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
    cssVariable: '--env-color-bg-muted-hover',
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
    cssVariable: '--env-color-bg-muted-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#4b4d51',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#424447',
    },
  },
  /** A navigation item that isn’t selected, under the pointer: a blue-gray tint in light, deeper than the selection so it doesn’t read as selected; in dark and at high contrast, a gray, since a blue tint there would read as the selection. */
  'color.bg.navigation.hover': {
    cssVariable: '--env-color-bg-navigation-hover',
    type: 'color',
    values: {
      light: '#cbd8ea',
      dark: '#424447',
      'light-high-contrast': '#d2d4d8',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A navigation item that isn’t selected, while pressed. Its label and an inset focus ring keep their minimums on it, which puts it one grade deeper than the hover in light. */
  'color.bg.navigation.pressed': {
    cssVariable: '--env-color-bg-navigation-pressed',
    type: 'color',
    values: {
      light: '#c7d5e8',
      dark: '#4b4d51',
      'light-high-contrast': '#ccced2',
      'dark-high-contrast': '#424447',
    },
  },
  /** A solid neutral fill, such as a solid neutral badge; paired with fg.on-emphasis. */
  'color.bg.neutral.emphasis': {
    cssVariable: '--env-color-bg-neutral-emphasis',
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
    cssVariable: '--env-color-bg-neutral-muted',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.09)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(30 31 33 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The neutral fill under the pointer. */
  'color.bg.neutral.muted.hover': {
    cssVariable: '--env-color-bg-neutral-muted-hover',
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
    cssVariable: '--env-color-bg-neutral-muted-pressed',
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
    cssVariable: '--env-color-bg-neutral-strong',
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
    cssVariable: '--env-color-bg-neutral-strong-hover',
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
    cssVariable: '--env-color-bg-neutral-strong-pressed',
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
    cssVariable: '--env-color-bg-neutral-subtle',
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
    cssVariable: '--env-color-bg-neutral-subtle-hover',
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
    cssVariable: '--env-color-bg-neutral-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.1)',
      dark: 'rgb(232 234 238 / 0.1)',
      'light-high-contrast': 'rgb(30 31 33 / 0.08)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The scrim behind dialogs and the command palette: the dark page color at 55%. */
  'color.bg.overlay': {
    cssVariable: '--env-color-bg-overlay',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.55)',
      dark: 'rgb(30 31 33 / 0.55)',
      'light-high-contrast': 'rgb(30 31 33 / 0.55)',
      'dark-high-contrast': 'rgb(30 31 33 / 0.55)',
    },
  },
  /** The lighter scrim behind a drawer, such as the app shell’s sidebar over a narrow window: the dark page color at 30%. */
  'color.bg.overlay.muted': {
    cssVariable: '--env-color-bg-overlay-muted',
    type: 'color',
    values: {
      light: 'rgb(30 31 33 / 0.3)',
      dark: 'rgb(30 31 33 / 0.3)',
      'light-high-contrast': 'rgb(30 31 33 / 0.3)',
      'dark-high-contrast': 'rgb(30 31 33 / 0.3)',
    },
  },
  /** The page behind all content: the app frame, title bars and Surface background="page". */
  'color.bg.page': {
    cssVariable: '--env-color-bg-page',
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
    cssVariable: '--env-color-bg-page-hover',
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
    cssVariable: '--env-color-bg-page-pressed',
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
    cssVariable: '--env-color-bg-popup',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#303234',
    },
  },
  /** A highlighted row in a popup. */
  'color.bg.popup.hover': {
    cssVariable: '--env-color-bg-popup-hover',
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
    cssVariable: '--env-color-bg-popup-pressed',
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
    cssVariable: '--env-color-bg-raised',
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
    cssVariable: '--env-color-bg-raised-hover',
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
    cssVariable: '--env-color-bg-raised-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** Selected navigation items, tree and table rows, Select options and drop targets; paired with fg.on-selected. A blue tint in light and a blue-gray in dark, distinct from the other items around it, at rest and under the pointer: ΔEOK 0.03 or more, 0.04 at high contrast. */
  'color.bg.selected': {
    cssVariable: '--env-color-bg-selected',
    type: 'color',
    values: {
      light: '#dbe8fd',
      dark: '#293a55',
      'light-high-contrast': '#c8dbfc',
      'dark-high-contrast': '#1d2e47',
    },
  },
  /** A selected item under the pointer: visibly deeper than the selection, and distinct from an unselected item under the pointer. */
  'color.bg.selected.hover': {
    cssVariable: '--env-color-bg-selected-hover',
    type: 'color',
    values: {
      light: '#d2e1fc',
      dark: '#33445f',
      'light-high-contrast': '#bfd5fb',
      'dark-high-contrast': '#253650',
    },
  },
  /** A selected item while pressed. Muted text and an inset focus ring keep their minimums on it. */
  'color.bg.selected.pressed': {
    cssVariable: '--env-color-bg-selected-pressed',
    type: 'color',
    values: {
      light: '#cddefc',
      dark: '#3c4e69',
      'light-high-contrast': '#bad2fb',
      'dark-high-contrast': '#293a55',
    },
  },
  /** A solid success fill; paired with fg.on-emphasis. */
  'color.bg.success.emphasis': {
    cssVariable: '--env-color-bg-success-emphasis',
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
    cssVariable: '--env-color-bg-success-muted',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.12)',
      dark: 'rgb(122 209 151 / 0.14)',
      'light-high-contrast': 'rgb(0 68 26 / 0.08)',
      'dark-high-contrast': 'rgb(152 240 181 / 0.1)',
    },
  },
  /** The teal success fill of toasts in both themes; paired with fg.on-strong. */
  'color.bg.success.strong': {
    cssVariable: '--env-color-bg-success-strong',
    type: 'color',
    values: {
      light: '#236d52',
      dark: '#236d52',
      'light-high-contrast': '#004e37',
      'dark-high-contrast': '#004e37',
    },
  },
  /** A control on the success toast, its dismiss button, under the pointer. Its white label keeps 4.5:1. */
  'color.bg.success.strong.hover': {
    cssVariable: '--env-color-bg-success-strong-hover',
    type: 'color',
    values: {
      light: '#2f775c',
      dark: '#2f775c',
      'light-high-contrast': '#00432e',
      'dark-high-contrast': '#00432e',
    },
  },
  /** A control on the success toast while pressed. Its white label keeps 4.5:1. */
  'color.bg.success.strong.pressed': {
    cssVariable: '--env-color-bg-success-strong-pressed',
    type: 'color',
    values: {
      light: '#3b8266',
      dark: '#3b8266',
      'light-high-contrast': '#003a28',
      'dark-high-contrast': '#003a28',
    },
  },
  /** Controls in the success tone without a fill at rest, such as an alert’s dismiss button: transparent, as color.bg.neutral.subtle is. */
  'color.bg.success.subtle': {
    cssVariable: '--env-color-bg-success-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer of a control without a fill in the success tone, such as a success alert’s dismiss button, under the pointer: the success text color at 14%, in every theme and at high contrast. */
  'color.bg.success.subtle.hover': {
    cssVariable: '--env-color-bg-success-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.14)',
      dark: 'rgb(122 209 151 / 0.14)',
      'light-high-contrast': 'rgb(0 68 26 / 0.14)',
      'dark-high-contrast': 'rgb(165 253 193 / 0.14)',
    },
  },
  /** The success state layer while pressed: the success text color at 22%. */
  'color.bg.success.subtle.pressed': {
    cssVariable: '--env-color-bg-success-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.22)',
      dark: 'rgb(122 209 151 / 0.22)',
      'light-high-contrast': 'rgb(0 68 26 / 0.22)',
      'dark-high-contrast': 'rgb(165 253 193 / 0.22)',
    },
  },
  /** A solid warning fill; paired with fg.on-emphasis. */
  'color.bg.warning.emphasis': {
    cssVariable: '--env-color-bg-warning-emphasis',
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
    cssVariable: '--env-color-bg-warning-muted',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.12)',
      dark: 'rgb(235 183 80 / 0.14)',
      'light-high-contrast': 'rgb(85 50 0 / 0.08)',
      'dark-high-contrast': 'rgb(255 216 144 / 0.1)',
    },
  },
  /** Controls in the warning tone without a fill at rest, such as an alert’s dismiss button: transparent, as color.bg.neutral.subtle is. */
  'color.bg.warning.subtle': {
    cssVariable: '--env-color-bg-warning-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer of a control without a fill in the warning tone, such as a warning alert’s dismiss button, under the pointer: the warning text color at 14%, in every theme and at high contrast. */
  'color.bg.warning.subtle.hover': {
    cssVariable: '--env-color-bg-warning-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.14)',
      dark: 'rgb(235 183 80 / 0.14)',
      'light-high-contrast': 'rgb(85 50 0 / 0.14)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.14)',
    },
  },
  /** The warning state layer while pressed: the warning text color at 22%. */
  'color.bg.warning.subtle.pressed': {
    cssVariable: '--env-color-bg-warning-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.22)',
      dark: 'rgb(235 183 80 / 0.22)',
      'light-high-contrast': 'rgb(85 50 0 / 0.22)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.22)',
    },
  },
  /** A decorative edge in the accent tone, around an outlined badge: the accent text color at 55%, in every theme and at high contrast. */
  'color.border.accent': {
    cssVariable: '--env-color-border-accent',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.55)',
      dark: 'rgb(159 193 248 / 0.55)',
      'light-high-contrast': 'rgb(0 55 124 / 0.55)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.55)',
    },
  },
  /** The active border and label of a focused field, and today’s ring in a calendar. */
  'color.border.accent.emphasis': {
    cssVariable: '--env-color-border-accent-emphasis',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** An active field border under the pointer. */
  'color.border.accent.emphasis.hover': {
    cssVariable: '--env-color-border-accent-emphasis-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** An active field border while pressed. */
  'color.border.accent.emphasis.pressed': {
    cssVariable: '--env-color-border-accent-emphasis-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The faint edge of an info alert: the accent text color at 28%, in every theme and at high contrast. */
  'color.border.accent.muted': {
    cssVariable: '--env-color-border-accent-muted',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.28)',
      dark: 'rgb(159 193 248 / 0.28)',
      'light-high-contrast': 'rgb(0 55 124 / 0.28)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.28)',
    },
  },
  /** A decorative edge in the danger tone, around an outlined badge and a message that failed to send: the danger text color at 55%, in every theme and at high contrast. */
  'color.border.danger': {
    cssVariable: '--env-color-border-danger',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.55)',
      dark: 'rgb(248 172 166 / 0.55)',
      'light-high-contrast': 'rgb(122 2 0 / 0.55)',
      'dark-high-contrast': 'rgb(255 228 226 / 0.55)',
    },
  },
  /** The border of an invalid field. */
  'color.border.danger.emphasis': {
    cssVariable: '--env-color-border-danger-emphasis',
    type: 'color',
    values: {
      light: '#b72b20',
      dark: '#f8aca6',
      'light-high-contrast': '#7a0200',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  /** An invalid field border under the pointer. */
  'color.border.danger.emphasis.hover': {
    cssVariable: '--env-color-border-danger-emphasis-hover',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#e68c84',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#ffedeb',
    },
  },
  /** An invalid field border while pressed. */
  'color.border.danger.emphasis.pressed': {
    cssVariable: '--env-color-border-danger-emphasis-pressed',
    type: 'color',
    values: {
      light: '#d66d63',
      dark: '#d66d63',
      'light-high-contrast': '#5a0100',
      'dark-high-contrast': '#fff6f5',
    },
  },
  /** The faint edge of an error alert: the danger text color at 28%, in every theme and at high contrast. */
  'color.border.danger.muted': {
    cssVariable: '--env-color-border-danger-muted',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.28)',
      dark: 'rgb(248 172 166 / 0.28)',
      'light-high-contrast': 'rgb(122 2 0 / 0.28)',
      'dark-high-contrast': 'rgb(255 228 226 / 0.28)',
    },
  },
  /** The edge of the strong danger fill where it floats, on error toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge of elevation 2: color.border.muted, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.danger.strong': {
    cssVariable: '--env-color-border-danger-strong',
    type: 'color',
    values: {
      light: '#9f0300',
      dark: '#5d6166',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** The boundary of a control that has no other edge: outlined fields and buttons, the track of a switch that is off. At least 3:1 on every surface. */
  'color.border.default': {
    cssVariable: '--env-color-border-default',
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
    cssVariable: '--env-color-border-default-hover',
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
    cssVariable: '--env-color-border-default-pressed',
    type: 'color',
    values: {
      light: '#686b70',
      dark: '#a1a4a9',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  /** A decorative edge in the done tone, around an outlined badge: the done text color at 55%, in every theme and at high contrast. */
  'color.border.done': {
    cssVariable: '--env-color-border-done',
    type: 'color',
    values: {
      light: 'rgb(122 63 200 / 0.55)',
      dark: 'rgb(210 178 247 / 0.55)',
      'light-high-contrast': 'rgb(83 0 154 / 0.55)',
      'dark-high-contrast': 'rgb(241 230 255 / 0.55)',
    },
  },
  /** Focus rings: at least 3:1 against what they are drawn on. */
  'color.border.focus': {
    cssVariable: '--env-color-border-focus',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#0053b5',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** The edge of the strong information fill where it floats, on information toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge of elevation 2: color.border.muted, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.info.strong': {
    cssVariable: '--env-color-border-info-strong',
    type: 'color',
    values: {
      light: '#174d90',
      dark: '#5d6166',
      'light-high-contrast': '#003068',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A neutral inner edge that defines content of any color, such as the color picker’s area: black at 5% in both themes. */
  'color.border.media': {
    cssVariable: '--env-color-border-media',
    type: 'color',
    values: {
      light: 'rgb(0 0 0 / 0.05)',
      dark: 'rgb(0 0 0 / 0.05)',
      'light-high-contrast': 'rgb(0 0 0 / 0.05)',
      'dark-high-contrast': 'rgb(0 0 0 / 0.05)',
    },
  },
  /** Decorative dividers and outlines that are not a control’s only boundary: table lines, title bars, Markdown rules, keyboard keys, and the hairline edge of every elevated popup, which the elevation shadow and the content already identify. */
  'color.border.muted': {
    cssVariable: '--env-color-border-muted',
    type: 'color',
    values: {
      light: '#cfd1d5',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative outline under the pointer, such as a resize handle or a pager link. */
  'color.border.muted.hover': {
    cssVariable: '--env-color-border-muted-hover',
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
    cssVariable: '--env-color-border-muted-pressed',
    type: 'color',
    values: {
      light: '#a1a4a9',
      dark: '#95989c',
      'light-high-contrast': '#54575c',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  /** A decorative edge in the neutral tone, around an outlined badge: the muted text color at 55%, in every theme and at high contrast. */
  'color.border.neutral': {
    cssVariable: '--env-color-border-neutral',
    type: 'color',
    values: {
      light: 'rgb(93 97 102 / 0.55)',
      dark: 'rgb(189 191 195 / 0.55)',
      'light-high-contrast': 'rgb(48 50 52 / 0.55)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.55)',
    },
  },
  /** The edge of the strong neutral fill where it floats, on tooltips and neutral toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge of elevation 2: color.border.muted, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.neutral.strong': {
    cssVariable: '--env-color-border-neutral-strong',
    type: 'color',
    values: {
      light: '#303234',
      dark: '#5d6166',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative edge in the success tone, around an outlined badge: the success text color at 55%, in every theme and at high contrast. */
  'color.border.success': {
    cssVariable: '--env-color-border-success',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.55)',
      dark: 'rgb(122 209 151 / 0.55)',
      'light-high-contrast': 'rgb(0 68 26 / 0.55)',
      'dark-high-contrast': 'rgb(165 253 193 / 0.55)',
    },
  },
  /** The faint edge of a success alert: the success text color at 28%, in every theme and at high contrast. */
  'color.border.success.muted': {
    cssVariable: '--env-color-border-success-muted',
    type: 'color',
    values: {
      light: 'rgb(23 111 53 / 0.28)',
      dark: 'rgb(122 209 151 / 0.28)',
      'light-high-contrast': 'rgb(0 68 26 / 0.28)',
      'dark-high-contrast': 'rgb(165 253 193 / 0.28)',
    },
  },
  /** The edge of the strong success fill where it floats, on success toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge of elevation 2: color.border.muted, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.success.strong': {
    cssVariable: '--env-color-border-success-strong',
    type: 'color',
    values: {
      light: '#03593f',
      dark: '#5d6166',
      'light-high-contrast': '#003a28',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative edge in the warning tone, around an outlined badge: the warning text color at 55%, in every theme and at high contrast. */
  'color.border.warning': {
    cssVariable: '--env-color-border-warning',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.55)',
      dark: 'rgb(235 183 80 / 0.55)',
      'light-high-contrast': 'rgb(85 50 0 / 0.55)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.55)',
    },
  },
  /** The faint edge of a warning alert: the warning text color at 28%, in every theme and at high contrast. */
  'color.border.warning.muted': {
    cssVariable: '--env-color-border-warning-muted',
    type: 'color',
    values: {
      light: 'rgb(138 85 4 / 0.28)',
      dark: 'rgb(235 183 80 / 0.28)',
      'light-high-contrast': 'rgb(85 50 0 / 0.28)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.28)',
    },
  },
  /** Accent text and icons: the accent tone, outlined button labels, chips, the icon of a pager link. */
  'color.fg.accent': {
    cssVariable: '--env-color-fg-accent',
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
    cssVariable: '--env-color-fg-control',
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
    cssVariable: '--env-color-fg-danger',
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
    cssVariable: '--env-color-fg-default',
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
    cssVariable: '--env-color-fg-done',
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
    cssVariable: '--env-color-fg-link',
    type: 'color',
    values: {
      light: '#0366da',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** Links and text buttons on a tint, where fg.link falls below 4.5:1: inside alerts, on bg.brand-muted, and in list rows and interactive table rows under the pointer or pressed. In light it is a grade darker than fg.link and darkens on hover and press; in dark it is fg.link at rest and lightens on hover and press, where fg.link darkens. Alerts and those rows point fg.link at it; an application puts it on bg.brand-muted. */
  'color.fg.link-on-tint': {
    cssVariable: '--env-color-fg-link-on-tint',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** A link on a tint under the pointer. */
  'color.fg.link-on-tint.hover': {
    cssVariable: '--env-color-fg-link-on-tint-hover',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  /** A link on a tint while pressed. */
  'color.fg.link-on-tint.pressed': {
    cssVariable: '--env-color-fg-link-on-tint-pressed',
    type: 'color',
    values: {
      light: '#004aa2',
      dark: '#cddefc',
      'light-high-contrast': '#00275c',
      'dark-high-contrast': '#f4f8ff',
    },
  },
  /** A link under the pointer. */
  'color.fg.link.hover': {
    cssVariable: '--env-color-fg-link-hover',
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
    cssVariable: '--env-color-fg-link-pressed',
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
    cssVariable: '--env-color-fg-muted',
    type: 'color',
    values: {
      light: '#54575c',
      dark: '#bdbfc3',
      'light-high-contrast': '#303234',
      'dark-high-contrast': '#e8eaee',
    },
  },
  /** Muted text that responds to the pointer, such as a Disclosure summary, gains contrast. */
  'color.fg.muted.hover': {
    cssVariable: '--env-color-fg-muted-hover',
    type: 'color',
    values: {
      light: '#4b4d51',
      dark: '#ccced2',
      'light-high-contrast': '#28292b',
      'dark-high-contrast': '#eff1f5',
    },
  },
  /** Muted text while pressed. */
  'color.fg.muted.pressed': {
    cssVariable: '--env-color-fg-muted-pressed',
    type: 'color',
    values: {
      light: '#424447',
      dark: '#dbdde1',
      'light-high-contrast': '#1e1f21',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  /** Text and icons on the emphasis fills: white in light, dark in dark. */
  'color.fg.on-emphasis': {
    cssVariable: '--env-color-fg-on-emphasis',
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
    cssVariable: '--env-color-fg-on-selected',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** White in both themes, on the strong fills: labels at 4.5:1 on the danger, important, neutral, success and information fills, at rest, hovered and pressed; marks at 3:1 on the brand’s strong fill. */
  'color.fg.on-strong': {
    cssVariable: '--env-color-fg-on-strong',
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
    cssVariable: '--env-color-fg-success',
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
    cssVariable: '--env-color-fg-warning',
    type: 'color',
    values: {
      light: '#8a5504',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffe8be',
    },
  },
  /** The fill of a list item: the default surface in light, the muted one in dark, so items stand apart from the page and from a surface in both. */
  'color.list-item.bg': {
    cssVariable: '--env-color-list-item-bg',
    type: 'color',
    values: {
      light: '#eff1f5',
      dark: '#343638',
      'light-high-contrast': '#eff1f5',
      'dark-high-contrast': '#343638',
    },
  },
  /** A list item under the pointer. */
  'color.list-item.bg.hover': {
    cssVariable: '--env-color-list-item-bg-hover',
    type: 'color',
    values: {
      light: '#e2e4e8',
      dark: '#424447',
      'light-high-contrast': '#e2e4e8',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A list item while pressed. */
  'color.list-item.bg.pressed': {
    cssVariable: '--env-color-list-item-bg-pressed',
    type: 'color',
    values: {
      light: '#dbdde1',
      dark: '#4b4d51',
      'light-high-contrast': '#dbdde1',
      'dark-high-contrast': '#424447',
    },
  },
  /** The hairline border of controls and fields, which stays 1 px in both scales. */
  'control.border-width': {
    cssVariable: '--env-control-border-width',
    type: 'dimension',
    values: {
      light: '1px',
      dark: '1px',
      'light-high-contrast': '1px',
      'dark-high-contrast': '1px',
    },
  },
  'control.font-size': {
    cssVariable: '--env-control-font-size',
    type: 'dimension',
    values: {
      light: '0.9375rem',
      dark: '0.9375rem',
      'light-high-contrast': '0.9375rem',
      'dark-high-contrast': '0.9375rem',
    },
  },
  /** The space between a control's icon and its label. */
  'control.gap': {
    cssVariable: '--env-control-gap',
    type: 'dimension',
    values: {
      light: '0.4375rem',
      dark: '0.4375rem',
      'light-high-contrast': '0.4375rem',
      'dark-high-contrast': '0.4375rem',
    },
    scales: { compact: '0.375rem' },
  },
  /** The height a control takes when it sets no size: md, unless a container sets it to another control height for what it holds, as a table cell does with sm. */
  'control.height': {
    cssVariable: '--env-control-height',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
  },
  /** The large control height, for a control of size lg, such as a prominent call to action. */
  'control.height-lg': {
    cssVariable: '--env-control-height-lg',
    type: 'dimension',
    values: {
      light: '3rem',
      dark: '3rem',
      'light-high-contrast': '3rem',
      'dark-high-contrast': '3rem',
    },
    scales: { compact: '2.375rem' },
  },
  /** The medium control height, every control's default size. */
  'control.height-md': {
    cssVariable: '--env-control-height-md',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
    scales: { compact: '2rem' },
  },
  /** The small control height: a control of size sm, the actions in a table cell, a title bar or a panel header. */
  'control.height-sm': {
    cssVariable: '--env-control-height-sm',
    type: 'dimension',
    values: {
      light: '2rem',
      dark: '2rem',
      'light-high-contrast': '2rem',
      'dark-high-contrast': '2rem',
    },
    scales: { compact: '1.625rem' },
  },
  /** The height every control grows to under a coarse pointer, whatever the scale, and the width of a button: its own box is its hit area. Rows grow to it too. */
  'control.height-touch': {
    cssVariable: '--env-control-height-touch',
    type: 'dimension',
    values: {
      light: '2.75rem',
      dark: '2.75rem',
      'light-high-contrast': '2.75rem',
      'dark-high-contrast': '2.75rem',
    },
  },
  /** The icon in a control. 1 rem in both scales: icons never get smaller than this. */
  'control.icon-size': {
    cssVariable: '--env-control-icon-size',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  /** The smallest a pressable target may be in either dimension, in both scales: WCAG 2.2's 24 px minimum. A control smaller than its size, such as a segment inside a small rail or an action inside a small field, keeps at least this. */
  'control.target-min': {
    cssVariable: '--env-control-target-min',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
  },
  /** The height, and the least width, of a counter badge and a diff stat. */
  'counter-badge.height': {
    cssVariable: '--env-counter-badge-height',
    type: 'dimension',
    values: {
      light: '1.25rem',
      dark: '1.25rem',
      'light-high-contrast': '1.25rem',
      'dark-high-contrast': '1.25rem',
    },
    scales: { compact: '1rem' },
  },
  'elevation.0.border': {
    cssVariable: '--env-elevation-0-border',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  'elevation.0.shadow': {
    cssVariable: '--env-elevation-0-shadow',
    type: 'shadow',
    values: {
      light: '0 0 0 0 transparent',
      dark: '0 0 0 0 transparent',
      'light-high-contrast': '0 0 0 0 transparent',
      'dark-high-contrast': '0 0 0 0 transparent',
    },
  },
  'elevation.1.border': {
    cssVariable: '--env-elevation-1-border',
    type: 'color',
    values: {
      light: '#cfd1d5',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.1.shadow': {
    cssVariable: '--env-elevation-1-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 1px 3px 1px rgb(66 68 71 / 0.15)',
      dark: '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 1px 3px 1px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 1px 3px 1px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 1px 3px 1px rgb(0 0 0 / 0.3)',
    },
  },
  'elevation.2.border': {
    cssVariable: '--env-elevation-2-border',
    type: 'color',
    values: {
      light: '#cfd1d5',
      dark: '#5d6166',
      'light-high-contrast': '#686b70',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.2.shadow': {
    cssVariable: '--env-elevation-2-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 2px 6px 2px rgb(66 68 71 / 0.15)',
      dark: '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 2px 6px 2px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 2px 0 rgb(66 68 71 / 0.3), 0 2px 6px 2px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 2px 0 rgb(0 0 0 / 0.6), 0 2px 6px 2px rgb(0 0 0 / 0.3)',
    },
  },
  'elevation.3.border': {
    cssVariable: '--env-elevation-3-border',
    type: 'color',
    values: {
      light: '#cfd1d5',
      dark: '#5d6166',
      'light-high-contrast': '#121315',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  'elevation.3.shadow': {
    cssVariable: '--env-elevation-3-shadow',
    type: 'shadow',
    values: {
      light: '0 1px 3px 0 rgb(66 68 71 / 0.3), 0 4px 8px 3px rgb(66 68 71 / 0.15)',
      dark: '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 4px 8px 3px rgb(0 0 0 / 0.3)',
      'light-high-contrast': '0 1px 3px 0 rgb(66 68 71 / 0.3), 0 4px 8px 3px rgb(66 68 71 / 0.15)',
      'dark-high-contrast': '0 1px 3px 0 rgb(0 0 0 / 0.6), 0 4px 8px 3px rgb(0 0 0 / 0.3)',
    },
  },
  /** The height of a text field's floating variant, whose label rests inside the field and floats into its outline. Other fields take the control height. */
  'field.floating-height': {
    cssVariable: '--env-field-floating-height',
    type: 'dimension',
    values: {
      light: '3.5rem',
      dark: '3.5rem',
      'light-high-contrast': '3.5rem',
      'dark-high-contrast': '3.5rem',
    },
    scales: { compact: '2.75rem' },
  },
  'font.family': {
    cssVariable: '--env-font-family',
    type: 'fontFamily',
    values: {
      light: "'envUI Inter', sans-serif",
      dark: "'envUI Inter', sans-serif",
      'light-high-contrast': "'envUI Inter', sans-serif",
      'dark-high-contrast': "'envUI Inter', sans-serif",
    },
  },
  'font.size.body': {
    cssVariable: '--env-font-size-body',
    type: 'dimension',
    values: {
      light: '0.9375rem',
      dark: '0.9375rem',
      'light-high-contrast': '0.9375rem',
      'dark-high-contrast': '0.9375rem',
    },
    scales: { compact: '0.8125rem' },
  },
  'font.size.body-small': {
    cssVariable: '--env-font-size-body-small',
    type: 'dimension',
    values: {
      light: '0.875rem',
      dark: '0.875rem',
      'light-high-contrast': '0.875rem',
      'dark-high-contrast': '0.875rem',
    },
    scales: { compact: '0.75rem' },
  },
  /** Captions, a menu's group labels and other small secondary text. */
  'font.size.caption': {
    cssVariable: '--env-font-size-caption',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
    scales: { compact: '0.6875rem' },
  },
  'font.size.heading': {
    cssVariable: '--env-font-size-heading',
    type: 'dimension',
    values: {
      light: '1.125rem',
      dark: '1.125rem',
      'light-high-contrast': '1.125rem',
      'dark-high-contrast': '1.125rem',
    },
    scales: { compact: '1rem' },
  },
  'font.size.heading-small': {
    cssVariable: '--env-font-size-heading-small',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
    scales: { compact: '0.875rem' },
  },
  /** The label of a control, and the text of menu, tree and option rows. */
  'font.size.label': {
    cssVariable: '--env-font-size-label',
    type: 'dimension',
    values: {
      light: '0.875rem',
      dark: '0.875rem',
      'light-high-contrast': '0.875rem',
      'dark-high-contrast': '0.875rem',
    },
    scales: { compact: '0.8125rem' },
  },
  /** A label inside a field at the control height, such as a combobox chip's. */
  'font.size.label-small': {
    cssVariable: '--env-font-size-label-small',
    type: 'dimension',
    values: {
      light: '0.8125rem',
      dark: '0.8125rem',
      'light-high-contrast': '0.8125rem',
      'dark-high-contrast': '0.8125rem',
    },
    scales: { compact: '0.75rem' },
  },
  'font.weight.medium': {
    cssVariable: '--env-font-weight-medium',
    type: 'fontWeight',
    values: {
      light: '500',
      dark: '500',
      'light-high-contrast': '500',
      'dark-high-contrast': '500',
    },
  },
  'font.weight.regular': {
    cssVariable: '--env-font-weight-regular',
    type: 'fontWeight',
    values: {
      light: '400',
      dark: '400',
      'light-high-contrast': '400',
      'dark-high-contrast': '400',
    },
  },
  'font.weight.semibold': {
    cssVariable: '--env-font-weight-semibold',
    type: 'fontWeight',
    values: {
      light: '600',
      dark: '600',
      'light-high-contrast': '600',
      'dark-high-contrast': '600',
    },
  },
  /** A leading icon in a large row, such as a list item's. */
  'icon.size-lg': {
    cssVariable: '--env-icon-size-lg',
    type: 'dimension',
    values: {
      light: '1.25rem',
      dark: '1.25rem',
      'light-high-contrast': '1.25rem',
      'dark-high-contrast': '1.25rem',
    },
    scales: { compact: '1.125rem' },
  },
  /** An icon beside body text, such as in a tree or a select trigger. */
  'icon.size-md': {
    cssVariable: '--env-icon-size-md',
    type: 'dimension',
    values: {
      light: '1.125rem',
      dark: '1.125rem',
      'light-high-contrast': '1.125rem',
      'dark-high-contrast': '1.125rem',
    },
    scales: { compact: '1rem' },
  },
  'icon.size-sm': {
    cssVariable: '--env-icon-size-sm',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
  },
  'motion.duration.fast': {
    cssVariable: '--env-motion-duration-fast',
    type: 'duration',
    values: {
      light: '0.12s',
      dark: '0.12s',
      'light-high-contrast': '0.12s',
      'dark-high-contrast': '0.12s',
    },
  },
  'motion.duration.medium': {
    cssVariable: '--env-motion-duration-medium',
    type: 'duration',
    values: {
      light: '0.16s',
      dark: '0.16s',
      'light-high-contrast': '0.16s',
      'dark-high-contrast': '0.16s',
    },
  },
  'motion.duration.slow': {
    cssVariable: '--env-motion-duration-slow',
    type: 'duration',
    values: {
      light: '0.24s',
      dark: '0.24s',
      'light-high-contrast': '0.24s',
      'dark-high-contrast': '0.24s',
    },
  },
  'motion.ease': {
    cssVariable: '--env-motion-ease',
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
    cssVariable: '--env-motion-ease-enter',
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
    cssVariable: '--env-motion-ease-exit',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      dark: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      'light-high-contrast': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      'dark-high-contrast': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    },
  },
  'motion.ease-standard': {
    cssVariable: '--env-motion-ease-standard',
    type: 'cubicBezier',
    values: {
      light: 'cubic-bezier(0.45, 0, 0.2, 1)',
      dark: 'cubic-bezier(0.45, 0, 0.2, 1)',
      'light-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
      'dark-high-contrast': 'cubic-bezier(0.45, 0, 0.2, 1)',
    },
  },
  /** Medium corners: fields, tables, alerts and other blocks. */
  'radius.lg': {
    cssVariable: '--env-radius-lg',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
    scales: { compact: '0.75rem' },
  },
  'radius.md': {
    cssVariable: '--env-radius-md',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
    scales: { compact: '0.625rem' },
  },
  'radius.none': {
    cssVariable: '--env-radius-none',
    type: 'dimension',
    values: { light: '0', dark: '0', 'light-high-contrast': '0', 'dark-high-contrast': '0' },
  },
  'radius.row-inner': {
    cssVariable: '--env-radius-row-inner',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
  },
  'radius.row-outer': {
    cssVariable: '--env-radius-row-outer',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  'radius.row-single': {
    cssVariable: '--env-radius-row-single',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  /** Small corners: buttons in a group, chips, menu rows, list rows inside a surface. */
  'radius.sm': {
    cssVariable: '--env-radius-sm',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
    scales: { compact: '0.375rem' },
  },
  /** The rounded corners of surfaces, dialogs and popups. */
  'radius.surface': {
    cssVariable: '--env-radius-surface',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
  },
  'radius.xl': {
    cssVariable: '--env-radius-xl',
    type: 'dimension',
    values: {
      light: '1.75rem',
      dark: '1.75rem',
      'light-high-contrast': '1.75rem',
      'dark-high-contrast': '1.75rem',
    },
    scales: { compact: '1.375rem' },
  },
  'radius.xs': {
    cssVariable: '--env-radius-xs',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
    scales: { compact: '0.1875rem' },
  },
  /** The line a tree row reserves for its label and icon, 20 px in both scales; the row's density adds its block padding around it. */
  'row.content-height': {
    cssVariable: '--env-row-content-height',
    type: 'dimension',
    values: {
      light: '1.25rem',
      dark: '1.25rem',
      'light-high-contrast': '1.25rem',
      'dark-high-contrast': '1.25rem',
    },
  },
  /** The row of a menu and of a select's or combobox's popup. */
  'row.height': {
    cssVariable: '--env-row-height',
    type: 'dimension',
    values: {
      light: '2.25rem',
      dark: '2.25rem',
      'light-high-contrast': '2.25rem',
      'dark-high-contrast': '2.25rem',
    },
    scales: { compact: '1.75rem' },
  },
  /** Row density lg. */
  'row.padding-block-lg': {
    cssVariable: '--env-row-padding-block-lg',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
    scales: { compact: '0.375rem' },
  },
  /** Row density md: the default of tables and lists. */
  'row.padding-block-md': {
    cssVariable: '--env-row-padding-block-md',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
    scales: { compact: '0.25rem' },
  },
  /** Row density sm: a tree's default. */
  'row.padding-block-sm': {
    cssVariable: '--env-row-padding-block-sm',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
    scales: { compact: '0.1875rem' },
  },
  /** Row density xs: the block padding of each row of a data component, such as a table, a tree or a list. */
  'row.padding-block-xs': {
    cssVariable: '--env-row-padding-block-xs',
    type: 'dimension',
    values: {
      light: '0.125rem',
      dark: '0.125rem',
      'light-high-contrast': '0.125rem',
      'dark-high-contrast': '0.125rem',
    },
    scales: { compact: '0.125rem' },
  },
  /** Text in rows keeps clear of the large outer corners, whether a row stands alone or is connected. */
  'row.padding-inline': {
    cssVariable: '--env-row-padding-inline',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
    scales: { compact: '1.25rem' },
  },
  'space.1': {
    cssVariable: '--env-space-1',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
  },
  'space.2': {
    cssVariable: '--env-space-2',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
    scales: { compact: '0.375rem' },
  },
  'space.3': {
    cssVariable: '--env-space-3',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
    scales: { compact: '0.625rem' },
  },
  'space.4': {
    cssVariable: '--env-space-4',
    type: 'dimension',
    values: {
      light: '1rem',
      dark: '1rem',
      'light-high-contrast': '1rem',
      'dark-high-contrast': '1rem',
    },
    scales: { compact: '0.75rem' },
  },
  'space.5': {
    cssVariable: '--env-space-5',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
    scales: { compact: '1.25rem' },
  },
  'space.6': {
    cssVariable: '--env-space-6',
    type: 'dimension',
    values: {
      light: '2rem',
      dark: '2rem',
      'light-high-contrast': '2rem',
      'dark-high-contrast': '2rem',
    },
    scales: { compact: '1.625rem' },
  },
  'space.7': {
    cssVariable: '--env-space-7',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
    scales: { compact: '2rem' },
  },
  'space.8': {
    cssVariable: '--env-space-8',
    type: 'dimension',
    values: {
      light: '3rem',
      dark: '3rem',
      'light-high-contrast': '3rem',
      'dark-high-contrast': '3rem',
    },
    scales: { compact: '2.375rem' },
  },
  'space.9': {
    cssVariable: '--env-space-9',
    type: 'dimension',
    values: {
      light: '4rem',
      dark: '4rem',
      'light-high-contrast': '4rem',
      'dark-high-contrast': '4rem',
    },
    scales: { compact: '3.25rem' },
  },
  'state.disabled-opacity': {
    cssVariable: '--env-state-disabled-opacity',
    type: 'number',
    values: {
      light: '0.48',
      dark: '0.48',
      'light-high-contrast': '0.48',
      'dark-high-contrast': '0.48',
    },
  },
  /** A window title bar drawn by the application, which holds controls of size sm. */
  'title-bar.height': {
    cssVariable: '--env-title-bar-height',
    type: 'dimension',
    values: {
      light: '2.5rem',
      dark: '2.5rem',
      'light-high-contrast': '2.5rem',
      'dark-high-contrast': '2.5rem',
    },
    scales: { compact: '2rem' },
  },
  /** A tree row's block padding at density lg: the row density's in the comfortable scale. */
  'tree.row-padding-block-lg': {
    cssVariable: '--env-tree-row-padding-block-lg',
    type: 'dimension',
    values: {
      light: '0.75rem',
      dark: '0.75rem',
      'light-high-contrast': '0.75rem',
      'dark-high-contrast': '0.75rem',
    },
    scales: { compact: '0.4375rem' },
  },
  /** A tree row's block padding at density md: the row density's in the comfortable scale. */
  'tree.row-padding-block-md': {
    cssVariable: '--env-tree-row-padding-block-md',
    type: 'dimension',
    values: {
      light: '0.5rem',
      dark: '0.5rem',
      'light-high-contrast': '0.5rem',
      'dark-high-contrast': '0.5rem',
    },
    scales: { compact: '0.3125rem' },
  },
  /** A tree row's block padding at density sm, its default, so that a row is as tall as a menu row in either scale: the row density's in the comfortable scale. */
  'tree.row-padding-block-sm': {
    cssVariable: '--env-tree-row-padding-block-sm',
    type: 'dimension',
    values: {
      light: '0.25rem',
      dark: '0.25rem',
      'light-high-contrast': '0.25rem',
      'dark-high-contrast': '0.25rem',
    },
    scales: { compact: '0.25rem' },
  },
  'type.body': {
    cssVariable: '--env-type-body',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  'type.body-small': {
    cssVariable: '--env-type-body-small',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  'type.h1': {
    cssVariable: '--env-type-h1',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  'type.h2': {
    cssVariable: '--env-type-h2',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Inter', sans-serif",
        'font-size': '1rem',
        'font-weight': '500',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  /** 52.5 rem: where expanded starts, such as a tablet held sideways. */
  'window-class.expanded': {
    cssVariable: '--env-window-class-expanded',
    type: 'dimension',
    values: {
      light: '52.5rem',
      dark: '52.5rem',
      'light-high-contrast': '52.5rem',
      'dark-high-contrast': '52.5rem',
    },
  },
  /** 75 rem: where large starts, such as a desktop window. */
  'window-class.large': {
    cssVariable: '--env-window-class-large',
    type: 'dimension',
    values: {
      light: '75rem',
      dark: '75rem',
      'light-high-contrast': '75rem',
      'dark-high-contrast': '75rem',
    },
  },
  /** 37.5 rem: where medium starts, such as a tablet held upright or a narrow desktop window; narrower is compact, such as a phone. */
  'window-class.medium': {
    cssVariable: '--env-window-class-medium',
    type: 'dimension',
    values: {
      light: '37.5rem',
      dark: '37.5rem',
      'light-high-contrast': '37.5rem',
      'dark-high-contrast': '37.5rem',
    },
  },
  /** The flow of a page or a component; a part drawn behind its siblings takes calc(var(--env-z-base) - 1). */
  'z.base': {
    cssVariable: '--env-z-base',
    type: 'number',
    values: { light: '0', dark: '0', 'light-high-contrast': '0', 'dark-high-contrast': '0' },
  },
  /** Modal layers over their scrim: dialogs, drawers and the command palette. */
  'z.modal': {
    cssVariable: '--env-z-modal',
    type: 'number',
    values: {
      light: '100',
      dark: '100',
      'light-high-contrast': '100',
      'dark-high-contrast': '100',
    },
  },
  /** The scrim behind a modal layer, which covers the page and the frame. */
  'z.overlay': {
    cssVariable: '--env-z-overlay',
    type: 'number',
    values: { light: '90', dark: '90', 'light-high-contrast': '90', 'dark-high-contrast': '90' },
  },
  /** A collapsed sidebar that opens over the content without docking, above the frame's sticky parts. */
  'z.peek': {
    cssVariable: '--env-z-peek',
    type: 'number',
    values: { light: '30', dark: '30', 'light-high-contrast': '30', 'dark-high-contrast': '30' },
  },
  /** Popups anchored to a control, also inside a modal layer: menus, popovers, hover cards, the lists of Select and Combobox, and suggestions. */
  'z.popover': {
    cssVariable: '--env-z-popover',
    type: 'number',
    values: {
      light: '110',
      dark: '110',
      'light-high-contrast': '110',
      'dark-high-contrast': '110',
    },
  },
  /** A part raised over its siblings inside a component or a region: a sticky table header, a resize handle, the hovered avatar of a group. */
  'z.raised': {
    cssVariable: '--env-z-raised',
    type: 'number',
    values: { light: '1', dark: '1', 'light-high-contrast': '1', 'dark-high-contrast': '1' },
  },
  /** The frame's sticky and fixed parts that content scrolls under: the app header and the sidebar columns. */
  'z.sticky': {
    cssVariable: '--env-z-sticky',
    type: 'number',
    values: { light: '20', dark: '20', 'light-high-contrast': '20', 'dark-high-contrast': '20' },
  },
  /** Notifications, above the popups and modal layers they report on. */
  'z.toast': {
    cssVariable: '--env-z-toast',
    type: 'number',
    values: {
      light: '120',
      dark: '120',
      'light-high-contrast': '120',
      'dark-high-contrast': '120',
    },
  },
  /** Tooltips, above everything they can describe. */
  'z.tooltip': {
    cssVariable: '--env-z-tooltip',
    type: 'number',
    values: {
      light: '130',
      dark: '130',
      'light-high-contrast': '130',
      'dark-high-contrast': '130',
    },
  },
} as const satisfies Record<string, TokenDefinition>;

export type TokenId = keyof typeof tokens;
export type TokenCssVariable = (typeof tokens)[TokenId]['cssVariable'];
