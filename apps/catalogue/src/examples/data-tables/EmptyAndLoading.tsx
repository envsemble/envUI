import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Column,
  EmptyState,
  SegmentedControl,
  Table,
  placeholders,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

/** The skeleton appears only once a load has taken this long, so quick loads never flash it. */
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
  const rows = loaded.includes(team) ? projects[team] : undefined;

  // In place of the table, the empty state says what goes here and how to start. While the rows
  // load, the table is a skeleton over placeholder rows; until the delay has passed it keeps its
  // space, hidden, so the page doesn't jump.
  const content =
    rows?.length === 0 ? (
      <EmptyState
        icon={<FolderOpen />}
        title={`No ${name} projects yet`}
        description="Projects bring a team’s documents, tasks and people together."
        action={<Button startIcon={<Add />}>Create project</Button>}
      />
    ) : (
      <div style={{ visibility: rows || showPlaceholders ? undefined : 'hidden' }}>
        <Table.Root aria-label={`${name} projects`} skeleton={!rows}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell numeric>Open tasks</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {(rows ?? placeholders(3)).map((project, row) => (
              <Table.Row key={project.name ?? row}>
                <Table.Cell>{project.name}</Table.Cell>
                <Table.Cell nowrap>{project.owner}</Table.Cell>
                <Table.Cell numeric>{project.tasks}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    );

  return (
    <Column gap={4}>
      <Column gap={4} align="start">
        <SegmentedControl aria-label="Team" value={team} onValueChange={choose} items={teams} />
      </Column>
      {content}
    </Column>
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
