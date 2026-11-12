import { useState } from 'react';
import { Table } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

/** Two projects, so the table shows whole, its frame in view, in a gallery's low tile. */
const projects = [
  { name: 'Website', tasks: 12 },
  { name: 'Billing', tasks: 4 },
];

const row = (index: number) => `.env-table-body .env-table-row:nth-child(${index})`;
const sort = '.env-table-sort-button';

/*
 * Moves down the rows and chooses the first. Sorts its column the other way, which moves the chosen
 * row below the other, and back, then clears the row again.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: row(1), x: 0.3 },
  { wait: 210 },
  { to: row(2), x: 0.3, duration: 300 },
  { wait: 180 },
  { to: row(1), x: 0.3, duration: 300 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: sort, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 720 },
  { click: true },
  { wait: 540 },
  { to: row(1), x: 0.3, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 16, height: 12 };

/** A table of projects and their open tasks, sortable by the tasks, whose rows can be chosen. */
export default function TableTile() {
  const narrow = useMedia(narrowGallery);
  const [direction, setDirection] = useState<Table.SortDirection>('ascending');
  const [chosen, setChosen] = useState<string | null>(null);
  usePointer(script);
  const rows = [...projects].sort((a, b) =>
    direction === 'ascending' ? a.tasks - b.tasks : b.tasks - a.tasks,
  );
  return (
    <Table.Root aria-label="Projects" style={{ inlineSize: narrow ? '10rem' : '11.5rem' }}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Project</Table.HeaderCell>
          <Table.HeaderCell numeric sortDirection={direction} onSortChange={setDirection}>
            Tasks
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map(({ name, tasks }) => (
          <Table.Row
            key={name}
            interactive
            selected={chosen === name}
            onClick={() => setChosen((current) => (current === name ? null : name))}
          >
            <Table.Cell>{name}</Table.Cell>
            <Table.Cell numeric>{tasks}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
