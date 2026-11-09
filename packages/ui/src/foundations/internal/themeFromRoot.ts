/**
 * Marks a ThemePreferenceProvider's boundary on the server and as the page hydrates: the Theme
 * provides its theme to what it holds but leaves the look to the document root's theme, a plain
 * element with none of a theme boundary's class and attributes, so it takes the root's tokens.
 * Only the root, which the bootstrap script themes before the first paint, knows the stored
 * preference then. Private, as every `data-env-ssr-*` attribute: server markup carries it only
 * until the page has hydrated, when the provider renders its whole boundary on the same element.
 */
export const themeFromRootAttribute = 'data-env-ssr-root';
