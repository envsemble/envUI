// Reads the stored theme before the first paint.
// eslint-disable-next-line envui/no-renamed-exports -- until the 1.0 upgrade
import { defaultThemeStorageKey } from '@envsemble/envui/theme-bootstrap';
import { readStorage } from './storage';

export const storedTheme = () => readStorage(defaultThemeStorageKey);
