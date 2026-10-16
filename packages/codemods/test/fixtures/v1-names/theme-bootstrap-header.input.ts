// Reads the stored theme before the first paint.
import { defaultThemeStorageKey as storageKey } from '@envsemble/envui/theme-bootstrap';

export function storedTheme() {
  return localStorage.getItem(storageKey);
}
