export interface EditorTheme {
  theme: 'page' | 'light' | 'dark';
  contrast: 'standard' | 'high';
}

const editorThemeKey = 'envui-dev-theme';

const pageTheme: EditorTheme = { theme: 'page', contrast: 'standard' };

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
    return pageTheme;
  }
  return pageTheme;
}

export function saveEditorTheme(theme: EditorTheme): boolean {
  try {
    localStorage.setItem(editorThemeKey, JSON.stringify(theme));
    return true;
  } catch {
    return false;
  }
}
