/**
 * The locale the server and the first client render format with when no EnvUIProvider sets one:
 * the runtime's locale is unknown on the server, so output that depends on it waits for hydration
 * and starts from this fixed one, which keeps server and client markup equal.
 */
export const defaultServerLocale = 'en-GB';
