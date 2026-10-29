/*
 * The small badge beside a page's name in the Docs' navigation: Deprecated or Experimental, which
 * a reader must not miss, else New while the page came in the current minor release. One badge a
 * page, the first that applies. Beta has none here: it stays on the page, as so many pages are
 * beta that the navigation would be a column of them. Kept free of imports, so the unit tests
 * read it as it is.
 */

/** A page's status, from its frontmatter. */
export type PageStatus = 'experimental' | 'beta' | 'stable' | 'deprecated';

/** The badge a page shows: its words and the tone of envUI's Badge. */
export interface PageBadge {
  label: 'Deprecated' | 'Experimental' | 'New';
  tone: 'warning' | 'accent' | 'success';
}

/** A version's major and minor numbers, such as 1.1 for 1.1.0 or 1.1.0-prerelease.2. */
const minorLine = (version: string) => version.split(/[.-]/).slice(0, 2).join('.');

/**
 * Whether a page is new: its `since` is in the current version's minor line, such as 1.1.0 while
 * the package is any 1.1.x. Never for 1.0, the launch, when almost every page says 1.0.0.
 */
export function isNew(since: string | undefined, version: string): boolean {
  if (!since) return false;
  const line = minorLine(since);
  return line !== '1.0' && line === minorLine(version);
}

/** The badge of a page with this status and `since`, in a release of this version; or none. */
export function pageBadge(
  { status, since }: { status?: PageStatus; since?: string },
  version: string,
): PageBadge | undefined {
  if (status === 'deprecated') return { label: 'Deprecated', tone: 'warning' };
  if (status === 'experimental') return { label: 'Experimental', tone: 'accent' };
  if (isNew(since, version)) return { label: 'New', tone: 'success' };
  return undefined;
}
