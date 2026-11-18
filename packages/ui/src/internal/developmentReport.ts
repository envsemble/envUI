const reportsAlreadyMade = new Set<string>();

/**
 * Reports a mistake while the application is being developed, as reportOnce does, from a message
 * built behind an inline `process.env.NODE_ENV` check that a production build drops:
 * `reportInDevelopment(() => process.env.NODE_ENV !== 'production' && 'A Tooltip …')`. Where
 * nothing replaced `process.env`, nothing is reported.
 */
export function reportInDevelopment(
  message: () => string | false | undefined,
  options?: Parameters<typeof reportOnce>[1],
) {
  let text: string | false | undefined;
  try {
    text = message();
  } catch {
    return;
  }
  if (text) reportOnce(text, options);
}

/**
 * A development-only report of a mistake, as React reports an invalid prop: prefixed with
 * "envUI:", once per key, the message by default, counted once the console has printed it.
 */
export function reportOnce(
  message: string,
  { level = 'error', key = message }: { level?: 'error' | 'warn'; key?: string } = {},
) {
  if (reportsAlreadyMade.has(key)) return;
  // eslint-disable-next-line no-console
  console[level](`envUI: ${message}`);
  reportsAlreadyMade.add(key);
}
