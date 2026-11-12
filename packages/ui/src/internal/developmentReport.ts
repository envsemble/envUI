/** The keys of the reports already made. */
const reported = new Set<string>();

/**
 * Reports a mistake while the application is being developed, as reportOnce does. The call builds
 * its message behind process.env.NODE_ENV, written inline so bundlers replace it and a production
 * build drops the message and the work that finds the mistake:
 * `reportInDevelopment(() => process.env.NODE_ENV !== 'production' && 'A Tooltip …')`. `process`
 * itself stays undefined in a browser, so where nothing replaced the expression, as without a
 * bundler, reading it throws and nothing is reported. The report runs outside that, so a console
 * that throws, as a test's may, still throws.
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
 * "envUI:", once per key, the message by default. Call it only while developing. The key counts as
 * reported once the console has printed it, so a console that throws, as a test's may, reports it
 * again.
 */
export function reportOnce(
  message: string,
  { level = 'error', key = message }: { level?: 'error' | 'warn'; key?: string } = {},
) {
  if (reported.has(key)) return;
  // eslint-disable-next-line no-console
  console[level](`envUI: ${message}`);
  reported.add(key);
}
