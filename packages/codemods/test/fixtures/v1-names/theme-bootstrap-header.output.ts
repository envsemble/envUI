// Reads the stored theme before the first paint.
export function storedTheme() {
  return localStorage.getItem('env-theme');
}
