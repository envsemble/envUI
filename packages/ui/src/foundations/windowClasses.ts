/**
 * The window classes, after Material's: ranges of a container's width at which arrangement may
 * change, each given by the width where it starts. compact is narrower than 37.5 rem, medium from
 * 37.5 rem, expanded from 52.5 rem and large from 75 rem (600, 840 and 1200 px at a 16 px root).
 *
 * envUI measures them on a container, never on the viewport: the theme boundary is the `env-window`
 * container, so `@container env-window (width < 37.5rem)` is compact. CSS can't read a custom
 * property inside a query, so style sheets write these widths literally; the `--env-window-class-*`
 * tokens hold the same values.
 */
export const windowClasses = {
  compact: '0rem',
  medium: '37.5rem',
  expanded: '52.5rem',
  large: '75rem',
} as const;

/** A window class: compact (< 37.5 rem), medium (< 52.5 rem), expanded (< 75 rem) or large. */
export type WindowClass = keyof typeof windowClasses;
