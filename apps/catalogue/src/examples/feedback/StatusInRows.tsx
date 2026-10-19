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

const projects: { id: string; name: string; owner: string; updated: string; status: Status }[] = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Alex Morgan',
    updated: '2026-03-04T08:30:00Z',
    status: 'On track',
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Jordan Kim',
    updated: '2026-03-03T16:10:00Z',
    status: 'At risk',
  },
  {
    id: 'data-migration',
    name: 'Data migration',
    owner: 'Chen Wei',
    updated: '2026-02-27T11:00:00Z',
    status: 'Blocked',
  },
  {
    id: 'annual-review',
    name: 'Annual review',
    owner: 'Maria Garcia',
    updated: '2026-02-20T09:45:00Z',
    status: 'Done',
  },
];
