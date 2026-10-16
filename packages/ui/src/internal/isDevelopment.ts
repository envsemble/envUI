/**
 * Whether envUI runs in a development build. Bundlers replace `process.env.NODE_ENV` with its value,
 * as they do for React; where nothing defines `process`, such as a browser loading the modules
 * without a bundler, reading it throws, and envUI behaves as in production.
 */
export function isDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}
