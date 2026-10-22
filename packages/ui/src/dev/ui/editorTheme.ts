// The theme of dev mode's own UI, the editor around the page: the page's theme by default, or light
// or dark, with or without high contrast. The choice is kept in localStorage across reloads. The
// page keeps its own theme; dev mode never changes it.

export interface EditorTheme {
  /** `page`: the theme the page has as dev mode opens. */
  theme: 'page' | 'light' | 'dark';
  contrast: 'standard' | 'high';
}

export const editorThemeKey = 'envui-dev-theme';

const fallback: EditorTheme = { theme: 'page', contrast: 'standard' };

/** The editor's theme as it was last chosen, or the page's. */
export function loadEditorTheme(): EditorTheme {
  try {
    const stored = JSON.parse(localStorage.getItem(editorThemeKey) ?? 'null') as unknown;
    if (stored && typeof stored === 'object') {
      const { theme, contrast } = stored as Partial<EditorTheme>;
      return {
        theme: theme === 'light' || theme === 'dark' ? theme : 'page',
        contrast: contrast === 'high' ? 'high' : 'standard',
      };
    }
  } catch {
    // No storage, as in a private window, or something else under the key: the page's theme.
  }
  return fallback;
}

export function saveEditorTheme(theme: EditorTheme) {
  try {
    localStorage.setItem(editorThemeKey, JSON.stringify(theme));
  } catch {
    // No storage: the choice lasts until the page reloads.
  }
}
