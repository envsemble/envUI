import type { PageStatus } from '../documentation/DocumentationTypes';

const statusTones = {
  alpha: 'warning',
  beta: 'neutral',
  stable: 'success',
  deprecated: 'danger',
} as const satisfies Record<PageStatus, string>;

const newTone = 'accent';
const launchMinorLine = '1.0';

interface PageBadge {
  label: 'Deprecated' | 'Alpha' | 'New';
  tone: (typeof statusTones)[PageStatus] | typeof newTone;
}

const minorLine = (version: string) => version.split(/[.-]/).slice(0, 2).join('.');

export function isNew(since: string | undefined, version: string): boolean {
  if (!since) return false;
  const line = minorLine(since);
  return line !== launchMinorLine && line === minorLine(version);
}

export function pageBadge(
  { status, since }: { status?: PageStatus; since?: string },
  version: string,
): PageBadge | undefined {
  if (status === 'deprecated') return { label: 'Deprecated', tone: statusTones.deprecated };
  if (status === 'alpha') return { label: 'Alpha', tone: statusTones.alpha };
  if (isNew(since, version)) return { label: 'New', tone: newTone };
  return undefined;
}
