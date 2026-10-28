/** The keys of the reports already made. */
const reported = new Set<string>();

/**
 * Whether the application is being developed. process.env.NODE_ENV is written inline so bundlers
 * replace it; `process` itself stays undefined in a browser, so where nothing replaced it, as
 * without a bundler, reading it throws and this is false. A report whose message a production build
 * should drop builds it behind the same check written at the call instead, as Theme does.
 */
export function isDeveloping() {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
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
