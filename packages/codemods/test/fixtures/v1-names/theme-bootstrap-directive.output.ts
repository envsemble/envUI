// Reads the stored theme before the first paint.
import { readStorage } from './storage';

export const storedTheme = () => readStorage('env-theme');
