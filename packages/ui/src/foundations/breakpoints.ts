/**
 * The viewport widths where a page's layout may change, smallest first: the values of the
 * `breakpoint.*` tokens (`--env-breakpoint-sm` …), which CSS can't read inside `@media`. Components
 * respond to their container's width instead; these are for the page and the app frame.
 */
export const breakpoints = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' } as const;

/** A breakpoint's name: `sm` (40 rem), `md` (48 rem), `lg` (64 rem) or `xl` (80 rem). */
export type Breakpoint = keyof typeof breakpoints;

/**
 * The media query for a viewport at least as wide as a breakpoint (`up`, the default), or narrower
 * than it (`down`), so that `up` and `down` of one breakpoint never both match nor both miss:
 * `breakpointQuery('md')` is `(width >= 48rem)`.
 */
export function breakpointQuery(breakpoint: Breakpoint, direction: 'up' | 'down' = 'up') {
  const width = breakpoints[breakpoint];
  return direction === 'up' ? `(width >= ${width})` : `(width < ${width})`;
}
