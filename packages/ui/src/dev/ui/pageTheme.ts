// Switching the inspected page's theme from dev mode: the theme boundary around the root takes
// the theme and contrast dev mode sets, kept there even when the application re-renders it, and
// gets its own back as dev mode closes or goes back to the page's theme.

export interface PageTheme {
  theme: 'light' | 'dark';
  contrast: 'standard' | 'high';
}

/** The theme boundary whose theme the page's root follows: around it, else the first inside. */
export function themeBoundaryOf(root: HTMLElement): HTMLElement | null {
  return (
    root.closest<HTMLElement>('.env-theme') ??
    root.querySelector<HTMLElement>('.env-theme:not([data-env-dev] *)')
  );
}

/** The boundary's own theme, as it reads now. */
export function themeOf(boundary: HTMLElement): PageTheme {
  return {
    theme: boundary.getAttribute('data-env-theme') === 'dark' ? 'dark' : 'light',
    contrast: boundary.getAttribute('data-env-contrast') === 'high' ? 'high' : 'standard',
  };
}

/**
 * Gives the boundary a theme until the function it returns puts its own attributes back. A
 * re-render that writes the application's theme again is undone at once.
 */
export function holdTheme(boundary: HTMLElement, { theme, contrast }: PageTheme): () => void {
  const own = ['data-env-theme', 'data-env-contrast'].map(
    (name) => [name, boundary.getAttribute(name)] as const,
  );
  const apply = () => {
    if (boundary.getAttribute('data-env-theme') !== theme)
      boundary.setAttribute('data-env-theme', theme);
    if (boundary.getAttribute('data-env-contrast') !== contrast)
      boundary.setAttribute('data-env-contrast', contrast);
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(boundary, {
    attributes: true,
    attributeFilter: ['data-env-theme', 'data-env-contrast'],
  });
  return () => {
    observer.disconnect();
    for (const [name, value] of own) {
      if (value === null) boundary.removeAttribute(name);
      else boundary.setAttribute(name, value);
    }
  };
}
