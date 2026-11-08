/*
 * The small badge beside a page's name in the Docs' navigation: Deprecated or Alpha, which
 * a reader must not miss, else New while the page came in the current minor release. One badge a
 * page, the first that applies. Beta has none here: it stays on the page, as so many pages are
 * beta that the navigation would be a column of them. Kept free of imports, so the unit tests
 * read it as it is.
 */

/** A page's status, from its frontmatter. */
type PageStatus = 'alpha' | 'beta' | 'stable' | 'deprecated';

/**
 * The tone of each status's Badge, the same wherever a status shows: under a page's title and
 * beside its name in the navigation.
 */
export const statusTones = {
  alpha: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const satisfies Record<PageStatus, string>;

/** The tone of New, which only the navigation shows: none of the statuses' tones. */
const newTone = 'accent';

/** The badge a page shows: its words and the tone of envUI's Badge. */
interface PageBadge {
  label: 'Deprecated' | 'Alpha' | 'New';
  tone: (typeof statusTones)[PageStatus] | typeof newTone;
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
  if (status === 'deprecated') return { label: 'Deprecated', tone: statusTones.deprecated };
  if (status === 'alpha') return { label: 'Alpha', tone: statusTones.alpha };
  if (isNew(since, version)) return { label: 'New', tone: newTone };
  return undefined;
}
