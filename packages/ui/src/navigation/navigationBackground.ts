/**
 * The background of the navigation and the top bar, named as Surface's and Card's fills: page, the
 * page's background, the same as the content beside them; default, the default surface color, a
 * plain rectangle that stands apart from the page. On a surface, such as a Sheet, both take the
 * surface's color.
 */
export type NavigationBackground = 'default' | 'page';

/** The data attribute a navigation form or a top bar renders for its background. */
export function backgroundAttribute(background: NavigationBackground) {
  return background;
}
