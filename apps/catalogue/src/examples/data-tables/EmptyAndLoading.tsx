import { useEffect, useRef, useState } from 'react';
import {
  Button,
  EmptyState,
  LoadingState,
  SegmentedControl,
  Skeleton,
  Stack,
  Surface,
  Table,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

/** Placeholders appear only once a load has taken this long, so quick loads never flash them. */
const placeholderDelay = 200;

export default function EmptyAndLoading() {
  const [team, setTeam] = useState('design');
  // Teams whose projects have loaded; each loads the first time it is chosen.
  const [loaded, setLoaded] = useState<string[]>(['design']);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const timers = useRef<number[]>([]);
  const clearTimers = () => timers.current.forEach((timer) => window.clearTimeout(timer));
  useEffect(() => clearTimers, []);

  const choose = (next: string) => {
    clearTimers();
    setTeam(next);
    setShowPlaceholders(false);
    if (loaded.includes(next)) return;
    // The projects load from a server; timers stand in for it here.
    timers.current = [
      window.setTimeout(() => setShowPlaceholders(true), placeholderDelay),
      window.setTimeout(() => setLoaded((current) => [...current, next]), 1600),
    ];
  };

  const name = teams.find((option) => option.value === team)?.label ?? '';
  const rows = projects[team];

  let content;
  if (!loaded.includes(team))
    content = (
      // Rows of placeholders in the shape of the table's rows, on its surface. They keep their
      // space, hidden, until the delay has passed, so the page doesn't jump.
      <Surface padding={4} style={{ visibility: showPlaceholders ? undefined : 'hidden' }}>
        <LoadingState label={`Loading ${name} projects`}>
          {[0, 1, 2].map((row) => (
            <Stack key={row} direction="row" align="center" gap={6} style={{ blockSize: '2.5rem' }}>
              <Skeleton width={`${36 - row * 6}%`} height="1rem" emphasis="default" />
              <Skeleton width="20%" height="1rem" />
              <Skeleton width="12%" height="1rem" />
            </Stack>
          ))}
        </LoadingState>
      </Surface>
    );
  else if (rows.length === 0)
    content = (
      // In place of the table, the empty state says what goes here and how to start.
      <EmptyState
        icon={<FolderOpen />}
        title={`No ${name} projects yet`}
        description="Projects bring a team’s documents, tasks and people together."
        action={<Button startIcon={<Add />}>Create project</Button>}
      />
    );
  else
    content = (
      <Table.Root aria-label={`${name} projects`}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((project) => (
            <Table.Row key={project.name}>
              <Table.Cell>{project.name}</Table.Cell>
              <Table.Cell nowrap>{project.owner}</Table.Cell>
              <Table.Cell numeric>{project.tasks}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    );

  return (
    <Stack gap={4}>
      <Stack align="start">
        <SegmentedControl aria-label="Team" value={team} onValueChange={choose} items={teams} />
      </Stack>
      {content}
    </Stack>
  );
}

const teams = [
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
];

const projects: Record<string, { name: string; owner: string; tasks: number }[]> = {
  design: [
    { name: 'Website refresh', owner: 'Priya Shah', tasks: 12 },
    { name: 'Onboarding guide', owner: 'Jordan Kim', tasks: 8 },
    { name: 'Mobile release', owner: 'Chen Wei', tasks: 21 },
  ],
  marketing: [
    { name: 'Quarterly report', owner: 'Sam Lee', tasks: 5 },
    { name: 'Annual review', owner: 'Alex Morgan', tasks: 0 },
  ],
  sales: [],
};
