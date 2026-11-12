/**
 * Marks a ThemePreferenceProvider's boundary that takes the document root's look: the Theme
 * provides its theme to what it holds but leaves the look to the root's theme, a plain element
 * with none of a theme boundary's class and attributes, so it takes the root's tokens; it sets
 * envUI's type again, as a boundary does (Theme.css). A provider
 * that applies to the document, outside any Theme, renders it so on the server, where only the
 * root, which the bootstrap script themes before the first paint, knows the stored preference, and
 * after, as it gives the root its own theme: the same element throughout, which restyles nothing as
 * the page hydrates. Private, as every `data-env-ssr-*` attribute.
 */
export const themeFromRootAttribute = 'data-env-ssr-root';
