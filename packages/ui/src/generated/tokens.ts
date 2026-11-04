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
  /** The height, and the least width, of a counter badge and a diff stat. */
  'badge-count.height': {
    cssVariable: '--env-badge-count-height',
    type: 'dimension',
    values: {
      light: '1.25rem',
      dark: '1.25rem',
      'light-high-contrast': '1.25rem',
      'dark-high-contrast': '1.25rem',
    },
    scales: { compact: '1rem' },
  },
  /** The fill of accent primary actions, as the primary emphasis fill is of the main one: saturated with white labels in light, soft with dark labels in dark; paired with fg.on-emphasis. */
  'color.bg.accent.emphasis': {
    cssVariable: '--env-color-bg-accent-emphasis',
    type: 'color',
    values: {
      light: '#9948b6',
      dark: '#e7a8ff',
      'light-high-contrast': '#6d1888',
      'dark-high-contrast': '#f2d2ff',
    },
  },
  /** An accent primary action under the pointer. */
  'color.bg.accent.emphasis.hover': {
    cssVariable: '--env-color-bg-accent-emphasis-hover',
    type: 'color',
    values: {
      light: '#83319f',
      dark: '#d683f5',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#f7e4ff',
    },
  },
  /** An accent primary action while pressed. */
  'color.bg.accent.emphasis.pressed': {
    cssVariable: '--env-color-bg-accent-emphasis-pressed',
    type: 'color',
    values: {
      light: '#6d1888',
      dark: '#bc6ada',
      'light-high-contrast': '#57006e',
      'dark-high-contrast': '#faedff',
    },
  },
  /** The translucent accent tint of soft accent badges in dark and at high contrast; in light they take color.bg.accent.soft. */
  'color.bg.accent.muted': {
    cssVariable: '--env-color-bg-accent-muted',
    type: 'color',
    values: {
      light: 'rgb(142 60 170 / 0.12)',
      dark: 'rgb(231 168 255 / 0.14)',
      'light-high-contrast': 'rgb(99 4 125 / 0.08)',
      'dark-high-contrast': 'rgb(242 210 255 / 0.1)',
    },
  },
  /** The tint of a soft accent badge: in light the accent purple at 5%, so the purple text keeps 4.5:1 over it; in dark and at high contrast it is color.bg.accent.muted. */
  'color.bg.accent.soft': {
    cssVariable: '--env-color-bg-accent-soft',
    type: 'color',
    values: {
      light: 'rgb(142 60 170 / 0.05)',
      dark: 'rgb(231 168 255 / 0.14)',
      'light-high-contrast': 'rgb(99 4 125 / 0.08)',
      'dark-high-contrast': 'rgb(242 210 255 / 0.1)',
    },
  },
  /** A solid accent fill, such as a solid accent badge; paired with fg.on-emphasis. */
  'color.bg.accent.solid': {
    cssVariable: '--env-color-bg-accent-solid',
    type: 'color',
    values: {
      light: '#8e3caa',
      dark: '#e7a8ff',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#f2d2ff',
    },
  },
  /** The accent purple of accent actions, such as Button's accent tone, in both themes; paired with fg.on-strong. */
  'color.bg.accent.strong': {
    cssVariable: '--env-color-bg-accent-strong',
    type: 'color',
    values: {
      light: '#9948b6',
      dark: '#9948b6',
      'light-high-contrast': '#6d1888',
      'dark-high-contrast': '#6d1888',
    },
  },
  /** An accent action under the pointer. */
  'color.bg.accent.strong.hover': {
    cssVariable: '--env-color-bg-accent-strong-hover',
    type: 'color',
    values: {
      light: '#83319f',
      dark: '#83319f',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#63047d',
    },
  },
  /** An accent action while pressed. */
  'color.bg.accent.strong.pressed': {
    cssVariable: '--env-color-bg-accent-strong-pressed',
    type: 'color',
    values: {
      light: '#6d1888',
      dark: '#6d1888',
      'light-high-contrast': '#57006e',
      'dark-high-contrast': '#57006e',
    },
  },
  /** Controls in the accent tone without a fill at rest: transparent, as color.bg.neutral.subtle is. */
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
  /** The state layer of a control without a fill in the accent tone under the pointer, and the tonal fill of an accent badge: the accent text color at 14%. */
  'color.bg.accent.subtle.hover': {
    cssVariable: '--env-color-bg-accent-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(142 60 170 / 0.14)',
      dark: 'rgb(231 168 255 / 0.17)',
      'light-high-contrast': 'rgb(99 4 125 / 0.14)',
      'dark-high-contrast': 'rgb(247 228 255 / 0.14)',
    },
  },
  /** The accent state layer while pressed: the accent text color at 22%. */
  'color.bg.accent.subtle.pressed': {
    cssVariable: '--env-color-bg-accent-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(142 60 170 / 0.22)',
      dark: 'rgb(231 168 255 / 0.25)',
      'light-high-contrast': 'rgb(99 4 125 / 0.22)',
      'dark-high-contrast': 'rgb(247 228 255 / 0.22)',
    },
  },
  /** The default fill, the powder hue: the fill of an avatar whose hue nothing sets. */
  'color.bg.avatar': {
    cssVariable: '--env-color-bg-avatar',
    type: 'color',
    values: {
      light: '#c0e2f6',
      dark: '#afd3e9',
      'light-high-contrast': '#c0e2f6',
      'dark-high-contrast': '#afd3e9',
    },
  },
  /** The blush pink pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.blush': {
    cssVariable: '--env-color-bg-avatar-blush',
    type: 'color',
    values: {
      light: '#ffd3d4',
      dark: '#f3c2c4',
      'light-high-contrast': '#ffd3d4',
      'dark-high-contrast': '#f3c2c4',
    },
  },
  /** The butter yellow pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.butter': {
    cssVariable: '--env-color-bg-avatar-butter',
    type: 'color',
    values: {
      light: '#efdca4',
      dark: '#e1cc95',
      'light-high-contrast': '#efdca4',
      'dark-high-contrast': '#e1cc95',
    },
  },
  /** The warm oat pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.oat': {
    cssVariable: '--env-color-bg-avatar-oat',
    type: 'color',
    values: {
      light: '#e7dbce',
      dark: '#d8ccbf',
      'light-high-contrast': '#e7dbce',
      'dark-high-contrast': '#d8ccbf',
    },
  },
  /** The orchid pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.orchid': {
    cssVariable: '--env-color-bg-avatar-orchid',
    type: 'color',
    values: {
      light: '#fad2ec',
      dark: '#ecc2dd',
      'light-high-contrast': '#fad2ec',
      'dark-high-contrast': '#ecc2dd',
    },
  },
  /** The periwinkle pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.periwinkle': {
    cssVariable: '--env-color-bg-avatar-periwinkle',
    type: 'color',
    values: {
      light: '#dadaff',
      dark: '#cacaf3',
      'light-high-contrast': '#dadaff',
      'dark-high-contrast': '#cacaf3',
    },
  },
  /** The powder blue pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.powder': {
    cssVariable: '--env-color-bg-avatar-powder',
    type: 'color',
    values: {
      light: '#c0e2f6',
      dark: '#afd3e9',
      'light-high-contrast': '#c0e2f6',
      'dark-high-contrast': '#afd3e9',
    },
  },
  /** The sage pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.sage': {
    cssVariable: '--env-color-bg-avatar-sage',
    type: 'color',
    values: {
      light: '#cee4c3',
      dark: '#bed4b3',
      'light-high-contrast': '#cee4c3',
      'dark-high-contrast': '#bed4b3',
    },
  },
  /** The seafoam pastel fill, one of the hues an avatar takes from its name. */
  'color.bg.avatar.seafoam': {
    cssVariable: '--env-color-bg-avatar-seafoam',
    type: 'color',
    values: {
      light: '#b8e7de',
      dark: '#a7d7cf',
      'light-high-contrast': '#b8e7de',
      'dark-high-contrast': '#a7d7cf',
    },
  },
  /** The backdrop behind dialogs and the command palette: the dark page color at 32% in light, which sets the page back without turning it gray, and black at 50% in dark, where the page color would not darken it. */
  'color.bg.backdrop': {
    cssVariable: '--env-color-bg-backdrop',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.32)',
      dark: 'rgb(0 0 0 / 0.5)',
      'light-high-contrast': 'rgb(31 31 34 / 0.32)',
      'dark-high-contrast': 'rgb(0 0 0 / 0.5)',
    },
  },
  /** The lighter backdrop behind a sheet that leaves the page usable, such as a supporting pane over its main pane: the dark page color at 20% in light and black at 30% in dark. */
  'color.bg.backdrop.muted': {
    cssVariable: '--env-color-bg-backdrop-muted',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.2)',
      dark: 'rgb(0 0 0 / 0.3)',
      'light-high-contrast': 'rgb(31 31 34 / 0.2)',
      'dark-high-contrast': 'rgb(0 0 0 / 0.3)',
    },
  },
  /** A solid danger fill, such as a solid danger badge, and the fill of destructive primary actions, as the primary emphasis fill is of the main one: saturated with white labels in light, soft with dark labels in dark; paired with fg.on-emphasis. */
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
  /** A destructive primary action under the pointer. */
  'color.bg.danger.emphasis.hover': {
    cssVariable: '--env-color-bg-danger-emphasis-hover',
    type: 'color',
    values: {
      light: '#c64e43',
      dark: '#e68c84',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#ffe4e2',
    },
  },
  /** A destructive primary action while pressed. */
  'color.bg.danger.emphasis.pressed': {
    cssVariable: '--env-color-bg-danger-emphasis-pressed',
    type: 'color',
    values: {
      light: '#bf3e33',
      dark: '#d66d63',
      'light-high-contrast': '#5a0100',
      'dark-high-contrast': '#ffedeb',
    },
  },
  /** The translucent danger tint of badges and alerts. */
  'color.bg.danger.muted': {
    cssVariable: '--env-color-bg-danger-muted',
    type: 'color',
    values: {
      light: 'rgb(183 43 32 / 0.12)',
      dark: 'rgb(206 94 83 / 0.18)',
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
      dark: 'rgb(206 94 83 / 0.22)',
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
      dark: 'rgb(206 94 83 / 0.3)',
      'light-high-contrast': 'rgb(122 2 0 / 0.22)',
      'dark-high-contrast': 'rgb(255 228 226 / 0.22)',
    },
  },
  /** The default surface: Surface, navigation, sheets, standard menus. A step lighter than the page in both themes. */
  'color.bg.default': {
    cssVariable: '--env-color-bg-default',
    type: 'color',
    values: {
      light: '#f4f4f6',
      dark: '#28292b',
      'light-high-contrast': '#f8f8fa',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive default surface, such as a card or a list row, under the pointer. */
  'color.bg.default.hover': {
    cssVariable: '--env-color-bg-default-hover',
    type: 'color',
    values: {
      light: '#e7e7e9',
      dark: '#383a3d',
      'light-high-contrast': '#eaeaec',
      'dark-high-contrast': '#303234',
    },
  },
  /** An interactive default surface while pressed. Muted text and an inset focus ring keep their minimums on it. */
  'color.bg.default.pressed': {
    cssVariable: '--env-color-bg-default-pressed',
    type: 'color',
    values: {
      light: '#dddddf',
      dark: '#424447',
      'light-high-contrast': '#e0e0e2',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A solid done fill; paired with fg.on-emphasis. */
  'color.bg.done.emphasis': {
    cssVariable: '--env-color-bg-done-emphasis',
    type: 'color',
    values: {
      light: '#076a7c',
      dark: '#81cbd7',
      'light-high-contrast': '#00404c',
      'dark-high-contrast': '#a0e9f4',
    },
  },
  /** The translucent done tint of badges. */
  'color.bg.done.muted': {
    cssVariable: '--env-color-bg-done-muted',
    type: 'color',
    values: {
      light: 'rgb(7 106 124 / 0.12)',
      dark: 'rgb(129 203 215 / 0.17)',
      'light-high-contrast': 'rgb(0 64 76 / 0.08)',
      'dark-high-contrast': 'rgb(160 233 244 / 0.1)',
    },
  },
  /** A well that keeps a fill of its own, such as the color picker's value button and code and references in rich text. Text fields have none: they take the background of what they sit on. */
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
  /** The fill of a list item: the muted surface in both themes and at high contrast, so items stand apart from the page and from a surface. */
  'color.bg.list-item': {
    cssVariable: '--env-color-bg-list-item',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  /** A list item under the pointer. */
  'color.bg.list-item.hover': {
    cssVariable: '--env-color-bg-list-item-hover',
    type: 'color',
    values: {
      light: '#f1f1f3',
      dark: '#424447',
      'light-high-contrast': '#f1f1f3',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A list item while pressed. */
  'color.bg.list-item.pressed': {
    cssVariable: '--env-color-bg-list-item-pressed',
    type: 'color',
    values: {
      light: '#e3e3e6',
      dark: '#4b4d51',
      'light-high-contrast': '#e3e3e6',
      'dark-high-contrast': '#424447',
    },
  },
  /** The muted surface: Surface background="muted", cards, list and radio rows. Lighter than the default surface in both themes, white in light, so cards stand apart from a pane. */
  'color.bg.muted': {
    cssVariable: '--env-color-bg-muted',
    type: 'color',
    values: {
      light: '#ffffff',
      dark: '#343638',
      'light-high-contrast': '#ffffff',
      'dark-high-contrast': '#343638',
    },
  },
  /** An interactive muted surface under the pointer. */
  'color.bg.muted.hover': {
    cssVariable: '--env-color-bg-muted-hover',
    type: 'color',
    values: {
      light: '#f1f1f3',
      dark: '#424447',
      'light-high-contrast': '#f1f1f3',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** An interactive muted surface while pressed. */
  'color.bg.muted.pressed': {
    cssVariable: '--env-color-bg-muted-pressed',
    type: 'color',
    values: {
      light: '#e3e3e6',
      dark: '#4b4d51',
      'light-high-contrast': '#e3e3e6',
      'dark-high-contrast': '#424447',
    },
  },
  /** A navigation item that isn’t selected, at rest: no fill, over the navigation’s own background. */
  'color.bg.navigation': {
    cssVariable: '--env-color-bg-navigation',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** A navigation item that isn’t selected, under the pointer: a blue-gray tint in light, deeper than the selection so it doesn’t read as selected; in dark and at high contrast, a gray, since a blue tint there would read as the selection. */
  'color.bg.navigation.hover': {
    cssVariable: '--env-color-bg-navigation-hover',
    type: 'color',
    values: {
      light: '#cbd8ea',
      dark: '#424447',
      'light-high-contrast': '#d4d4d6',
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
      'light-high-contrast': '#ceced0',
      'dark-high-contrast': '#424447',
    },
  },
  /** A solid neutral fill, such as a solid neutral badge; paired with fg.on-emphasis. */
  'color.bg.neutral.emphasis': {
    cssVariable: '--env-color-bg-neutral-emphasis',
    type: 'color',
    values: {
      light: '#616164',
      dark: '#bdbfc3',
      'light-high-contrast': '#39393d',
      'dark-high-contrast': '#dbdde1',
    },
  },
  /** The translucent neutral fill of secondary buttons, chips, switch tracks and skeletons: a layer of the text color, so it keeps its tone on every surface. */
  'color.bg.neutral.muted': {
    cssVariable: '--env-color-bg-neutral-muted',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.1)',
      dark: 'rgb(232 234 238 / 0.125)',
      'light-high-contrast': 'rgb(31 31 34 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The neutral fill under the pointer. */
  'color.bg.neutral.muted.hover': {
    cssVariable: '--env-color-bg-neutral-muted-hover',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.16)',
      dark: 'rgb(232 234 238 / 0.18)',
      'light-high-contrast': 'rgb(31 31 34 / 0.17)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.12)',
    },
  },
  /** The neutral fill while pressed. */
  'color.bg.neutral.muted.pressed': {
    cssVariable: '--env-color-bg-neutral-muted-pressed',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.26)',
      dark: 'rgb(232 234 238 / 0.28)',
      'light-high-contrast': 'rgb(31 31 34 / 0.25)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.15)',
    },
  },
  /** The dark neutral fill of tooltips and neutral toasts in both themes; paired with fg.on-strong. */
  'color.bg.neutral.strong': {
    cssVariable: '--env-color-bg-neutral-strong',
    type: 'color',
    values: {
      light: '#434346',
      dark: '#424447',
      'light-high-contrast': '#434346',
      'dark-high-contrast': '#424447',
    },
  },
  /** A control on the strong neutral fill under the pointer. */
  'color.bg.neutral.strong.hover': {
    cssVariable: '--env-color-bg-neutral-strong-hover',
    type: 'color',
    values: {
      light: '#616164',
      dark: '#5d6166',
      'light-high-contrast': '#313134',
      'dark-high-contrast': '#303234',
    },
  },
  /** A control on the strong neutral fill while pressed. */
  'color.bg.neutral.strong.pressed': {
    cssVariable: '--env-color-bg-neutral-strong-pressed',
    type: 'color',
    values: {
      light: '#757578',
      dark: '#72767b',
      'light-high-contrast': '#29292c',
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
      light: 'rgb(31 31 34 / 0.08)',
      dark: 'rgb(232 234 238 / 0.08)',
      'light-high-contrast': 'rgb(31 31 34 / 0.06)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.06)',
    },
  },
  /** The state layer over a control without a fill, while pressed. */
  'color.bg.neutral.subtle.pressed': {
    cssVariable: '--env-color-bg-neutral-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(31 31 34 / 0.12)',
      dark: 'rgb(232 234 238 / 0.12)',
      'light-high-contrast': 'rgb(31 31 34 / 0.08)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.08)',
    },
  },
  /** The page behind all content: the app frame, title bars and Surface background="page". Deeper than the panes and cards on it in both themes, so they part from it. */
  'color.bg.page': {
    cssVariable: '--env-color-bg-page',
    type: 'color',
    values: {
      light: '#eaeaec',
      dark: '#1e1f21',
      'light-high-contrast': '#f1f1f3',
      'dark-high-contrast': '#1e1f21',
    },
  },
  /** An interactive page-colored surface under the pointer. */
  'color.bg.page.hover': {
    cssVariable: '--env-color-bg-page-hover',
    type: 'color',
    values: {
      light: '#dddddf',
      dark: '#2c2d30',
      'light-high-contrast': '#e3e3e6',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive page-colored surface while pressed. */
  'color.bg.page.pressed': {
    cssVariable: '--env-color-bg-page-pressed',
    type: 'color',
    values: {
      light: '#d4d4d6',
      dark: '#383a3d',
      'light-high-contrast': '#dadadc',
      'dark-high-contrast': '#303234',
    },
  },
  /** Popups over the page: menus, Select lists, popovers, the composer. They take elevation 2. In light a gray between the recessed well and the panes, so a popup parts from the white cards it opens over; in dark a step lighter than the page. */
  'color.bg.popup': {
    cssVariable: '--env-color-bg-popup',
    type: 'color',
    values: {
      light: '#f5f5f7',
      dark: '#343638',
      'light-high-contrast': '#f5f5f7',
      'dark-high-contrast': '#303234',
    },
  },
  /** A highlighted row in a popup. */
  'color.bg.popup.hover': {
    cssVariable: '--env-color-bg-popup-hover',
    type: 'color',
    values: {
      light: '#e0e0e2',
      dark: '#424447',
      'light-high-contrast': '#e7e7e9',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A pressed row in a popup. */
  'color.bg.popup.pressed': {
    cssVariable: '--env-color-bg-popup-pressed',
    type: 'color',
    values: {
      light: '#d7d7d9',
      dark: '#4b4d51',
      'light-high-contrast': '#dddddf',
      'dark-high-contrast': '#424447',
    },
  },
  /** The primary fill of primary actions, chosen radios and the chosen calendar day; paired with fg.on-emphasis. In dark and at high contrast, checked checkboxes, switches that are on, sliders, meters and spinners take it too: a soft blue with dark marks at 4.5:1. */
  'color.bg.primary.emphasis': {
    cssVariable: '--env-color-bg-primary-emphasis',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** A primary action under the pointer. */
  'color.bg.primary.emphasis.hover': {
    cssVariable: '--env-color-bg-primary-emphasis-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** A primary action while pressed. */
  'color.bg.primary.emphasis.pressed': {
    cssVariable: '--env-color-bg-primary-emphasis-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The translucent primary tint of info alerts, and of soft primary badges in dark and at high contrast; in light they take color.bg.primary.soft. An application may put a container in it, with links in fg.link-on-muted. */
  'color.bg.primary.muted': {
    cssVariable: '--env-color-bg-primary-muted',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.12)',
      dark: 'rgb(52 126 234 / 0.16)',
      'light-high-contrast': 'rgb(0 55 124 / 0.08)',
      'dark-high-contrast': 'rgb(205 222 252 / 0.1)',
    },
  },
  /** The tint of a soft primary badge. In light it is the primary blue at 5%, fainter than color.bg.primary.muted, so the blue text keeps 4.5:1 over it on list rows and muted surfaces; in dark and at high contrast it is color.bg.primary.muted. */
  'color.bg.primary.soft': {
    cssVariable: '--env-color-bg-primary-soft',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.05)',
      dark: 'rgb(52 126 234 / 0.16)',
      'light-high-contrast': 'rgb(0 55 124 / 0.08)',
      'dark-high-contrast': 'rgb(205 222 252 / 0.1)',
    },
  },
  /** A solid primary fill, such as a solid primary badge or a navigation item's count, a grade deeper than the emphasis fill in light; paired with fg.on-emphasis. */
  'color.bg.primary.solid': {
    cssVariable: '--env-color-bg-primary-solid',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** The saturated primary fill of checked checkboxes, switches that are on, sliders, meters and spinners in the light theme at standard contrast, with white marks, the check and the thumb, at 3:1. The dark theme and high contrast put those controls on the emphasis fill instead; in dark this fill, which keeps 3:1 against the surfaces, would put white text below 4.5:1. */
  'color.bg.primary.strong': {
    cssVariable: '--env-color-bg-primary-strong',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#4b8bec',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#00408f',
    },
  },
  /** A checked control under the pointer. */
  'color.bg.primary.strong.hover': {
    cssVariable: '--env-color-bg-primary-strong-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#347eea',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#00377c',
    },
  },
  /** A checked control while pressed. */
  'color.bg.primary.strong.pressed': {
    cssVariable: '--env-color-bg-primary-strong-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#1872e7',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#002f6d',
    },
  },
  /** Controls in the primary tone without a fill at rest, such as an alert’s dismiss button: transparent, as color.bg.neutral.subtle is. */
  'color.bg.primary.subtle': {
    cssVariable: '--env-color-bg-primary-subtle',
    type: 'color',
    values: {
      light: 'transparent',
      dark: 'transparent',
      'light-high-contrast': 'transparent',
      'dark-high-contrast': 'transparent',
    },
  },
  /** The state layer of a control without a fill in the primary tone, such as an info alert’s dismiss button, under the pointer: the primary text color at 14%, in every theme and at high contrast. */
  'color.bg.primary.subtle.hover': {
    cssVariable: '--env-color-bg-primary-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.14)',
      dark: 'rgb(52 126 234 / 0.2)',
      'light-high-contrast': 'rgb(0 55 124 / 0.14)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.14)',
    },
  },
  /** The primary state layer while pressed: the primary text color at 22%. */
  'color.bg.primary.subtle.pressed': {
    cssVariable: '--env-color-bg-primary-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.22)',
      dark: 'rgb(52 126 234 / 0.28)',
      'light-high-contrast': 'rgb(0 55 124 / 0.22)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.22)',
    },
  },
  /** A raised surface: Surface background="raised", rows on a contrasting surface, outlined buttons. */
  'color.bg.raised': {
    cssVariable: '--env-color-bg-raised',
    type: 'color',
    values: {
      light: '#f4f4f6',
      dark: '#28292b',
      'light-high-contrast': '#f8f8fa',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive raised surface under the pointer. */
  'color.bg.raised.hover': {
    cssVariable: '--env-color-bg-raised-hover',
    type: 'color',
    values: {
      light: '#e7e7e9',
      dark: '#383a3d',
      'light-high-contrast': '#eaeaec',
      'dark-high-contrast': '#303234',
    },
  },
  /** An interactive raised surface while pressed. */
  'color.bg.raised.pressed': {
    cssVariable: '--env-color-bg-raised-pressed',
    type: 'color',
    values: {
      light: '#dddddf',
      dark: '#424447',
      'light-high-contrast': '#e0e0e2',
      'dark-high-contrast': '#383a3d',
    },
  },
  /** A recessed surface: a well that what it holds rises out of, such as a stage for a preview or a drop area, and Surface background="recessed". A shade deeper than the page in dark; in light a shade lighter than the page and the panes, since a deeper gray would take edges and focus rings below 3:1. Everything measured on the page keeps its minimum on it. */
  'color.bg.recessed': {
    cssVariable: '--env-color-bg-recessed',
    type: 'color',
    values: {
      light: '#f8f8fa',
      dark: '#191a1b',
      'light-high-contrast': '#f8f8fa',
      'dark-high-contrast': '#191a1b',
    },
  },
  /** An interactive recessed surface under the pointer. */
  'color.bg.recessed.hover': {
    cssVariable: '--env-color-bg-recessed-hover',
    type: 'color',
    values: {
      light: '#eaeaec',
      dark: '#28292b',
      'light-high-contrast': '#eaeaec',
      'dark-high-contrast': '#28292b',
    },
  },
  /** An interactive recessed surface while pressed. */
  'color.bg.recessed.pressed': {
    cssVariable: '--env-color-bg-recessed-pressed',
    type: 'color',
    values: {
      light: '#e0e0e2',
      dark: '#343638',
      'light-high-contrast': '#e0e0e2',
      'dark-high-contrast': '#343638',
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
      dark: 'rgb(60 144 86 / 0.18)',
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
      dark: 'rgb(60 144 86 / 0.22)',
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
      dark: 'rgb(60 144 86 / 0.3)',
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
  /** The translucent warning tint of badges and alerts: a clean light amber rather than the warning text color, which would turn a light surface tan. */
  'color.bg.warning.muted': {
    cssVariable: '--env-color-bg-warning-muted',
    type: 'color',
    values: {
      light: 'rgb(255 208 120 / 0.24)',
      dark: 'rgb(160 106 24 / 0.2)',
      'light-high-contrast': 'rgb(255 208 120 / 0.24)',
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
  /** The stronger warning tint, which fills a warning alert and a soft badge and lies under a control without a fill in the warning tone, such as a warning alert’s dismiss button, under the pointer: a light amber at 36% in light, at either contrast, so a light surface takes a clean amber rather than tan; the warning text color at 17% in dark, and 14% at high contrast. */
  'color.bg.warning.subtle.hover': {
    cssVariable: '--env-color-bg-warning-subtle-hover',
    type: 'color',
    values: {
      light: 'rgb(255 208 120 / 0.36)',
      dark: 'rgb(160 106 24 / 0.26)',
      'light-high-contrast': 'rgb(255 208 120 / 0.36)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.14)',
    },
  },
  /** The warning state layer while pressed: the light amber at 50% in light, at either contrast; the warning text color at 25% in dark, and 22% at high contrast. */
  'color.bg.warning.subtle.pressed': {
    cssVariable: '--env-color-bg-warning-subtle-pressed',
    type: 'color',
    values: {
      light: 'rgb(255 208 120 / 0.5)',
      dark: 'rgb(160 106 24 / 0.36)',
      'light-high-contrast': 'rgb(255 208 120 / 0.5)',
      'dark-high-contrast': 'rgb(255 232 190 / 0.22)',
    },
  },
  /** A decorative edge in the accent tone, around an outlined accent badge: the accent text color at 55%. */
  'color.border.accent': {
    cssVariable: '--env-color-border-accent',
    type: 'color',
    values: {
      light: 'rgb(142 60 170 / 0.55)',
      dark: 'rgb(231 168 255 / 0.55)',
      'light-high-contrast': 'rgb(99 4 125 / 0.55)',
      'dark-high-contrast': 'rgb(247 228 255 / 0.55)',
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
      light: '#ce5e53',
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
  /** The edge of the strong danger fill where it floats, on error toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge, elevation.2.border, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.danger.strong': {
    cssVariable: '--env-color-border-danger-strong',
    type: 'color',
    values: {
      light: '#9f0300',
      dark: '#686b70',
      'light-high-contrast': '#6b0100',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** The boundary of a control that has no other edge: outlined fields and buttons, the track of a switch that is off. At least 3:1 on every surface. */
  'color.border.default': {
    cssVariable: '--env-color-border-default',
    type: 'color',
    values: {
      light: '#808083',
      dark: '#898c91',
      'light-high-contrast': '#6b6b6e',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A control boundary under the pointer. */
  'color.border.default.hover': {
    cssVariable: '--env-color-border-default-hover',
    type: 'color',
    values: {
      light: '#757578',
      dark: '#95989c',
      'light-high-contrast': '#616164',
      'dark-high-contrast': '#afb1b6',
    },
  },
  /** A control boundary while pressed. */
  'color.border.default.pressed': {
    cssVariable: '--env-color-border-default-pressed',
    type: 'color',
    values: {
      light: '#6b6b6e',
      dark: '#a1a4a9',
      'light-high-contrast': '#57575a',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  /** A decorative edge in the done tone, around an outlined badge: the done text color at 55%, in every theme and at high contrast. */
  'color.border.done': {
    cssVariable: '--env-color-border-done',
    type: 'color',
    values: {
      light: 'rgb(7 106 124 / 0.55)',
      dark: 'rgb(129 203 215 / 0.55)',
      'light-high-contrast': 'rgb(0 64 76 / 0.55)',
      'dark-high-contrast': 'rgb(181 245 255 / 0.55)',
    },
  },
  /** Focus rings: at least 3:1 against what they are drawn on. */
  'color.border.focus': {
    cssVariable: '--env-color-border-focus',
    type: 'color',
    values: {
      light: '#0366da',
      dark: '#9fc1f8',
      'light-high-contrast': '#0053b5',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** The edge of the strong information fill where it floats, on information toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge, elevation.2.border, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.info.strong': {
    cssVariable: '--env-color-border-info-strong',
    type: 'color',
    values: {
      light: '#174d90',
      dark: '#686b70',
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
  /** The hairlines between the items of one list, across its full width: table rows, Markdown rules, menu separators and accordion items; and decorative edges that are not a control’s only boundary: quote bars, keyboard keys and color swatches. Regions separate by space and background instead. A floating layer takes its own, clearer edge, elevation.{level}.border. */
  'color.border.muted': {
    cssVariable: '--env-color-border-muted',
    type: 'color',
    values: {
      light: '#d1d1d3',
      dark: '#5d6166',
      'light-high-contrast': '#6b6b6e',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative outline under the pointer, such as a resize handle or a pager link. */
  'color.border.muted.hover': {
    cssVariable: '--env-color-border-muted-hover',
    type: 'color',
    values: {
      light: '#bfbfc1',
      dark: '#7d8185',
      'light-high-contrast': '#616164',
      'dark-high-contrast': '#afb1b6',
    },
  },
  /** A decorative outline while pressed. */
  'color.border.muted.pressed': {
    cssVariable: '--env-color-border-muted-pressed',
    type: 'color',
    values: {
      light: '#a4a4a7',
      dark: '#95989c',
      'light-high-contrast': '#57575a',
      'dark-high-contrast': '#bdbfc3',
    },
  },
  /** A decorative edge in the neutral tone, around an outlined badge: the muted text color at 55%, in every theme and at high contrast. */
  'color.border.neutral': {
    cssVariable: '--env-color-border-neutral',
    type: 'color',
    values: {
      light: 'rgb(97 97 100 / 0.55)',
      dark: 'rgb(189 191 195 / 0.55)',
      'light-high-contrast': 'rgb(49 49 52 / 0.55)',
      'dark-high-contrast': 'rgb(232 234 238 / 0.55)',
    },
  },
  /** The edge of the strong neutral fill where it floats, on tooltips and neutral toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge, elevation.2.border, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.neutral.strong': {
    cssVariable: '--env-color-border-neutral-strong',
    type: 'color',
    values: {
      light: '#313134',
      dark: '#686b70',
      'light-high-contrast': '#313134',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** A decorative edge in the primary tone, around an outlined primary badge: the primary text color at 55%, in every theme and at high contrast. */
  'color.border.primary': {
    cssVariable: '--env-color-border-primary',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.55)',
      dark: 'rgb(159 193 248 / 0.55)',
      'light-high-contrast': 'rgb(0 55 124 / 0.55)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.55)',
    },
  },
  /** The active border and label of a focused field, and today’s ring in a calendar. */
  'color.border.primary.emphasis': {
    cssVariable: '--env-color-border-primary-emphasis',
    type: 'color',
    values: {
      light: '#1872e7',
      dark: '#9fc1f8',
      'light-high-contrast': '#00408f',
      'dark-high-contrast': '#b5cffb',
    },
  },
  /** An active field border under the pointer. */
  'color.border.primary.emphasis.hover': {
    cssVariable: '--env-color-border-primary-emphasis-hover',
    type: 'color',
    values: {
      light: '#005cc8',
      dark: '#75a5f2',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#cddefc',
    },
  },
  /** An active field border while pressed. */
  'color.border.primary.emphasis.pressed': {
    cssVariable: '--env-color-border-primary-emphasis-pressed',
    type: 'color',
    values: {
      light: '#00408f',
      dark: '#4b8bec',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The faint edge of an info alert: the primary text color at 28%, in every theme and at high contrast. */
  'color.border.primary.muted': {
    cssVariable: '--env-color-border-primary-muted',
    type: 'color',
    values: {
      light: 'rgb(0 92 200 / 0.28)',
      dark: 'rgb(159 193 248 / 0.28)',
      'light-high-contrast': 'rgb(0 55 124 / 0.28)',
      'dark-high-contrast': 'rgb(224 235 253 / 0.28)',
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
  /** The edge of the strong success fill where it floats, on success toasts. In light the fill is dark on a light page, so its edge is the fill a step darker, about 1.3:1 from it: it reads as the fill’s own edge rather than a light halo, and still sets the fill apart from a surface of its color. High contrast keeps that step, from the darker high-contrast fill, far above 4.5:1 on the page. In dark, where the fill is lighter than the page as every popup is, it is the popup edge, elevation.2.border, and color.border.default at high contrast. A dark edge, unlike the 0.7 alias color.border-strong, which is the light divider color, border.muted. */
  'color.border.success.strong': {
    cssVariable: '--env-color-border-success-strong',
    type: 'color',
    values: {
      light: '#03593f',
      dark: '#686b70',
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
  /** Accent text and icons: the purple of an accent badge. */
  'color.fg.accent': {
    cssVariable: '--env-color-fg-accent',
    type: 'color',
    values: {
      light: '#83319f',
      dark: '#e7a8ff',
      'light-high-contrast': '#63047d',
      'dark-high-contrast': '#f7e4ff',
    },
  },
  /** The default initials, on the powder fill. */
  'color.fg.avatar': {
    cssVariable: '--env-color-fg-avatar',
    type: 'color',
    values: {
      light: '#39648d',
      dark: '#2f5a84',
      'light-high-contrast': '#0f3b64',
      'dark-high-contrast': '#002e56',
    },
  },
  /** The default figure, on the powder fill. */
  'color.fg.avatar-figure': {
    cssVariable: '--env-color-fg-avatar-figure',
    type: 'color',
    values: {
      light: '#39648d',
      dark: '#2f5a84',
      'light-high-contrast': '#0f3b64',
      'dark-high-contrast': '#002e56',
    },
  },
  /** The default figure on the blush fill, the shade of its initials. */
  'color.fg.avatar-figure.blush': {
    cssVariable: '--env-color-fg-avatar-figure-blush',
    type: 'color',
    values: {
      light: '#924c4f',
      dark: '#894144',
      'light-high-contrast': '#682227',
      'dark-high-contrast': '#59131b',
    },
  },
  /** The default figure on the butter fill, the shade of its initials. */
  'color.fg.avatar-figure.butter': {
    cssVariable: '--env-color-fg-avatar-figure-butter',
    type: 'color',
    values: {
      light: '#7c5b2a',
      dark: '#73501f',
      'light-high-contrast': '#523300',
      'dark-high-contrast': '#422800',
    },
  },
  /** The default figure on the oat fill, the shade of its initials. */
  'color.fg.avatar-figure.oat': {
    cssVariable: '--env-color-fg-avatar-figure-oat',
    type: 'color',
    values: {
      light: '#6e5e51',
      dark: '#645447',
      'light-high-contrast': '#46372b',
      'dark-high-contrast': '#392b1f',
    },
  },
  /** The default figure on the orchid fill, the shade of its initials. */
  'color.fg.avatar-figure.orchid': {
    cssVariable: '--env-color-fg-avatar-figure-orchid',
    type: 'color',
    values: {
      light: '#864f70',
      dark: '#7d4566',
      'light-high-contrast': '#5d2648',
      'dark-high-contrast': '#4e193b',
    },
  },
  /** The default figure on the periwinkle fill, the shade of its initials. */
  'color.fg.avatar-figure.periwinkle': {
    cssVariable: '--env-color-fg-avatar-figure-periwinkle',
    type: 'color',
    values: {
      light: '#5d5a96',
      dark: '#54508d',
      'light-high-contrast': '#38326d',
      'dark-high-contrast': '#2c255f',
    },
  },
  /** The default figure on the powder fill, the shade of its initials. */
  'color.fg.avatar-figure.powder': {
    cssVariable: '--env-color-fg-avatar-figure-powder',
    type: 'color',
    values: {
      light: '#39648d',
      dark: '#2f5a84',
      'light-high-contrast': '#0f3b64',
      'dark-high-contrast': '#002e56',
    },
  },
  /** The default figure on the sage fill, the shade of its initials. */
  'color.fg.avatar-figure.sage': {
    cssVariable: '--env-color-fg-avatar-figure-sage',
    type: 'color',
    values: {
      light: '#4d6845',
      dark: '#425e3b',
      'light-high-contrast': '#26401f',
      'dark-high-contrast': '#193312',
    },
  },
  /** The default figure on the seafoam fill, the shade of its initials. */
  'color.fg.avatar-figure.seafoam': {
    cssVariable: '--env-color-fg-avatar-figure-seafoam',
    type: 'color',
    values: {
      light: '#266b68',
      dark: '#16615f',
      'light-high-contrast': '#004140',
      'dark-high-contrast': '#003432',
    },
  },
  /** The initials on the blush fill. */
  'color.fg.avatar.blush': {
    cssVariable: '--env-color-fg-avatar-blush',
    type: 'color',
    values: {
      light: '#924c4f',
      dark: '#894144',
      'light-high-contrast': '#682227',
      'dark-high-contrast': '#59131b',
    },
  },
  /** The initials on the butter fill. */
  'color.fg.avatar.butter': {
    cssVariable: '--env-color-fg-avatar-butter',
    type: 'color',
    values: {
      light: '#7c5b2a',
      dark: '#73501f',
      'light-high-contrast': '#523300',
      'dark-high-contrast': '#422800',
    },
  },
  /** The initials on the oat fill. */
  'color.fg.avatar.oat': {
    cssVariable: '--env-color-fg-avatar-oat',
    type: 'color',
    values: {
      light: '#6e5e51',
      dark: '#645447',
      'light-high-contrast': '#46372b',
      'dark-high-contrast': '#392b1f',
    },
  },
  /** The initials on the orchid fill. */
  'color.fg.avatar.orchid': {
    cssVariable: '--env-color-fg-avatar-orchid',
    type: 'color',
    values: {
      light: '#864f70',
      dark: '#7d4566',
      'light-high-contrast': '#5d2648',
      'dark-high-contrast': '#4e193b',
    },
  },
  /** The initials on the periwinkle fill. */
  'color.fg.avatar.periwinkle': {
    cssVariable: '--env-color-fg-avatar-periwinkle',
    type: 'color',
    values: {
      light: '#5d5a96',
      dark: '#54508d',
      'light-high-contrast': '#38326d',
      'dark-high-contrast': '#2c255f',
    },
  },
  /** The initials on the powder fill. */
  'color.fg.avatar.powder': {
    cssVariable: '--env-color-fg-avatar-powder',
    type: 'color',
    values: {
      light: '#39648d',
      dark: '#2f5a84',
      'light-high-contrast': '#0f3b64',
      'dark-high-contrast': '#002e56',
    },
  },
  /** The initials on the sage fill. */
  'color.fg.avatar.sage': {
    cssVariable: '--env-color-fg-avatar-sage',
    type: 'color',
    values: {
      light: '#4d6845',
      dark: '#425e3b',
      'light-high-contrast': '#26401f',
      'dark-high-contrast': '#193312',
    },
  },
  /** The initials on the seafoam fill. */
  'color.fg.avatar.seafoam': {
    cssVariable: '--env-color-fg-avatar-seafoam',
    type: 'color',
    values: {
      light: '#266b68',
      dark: '#16615f',
      'light-high-contrast': '#004140',
      'dark-high-contrast': '#003432',
    },
  },
  /** The labels of navigation items, secondary buttons and Select options, the values of meters and sliders, and the thumb of a switch that is off. */
  'color.fg.control': {
    cssVariable: '--env-color-fg-control',
    type: 'color',
    values: {
      light: '#434346',
      dark: '#e8eaee',
      'light-high-contrast': '#29292c',
      'dark-high-contrast': '#eff1f5',
    },
  },
  /** Danger text and icons, and field errors. */
  'color.fg.danger': {
    cssVariable: '--env-color-fg-danger',
    type: 'color',
    values: {
      light: '#ac190f',
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
      light: '#1f1f22',
      dark: '#e8eaee',
      'light-high-contrast': '#131315',
      'dark-high-contrast': '#f6f8fc',
    },
  },
  /** Done text and icons. */
  'color.fg.done': {
    cssVariable: '--env-color-fg-done',
    type: 'color',
    values: {
      light: '#006071',
      dark: '#81cbd7',
      'light-high-contrast': '#00404c',
      'dark-high-contrast': '#b5f5ff',
    },
  },
  /** Links and text buttons: at least 4.5:1 on every surface and row. */
  'color.fg.link': {
    cssVariable: '--env-color-fg-link',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** Links and text buttons on a tint, where fg.link falls below 4.5:1: inside alerts, on bg.primary.muted, and in list rows and interactive table rows under the pointer or pressed. In light it is a grade darker than fg.link and darkens on hover and press; in dark it is fg.link at rest and lightens on hover and press, where fg.link darkens. Alerts and those rows point fg.link at it; an application puts it on bg.brand-muted. */
  'color.fg.link-on-muted': {
    cssVariable: '--env-color-fg-link-on-muted',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** A link on a tint under the pointer. */
  'color.fg.link-on-muted.hover': {
    cssVariable: '--env-color-fg-link-on-muted-hover',
    type: 'color',
    values: {
      light: '#004aa2',
      dark: '#b5cffb',
      'light-high-contrast': '#002f6d',
      'dark-high-contrast': '#eaf2ff',
    },
  },
  /** A link on a tint while pressed. */
  'color.fg.link-on-muted.pressed': {
    cssVariable: '--env-color-fg-link-on-muted-pressed',
    type: 'color',
    values: {
      light: '#00408f',
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
      light: '#004aa2',
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
      light: '#00408f',
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
      light: '#4d4d50',
      dark: '#bdbfc3',
      'light-high-contrast': '#313134',
      'dark-high-contrast': '#e8eaee',
    },
  },
  /** Muted text that responds to the pointer, such as a Disclosure summary, gains contrast. */
  'color.fg.muted.hover': {
    cssVariable: '--env-color-fg-muted-hover',
    type: 'color',
    values: {
      light: '#434346',
      dark: '#ccced2',
      'light-high-contrast': '#29292c',
      'dark-high-contrast': '#eff1f5',
    },
  },
  /** Muted text while pressed. */
  'color.fg.muted.pressed': {
    cssVariable: '--env-color-fg-muted-pressed',
    type: 'color',
    values: {
      light: '#39393d',
      dark: '#dbdde1',
      'light-high-contrast': '#1f1f22',
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
  /** White in both themes, on the strong fills: labels at 4.5:1 on the danger, accent, neutral, success and information fills, at rest, hovered and pressed; marks at 3:1 on the primary strong fill. */
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
  /** Primary text and icons: the primary tone, outlined button labels, the selected tab, a field's focused label, the icon of a pager link. */
  'color.fg.primary': {
    cssVariable: '--env-color-fg-primary',
    type: 'color',
    values: {
      light: '#0053b5',
      dark: '#9fc1f8',
      'light-high-contrast': '#00377c',
      'dark-high-contrast': '#e0ebfd',
    },
  },
  /** The filled stars and the filled half of a half star: a clear gold. */
  'color.fg.rating-star': {
    cssVariable: '--env-color-fg-rating-star',
    type: 'color',
    values: {
      light: '#dea846',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffe8be',
    },
  },
  /** Success text and icons. */
  'color.fg.success': {
    cssVariable: '--env-color-fg-success',
    type: 'color',
    values: {
      light: '#02652b',
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
      light: '#7e4b00',
      dark: '#ebb750',
      'light-high-contrast': '#553200',
      'dark-high-contrast': '#ffe8be',
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
  /** The text of a control and of a field's value: the body size, and 1 rem under a coarse pointer, where smaller text makes touch browsers zoom into a focused field. */
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
  /** The edge of a level-0 layer, which lies in the page: none. */
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
  /** The edge of a level-1 layer, the same as every level's: where a floating layer is solid, the edge and its fill set it apart. */
  'elevation.1.border': {
    cssVariable: '--env-elevation-1-border',
    type: 'color',
    values: {
      light: '#b1b1b4',
      dark: '#686b70',
      'light-high-contrast': '#6b6b6e',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** The edge of menus, Select and Combobox lists, popovers, hover cards, pickers, rich text suggestions, docked panels and drag images: about 2:1 against a popup's own fill and the page, and at least 1.6:1 against every surface it floats over. */
  'elevation.2.border': {
    cssVariable: '--env-elevation-2-border',
    type: 'color',
    values: {
      light: '#b1b1b4',
      dark: '#686b70',
      'light-high-contrast': '#6b6b6e',
      'dark-high-contrast': '#a1a4a9',
    },
  },
  /** The edge of dialogs, sheets and the command palette where they are solid: in light the default border's gray, a step stronger than level 2's, as the light backdrop dims the page to about level 2's gray; in dark the same as level 2's. A dialog and the palette otherwise part by their fill and the popups' soft shadow, a sheet by its fill. */
  'elevation.3.border': {
    cssVariable: '--env-elevation-3-border',
    type: 'color',
    values: {
      light: '#808083',
      dark: '#686b70',
      'light-high-contrast': '#131315',
      'dark-high-contrast': '#a1a4a9',
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
  /** envUI's typeface, Geist, which the package ships, falling back to the system's sans-serif. */
  'font.family': {
    cssVariable: '--env-font-family',
    type: 'fontFamily',
    values: {
      light: "'envUI Geist', sans-serif",
      dark: "'envUI Geist', sans-serif",
      'light-high-contrast': "'envUI Geist', sans-serif",
      'dark-high-contrast': "'envUI Geist', sans-serif",
    },
  },
  /** Running text: Text's body variant and a type role's default, 15 px in the comfortable scale. */
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
  /** Supporting text: Text's body-sm and caption variants, 14 px in the comfortable scale. */
  'font.size.body-sm': {
    cssVariable: '--env-font-size-body-sm',
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
  /** A page's heading: Text's headline variant, 22 px in the comfortable scale: a clear step above a section's title. */
  'font.size.headline': {
    cssVariable: '--env-font-size-headline',
    type: 'dimension',
    values: {
      light: '1.375rem',
      dark: '1.375rem',
      'light-high-contrast': '1.375rem',
      'dark-high-contrast': '1.375rem',
    },
    scales: { compact: '1.25rem' },
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
  'font.size.label-sm': {
    cssVariable: '--env-font-size-label-sm',
    type: 'dimension',
    values: {
      light: '0.8125rem',
      dark: '0.8125rem',
      'light-high-contrast': '0.8125rem',
      'dark-high-contrast': '0.8125rem',
    },
    scales: { compact: '0.75rem' },
  },
  /** A section's heading: Text's title variant, 18 px in the comfortable scale: a step above body text in size as well as weight. */
  'font.size.title': {
    cssVariable: '--env-font-size-title',
    type: 'dimension',
    values: {
      light: '1.125rem',
      dark: '1.125rem',
      'light-high-contrast': '1.125rem',
      'dark-high-contrast': '1.125rem',
    },
    scales: { compact: '1rem' },
  },
  /** The weight of running text, which the body type roles take: regular. */
  'font.weight.body': {
    cssVariable: '--env-font-weight-body',
    type: 'fontWeight',
    values: {
      light: '400',
      dark: '400',
      'light-high-contrast': '400',
      'dark-high-contrast': '400',
    },
  },
  /** Medium, 500: headings, labels that lead and emphasis in a row. */
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
  /** Regular, 400: running text and most labels. */
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
  /** Semibold, 600: the strongest emphasis in a small space, such as today in a calendar. */
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
  /** A small icon, such as inside a control: the control's icon size, 1 rem. */
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
  /** The line height of a theme boundary's text, which an application may set: 1.4 times the font size. */
  'line-height.body': {
    cssVariable: '--env-line-height-body',
    type: 'number',
    values: {
      light: '1.4',
      dark: '1.4',
      'light-high-contrast': '1.4',
      'dark-high-contrast': '1.4',
    },
  },
  /** A small change, such as a state layer or a color under the pointer: 120 ms. */
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
  /** A part that opens, moves or fades in, such as a popup or a field's floating label: 160 ms. */
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
  /** A larger movement, such as a sheet sliding in or a dialog's backdrop: 240 ms. */
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
  /** The standard easing of a change on screen, which speeds up and then settles. */
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
  /** A picture beside a name with a second line, such as an account header. */
  'picture.size-lg': {
    cssVariable: '--env-picture-size-lg',
    type: 'dimension',
    values: {
      light: '3rem',
      dark: '3rem',
      'light-high-contrast': '3rem',
      'dark-high-contrast': '3rem',
    },
  },
  /** A picture beside a name in a list, a comment or a toolbar: an avatar's default size. */
  'picture.size-md': {
    cssVariable: '--env-picture-size-md',
    type: 'dimension',
    values: {
      light: '2rem',
      dark: '2rem',
      'light-high-contrast': '2rem',
      'dark-high-contrast': '2rem',
    },
  },
  /** A small picture, beside compact text such as a combobox option or the application's name in a top bar. */
  'picture.size-sm': {
    cssVariable: '--env-picture-size-sm',
    type: 'dimension',
    values: {
      light: '1.5rem',
      dark: '1.5rem',
      'light-high-contrast': '1.5rem',
      'dark-high-contrast': '1.5rem',
    },
  },
  /** The largest picture, such as on a profile page or a sign-in screen. */
  'picture.size-xl': {
    cssVariable: '--env-picture-size-xl',
    type: 'dimension',
    values: {
      light: '5.5rem',
      dark: '5.5rem',
      'light-high-contrast': '5.5rem',
      'dark-high-contrast': '5.5rem',
    },
  },
  /** The full corner of a pill, such as a button, a field, a badge or a navigation item: half the tallest single-line control, the large control height or the touch height, whichever is more, so anything taller keeps the same corners and becomes a rounded rectangle. */
  'radius.full': {
    cssVariable: '--env-radius-full',
    type: 'dimension',
    values: {
      light: 'calc(max(3rem, 2.75rem) / 2)',
      dark: 'calc(max(3rem, 2.75rem) / 2)',
      'light-high-contrast': 'calc(max(3rem, 2.75rem) / 2)',
      'dark-high-contrast': 'calc(max(3rem, 2.75rem) / 2)',
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
  /** Corners between sm and lg, such as a navigation item's indicator. */
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
  /** Square corners. */
  'radius.none': {
    cssVariable: '--env-radius-none',
    type: 'dimension',
    values: { light: '0', dark: '0', 'light-high-contrast': '0', 'dark-high-contrast': '0' },
  },
  /** The corners where connected rows meet: small, so the rows read as one block. */
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
  /** The outer corners of connected rows, the first row's top and the last row's bottom: a surface's. */
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
  /** A row that stands alone, with the outer corners on every side. */
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
  /** The largest corners of the scale. */
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
  /** The smallest corners, such as a checkbox's box and a color swatch. */
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
  /** Spacing step 1: 4 px, the same in both scales. */
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
  /** Spacing step 2: 8 px in the comfortable scale, 6 px in compact. */
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
  /** Spacing step 3: 12 px in the comfortable scale, 10 px in compact. */
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
  /** Spacing step 4: 16 px in the comfortable scale, 12 px in compact. */
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
  /** Spacing step 5: 24 px in the comfortable scale, 20 px in compact. */
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
  /** Spacing step 6: 32 px in the comfortable scale, 26 px in compact. */
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
  /** Spacing step 7: 40 px in the comfortable scale, 32 px in compact. */
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
  /** Spacing step 8: 48 px in the comfortable scale, 38 px in compact. */
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
  /** Spacing step 9: 64 px in the comfortable scale, 52 px in compact. */
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
  /** The opacity of a disabled control, which keeps its colors: 48%. */
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
  /** The state layer of keyboard focus, under the focus ring: 10% of the content color. */
  'state.focus-opacity': {
    cssVariable: '--env-state-focus-opacity',
    type: 'number',
    values: {
      light: '0.1',
      dark: '0.1',
      'light-high-contrast': '0.07',
      'dark-high-contrast': '0.07',
    },
  },
  /** The state layer under the pointer: 8% of the content color over the container. */
  'state.hover-opacity': {
    cssVariable: '--env-state-hover-opacity',
    type: 'number',
    values: {
      light: '0.08',
      dark: '0.08',
      'light-high-contrast': '0.06',
      'dark-high-contrast': '0.06',
    },
  },
  /** The state layer while pressed: 10% of the content color over the container. */
  'state.pressed-opacity': {
    cssVariable: '--env-state-pressed-opacity',
    type: 'number',
    values: {
      light: '0.1',
      dark: '0.12',
      'light-high-contrast': '0.07',
      'dark-high-contrast': '0.07',
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
  /** TopBar's height: a single row that holds controls of the control height with space around them. */
  'top-bar.height': {
    cssVariable: '--env-top-bar-height',
    type: 'dimension',
    values: {
      light: '3.25rem',
      dark: '3.25rem',
      'light-high-contrast': '3.25rem',
      'dark-high-contrast': '3.25rem',
    },
    scales: { compact: '2.625rem' },
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
  /** Running text: Text's body variant, regular. */
  'type.body': {
    cssVariable: '--env-type-body',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.9375rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  /** Supporting text: Text's body-sm and caption variants, regular. */
  'type.body-sm': {
    cssVariable: '--env-type-body-sm',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      dark: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '0.875rem',
        'font-weight': '400',
        'letter-spacing': '0rem',
        'line-height': '1.4em',
      },
    },
  },
  /** Display text, Text's display variant: medium, 1.75 to 2.75 rem with the window, set tight. */
  'type.display': {
    cssVariable: '--env-type-display',
    type: 'typography',
    values: {
      light: "500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif",
      dark: "500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif",
      'light-high-contrast':
        "500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif",
      'dark-high-contrast':
        "500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif",
    },
  },
  /** A page's heading: Text's headline variant, medium, its lines tighter than body text's and its letters a touch closer, as larger type wants. */
  'type.headline': {
    cssVariable: '--env-type-headline',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.375rem',
        'font-weight': '500',
        'letter-spacing': '-0.0125rem',
        'line-height': '1.3em',
      },
      dark: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.375rem',
        'font-weight': '500',
        'letter-spacing': '-0.0125rem',
        'line-height': '1.3em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.375rem',
        'font-weight': '500',
        'letter-spacing': '-0.0125rem',
        'line-height': '1.3em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.375rem',
        'font-weight': '500',
        'letter-spacing': '-0.0125rem',
        'line-height': '1.3em',
      },
    },
  },
  /** A section's heading: Text's title variant, medium, its lines a little tighter than body text's and its letters a touch closer. */
  'type.title': {
    cssVariable: '--env-type-title',
    type: 'typography',
    values: {
      light: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '-0.00625rem',
        'line-height': '1.35em',
      },
      dark: {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '-0.00625rem',
        'line-height': '1.35em',
      },
      'light-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '-0.00625rem',
        'line-height': '1.35em',
      },
      'dark-high-contrast': {
        'font-family': "'envUI Geist', sans-serif",
        'font-size': '1.125rem',
        'font-weight': '500',
        'letter-spacing': '-0.00625rem',
        'line-height': '1.35em',
      },
    },
  },
  /** The least space between the window's edge and a dialog, the command palette or rich text suggestions: 0.75 to 1 rem, with the window. */
  'viewport-gutter': {
    cssVariable: '--env-viewport-gutter',
    type: 'dimension',
    values: {
      light: 'clamp(0.75rem, 2vw, 1rem)',
      dark: 'clamp(0.75rem, 2vw, 1rem)',
      'light-high-contrast': 'clamp(0.75rem, 2vw, 1rem)',
      'dark-high-contrast': 'clamp(0.75rem, 2vw, 1rem)',
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
  /** The backdrop behind a modal layer, which covers the page and the frame. */
  'z.backdrop': {
    cssVariable: '--env-z-backdrop',
    type: 'number',
    values: { light: '90', dark: '90', 'light-high-contrast': '90', 'dark-high-contrast': '90' },
  },
  /** The flow of a page or a component; a part drawn behind its siblings takes calc(var(--env-z-base) - 1). */
  'z.base': {
    cssVariable: '--env-z-base',
    type: 'number',
    values: { light: '0', dark: '0', 'light-high-contrast': '0', 'dark-high-contrast': '0' },
  },
  /** Modal layers over their backdrop: dialogs, sheets and the command palette. */
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
  /** Popups anchored to a control, also inside a modal layer: menus, popovers, hover cards, the lists of Select and Combobox, and suggestions. */
  'z.popup': {
    cssVariable: '--env-z-popup',
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
  /** Sticky parts that content scrolls under: a sticky TopBar or PageHeader. */
  'z.sticky': {
    cssVariable: '--env-z-sticky',
    type: 'number',
    values: { light: '20', dark: '20', 'light-high-contrast': '20', 'dark-high-contrast': '20' },
  },
  /** A supporting pane that opens over its main pane as a sheet, and the backdrop behind it, above the sticky parts. */
  'z.supporting-pane': {
    cssVariable: '--env-z-supporting-pane',
    type: 'number',
    values: { light: '30', dark: '30', 'light-high-contrast': '30', 'dark-high-contrast': '30' },
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
