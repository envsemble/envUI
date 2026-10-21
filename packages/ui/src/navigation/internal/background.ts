/**
 * The background of the navigation and the top bar: default, the default surface color they all
 * share, a plain rectangle (on a surface, such as a Sheet, the surface's color); none, no
 * background of their own, so they sit on what is behind them, the page or the surface they are
 * on.
 */
export type NavigationBackground = 'default' | 'none';

/** The data attribute a navigation form or a top bar renders for its background. */
export function backgroundAttribute(background: NavigationBackground) {
  return background === 'none' ? 'none' : undefined;
}
