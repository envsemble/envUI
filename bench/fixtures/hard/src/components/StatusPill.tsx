import type { ProjectStatus } from '../data/projects';

const labels: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
};

/** A project's status as a coloured pill. */
export function StatusPill({ status }: { status: ProjectStatus }) {
  return <span className={`pill pill-${status}`}>{labels[status]}</span>;
}
