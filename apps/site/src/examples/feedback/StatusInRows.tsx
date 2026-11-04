import { Badge, List, RelativeTime } from '@envsemble/envui';

type Status = 'On track' | 'At risk' | 'Blocked' | 'Done';

/** Each status keeps one tone everywhere it shows, so people learn it once. */
const tones = {
  'On track': 'success',
  'At risk': 'warning',
  Blocked: 'danger',
  Done: 'done',
} as const satisfies Record<Status, string>;

export default function StatusInRows() {
  return (
    // A status that belongs to a row sits in the row, as text in a Badge: it needs no
    // announcement, and its words carry the meaning without the color.
    <List.Root aria-label="Projects">
      {projects.map((project) => (
        <List.Item
          key={project.id}
          label={project.name}
          description={
            <>
              {project.owner}, updated <RelativeTime value={project.updated} />
            </>
          }
        >
          <Badge tone={tones[project.status]}>{project.status}</Badge>
        </List.Item>
      ))}
    </List.Root>
  );
}

/** A time before now, as an ISO date, so the sample reads as live: minutes and days ago. */
const minutes = (count: number) => count * 60_000;
const hours = (count: number) => count * 3_600_000;
const ago = (time: number) => new Date(Date.now() - time).toISOString();

const projects: { id: string; name: string; owner: string; updated: string; status: Status }[] = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Alex Morgan',
    updated: ago(minutes(12)),
    status: 'On track',
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Jordan Kim',
    updated: ago(minutes(50)),
    status: 'At risk',
  },
  {
    id: 'data-migration',
    name: 'Data migration',
    owner: 'Chen Wei',
    updated: ago(hours(26)),
    status: 'Blocked',
  },
  {
    id: 'annual-review',
    name: 'Annual review',
    owner: 'Maria Garcia',
    updated: ago(hours(24 * 5)),
    status: 'Done',
  },
];
