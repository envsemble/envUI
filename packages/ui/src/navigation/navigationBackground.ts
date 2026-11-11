/**
 * The background of the navigation and the top bar, named as Surface's and Card's fills: default,
 * the default surface color they all share, a plain rectangle; page, the page's background, so
 * the bar or the form sits on the page. On a surface, such as a Sheet, both take the surface's
 * color.
 */
export type NavigationBackground = 'default' | 'page';

/** The data attribute a navigation form or a top bar renders for its background. */
export function backgroundAttribute(background: NavigationBackground) {
  return background === 'page' ? 'page' : undefined;
}
